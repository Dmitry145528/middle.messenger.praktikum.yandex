export function collectFormData(form: HTMLFormElement): Record<string, string | string[] | FileList> {
  const result: Record<string, string | string[] | FileList> = {};

  for (const element of form.elements) {
    if (
      !element ||
      !(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)
    )
      continue;
    const name = element.name;
    if (!name) continue;

    if (element instanceof HTMLInputElement) {
      if (element.type === 'file') {
        if (element.files?.length) result[name] = element.files;
      } else if (element.type === 'checkbox') {
        result[name] = element.checked ? element.value : '';
      } else if (element.type === 'radio') {
        if (element.checked) result[name] = element.value;
      } else {
        result[name] = element.value;
      }
    } else if (element instanceof HTMLTextAreaElement) {
      result[name] = element.value;
    } else if (element instanceof HTMLSelectElement) {
      result[name] = element.value;
    }
  }

  return result;
}
