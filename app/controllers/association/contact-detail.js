import Controller from '@ember/controller';

export default class AssociationContactDetailController extends Controller {
  get getContactDetails() {
    const contactPoints = {
      telephone: '',
      email: '',
      website: '',
      socialMedia: [],
    };
    if (this.model.contactPoints) {
      this.model.contactPoints.forEach((contactPoint) => {
        if (contactPoint.telephone) {
          contactPoints.telephone = contactPoint.telephone;
        }
        if (contactPoint.email) {
          contactPoints.email = contactPoint.email;
        }
        if (contactPoint.website) {
          if (contactPoint.name === 'Website') {
            contactPoints.website = contactPoint.website;
          } else {
            contactPoints.socialMedia.push({
              name: contactPoint.name,
              url: contactPoint.website,
            });
          }
        }
      });
    }
    return contactPoints;
  }
}
