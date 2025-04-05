// import { useState, useEffect, useRef } from 'react';
// import { Link, useParams } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { LayoutDashboard, Users, Settings, Menu, X, Database, RectangleEllipsis, ClipboardMinus, File, ArrowLeftRight, FileSpreadsheet, Archive, ClipboardList } from 'lucide-react';
// import { UserNav } from './user-nav';
// import { useSelector } from 'react-redux';
// import axiosInstance from '@/lib/axios';
// import { DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '../ui/dropdown-menu';

// export function Navigation() {
//   const user = useSelector((state: any) => state.auth.user); // Get user from Redux state
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const sidebarRef = useRef(null);
//   const { id } = useParams();
//   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
//   const [companyName, setCompanyName] = useState(null);
//   const [companyThemeColor, setCompanyThemeColor] = useState<string>('');


//   useEffect(() => {
//     const handleOutsideClick = (event) => {
//       if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
//         setSidebarOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleOutsideClick);
//     return () => document.removeEventListener('mousedown', handleOutsideClick);
//   }, [sidebarOpen]);


//   useEffect(() => {

//     const fetchCompanyData = async () => {
//       try {
//         const company = await axiosInstance.get(`/users/${id}`);
//         setCompanyName(company.data.data);
//         setCompanyThemeColor(company.data.data.themeColor);
//       } catch (error) {
//         console.error('Error fetching company data:', error);
//       }
//     };

//     fetchCompanyData();
//   }, [id]);

//   const navItems = [

//     {
//       to: `/admin/company/${id}`,
//       icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
//       label: 'Dashboard',
//       roles: ['admin', 'user', 'company']
//     },
//     {
//       to: `/admin/company/${id}/invoice`,
//       icon: <ClipboardList className="mr-2 h-4 w-4" />,
//       label: 'Invoice',
//       roles: ['admin', 'user', 'company']
//     },
//     {
//       to: `/admin/company/${id}/transactions`,
//       icon: <ArrowLeftRight className="mr-2 h-4 w-4" />,
//       label: 'Transactions',
//       roles: ['admin', 'user', 'company'],

//       subItem: [
//         {
//           to: `/admin/company/${id}/transactions`,
//           icon: <ArrowLeftRight className="mr-2 h-4 w-4" />,
//           label: 'Pending',
//           roles: ['admin', 'user', 'company'],
//         },

//         {

//           to: `/admin/company/${id}/csv`,
//           icon: <FileSpreadsheet className="mr-2 h-4 w-4" />,
//           label: 'CSV Upload',
//           roles: ['admin', 'user', 'company']
//         },
//         {
//           to: `/admin/company/${id}/archive`,
//           icon: <Archive className="mr-2 h-4 w-4" />,
//           label: 'Archive',
//           roles: ['admin', 'user', 'company']
//         }


//       ]

//     },


//     {
//       to: `/admin/company/${id}/report`,
//       icon: <File className="mr-2 h-4 w-4" />,
//       label: 'Report',
//       roles: ['admin', 'user', 'company']
//     },




//     {

//       icon: <Settings className="mr-2 h-4 w-4" />,
//       label: 'Settings',
//       roles: ['admin', 'user', 'company'],
//       subItem: [
//         {
//           to: `/admin/company/${id}/methods`,
//           icon: <Settings className="mr-2 h-4 w-4" />,
//           label: 'Method',
//           roles: ['admin', 'user', 'company']
//         },
//         {
//           to: `/admin/company/${id}/storages`,
//           icon: <Database className="mr-2 h-4 w-4" />,
//           label: 'Storage',
//           roles: ['admin', 'company']
//         },

//         {
//           to: `/admin/company/${id}/categories`,
//           icon: <RectangleEllipsis className="mr-2 h-4 w-4" />,
//           label: 'Category',
//           roles: ['admin', 'user', 'company']
//         },

//         {
//           to: `/admin/company/${id}/users`,
//           icon: <Users className="mr-2 h-4 w-4" />,
//           label: 'Create Users',
//           roles: ['admin', 'company']
//         },
//         {
//           to: `/admin/company/${id}/users`,
//           icon: <Users className="mr-2 h-4 w-4" />,
//           label: 'Company Details',
//           roles: ['admin', 'company']
//         },
//       ]
//     }
//   ];

//   const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role ?? ''));

//   useEffect(() => {
//     const themeColor = companyThemeColor || '#a78bfa'; // Default color (adjust as needed)
//     document.documentElement.style.setProperty('--theme', themeColor);
//   }, [companyThemeColor]);



