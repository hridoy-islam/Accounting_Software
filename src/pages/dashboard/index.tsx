import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import placeholder from '@/assets/imges/home/logos/placeholder.jpg';

interface Company {
  id: number;
  name: string;
  logo: string;
}

export function Dashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulating API call to fetch companies
    const fetchCompanies = async () => {
      // In a real application, this would be an API call
      const response = await new Promise<Company[]>((resolve) =>
        setTimeout(
          () =>
            resolve([
              { id: 1, name: 'Company 1', logo: '' },
              { id: 2, name: 'Company 2', logo: '' },
              { id: 3, name: 'Company 3', logo: '' }
            ]),
          1000
        )
      );
      setCompanies(response);
    };

    fetchCompanies();
  }, []);

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
        <Card>
          <CardHeader className='p-6'>
            <CardTitle>Total Storage Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-8xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='p-6'>
            <CardTitle>Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-8xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='p-6'>
            <CardTitle>Total Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-8xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className='p-6'>
          <CardTitle>Registered Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 justify-items-center gap-4 md:grid-cols-2 lg:grid-cols-4">
            {companies.map((company) => (
              <Card
                key={company.id}
                className="w-auto cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() => navigate(`companies/${company.id}`)}
              >
                <CardContent className="p-4">
                  <img
                    src={company.logo || placeholder}
                    alt={`${company.name} logo`}
                    className="mb-2 h-full w-full object-cover"
                  />
                  <h3 className="font-bold">{company.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
