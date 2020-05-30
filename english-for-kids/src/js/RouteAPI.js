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
      break;
    case 'getPoints':
      prepareURL += 'getPoints';
      break;
    case 'setPoints':
      prepareURL += 'setPoints';
      break;
    case 'getInformationAboutUser':
      prepareURL += 'getDataAboutUser';
      break;
    case 'changePassword':
      prepareURL += 'changePassword';
      break;
    case 'getRating':
      prepareURL += 'getRating';
      break;
    case 'addCategory':
      prepareURL += 'createNewCategory';
      break;
    case 'addWord':
      prepareURL += 'createWord';
      break;
    case 'getUsers':
      prepareURL += 'getAllUsers';
      break;
    default:
      break;
  }
  return prepareURL;
}