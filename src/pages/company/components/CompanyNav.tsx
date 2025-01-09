import { useParams, useNavigate } from 'react-router-dom';

const CompanyNav = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="mb-6 flex relative z-auto">
      <ul className="flex space-x-4">
        <li>
          <button
            onClick={() => handleNavigation(`/admin/companies/${id}`)}
            className="text-blue-500 hover:underline"
          >
            Dashboard
          </button>
        </li>
        <li>
          <button
            onClick={() => handleNavigation(`/admin/companies/${id}/transactions`)}
            className="text-blue-500 hover:underline"
          >
            Transactions
          </button>
        </li>
        <li>
          <button
            onClick={() => handleNavigation(`/admin/companies/${id}/reports`)}
            className="text-blue-500 hover:underline"
          >
            Reports
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default CompanyNav