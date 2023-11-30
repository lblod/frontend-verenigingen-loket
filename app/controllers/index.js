import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout, task } from 'ember-concurrency';
import { action } from '@ember/object';
import XLSX from 'xlsx-js-style';
export default class IndexController extends Controller {
  @service store;
  @service router;
  @service toaster;
  @service contactPoints;
  @service queryBuilder;

  size = 0;
  @tracked page = 0;
  @tracked sort = 'name';
  @tracked search = '';
  @tracked activities = '';
  @tracked selectedActivities = [];
  @tracked status = '';
  @tracked selectedOrganizationStatus = '';
  @tracked postalCodes = '';
  @tracked selectedPostalCodes = [];
  @tracked targetAudiences = '';
  @tracked selectedTargetAudiences = [];

  queryParams = [
    'sort',
    'page',
    'search',
    'activities',
    'status',
    'postalCodes',
    'targetAudiences',
  ];

  @action
  setActivities(selectedActivities) {
    this.page = 0;
    this.selectedActivities = selectedActivities;
    this.activities = selectedActivities
      .map((activity) => activity.id)
      .join(',');
    return this.activities;
  }

  @action
  setPostalCodes(selectedPostals) {
    this.page = 0;
    this.selectedPostalCodes = selectedPostals;
    this.postalCodes = selectedPostals
      .map((postal) => postal.postalCode)
      .join(',');
  }

  @action
  setOrganizationStatus(selectedStatus) {
    this.page = 0;
    this.selectedOrganizationStatus = selectedStatus;
    this.status = selectedStatus.join(',');
  }

  @action
  setTargetAudiences(selectedTargetAudiences) {
    this.page = 0;
    this.selectedTargetAudiences = selectedTargetAudiences;
    this.targetAudiences = selectedTargetAudiences.join(',');
  }
  get isLoading() {
    return this.model.associations.isRunning;
  }

  get associations() {
    return this.model.associations.isFinished
      ? this.model.associations.value
      : [];
  }

  @restartableTask
  *updateAssociationSearch(value) {
    yield timeout(500);
    this.page = 0;
    this.search = value.trimStart();
  }

  @action
  resetFilters() {
    this.status = '';
    this.selectedOrganizationStatus = [];
    this.activities = '';
    this.selectedActivities = [];
    this.postalCodes = '';
    this.selectedPostalCodes = [];
    this.targetAudiences = '';
    this.selectedTargetAudiences = [];
    this.search = '';
    this.page = null;
    this.sort = 'name';
  }

  @task
  *download() {
    const toast = this.toaster.loading(
      `Het downloaden van het bestand is begonnen.`,
      'Download gestart',
    );
    try {
      const associations = yield this.queryBuilder.buildAndExecuteQuery.perform(
        {
          sort: this.sort,
          page: this.page,
          search: this.search,
          activities: this.activities,
          status: this.status,
          postalCodes: this.postalCodes,
        },
        [
          'classification',
          'target-audience',
          'primary-site.address',
          'sites.address',
          'identifiers.structured-identifier',
          'organization-status',
          'activities',
          'parent-organization',
          'change-events.result',
          'members.person.site.contact-points',
        ].join(','),
        500,
      );
      const generalSheet = yield this.getGeneralSheet.perform(associations);
      const locationSheet = yield this.getLocationSheet.perform(associations);
      const representativeSheet =
        yield this.getRepresentativesSheet.perform(associations);
      const currentDate = new Date();
      const timestamp = currentDate
        .toISOString()
        .replace(/[-:]/g, '_')
        .replace(/\.\d+/, '');
      const fileName = `verenigingen_${timestamp}.xlsx`;
      const style = { font: { sz: 14, bold: true } };

      const createSheet = (data, sheetName) => {
        const rowStyle = { rows: [], width: [] };
        if (data && data.length > 0) {
          const keys = Object.keys(data[0]);
          keys.forEach((key) => {
            if (key) {
              rowStyle.rows.push({ v: key, t: 's', s: style });
              rowStyle.width.push({ wch: key.length + 6 });
            }
          });
        }

        const worksheet = XLSX.utils.json_to_sheet(data);
        worksheet['!cols'] = rowStyle.width;
        XLSX.utils.sheet_add_aoa(worksheet, [rowStyle.rows]);

        return { worksheet, sheetName };
      };

      const workbook = XLSX.utils.book_new();
      const { worksheet: generalWorksheet, sheetName: generalSheetName } =
        createSheet(generalSheet, 'Algemeen');
      const { worksheet: locationWorksheet, sheetName: locationSheetName } =
        createSheet(locationSheet, 'Locaties');

      const {
        worksheet: representativeWorksheet,
        sheetName: representativeSheetName,
      } = createSheet(representativeSheet, 'Vertegenwoordigers');

      XLSX.utils.book_append_sheet(
        workbook,
        generalWorksheet,
        generalSheetName,
      );
      XLSX.utils.book_append_sheet(
        workbook,
        locationWorksheet,
        locationSheetName,
      );
      XLSX.utils.book_append_sheet(
        workbook,
        representativeWorksheet,
        representativeSheetName,
      );
      yield XLSX.writeFile(workbook, fileName);

      this.downloadFinished(toast);
    } catch (error) {
      this.downloadFailed(toast);
      console.error(error);
    }
  }

