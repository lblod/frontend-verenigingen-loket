import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class SharedBreadCrumbComponent extends Component {
  @service router;

  bread = [
    {
      route: 'index',
      crumbs: [{ label: 'Verenigingen' }],
    },
    {
      route: 'association.general',
      crumbs: [{ label: 'Verenigingen', link: 'index' }, { label: 'Algemeen' }],
    },
    {
      route: 'association.contact-detail',
      crumbs: [
        { label: 'Verenigingen', link: 'index' },
        { label: 'Contactgegevens' },
      ],
    },
    {
      route: 'association.location',
      crumbs: [{ label: 'Verenigingen', link: 'index' }, { label: 'Locaties' }],
    },
    {
      route: 'association.representatives',
      crumbs: [
        { label: 'Verenigingen', link: 'index' },
        { label: 'Vertegenwoordigers' },
      ],
    },
  ];

  get crumbsForRoute() {
    const results = this.bread.filter(
      (value) => value.route === this.router.currentRouteName,
    );
    if (results.length <= 0) return [];
    return results[0].crumbs;
  }
}
