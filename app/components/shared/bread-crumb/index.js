import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class SharedBreadCrumbComponent extends Component {
  @service router;
  @service() currentAssociation;
  bread(name) {
    return [
      {
        route: 'associations',
        crumbs: [{ label: 'Verenigingen' }],
      },
      {
        route: 'association.general',
        crumbs: [
          { label: 'Verenigingen', link: 'associations' },
          {
            label: name,
          },
          { label: 'Algemeen' },
        ],
      },
      {
        route: 'association.recognition.index',
        crumbs: [
          { label: 'Verenigingen', link: 'associations' },
          {
            label: name,
          },
          { label: 'Erkenningen' },
        ],
      },
      {
        route: 'association.contact-detail',
        crumbs: [
          { label: 'Verenigingen', link: 'associations' },
          {
            label: name,
          },
          { label: 'Contactgegevens' },
        ],
      },
      {
        route: 'association.location',
        crumbs: [
          { label: 'Verenigingen', link: 'associations' },
          {
            label: name,
          },
          { label: 'Locaties' },
        ],
      },
      {
        route: 'association.representatives',
        crumbs: [
          { label: 'Verenigingen', link: 'associations' },
          {
            label: name,
          },
          { label: 'Vertegenwoordigers' },
        ],
      },
    ];
  }

  get crumbsForRoute() {
    const results = this.bread(
      this.currentAssociation.association
        ? this.currentAssociation.association.name
        : null,
    ).filter((value) => value.route === this.router.currentRouteName);
    if (results.length <= 0) return [];
    return results[0].crumbs;
  }
}
