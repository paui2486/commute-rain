import Cookies from 'js-cookie';

const COOKIE_KEY_HOME = 'commute_rain_home';
const COOKIE_KEY_WORK = 'commute_rain_work';
const COOKIE_KEY_API = 'commute_rain_cwa_api_key';

export const getStoredSettings = () => {
  return {
    home: Cookies.get(COOKIE_KEY_HOME) || "信義區",
    work: Cookies.get(COOKIE_KEY_WORK) || "內湖區",
    apiKey: Cookies.get(COOKIE_KEY_API) || ""
  };
};

export const saveSettings = (home, work, apiKey) => {
  Cookies.set(COOKIE_KEY_HOME, home, { expires: 365 });
  Cookies.set(COOKIE_KEY_WORK, work, { expires: 365 });
  if (apiKey) {
    Cookies.set(COOKIE_KEY_API, apiKey, { expires: 365 });
  }
};
