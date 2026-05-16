import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import { SidebarContext } from '@/lib/SidebarContext';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  const { collapsed } = useContext(SidebarContext);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className={cn('flex-1 transition-all duration-300', collapsed ? 'ml-20' : 'ml-64')}>
          <div className="p-6 sm:p-8">
            <Outlet />
          </div>
        </main>
      </div>
      </div>
      );
      }