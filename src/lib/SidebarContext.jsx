import React, { createContext, useState } from 'react';

export const SidebarContext = createContext();

export default function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}