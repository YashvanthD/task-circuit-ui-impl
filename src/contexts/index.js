/**
 * Contexts Index
 * Export all context providers.
 *
 * @module contexts
 */

export { AlertProvider, useGlobalAlert, default as AlertContext } from './AlertContext';

export {
  UserProvider,
  useUser,
  useAuth,
  useUserProfile,
  useUserSettings,
  useUserPermissions,
  default as UserContext,
} from './UserContext';

export {
  DataProvider,
  useData,
  useUsers,
  usePonds,
  useFish,
  useSamplings,
  useTasks,
  useNotifications,
  useAlerts,
  default as DataContext,
} from './DataContext';

export {
  ThemeContextProvider,
  useThemeMode,
  default as ThemeContext,
} from './ThemeContext';

export {
  ReportProvider,
  useReportContext,
  WIDGET_TYPES,
  DATA_SOURCES,
  DEFAULT_WIDGETS,
  FILTER_CONFIGS,
  default as ReportContext,
} from './ReportContext';

