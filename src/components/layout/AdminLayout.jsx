import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-8 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}