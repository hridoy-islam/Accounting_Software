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
            Transaction History
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
        <li>
          <button
            onClick={() => handleNavigation(`/admin/companies/${id}/storages`)}
            className="text-blue-500 hover:underline"
          >
            Storage
          </button>
        </li>
        <li>
          <button
            onClick={() => handleNavigation(`/admin/companies/${id}/users`)}
            className="text-blue-500 hover:underline"
          >
            User
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default CompanyNav