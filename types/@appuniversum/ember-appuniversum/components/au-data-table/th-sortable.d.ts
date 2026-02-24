/* eslint-disable ember/no-classic-components, ember/require-tagless-components */
// TODO: remove these types once Appuniversum ships them
import Component from '@ember/component';

interface Signature {
  Args: {
    field: string;
    currentSorting: string;
    label: string;
    class?: string;
  };
  Element: HTMLTableCellElement;
}

export default class ThSortable extends Component<Signature> {}
