import Service from '@ember/service';
export default class MuSearchService extends Service {
  async search(request) {
    const { index, page, size, sort, filters, includes } = request;
    try {
      const params = [`page[size]=${size}`, `page[number]=${page}`];

      if (filters) {
        Object.entries(filters).forEach(([field, q]) => {
          params.push(`filter[${field}]=${q}`);
        });
      }

      if (sort) {
        const sortParams = sort
          .split(',')
          .filter((sortParam) => sortParam.length > 0);
        params.push(
          ...sortParams.map(
            (sortParam) =>
              `sort[${this.stripSort(sortParam)}]=${this.sortOrder(sortParam)}`,
          ),
        );
      }

      const endpoint = `/search/${index}/search?${params.join('&')}`;
      const response = await fetch(endpoint);
      const json = await response.json();

      if (!json || !json.count || !json.data) {
        throw new Error(`Invalid response from ${endpoint}`);
      }

      const { count, data } = json;
      const pagination = this.getPaginationMetadata(page, size, count);
      const items = data;

      return {
        items,
        count,
        pagination,
      };
    } catch (error) {
      console.error('Error during search:', error);
      return {
        items: [],
        count: 0,
        pagination: this.getPaginationMetadata(page, size, 0),
      };
    }
  }

  sortOrder(sort) {
    return sort.startsWith('-') ? 'desc' : 'asc';
  }

  stripSort(sort) {
    return sort.replace(/^[-+]+/, '');
  }

  getPaginationMetadata(pageNumber, pageSize, total) {
    const size = Math.min(pageSize, total);
    const lastPageNumber =
      total === 0 ? 0 : Math.max(Math.ceil(total / size) - 1, 0);
    const lastPageSize = total % size || size;
    const isFirstPage = pageNumber === 0;
    const isLastPage = pageNumber === lastPageNumber;

    const pagination = {
      first: {
        number: 0,
        size,
      },
      last: {
        number: lastPageNumber,
        size: lastPageSize,
      },
      self: {
        number: pageNumber,
        size,
      },
    };

    if (!isFirstPage) {
      pagination.prev = {
        number: pageNumber - 1,
        size,
      };
    }

    if (!isLastPage) {
      const nextPageSize = pageNumber === lastPageNumber ? lastPageSize : size;
      pagination.next = {
        number: pageNumber + 1,
        size: nextPageSize,
      };
    }
    return pagination;
  }
}
