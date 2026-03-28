import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import { useAuth } from '../../hooks/useAuth';
import { FullPageSpinner } from '../ui/Spinner';
import { SYSTEM_EMAILS } from '../../utils/permissions';

export default function AppShell() {
  const { user, loading, isFirstLogin } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (loading) {
    return <FullPageSpinner text="Initializing Zentrix OS..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // NEVER redirect system accounts (founders) to setup — double safety net
  const isSystem = user.email && SYSTEM_EMAILS.includes(user.email.toLowerCase());
  if (isFirstLogin && !isSystem) {
    return <Navigate to="/setup" replace />;
  }

  return (
    <div className="min-h-screen bg-space text-white font-body overflow-x-hidden selection:bg-cyan-400/30">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

      <main className="md:ml-[260px] pt-24 pb-32 px-4 sm:px-6 lg:px-12 min-h-screen relative z-10 transition-all duration-300">
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <MobileNav />

      {/* Decorative blurred background elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none z-0" />
    </div>
  );
}
