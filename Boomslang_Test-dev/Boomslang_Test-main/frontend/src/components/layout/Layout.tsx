import React, { useState } from 'react'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar collapsed={sidebarCollapsed} />
      <main className={`pt-14 ${sidebarCollapsed ? 'ml-16' : 'ml-60'} transition-all duration-200`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
