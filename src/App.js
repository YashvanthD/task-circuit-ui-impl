import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, matchPath, Navigate } from 'react-router-dom';
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
import ChatPage from './pages/user/ChatPage';
import ExpensesPage from './pages/user/ExpensesPage';
import InvoicePage from './pages/user/InvoicePage';
import SettingsPage from './pages/user/SettingsPage';
import { getRefreshToken, loadUserFromLocalStorage, removeFromLocalStorage, removeUserFromLocalStorage } from './utils/storage';
import SignupForm from './forms/SignupForm';
import RegisterCompanyForm from './forms/RegisterCompanyForm';
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

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  // Track auth state in React state so UI updates when localStorage changes (login/logout) without page reload
  const [user, setUser] = useState(() => loadUserFromLocalStorage());
  const [loggedIn, setLoggedIn] = useState(() => !!getRefreshToken() && !!loadUserFromLocalStorage());

  useEffect(() => {
    const onAuthChanged = () => {
      setUser(loadUserFromLocalStorage());
      setLoggedIn(!!getRefreshToken() && !!loadUserFromLocalStorage());
    };

    // Listen for custom auth change events dispatched by storage helpers
    window.addEventListener('authChanged', onAuthChanged);

    // Also listen to storage events (cross-tab logout/login)
    const onStorage = (e) => {
      if (e.key === 'user' || e.key === 'refresh_token' || e.key === 'access_token') {
        onAuthChanged();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('authChanged', onAuthChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    const isUserRoute = matchPath('/taskcircuit/user/*', location.pathname);
    if (!getRefreshToken() && isUserRoute && location.pathname !== '/taskcircuit/login') {
      navigate('/taskcircuit/login', { replace: true });
    }
  }, [location, navigate]);

  const handleLogout = () => {
    // Clear tokens and user info from storage (these functions will also trigger authChanged event)
    removeFromLocalStorage('refresh_token');
    removeFromLocalStorage('access_token');
    removeFromLocalStorage('access_token_expiry');
    removeUserFromLocalStorage();
    // Update local state immediately so UI (top nav) refreshes without reload
    setUser(null);
    setLoggedIn(false);
    // Navigate to login
    navigate('/taskcircuit/login');
    // Dispatch authChanged so any other listeners update
    try { window.dispatchEvent(new Event('authChanged')); } catch (e) {}
  };

  return (
    <Routes>
      {/* Make `/` render the LandingPage (same as `/taskcircuit/`) */}
      <Route path="/" element={<BaseLayout loggedIn={loggedIn} user={user} onLogout={handleLogout} showSidebar={false}><LandingPage /></BaseLayout>} />
      <Route path="/home" element={<Navigate to="/taskcircuit/" replace />} />
      <Route path="/taskcircuit/" element={<BaseLayout loggedIn={loggedIn} user={user} onLogout={handleLogout} showSidebar={false}><LandingPage /></BaseLayout>} />
      <Route path="/taskcircuit/home" element={<BaseLayout loggedIn={loggedIn} user={user} onLogout={handleLogout} showSidebar={false}><HomePage /></BaseLayout>} />
      <Route path="/taskcircuit/login" element={<BaseLayout loggedIn={loggedIn} user={user} onLogout={handleLogout} showSidebar={false}><LoginPage /></BaseLayout>} />
      <Route path="/taskcircuit/signup" element={<BaseLayout loggedIn={loggedIn} user={user} onLogout={handleLogout} showSidebar={false}><SignupForm /></BaseLayout>} />
      <Route path="/taskcircuit/register-company" element={<BaseLayout loggedIn={loggedIn} user={user} onLogout={handleLogout} showSidebar={false}><RegisterCompanyForm /></BaseLayout>} />
      <Route path="/taskcircuit/user/*" element={<UserLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="pond" element={<PondPage />} />
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
        {/* Add other user routes here */}
      </Route>
    </Routes>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
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
    <Router basename={basename}>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </Router>
  );
}
