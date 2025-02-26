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
        // We intentionally don't call URL.revokeObjectURL because it breaks file downloads in Chrome.
        // The revoked url causes the download to fail, even if the file is still visible in the browser's built-in pdf viewer.
        // We could go for a long delay before calling revokeObjectURL,
        // but that could still fail if the user keeps a file open for a very long time before downloading.
        // The browser does clean up these references when all the tabs of the app are closed,
        // so not calling revokeObjectURL simply means the data stays in memory longer.
        const url = window.URL.createObjectURL(fileBlob);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        a.remove();

        return true;
      } catch (error) {
        console.error(error.message);
        return false;
      }
    }
    return false;
  }
}
