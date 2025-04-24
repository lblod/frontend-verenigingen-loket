import Component from '@glimmer/component';
import { service } from '@ember/service';
import dateYear from 'frontend-verenigingen-loket/helpers/date-year';

export default class SharedBreadCrumbComponent extends Component {
  @service router;
  @service() currentAssociation;
  @service() currentRecognition;

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
        route: 'association.recognition.create',
        crumbs: [
          { label: 'Verenigingen', link: 'index' },
          {
            label: name,
          },
          { label: 'Erkenningen', link: 'association.recognition.index' },
          { label: 'Aanmaken' },
        ],
      },
      {
        route: 'association.recognition.edit',
        crumbs: [
          { label: 'Verenigingen', link: 'index' },
          {
            label: name,
          },
          { label: 'Erkenningen', link: 'association.recognition.index' },
          { label: 'Bewerken' },
        ],
      },
      {
        route: 'association.recognition.show',
        crumbs: [
          { label: 'Verenigingen', link: 'index' },
          {
            label: name,
          },
          { label: 'Erkenningen', link: 'association.recognition.index' },
          {
            label: this.currentRecognition.recognition
              ? `Erkenning ${dateYear(
                  this.currentRecognition.recognition.validityPeriod.get(
                    'startTime',
                  ),
                )} - ${dateYear(
                  this.currentRecognition.recognition.validityPeriod.get(
                    'endTime',
                  ),
                )}`
              : '',
          },
        ],
      },
      {
        route: 'association.contact-details.index',
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
