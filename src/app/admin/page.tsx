'use client';

import { useState } from 'react';
import AdminLoginPage from '@/components/admin/admin-login-page';
import AdminPanel from '@/components/admin/admin-panel';

export default function AdminAccessPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminPanel onLogout={handleLogout} />;
}
