import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Company {
  id: number
  name: string
  logo: string
}

export function Dashboard() {
  const [companies, setCompanies] = useState<Company[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    // Simulating API call to fetch companies
    const fetchCompanies = async () => {
      // In a real application, this would be an API call
      const response = await new Promise<Company[]>((resolve) => 
        setTimeout(() => resolve([
          { id: 1, name: 'Company 1', logo: '/placeholder.svg' },
          { id: 2, name: 'Company 2', logo: '/placeholder.svg' },
          { id: 3, name: 'Company 3', logo: '/placeholder.svg' },
        ]), 1000)
      )
      setCompanies(response)
    }

    fetchCompanies()
  }, [])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{companies.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Storage Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <Card key={company.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`companies/${company.id}`)}>
                <CardContent className="p-4">
                  <img src={company.logo} alt={`${company.name} logo`} className="w-full h-32 object-contain mb-2" />
                  <h3 className="font-bold">{company.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

