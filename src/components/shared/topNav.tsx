import { useState, useEffect, useRef } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Settings, Menu, X } from 'lucide-react';
import { UserNav } from './user-nav';

export function TopNavigation() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
        <div className="flex  justify-between px-4 py-2">
          <button
            className="rounded-md p-2 text-gray-600 md:hidden"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          <div className="flex items-center justify-between space-x-2">
            <span className="text-xl font-semibold text-white">
              Admin Dashboard
            </span>
          </div>
          <UserNav />
        </div>
        <div className="hidden justify-start px-4  bg-white py-2 md:flex">
          <nav className="flex flex-row items-center space-x-2">
            <Button
              asChild
              variant="ghost"
              className="flex items-center justify-center py-2 hover:bg-[#a78bfa] md:justify-start md:py-3"
            >
              <Link to="/admin">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="flex items-center justify-center py-2 hover:bg-[#a78bfa] md:justify-start md:py-3"
            >
              <Link to="companies">
                <Users className="mr-2 h-4 w-4" /> Company
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="flex items-center justify-center py-2 hover:bg-[#a78bfa] md:justify-start md:py-3"
            >
              <Link to="users">
                <Users className="mr-2 h-4 w-4" /> All Users
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="flex items-center justify-center py-2 hover:bg-[#a78bfa] md:justify-start md:py-3"
            >
              <Link to="Categories">
                <Users className="mr-2 h-4 w-4" /> Category
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className="flex items-center justify-center py-2 hover:bg-[#a78bfa] md:justify-start md:py-3"
            >
              <Link to="methods">
                <Settings className="mr-2 h-4 w-4" /> Method
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}
        <aside
          ref={sidebarRef}
          className={`fixed inset-y-0 left-0 z-50 w-4/5 transform bg-gray-100 p-4 transition-transform duration-300 md:relative md:hidden md:w-64 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <nav className="space-y-4">
            <Button
              asChild
              variant="ghost"
              className="w-full justify-center max-md:py-6 md:justify-start"
            >
              <Link to="/admin" onClick={() => setSidebarOpen(false)}>
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="w-full justify-center max-md:py-6 md:justify-start"
            >
              <Link to="companies">
                <Users className="mr-2 h-4 w-4" /> Company
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="w-full justify-center max-md:py-6 md:justify-start"
            >
              <Link to="users">
                <Users className="mr-2 h-4 w-4" /> User
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="w-full justify-center max-md:py-6 md:justify-start"
            >
              <Link to="Categories">
                <Users className="mr-2 h-4 w-4" /> Category
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="w-full justify-center max-md:py-6 md:justify-start"
            >
              <Link to="methods">
                <Settings className="mr-2 h-4 w-4" /> Method
              </Link>
            </Button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-100 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
