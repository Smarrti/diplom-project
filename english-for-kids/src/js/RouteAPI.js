export const urlToApiService = 'http://english-api/';
export function detectURL(requestTo) {
  let prepareURL = urlToApiService;
  switch (requestTo) {
    case 'login':
      prepareURL += 'login';
      break;
  
    default:
      break;
  }
  return prepareURL;
}