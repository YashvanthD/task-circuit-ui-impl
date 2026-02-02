import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, matchPath } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import BaseLayout from './layouts/BaseLayout';
import UserLayout from './layouts/UserLayout';
import DashboardPage from './pages/user/DashboardPage';
import TasksPage from './pages/user/TasksPage';
import PondPage from './pages/user/PondPage';
import ReportsPage from './pages/user/ReportsPage';
import ManageUsersPage from './pages/user/ManageUsersPage';
import DatasetPage from './pages/user/DatasetPage';
import PondMonitoringPage from './pages/user/PondMonitoringPage';
import ChatPage from './pages/user/ChatPage';
import ExpensesPage from './pages/user/ExpensesPage';
import InvoicePage from './pages/user/InvoicePage';
import SettingsPage from './pages/user/SettingsPage';
import { userSession } from './utils/auth/userSession';
import { UserProvider } from './contexts';
import { DataProvider } from './contexts';
import { AlertProvider } from './contexts';
import { ThemeContextProvider } from './contexts';
import { SignupForm } from './components/users/forms';
import { RegisterCompanyForm } from './components/common/forms';
import { ErrorBoundary, GlobalAlertProvider } from './components/common';
import FishPage from './pages/user/FishPage';
import SamplingPage from './pages/user/SamplingPage';
import WaterTestPage from './pages/user/WaterTestPage';
import TransformPage from './pages/user/TransformPage';
import CategoryList from './pages/user/expenses/CategoryList';
import TypeDetail from './pages/user/expenses/TypeDetail';
import CompanyAccount from './pages/user/expenses/CompanyAccount';
import Passbook from './pages/user/expenses/Passbook';
import MyAccount from './pages/user/expenses/MyAccount';
import UserPaySlips from './pages/user/expenses/UserPaySlips';
import TreeUserView from './pages/user/TreeUserView';
import AiPage from './pages/user/AiPage';
import NotificationsPage from './pages/user/NotificationsPage';
import {
    BASE_APP_PATH_HOME,
    BASE_APP_PATH_LOGIN,
    BASE_APP_PATH_REGISTER_COMPANY,
    BASE_APP_PATH_SIGNUP,
    BASE_APP_PATH_USER
} from "./config";
import SamplingAndStockPage from "./pages/user/SamplingAndStockPage";

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  // Track auth state using userSession singleton
  const [user, setUser] = useState(() => userSession.user);
  const [loggedIn, setLoggedIn] = useState(() => userSession.isAuthenticated);

  useEffect(() => {
    // Subscribe to userSession changes
    const unsubscribe = userSession.on('change', () => {
      setUser(userSession.user);
      setLoggedIn(userSession.isAuthenticated);
    });

    // Also listen to storage events (cross-tab logout/login)
    const onStorage = (e) => {
      if (['user', 'refresh_token', 'access_token', 'tc_user_session'].includes(e.key)) {
        setUser(userSession.user);
        setLoggedIn(userSession.isAuthenticated);
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Redirect to login if not authenticated on protected routes
  useEffect(() => {
    const isUserRoute = matchPath(`${BASE_APP_PATH_USER}/*`, location.pathname);
    if (!userSession.isAuthenticated && isUserRoute && location.pathname !== BASE_APP_PATH_LOGIN) {
      navigate(BASE_APP_PATH_LOGIN, { replace: true });
    }
  }, [location, navigate]);

  // Simplified logout handler - userSession.logout() handles everything
  const handleLogout = () => {
    userSession.logout();
    navigate(BASE_APP_PATH_LOGIN);
  };

  return (
    <Routes>
      {/* Make `/` render the LandingPage */}
      <Route path="/" element={<BaseLayout loggedIn={loggedIn} user={user} onLogout={handleLogout} showSidebar={false}><LandingPage /></BaseLayout>} />
      <Route path={BASE_APP_PATH_HOME} element={<BaseLayout loggedIn={loggedIn} user={user} onLogout={handleLogout} showSidebar={false}><HomePage /></BaseLayout>} />
      <Route path={BASE_APP_PATH_LOGIN} element={<BaseLayout loggedIn={loggedIn} user={user} onLogout={handleLogout} showSidebar={false}><LoginPage /></BaseLayout>} />
      <Route path={BASE_APP_PATH_SIGNUP} element={<BaseLayout loggedIn={loggedIn} user={user} onLogout={handleLogout} showSidebar={false}><SignupForm /></BaseLayout>} />
      <Route path={BASE_APP_PATH_REGISTER_COMPANY} element={<BaseLayout loggedIn={loggedIn} user={user} onLogout={handleLogout} showSidebar={false}><RegisterCompanyForm /></BaseLayout>} />
      <Route path={`${BASE_APP_PATH_USER}/*`} element={<UserLayout />} >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="pond" element={<PondPage />} />
        <Route path="ponds" element={<PondMonitoringPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="ai" element={<AiPage />} />
        <Route path="invoice" element={<InvoicePage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="dataset" element={<DatasetPage />} />
        <Route path="manage-users" element={<ManageUsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="fish" element={<FishPage />} />
        <Route path="sampling" element={<SamplingPage />} />
        <Route path="water-test" element={<WaterTestPage />} />
        <Route path="transform" element={<TransformPage />} />
        <Route path="expenses/:category" element={<CategoryList />} />
        <Route path="expenses/:category/:type" element={<TypeDetail />} />
        <Route path="expenses/company-account" element={<CompanyAccount />} />
        <Route path="expenses/passbook" element={<Passbook />} />
        <Route path="expenses/my-account" element={<MyAccount />} />
        <Route path="expenses/payslips" element={<UserPaySlips />} />
        <Route path="tree-user/:id" element={<TreeUserView />} />
        <Route path="stocks-sampling" element={<SamplingAndStockPage />} />
        {/* Add other user routes here */}
      </Route>
    </Routes>
  );
}


export default function App() {
  // Ensure routes match when app is hosted under a subpath (GitHub Pages project site)
  // Accept either a full URL (https://user.github.io/repo) or a path (/repo) in PACKAGE_JSON `homepage`.
  // If PUBLIC_URL is a full URL, extract the pathname so BrowserRouter receives a proper basename.
  let basename = '/';
  if (process.env.PUBLIC_URL) {
    try {
      // If PUBLIC_URL is a full URL, this will extract just the path part (e.g. '/repo')
      const parsed = new URL(process.env.PUBLIC_URL);
      basename = parsed.pathname.replace(/\/$/, '') || '/';
    } catch (e) {
      // If PUBLIC_URL is not a full URL (e.g. '/repo'), use it directly (trim trailing slash)
      basename = process.env.PUBLIC_URL.replace(/\/$/, '') || '/';
    }
  }
  return (
    <ThemeContextProvider>
      <AlertProvider>
        <UserProvider>
          <DataProvider>
            <Router basename={basename}>
              <ErrorBoundary>
                <GlobalAlertProvider />
                <AppRoutes />
              </ErrorBoundary>
            </Router>
          </DataProvider>
        </UserProvider>
      </AlertProvider>
    </ThemeContextProvider>
  );
}
