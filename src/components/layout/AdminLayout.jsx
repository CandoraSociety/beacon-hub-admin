import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { SidebarContext } from '@/lib/SidebarContext';

export default function AdminLayout() {
  const { collapsed } = useContext(SidebarContext);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={cn('min-h-screen transition-all duration-300', collapsed ? 'ml-20' : 'ml-64')}>
        <div className="p-6 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

import { cn } from '@/lib/utils';