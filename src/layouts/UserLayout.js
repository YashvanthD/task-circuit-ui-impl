import React, { createContext, useCallback } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  getAccessToken,
  getRefreshToken,
  handle401,
  loadUserFromLocalStorage,
  removeFromLocalStorage,
  removeUserFromLocalStorage,
  clearAccessTokenManagement,
  clearTasksFromLocalStorage
} from '../utils/auth/storage';
import BaseLayout from './BaseLayout';
import { BASE_APP_PATH_LOGIN } from "../config";

export const ApiErrorContext = createContext({ handleApiError: async () => {} });

/**
 * UserLayout wraps all {basepath}/user/* pages.
 * Checks authentication and redirects to login if not authenticated.
 * Loads and stores user info for all child pages.
 * Controls sidebar visibility for user pages.
 * @returns {JSX.Element}
 */
export default function UserLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const user = loadUserFromLocalStorage();
  const loggedIn = !!accessToken && !!refreshToken && !!user;

  // Wrapper to handle 401 errors from API calls
  const handleApiError = useCallback(async (error) => {
    if (error?.status === 401) {
      await handle401(() => navigate(BASE_APP_PATH_LOGIN, { replace: true }));
      return true;
    }
    return false;
  }, [navigate]);

  // Handle logout: clear all tokens, user data, and navigate to login
  const handleLogout = useCallback(() => {
    try {
      clearAccessTokenManagement();
    } catch (e) {
      console.warn('clearAccessTokenManagement failed', e);
    }
    try {
      removeFromLocalStorage('refresh_token');
      removeFromLocalStorage('access_token');
      removeFromLocalStorage('access_token_expiry');
      removeUserFromLocalStorage();
      clearTasksFromLocalStorage();
    } catch (e) {
      console.warn('Clearing local storage failed', e);
    }
    // Navigate to login
    navigate(BASE_APP_PATH_LOGIN, { replace: true });
    // Dispatch authChanged so App.js and other listeners update
    try { window.dispatchEvent(new Event('authChanged')); } catch (e) {}
  }, [navigate]);

  if (!loggedIn) {
    return <Navigate to={BASE_APP_PATH_LOGIN} state={{ from: location }} replace />;
  }

  // Wrap all user pages with BaseLayout and enable sidebar
  return (
    <ApiErrorContext.Provider value={{ handleApiError }}>
      <BaseLayout loggedIn={loggedIn} user={user} onLogout={handleLogout} showSidebar={true}>
        <Outlet context={{ user }} />
      </BaseLayout>
    </ApiErrorContext.Provider>
  );
}
