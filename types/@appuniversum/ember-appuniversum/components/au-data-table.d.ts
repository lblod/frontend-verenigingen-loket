/* eslint-disable ember/no-classic-components, ember/require-tagless-components */
// TODO: remove these types once Appuniversum ships them
import Component from '@ember/component';

interface Signature<T> {
  Args: {
    content: T[];
    isLoading?: boolean;
    noDataMessage?: string;
  };
}

export default class AuDataTable extends Component<Signature> {}