//   return (
//     <div className="flex flex-col">
//       <div className="hidden justify-between px-6 bg-white py-2 md:flex items-center rounded-lg shadow-md">
//         <div className='font-semibold'>
//           {companyName?.name}
//         </div>
//         <nav className="flex items-center">
//           {filteredNavItems.map(({ to, icon, label, subItems }) => (
//             <div key={to} className="relative">
//               {subItems ? (
//                 <DropdownMenuSub>
//                   <DropdownMenuSubTrigger className="flex w-full cursor-pointer items-center justify-between">
//                     <div className="flex items-center space-x-2">
//                       {icon}
//                       <span>{label}</span>
//                     </div>
//                   </DropdownMenuSubTrigger>
//                   <DropdownMenuSubContent className="border-none bg-supperagent">
//                     {subItems.map((subItem) => (
//                       <Button
//                         key={subItem.to}
//                         asChild
//                         variant="ghost"
//                         className="w-full justify-center max-md:py-6 md:justify-start"
//                       >
//                         <Link to={subItem.to}>{subItem.icon} {subItem.label}</Link>
//                       </Button>
//                     ))}
//                   </DropdownMenuSubContent>
//                 </DropdownMenuSub>
//               ) : (
//                 <Button
//                   asChild
//                   variant="ghost"
//                   className="flex items-center justify-center py-2 hover:bg-theme md:justify-start md:py-3"
//                 >
//                   <Link to={to}>
//                     {icon} {label}
//                   </Link>
//                 </Button>
//               )}
//             </div>
//           ))}
//         </nav>
//       </div>

//       <div className="flex flex-1 overflow-hidden">
//         {sidebarOpen && (
//           <div
//             className="fixed inset-0 z-50 bg-black/50 md:hidden"
//             onClick={toggleSidebar}
//           ></div>
//         )}
//         <aside
//           ref={sidebarRef}
//           className={`fixed inset-y-0 left-0 z-50 w-4/5 transform bg-gray-100 p-4 transition-transform duration-300 md:relative md:hidden md:w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
//             }`}
//         >
//           <nav className="space-y-4">
//             {filteredNavItems.map(({ to, icon, label, subItems }) => (
//               <div key={to} className="relative">
//                 {subItems ? (
//                   <DropdownMenuSub>
//                     <DropdownMenuSubTrigger className="flex w-full cursor-pointer items-center justify-between">
//                       <div className="flex items-center space-x-2">
//                         {icon}
//                         <span>{label}</span>
//                       </div>
//                     </DropdownMenuSubTrigger>
//                     <DropdownMenuSubContent className="border-none bg-supperagent">
//                       {subItems.map((subItem) => (
//                         <Button
//                           key={subItem.to}
//                           asChild
//                           variant="ghost"
//                           className="w-full justify-center max-md:py-6 md:justify-start"
//                         >
//                           <Link to={subItem.to} onClick={() => setSidebarOpen(false)}>
//                             {subItem.icon} {subItem.label}
//                           </Link>
//                         </Button>
//                       ))}
//                     </DropdownMenuSubContent>
//                   </DropdownMenuSub>
//                 ) : (
//                   <Button
//                     asChild
//                     variant="ghost"
//                     className="w-full justify-center max-md:py-6 md:justify-start"
//                   >
//                     <Link to={to} onClick={() => setSidebarOpen(false)}>
//                       {icon} {label}
//                     </Link>
//                   </Button>
//                 )}
//               </div>
//             ))}
//           </nav>
//         </aside>
//       </div>
//     </div>
//   );
// }



