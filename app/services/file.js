import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class FileService extends Service {
  @service() toaster;
  async getFile(fileName) {
    if (fileName && fileName.includes('.pdf')) {
      const [fileId] = fileName.split('.pdf');
      try {
        const response = await fetch(`/files/${fileId}/download`, {
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error(
            `An error occurred while opening the file: ${response.statusText}`,
          );
        }
        const file = await response.blob();
        const url = window.URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return true;
      } catch (error) {
        console.error(error.message);
        return false;
      }
    }
    return false;
  }
}
