import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileSidebarOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  useEffect(() => {
    if (!mobileSidebarOpen) {
      document.body.style.removeProperty('overflow')
      return
    }

    document.body.style.setProperty('overflow', 'hidden')
    return () => {
      document.body.style.removeProperty('overflow')
    }
  }, [mobileSidebarOpen])

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 768) {
      setSidebarCollapsed((prev) => !prev)
      return
    }
    setMobileSidebarOpen((prev) => !prev)
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)]">
      <a
        href="#app-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-blue-700"
      >
        Skip to main content
      </a>
      <TopHeader onToggleSidebar={handleToggleSidebar} />
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <main
        id="app-main-content"
        ref={mainRef}
        tabIndex={-1}
        className={`ml-0 pt-16 transition-[margin] duration-200 ease-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}
      >
        <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