import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Settings, Menu, X, Database, RectangleEllipsis, ClipboardMinus, File, ArrowLeftRight, FileSpreadsheet, Archive, ClipboardList, ChevronDown, BadgePoundSterling, FileWarning } from 'lucide-react';
import { UserNav } from './user-nav';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/axios';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function Navigation() {
  const user = useSelector((state: any) => state.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const { id } = useParams();
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [companyName, setCompanyName] = useState(null);
  const [companyThemeColor, setCompanyThemeColor] = useState<string>('');

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
        const company = await axiosInstance.get(`/users/${id}`);
        setCompanyName(company.data.data);
        setCompanyThemeColor(company.data.data.themeColor);
      } catch (error) {
        console.error('Error fetching company data:', error);
      }
    };

    fetchCompanyData();
  }, [id]);

  const navItems = [
    {
      to: `/admin/company/${id}`,
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: 'Dashboard',
      roles: ['admin', 'user', 'company']
    },
    {
      to: `/admin/company/${id}/invoice`,
      icon: <ClipboardList className="h-4 w-4" />,
      label: 'Invoice',
      roles: ['admin', 'user', 'company']
    },
    {
      icon: <ArrowLeftRight className="h-4 w-4" />,
      label: 'Transactions',
      roles: ['admin', 'user', 'company'],
      subItems: [
        {
          to: `/admin/company/${id}/transactions`,
          icon: <BadgePoundSterling  className="h-4 w-4" />,
          label: 'Transaction List',
          roles: ['admin', 'user', 'company'],
        },
        {
          to: `/admin/company/${id}/pending`,
          icon: <FileWarning  className="h-4 w-4" />,
          label: 'Pending',
          roles: ['admin', 'user', 'company'],
        },
        {
          to: `/admin/company/${id}/csv`,
          icon: <FileSpreadsheet className="h-4 w-4" />,
          label: 'CSV Upload',
          roles: ['admin', 'user', 'company']
        },
        {
          to: `/admin/company/${id}/archive`,
          icon: <Archive className="h-4 w-4" />,
          label: 'Archive',
          roles: ['admin', 'user', 'company']
        }
      ]
    },
    {
      to: `/admin/company/${id}/report`,
      icon: <File className="h-4 w-4" />,
      label: 'Report',
      roles: ['admin', 'user', 'company']
    },
    {
      icon: <Settings className="h-4 w-4" />,
      label: 'Settings',
      roles: ['admin', 'user', 'company'],
      subItems: [
        {
          to: `/admin/company/${id}/methods`,
          icon: <Settings className="h-4 w-4" />,
          label: 'Method',
          roles: ['admin', 'user', 'company']
        },
        {
          to: `/admin/company/${id}/storages`,
          icon: <Database className="h-4 w-4" />,
          label: 'Storage',
          roles: ['admin', 'company']
        },
        {
          to: `/admin/company/${id}/categories`,
          icon: <RectangleEllipsis className="h-4 w-4" />,
          label: 'Category',
          roles: ['admin', 'user', 'company']
        },
        {
          to: `/admin/company/${id}/users`,
          icon: <Users className="h-4 w-4" />,
          label: 'Create Users',
          roles: ['admin', 'company']
        },
        {
          to: `/admin/company/${id}/company-details`,
          icon: <Users className="h-4 w-4" />,
          label: 'Company Details',
          roles: ['admin', 'company']
        },
      ]
    }
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role ?? ''));

  useEffect(() => {
    const themeColor = companyThemeColor || '#a78bfa';
    document.documentElement.style.setProperty('--theme', themeColor);
  }, [companyThemeColor]);

  const NavItem = ({ item, depth = 0 }) => {
    if (item.subItems) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center  space-x-2 hover:bg-theme hover:text-white">
              {item.icon}
              <span>{item.label}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border border-gray-400 bg-white shadow-lg">
            {item.subItems
              .filter(subItem => subItem.roles.includes(user?.role ?? ''))
              .map((subItem) => (
                <DropdownMenuItem key={subItem.to} asChild>
                  <Link
                    to={subItem.to}
                    className="flex w-full cursor-pointer items-center space-x-2 hover:bg-theme hover:text-white"
                  >
                    {subItem.icon}
                    <span>{subItem.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button asChild variant="ghost" className="hover:bg-theme hover:text-white">
        <Link
          to={item.to}
          className="flex items-center space-x-2"
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      </Button>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Mobile menu button */}
      <div className="flex items-center justify-between p-4 md:hidden">
        <Button variant="ghost" onClick={toggleSidebar} className="hover:bg-theme hover:text-white">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
        <div className="font-semibold">{companyName?.name}</div>
      </div>

      {/* Desktop navigation */}
      <div className="hidden justify-between px-6 bg-white py-2 md:flex items-center rounded-lg shadow-md">
        <div className='font-semibold'>
          {companyName?.name}
        </div>
        <nav className="flex items-center gap-1">
          {filteredNavItems.map((item) => (
            <div key={item.label || item.to}>
              <NavItem item={item} />
            </div>
          ))}
        </nav>
      </div>

      {/* Mobile sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}
        <aside
          ref={sidebarRef}
          className={`fixed inset-y-0 left-0 z-50 w-4/5 transform bg-white p-4 transition-transform duration-300 md:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="mb-4 flex items-center justify-between border-b pb-4">
            <div className="font-semibold">{companyName?.name}</div>
            <Button variant="ghost" onClick={toggleSidebar} className="hover:bg-theme hover:text-white">
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="space-y-2">
            {filteredNavItems.map((item) => (
              <div key={item.label || item.to} className="w-full">
                {item.subItems ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex w-full items-center justify-start gap-2 hover:bg-theme hover:text-white">
                        {item.icon}
                        {item.label}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="border-none bg-white shadow-lg">
                      {item.subItems
                        .filter(subItem => subItem.roles.includes(user?.role ?? ''))
                        .map((subItem) => (
                          <DropdownMenuItem key={subItem.to} asChild>
                            <Link 
                              to={subItem.to} 
                              className="flex items-center gap-2 hover:bg-theme hover:text-white"
                              onClick={() => setSidebarOpen(false)}
                            >
                              {subItem.icon}
                              {subItem.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    asChild
                    variant="ghost"
                    className="flex w-full items-center justify-start gap-2 hover:bg-theme hover:text-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Link to={item.to}>
                      {item.icon}
                      {item.label}
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}