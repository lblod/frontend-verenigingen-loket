import Controller from '@ember/controller';

export default class AssociationContactDetailController extends Controller {
  get contactDetails() {
    const contactPoints = {
      telephone: '',
      email: '',
      website: '',
      socialMedia: [],
    };

    if (this.model.contactPoints) {
      this.model.contactPoints.forEach((contactPoint) => {
        const { telephone, email, website, name } = contactPoint;

        if (telephone) {
          contactPoints.telephone = telephone;
        }
        if (email) {
          contactPoints.email = email;
        }
        if (website) {
          if (name === 'Website') {
            contactPoints.website = website;
          } else {
            contactPoints.socialMedia.push({
              name,
              url: website,
            });
          }
        }
      });
    }

    return contactPoints;
  }
}
