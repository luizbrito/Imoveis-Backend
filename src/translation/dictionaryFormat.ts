export function dictionaryFormat(message: string, ...args: Array<any>) {
  if (!message) {
    return '';
  }

  try {
    return message.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  } catch (error) {
    console.error(message, error);
    throw error;
  }
}
