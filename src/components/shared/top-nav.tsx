import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Settings, Menu, X, Database, RectangleEllipsis, ClipboardMinus } from 'lucide-react';
import { UserNav } from './user-nav';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/axios'; 

export function TopNavigation() {
  const { user } = useSelector((state: any) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyThemeColor, setCompanyThemeColor] = useState<string>('');
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


useEffect(() => {
    const fetchCompanyData = async () => {

      try {
        const response = await axiosInstance.get(`/users/${id}`);
        setCompanyThemeColor(response.data.data.themeColor); // Fetch and set the company theme color
        
      } catch (error) {
        console.error('Error fetching company data:', error);
      }
    };
    fetchCompanyData();
  }, [id]);

  useEffect(() => {
    const themeColor = companyThemeColor || '#a78bfa'; // Default color (adjust as needed)
    document.documentElement.style.setProperty('--theme', themeColor);
  }, [companyThemeColor]);
  

  return (
    <div className="flex flex-col">
      <header className="bg-theme shadow-sm">
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
