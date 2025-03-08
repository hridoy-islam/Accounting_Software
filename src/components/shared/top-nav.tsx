import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {  Menu, X } from 'lucide-react';
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
    const savedTheme = localStorage.getItem("themeColor");
    if (savedTheme) {
      document.documentElement.style.setProperty("--theme", savedTheme);
      setCompanyThemeColor(savedTheme); // Set the theme color from localStorage
    }
  }, []);

  // Fetch company-specific theme color based on `id`
  useEffect(() => {
    if (id) {
      const fetchCompanyData = async () => {
        try {
          const response = await axiosInstance.get(`/users/${id}`);
          const themeColor = response.data.data.themeColor || '#a78bfa'; // Fallback theme color
          setCompanyThemeColor(themeColor);
          localStorage.setItem("themeColor", themeColor); // Store it in localStorage
          document.documentElement.style.setProperty("--theme", themeColor); // Apply the new theme
        } catch (error) {
          console.error('Error fetching company data:', error);
          // Fallback theme color in case of an error
          const fallbackColor = '#a78bfa';
          setCompanyThemeColor(fallbackColor);
          localStorage.setItem("themeColor", fallbackColor); // Store fallback in localStorage
          document.documentElement.style.setProperty("--theme", fallbackColor); // Apply fallback theme
        }
      };
      fetchCompanyData();
    } else {
      // If id is undefined, apply default theme color
      const fallbackColor = '#a78bfa';
      setCompanyThemeColor(fallbackColor);
      localStorage.setItem("themeColor", fallbackColor); // Store fallback in localStorage
      document.documentElement.style.setProperty("--theme", fallbackColor); // Apply fallback theme
    }
  }, [id]);



  useEffect(() => {
    if (id) {
      const fetchCompanyData = async () => {
        try {
          const response = await axiosInstance.get(`/users/${id}`);
          const themeColor = response.data.data.themeColor || '#a78bfa'; // Fallback theme color
          setCompanyThemeColor(themeColor);
          localStorage.setItem("themeColor", themeColor); // Store it in localStorage
          document.documentElement.style.setProperty("--theme", themeColor); // Apply the new theme
        } catch (error) {
          console.error('Error fetching company data:', error);
        }
      };
      fetchCompanyData();
    }
  }, [id]);

  // Apply theme color when `companyThemeColor` changes
  useEffect(() => {
    if (companyThemeColor) {
      document.documentElement.style.setProperty("--theme", companyThemeColor); // Apply the new theme
      localStorage.setItem("themeColor", companyThemeColor); // Store it in localStorage
    }
  }, [companyThemeColor,id]);

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
