import { useState, useEffect, useRef } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { UserNav } from './user-nav';

export function TopNavigation() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null); // Reference for the sidebar

  // Toggle the sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-[#a78bfa] shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Menu Icon on small screens */}
          <button
            className="rounded-md p-2 text-gray-600 md:hidden"
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
        <div className="hidden justify-center  bg-white py-2 md:flex">

          <nav className="flex flex-row items-center space-x-2">
            <Button
              asChild
              variant="ghost"
              className="flex items-center hover:bg-[#a78bfa] justify-center py-2 md:justify-start md:py-3"
            >
              <Link to="/admin">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="flex hover:bg-[#a78bfa] items-center justify-center py-2 md:justify-start md:py-3"
            >
              <Link to="companies">
                <Users className="mr-2 h-4 w-4" /> Company
              </Link>
            </Button>
  
            <Button
              asChild
              variant="ghost"
              className="flex hover:bg-[#a78bfa] items-center justify-center py-2 md:justify-start md:py-3"
            >
              <Link to="methods">
                <Settings className="mr-2 h-4 w-4" /> Method
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="md:hidden">
          <aside
            ref={sidebarRef}
            className={`${
              sidebarOpen ? 'block h-full' : 'hidden'
            } fixed inset-0 w-4/5 bg-gray-100 p-4 md:static md:block md:h-auto md:w-64`}
          >
            <nav className="space-y-2">
              <Button
                asChild
                variant="ghost"
                className="w-full hover:bg-[#a78bfa] justify-center max-md:py-6 md:justify-start"
              >
                <Link to="/admin" onClick={() => setSidebarOpen(false)}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="w-full hover:bg-[#a78bfa] justify-center max-md:py-6 md:justify-start"
              >
                <Link to="companies" onClick={() => setSidebarOpen(false)}>
                  <Users className="mr-2 h-4 w-4" /> Company
                </Link>
              </Button>
             
              <Button
                asChild
                variant="ghost"
                className="w-full hover:bg-[#a78bfa] justify-center max-md:py-6 md:justify-start"
              >
                <Link to="methods" onClick={() => setSidebarOpen(false)}>
                  <Settings className="mr-2 h-4 w-4" /> Method
                </Link>
              </Button>
            </nav>
          </aside>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-100 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