  @task
  *getGeneralSheet(associations) {
    return yield Promise.all([
      ...associations.map(async (item) => {
        const primarySite = await item.primarySite;
        const address = await primarySite.address;
        const associationData = await this.getAssociationData.perform(item);
        return {
          ...associationData,
          ...this.getAddress(address),
        };
      }),
    ]);
  }

  @task
  *getLocationSheet(associations) {
    const locationData = [];
    for (const item of associations) {
      const locations = yield item.sites;
      const { vCode, ...association } =
        yield this.getAssociationData.perform(item);
      for (const location of locations) {
        const address = yield location.address;
        locationData.push({
          vCode,
          ...this.getAddress(address),
          ...association,
        });
      }
    }
    return locationData;
  }

  @task
  *getRepresentativesSheet(associations) {
    const data = [];
    for (const item of associations) {
      const { vCode, ...association } =
        yield this.getAssociationData.perform(item);
      const representatives = yield item.members;
      for (const representative of representatives) {
        const person = yield representative.person;
        const site = yield person.site;
        const contactPoints = yield site.contactPoints;
        const { telephone, email, website, socialMedia } =
          this.contactPoints.getDetails(contactPoints);
        data.push({
          vCode,
          Voornaam: person.givenName,
          Achternaam: person.familyName,
          'E-mail': email,
          Telefoonnummer: telephone.join(', '),
          Website: website,
          'Sociale media': socialMedia.map((media) => media.url).join(', '),
          ...association,
        });
      }
    }
    return data;
  }

  @action
  getAddress(address) {
    return {
      Straat: address.street,
      Huisnummer: address.number,
      Busnummer: '',
      Postcode: address.postcode,
      Gemeente: address.municipality,
      Land: address.country,
    };
  }

  @task
  *getIdentifiers(identifiers) {
    const identifiersLabel = { kboNummer: '', vCode: '' };
    yield Promise.all(
      identifiers.map(async (identifier) => {
        const structuredIdentifier = await identifier.structuredIdentifier;
        if (identifier.idName === 'vCode') {
          identifiersLabel.vCode = structuredIdentifier.localId;
        }
        if (identifier.idName === 'KBO nummer') {
          identifiersLabel.kboNummer = structuredIdentifier.localId;
        }
      }),
    );
    return identifiersLabel;
  }

  @task
  *getStartDate(changeEvents) {
    for (const changeEvent of changeEvents) {
      const result = yield changeEvent.result;
      if (result.label === 'Oprichting') {
        return yield changeEvent.date;
      }
    }
    return '';
  }

  @task
  *getAssociationData(item) {
    const classification = yield item.classification;
    const targetAudience = yield item.targetAudience;
    const activities = yield item.activities;
    const identifiers = yield item.identifiers;
    const parentOrganization = yield item.parentOrganization;
    const changeEvents = yield item.changeEvents;

    const activitiesLabel = activities
      .map((activity) => activity.label)
      .join(',');

    const [identifier, startdatum] = yield Promise.all([
      this.getIdentifiers.perform(identifiers),
      this.getStartDate.perform(changeEvents),
    ]);

    return {
      vCode: identifier ? identifier.vCode : '',
      Naam: item ? item.name : '',
      Type: classification ? classification.notation : '',
      Hoofdactiviteiten: activitiesLabel,
      Beschrijving: item.description,
      'Minimum Leeftijd': targetAudience ? targetAudience.minimumLeeftijd : '',
      'Maximum Leeftijd': targetAudience ? targetAudience.maximumLeeftijd : '',
      Koepel: parentOrganization ? parentOrganization.name : '',
      Startdatum: startdatum,
      'KBO Nummer': identifier ? identifier.kboNummer : '',
    };
  }

  @action
  downloadFinished(toast) {
    this.toaster.close(toast);
    this.toaster.success(
      'Het bestand is succesvol gedownload.',
      'Download Voltooid',
      {
        timeOut: 3000,
      },
    );
  }
  @action
  downloadFailed(toast) {
    this.toaster.close(toast);
    this.toaster.error(
      'Er is een fout opgetreden bij het downloaden van het bestand. Probeer het opnieuw.',
      'Download Mislukt',
      {
        timeOut: 3000,
      },
    );
  }
}
