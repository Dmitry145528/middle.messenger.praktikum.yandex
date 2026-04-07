export function fetchAvatarBlob(fullUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!fullUrl) {
      reject(new Error('Empty avatar URL'));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', fullUrl);
    xhr.withCredentials = true;
    xhr.responseType = 'blob';

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300 && xhr.response instanceof Blob) {
        if (xhr.response.size === 0) {
          reject(new Error('Empty avatar body'));
          return;
        }
        resolve(xhr.response);
        return;
      }
      reject(new Error(`Avatar HTTP ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error('Avatar network error'));
    xhr.send();
  });
}
