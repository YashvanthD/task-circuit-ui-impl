// App configuration for Task Circuit
export const BASE_URL = 'http://localhost:5000';

// Base path for the application - use empty string since router handles basename
export const BASE_APP_PATH = '';

export const BASE_APP_PATH_USER = '/user';
export const BASE_APP_PATH_HOME = '/home';
export const BASE_APP_PATH_LOGIN = '/login';
export const BASE_APP_PATH_SIGNUP = '/signup';
export const BASE_APP_PATH_REGISTER_COMPANY = '/register-company';

// USER Endpoints
export const BASE_APP_PATH_USER_WATER_TEST = BASE_APP_PATH_USER + '/water-test';
export const BASE_APP_PATH_USER_SAMPLING = BASE_APP_PATH_USER + '/sampling';
export const BASE_APP_PATH_USER_FISH = BASE_APP_PATH_USER + '/fish';
export const BASE_APP_PATH_USER_TRANSFORM = BASE_APP_PATH_USER + '/transform';
export const BASE_APP_PATH_USER_TREE_VIEW = BASE_APP_PATH_USER + '/tree-view';
export const BASE_APP_PATH_USER_AI = BASE_APP_PATH_USER + '/ai';
export const BASE_APP_PATH_USER_DATASET = BASE_APP_PATH_USER + '/dataset';
export const BASE_APP_PATH_USER_MANAGE_USERS = BASE_APP_PATH_USER + '/manage-users';
export const BASE_APP_PATH_USER_DASHBOARD = BASE_APP_PATH_USER + '/dashboard';
export const BASE_APP_PATH_USER_TASKS = BASE_APP_PATH_USER + '/tasks';
export const BASE_APP_PATH_USER_POND = BASE_APP_PATH_USER + '/pond';
export const BASE_APP_PATH_USER_REPORTS = BASE_APP_PATH_USER + '/reports';
export const BASE_APP_PATH_USER_INVOICE = BASE_APP_PATH_USER + '/invoice';
export const BASE_APP_PATH_USER_CHAT = BASE_APP_PATH_USER + '/chat';
export const BASE_APP_PATH_USER_SETTINGS = BASE_APP_PATH_USER + '/settings';

// Expenses related paths
export const BASE_APP_PATH_USER_EXPENSES = BASE_APP_PATH_USER + '/expenses';
export const BASE_APP_PATH_USER_EXPENSES_CATEGORY_LIST = BASE_APP_PATH_USER_EXPENSES + '/categories';
export const BASE_APP_PATH_USER_EXPENSES_TYPE_DETAIL = BASE_APP_PATH_USER_EXPENSES + '/type/:typeId';
export const BASE_APP_PATH_USER_EXPENSES_COMPANY_ACCOUNT = BASE_APP_PATH_USER_EXPENSES + '/company-account';
export const BASE_APP_PATH_USER_EXPENSES_PASSBOOK = BASE_APP_PATH_USER_EXPENSES + '/passbook';
export const BASE_APP_PATH_USER_EXPENSES_MY_ACCOUNT = BASE_APP_PATH_USER_EXPENSES + '/my-account';
export const BASE_APP_PATH_USER_EXPENSES_PAYSLIPS = BASE_APP_PATH_USER_EXPENSES + '/pay-slips';
