export const urlToApiService = 'http://english-api/';
export function detectURL(requestTo) {
  let prepareURL = urlToApiService;
  switch (requestTo) {
    case 'login':
      prepareURL += 'login';
      break;
    case 'categories':
      prepareURL += 'getCategories';
      break;
    case 'determineCategoryId':
      prepareURL += 'determineCategoryId';
      break;
    case 'words':
      prepareURL += 'getWords';
      break;
    case 'registration':
      prepareURL += 'signup';
      break;
    case 'getStats':
      prepareURL += 'getStats';
      break;
    case 'setStats':
      prepareURL += 'setStats';
    default:
      break;
  }
  return prepareURL;
}