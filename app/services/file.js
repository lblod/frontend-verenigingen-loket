import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class FileService extends Service {
  @service() toaster;
  async getFile(file) {
    if (file) {
      try {
        const response = await fetch(`/files/${file.id}/download`, {
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error(
            `An error occurred while opening the file: ${response.statusText}`,
          );
        }
        const fileBlob = await response.blob();
        const url = window.URL.createObjectURL(fileBlob);
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
