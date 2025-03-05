import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Settings, Menu, X, Database, RectangleEllipsis, ClipboardMinus, File, ArrowLeftRight, FileSpreadsheet } from 'lucide-react';
import { UserNav } from './user-nav';
import { useSelector } from 'react-redux';

export function Navigation() {
  const user = useSelector((state:any) => state.auth.user); // Get user from Redux state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const { id } = useParams();
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

    {
      to: `/admin/company/${id}`,
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
      label: 'Dashboard',
      roles: ['admin', 'user', 'company']
    },
    {
      to: `/admin/company/${id}/transactions`,
      icon: <ArrowLeftRight  className="mr-2 h-4 w-4" />,
      label: 'Transactions',
      roles: ['admin', 'user', 'company']
    },
    {
      to: `/admin/company/${id}/csv`,
      icon: <FileSpreadsheet className="mr-2 h-4 w-4" />,
      label: 'CSV Upload',
      roles: ['admin', 'user','company']
    },
    {
      to: `/admin/company/${id}/report`,
      icon: <File className="mr-2 h-4 w-4" />,
      label: 'Report',
      roles: ['admin', 'user', 'company']
    },
    
    {
      to: `/admin/company/${id}/users`,
      icon: <Users className="mr-2 h-4 w-4" />,
      label: 'Create Users',
      roles: ['admin', 'company']
    },
    {
      to: `/admin/company/${id}/categories`,
      icon: <RectangleEllipsis className="mr-2 h-4 w-4" />,
      label: 'Category',
      roles: ['admin', 'user']
    },
    {
      to: `/admin/company/${id}/storages`,
      icon: <Database className="mr-2 h-4 w-4" />,
      label: 'Storage',
      roles: ['admin',  'company']
    },
    {
      to: `/admin/company/${id}/methods`,
      icon: <Settings className="mr-2 h-4 w-4" />,
      label: 'Method',
      roles: ['admin', 'user','company']
    }
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role ?? ''));

  return (
    <div className="flex flex-col">
      
        <div className="hidden justify-start px-4 bg-white py-2 md:flex rounded-lg shadow-md">
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
