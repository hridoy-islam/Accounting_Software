import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Database, FolderTree, Settings, Menu, X } from 'lucide-react'
import { UserNav } from './user-nav'

export function TopNavigation() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Toggle the sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
           {/* Menu Icon on small screens */}
           <button 
            className="md:hidden p-2 rounded-md text-gray-600" 
            onClick={toggleSidebar}
          >
            {/* Change the icon based on sidebarOpen */}
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-xl font-semibold">Admin Dashboard</span>
          </div>
          
          <UserNav />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
  
        <aside 
          className={`md:w-64 w-full bg-gray-100 p-4  ${sidebarOpen ? 'block' : 'hidden'} md:block`}
        >
          <nav className="space-y-2 ">
            <Button asChild variant="ghost" className="w-full max-md:py-6 md:justify-start justify-center">
              <Link to="/"><LayoutDashboard className="mr-2 h-4  w-4" /> Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full max-md:py-6 md:justify-start justify-center">
              <Link to="companies"><Users className="mr-2 h-4 w-4" /> Company</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full max-md:py-6  md:justify-start justify-center">
              <Link to="storages"><Database className="mr-2 h-4 w-4" /> Storage</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full max-md:py-6 md:justify-start justify-center">
              <Link to="categories"><FolderTree className="mr-2 h-4 w-4" /> Category</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full max-md:py-6  md:justify-start justify-center">
              <Link to="methods"><Settings className="mr-2 h-4 w-4" /> Method</Link>
            </Button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
