import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Settings, Menu, X, Database, RectangleEllipsis, ClipboardMinus } from 'lucide-react';
import { UserNav } from './user-nav';
import { useSelector } from 'react-redux';

export function TopNavigation() {
  const { user } = useSelector((state: any) => state.auth);
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


  return (
    <div className="flex flex-col">
      <header className="bg-[#a78bfa] shadow-sm">
        <div className="flex justify-between px-4 py-2">
          <button className="rounded-md p-2 text-gray-600 md:hidden" onClick={toggleSidebar}>
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <span className="text-xl mt-2 font-semibold text-white"> {user?.role === "admin" ? <Link to="/admin">Accounting Software</Link> : "Accounting Software"}</span>
          <UserNav />
        </div>
        
      </header>
      
    </div>
  );
}
