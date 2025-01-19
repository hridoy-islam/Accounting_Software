import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Settings, Menu, X } from 'lucide-react';
import { UserNav } from './user-nav';
import { useSelector } from 'react-redux';

export function TopNavigation() {
  const user = useSelector((state) => state.auth.user); // Get user from Redux state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [sidebarOpen]);

  const navItems = [
    { to: '/admin', icon: <LayoutDashboard className="mr-2 h-4 w-4" />, label: 'Dashboard', roles: ['admin', 'user'] },
    { to: 'companies', icon: <Users className="mr-2 h-4 w-4" />, label: 'Company', roles: ['admin', 'user'] },
    { to: 'users', icon: <Users className="mr-2 h-4 w-4" />, label: 'All Users', roles: ['admin'] },
    { to: 'Categories', icon: <Users className="mr-2 h-4 w-4" />, label: 'Category', roles: ['admin', 'user'] },
    { to: 'methods', icon: <Settings className="mr-2 h-4 w-4" />, label: 'Method', roles: ['admin', 'user'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role ?? ''));

  return (
    <div className="flex flex-col">
      <header className="bg-[#a78bfa] shadow-sm">
        <div className="flex justify-between px-4 py-2">
          <button className="rounded-md p-2 text-gray-600 md:hidden" onClick={toggleSidebar}>
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <span className="text-xl font-semibold text-white">Admin Dashboard</span>
          <UserNav />
        </div>
        <div className="hidden justify-start px-4 bg-white py-2 md:flex">
          <nav className="flex items-center space-x-2">
            {filteredNavItems.map(({ to, icon, label }) => (
              <Button
                key={to}
                asChild
                variant="ghost"
                className="flex items-center justify-center py-2 hover:bg-[#a78bfa] md:justify-start md:py-3"
              >
                <Link to={to}>
                  {icon} {label}
                </Link>
              </Button>
            ))}
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
            {filteredNavItems.map(({ to, icon, label }) => (
              <Button
                key={to}
                asChild
                variant="ghost"
                className="w-full justify-center max-md:py-6 md:justify-start"
              >
                <Link to={to} onClick={() => setSidebarOpen(false)}>
                  {icon} {label}
                </Link>
              </Button>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
