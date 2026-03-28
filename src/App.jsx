import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RoleProvider } from './contexts/RoleContext';
import { AppProvider } from './contexts/AppContext';
import { Toaster } from 'react-hot-toast';

import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import FirstSetup from './pages/FirstSetup';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Players from './pages/Players';
import Tournaments from './pages/Tournaments';
import Financials from './pages/Financials';
import RolesPage from './pages/RolesPage';
import Scrims from './pages/Scrims';
import Certificates from './pages/Certificates';
import Analytics from './pages/Analytics';
import AuditLogs from './pages/AuditLogs';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import PublicCertificate from './pages/PublicCertificate';
import Notifications from './pages/Notifications';
import Search from './pages/Search';

import { RoleRoute } from './components/auth/RoleRoute';
import { PERMISSIONS } from './utils/permissions';

function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <AppProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/setup" element={<FirstSetup />} />
              <Route path="/c/:certId" element={<PublicCertificate />} />

              {/* Protected app routes */}
              <Route path="/" element={<AppShell />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="teams" element={
                  <RoleRoute permission={PERMISSIONS.VIEW_TEAMS} redirect>
                    <Teams />
                  </RoleRoute>
                } />
                <Route path="players" element={
                  <RoleRoute permission={PERMISSIONS.VIEW_PLAYERS} redirect>
                    <Players />
                  </RoleRoute>
                } />
                <Route path="tournaments" element={
                  <RoleRoute permission={PERMISSIONS.VIEW_TOURNAMENTS} redirect>
                    <Tournaments />
                  </RoleRoute>
                } />
                <Route path="scrims" element={
                  <RoleRoute permission={PERMISSIONS.VIEW_SCRIMS} redirect>
                    <Scrims />
                  </RoleRoute>
                } />
                <Route path="analytics" element={
                  <RoleRoute permission={PERMISSIONS.VIEW_ANALYTICS} redirect>
                    <Analytics />
                  </RoleRoute>
                } />
                <Route path="certificates" element={
                  <RoleRoute permission={PERMISSIONS.VIEW_CERTIFICATES} redirect>
                    <Certificates />
                  </RoleRoute>
                } />
                <Route path="financials" element={
                  <RoleRoute permission={PERMISSIONS.VIEW_FINANCIALS} redirect>
                    <Financials />
                  </RoleRoute>
                } />
                <Route path="roles" element={
                  <RoleRoute permission={PERMISSIONS.MANAGE_ROLES} redirect>
                    <RolesPage />
                  </RoleRoute>
                } />
                <Route path="audit-logs" element={
                  <RoleRoute permission={PERMISSIONS.VIEW_AUDIT_LOGS} redirect>
                    <AuditLogs />
                  </RoleRoute>
                } />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="search" element={<Search />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(10,10,26,0.95)',
                color: '#fff',
                border: '1px solid rgba(0,245,255,0.3)',
                backdropFilter: 'blur(16px)',
                fontSize: '12px',
                fontWeight: 700,
              },
            }}
          />
        </AppProvider>
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;
