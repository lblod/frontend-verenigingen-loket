import Service from '@ember/service';

export default class ContactPointsService extends Service {
  getDetails(contactPoints) {
    const contactPoint = {
      telephone: [],
      email: '',
      website: '',
      socialMedia: [],
    };

    if (contactPoints) {
      contactPoints.forEach((contact) => {
        const { telephone, email, website, name } = contact;

        if (telephone) {
          const formattedPhoneNumber = telephone.replace('tel:', '');
          contactPoint.telephone.push(formattedPhoneNumber);
        }
        if (email) {
          contactPoint.email = email;
        }
        if (website) {
          if (name === 'Website') {
            contactPoint.website = website;
          } else {
            contactPoint.socialMedia.push({
              name,
              url: website,
            });
          }
        }
      });
    }

    return contactPoint;
  }
}
