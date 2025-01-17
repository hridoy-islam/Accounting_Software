import { Button } from '@/components/ui/button';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const CompanyNav = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: `/admin/companies/${id}`, label: "Transaction History" },
    { path: `/admin/companies/${id}/transactions`, label: "Transactions" },
    { path: `/admin/companies/${id}/reports`, label: "Reports" },
    { path: `/admin/companies/${id}/storages`, label: "Storages" },
    { path: `/admin/companies/${id}/users`, label: "Users" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="mb-6 flex relative z-auto">
      <ul className="flex space-x-4">
        {navItems.map((item) => (
          <li key={item.path}>
            <Button
              onClick={() => handleNavigation(item.path)}
              className={`bg-white text-primary-foreground shadow px-3 py-1 text-black  ${
                location.pathname === item.path ? "bg-[#a78bfa] text-white" : ""
              }`}
            >
              {item.label}
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CompanyNav;
