import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import placeholder from '@/assets/imges/home/logos/placeholder.jpg';
import axiosInstance from '@/lib/axios'
import { useSelector } from 'react-redux';
interface Company {
  _id: number;
  companyName: string;
  logo: string;
}

export function Dashboard() {
  const user = useSelector((state: any) => state.auth.user); // Get user from Redux state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const [users, setUsers] = useState([])
  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      let url;
      if (user.role === 'admin') {
        url = `/companies?createdBy=${user._id}`;
      } else if (user.role === 'user') {
        url = `/companies?assignUser=${user._id}`;
      }
      const response = await axiosInstance.get(url);

      setCompanies(response.data.data.result);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get(`/users`);
    
      setUsers(response.data.data.meta);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };


  useEffect(() => {
    fetchData();
    fetchUserData();
  }, [])



  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card>
          <CardHeader className='p-6'>
            <CardTitle>Total Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-8xl font-bold">{companies.length}</p>
          </CardContent>
        </Card>
        
      </div>

      <Card>
        <CardHeader className='p-6'>
          <CardTitle>Registered Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-6">
            {companies.map((company) => (
              <Link to={`companies/${company._id}`}>
                <Card
                  key={company.id}
                  className="w-auto cursor-pointer transition-shadow hover:shadow-lg"
                >
                  <CardContent className="p-4">
                    <img
                      src={company.logo || placeholder}
                      alt={`${company.companyName} logo`}
                      className="mb-2 h-full w-full object-cover"
                    />
                    <h3 className="font-bold">{company.companyName}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
