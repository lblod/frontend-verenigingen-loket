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

  queryParams = [
    'sort',
    'page',
    'search',
    'activities',
    'status',
    'postalCodes',
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
    this.search = '';
    this.page = null;
    this.sort = 'name';
  }

  @task
  *download() {
    const generalData = yield this.getGeneralData.perform();
    const locationData = yield this.getLocationData.perform(generalData);
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');

    const fileName = `verenigingen_${day}${month}${year}_${hours}${minutes}${seconds}.xlsx`;
    const style = { font: { sz: 14, bold: true } };
    const generalRowStyle = { rows: [], width: [] };
    generalData.map((item, index) => {
      const key = Object.keys(item)[index];
      if (key) {
        generalRowStyle.rows.push({ v: key, t: 's', s: style });
        generalRowStyle.width.push({ wch: key.length + 6 });
      }
    });

    const workbook = XLSX.utils.book_new();
    const worksheetAlgemeen = XLSX.utils.json_to_sheet(generalData, {
      origin: 'A2',
    });
    XLSX.utils.sheet_add_aoa(
      worksheetAlgemeen,
      [
        [
          {
            v: 'Vereniging',
            t: 's',
            s: {
              font: { sz: 18, bold: true },
              alignment: { horizontal: 'center' },
            },
          },
        ],
      ],
      { origin: 'A1' },
    );
    XLSX.utils.sheet_add_aoa(worksheetAlgemeen, [generalRowStyle.rows], {
      origin: 'A2',
    });
    XLSX.utils.book_append_sheet(workbook, worksheetAlgemeen, 'Algemeen');
    worksheetAlgemeen['!cols'] = generalRowStyle.width;
    if (!worksheetAlgemeen['!merges']) worksheetAlgemeen['!merges'] = [];
    worksheetAlgemeen['!merges'].push(XLSX.utils.decode_range('A1:J1'));

    // locaties
    const locationRowStyle = { rows: [], width: [] };
    locationData.map((item, index) => {
      const key = Object.keys(item)[index];
      if (key) {
        locationRowStyle.rows.push({ v: key, t: 's', s: style });
        locationRowStyle.width.push({ wch: key.length + 6 });
      }
    });
    const worksheetLocaties = XLSX.utils.json_to_sheet(locationData, {
      origin: 'A2',
    });
    worksheetLocaties['!cols'] = locationRowStyle.width;
    XLSX.utils.sheet_add_aoa(
      worksheetLocaties,
      [
        [
          {
            v: 'Locaties',
            t: 's',
            s: {
              font: { sz: 18, bold: true },
              alignment: { horizontal: 'center' },
            },
          },
        ],
      ],
      { origin: 'A1' },
    );
    XLSX.utils.sheet_add_aoa(worksheetLocaties, [locationRowStyle.rows], {
      origin: 'A2',
    });
    XLSX.utils.book_append_sheet(workbook, worksheetLocaties, 'Locaties');
    if (!worksheetLocaties['!merges']) worksheetLocaties['!merges'] = [];
    worksheetLocaties['!merges'].push(XLSX.utils.decode_range('A1:J1'));
    XLSX.writeFile(workbook, fileName);
  }

  @task
  *getGeneralData() {
    const generalDataPromises = this.associations.map(async (item) => {
      const [
        classification,
        identifiers,
        activities,
        targetAudience,
        parentOrganization,
        changeEvents,
      ] = await Promise.all([
        item.get('classification'),
        item.get('identifiers'),
        item.get('activities'),
        item.get('targetAudience'),
        item.get('parentOrganization'),
        item.get('changeEvents'),
      ]);

      const identifiersLabel = { kboNummer: '', vCode: '' };
      const activitiesLabel = activities
        .map((activity) => activity.label)
        .join(',');

      let startdatum = '';

      await Promise.all([
        ...changeEvents.map(async (changeEvent) => {
          const result = await changeEvent.get('result');
          if (result.label === 'Oprichting') {
            startdatum = changeEvent.date;
          }
        }),
        ...identifiers.map(async (identifier) => {
          const structuredIdentifier = await identifier.get(
            'structuredIdentifier',
          );
          if (identifier.idName === 'vCode') {
            identifiersLabel.vCode = structuredIdentifier.localId;
          }
          if (identifier.idName === 'KBO nummer') {
            identifiersLabel.kboNummer = structuredIdentifier.localId;
          }
        }),
      ]);

      return {
        vCode: identifiersLabel.vCode,
        naam: item.name,
        type: classification ? classification.notation : '',
        hoofdactiviteiten: activitiesLabel,
        beschrijving: item.description,
        minLeeftijd: targetAudience ? targetAudience.minimumLeeftijd : '',
        maxLeeftijd: targetAudience ? targetAudience.maximumLeeftijd : '',
        koepel: parentOrganization ? parentOrganization.name : '',
        startdatum,
        kboNummer: identifiersLabel.kboNummer,
      };
    });

    return yield Promise.all(generalDataPromises);
  }
  @task
  *getLocationData(generalData) {
    const locationDataPromises = this.associations.map(async (item) => {
      const [classification] = await Promise.all([item.get('classification')]);

      return {
        vCode: generalData.find((data) => data.naam === item.name).vCode,
        naam: item.name,
      };
    });

    return yield Promise.all(locationDataPromises);
  }
  @action
  downloadCallback() {
    this.toaster.success('Download voltooid', 'Bestand Downloaden', {
      timeOut: 3000,
    });
  }
}
