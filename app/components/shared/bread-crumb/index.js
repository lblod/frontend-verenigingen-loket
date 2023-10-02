import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class SharedBreadCrumbComponent extends Component {
  @service router;

  bread = [
    {
      route: 'associations',
      crumbs: [{ label: 'Verenigingen' }],
    },
    {
      route: 'associations.association.general',
      crumbs: [
        { label: 'Verenigingen', link: 'associations' },
        { label: 'Vereniging Algemeen' },
      ],
    },
    {
      route: 'associations.association.contact-detail',
      crumbs: [
        { label: 'Verenigingen', link: 'associations' },
        { label: 'Vereniging contactgegevens' },
      ],
    },
    {
      route: 'associations.association.location',
      crumbs: [
        { label: 'Verenigingen', link: 'associations' },
        { label: 'Vereniging locatie' },
      ],
    },
    {
      route: 'associations.association.representatives',
      crumbs: [
        { label: 'Verenigingen', link: 'associations' },
        { label: 'Vereniging vertegenwoordiger' },
      ],
    },
  ];

  get crumbsForRoute() {
    const results = this.bread.filter(
      (value) => value.route === this.router.currentRouteName
    );
    if (results.length <= 0) return [];
    return results[0].crumbs;
  }
}
