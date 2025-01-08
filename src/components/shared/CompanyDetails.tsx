import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Company {
  id: number
  email: string
  name: string
  phone: string
  role: string
  logo: string
}

interface Storage {
  id: number
  companyId: number
  name: string
  openingBalance: number
  openingDate: string
  logo: string
  status: 'active' | 'inactive'
  auditStatus: 'pending' | 'completed'
}

export function CompanyDetails() {
  const { id } = useParams<{ id: string }>()
  const [company, setCompany] = useState<Company | null>(null)
  const [storages, setStorages] = useState<Storage[]>([])

  useEffect(() => {
    // Simulating API call to fetch company details
    const fetchCompanyDetails = async () => {
      // In a real application, this would be an API call
      const companyResponse = await new Promise<Company>((resolve) => 
        setTimeout(() => resolve({
          id: Number(id),
          email: 'company@example.com',
          name: 'Example Company',
          phone: '1234567890',
          role: 'Admin',
          logo: '/placeholder.svg'
        }), 1000)
      )
      setCompany(companyResponse)

      // Simulating API call to fetch company storages
      const storagesResponse = await new Promise<Storage[]>((resolve) => 
        setTimeout(() => resolve([
          { id: 1, companyId: Number(id), name: 'Storage 1', openingBalance: 1000, openingDate: '2023-01-01', logo: '/placeholder.svg', status: 'active', auditStatus: 'pending' },
          { id: 2, companyId: Number(id), name: 'Storage 2', openingBalance: 2000, openingDate: '2023-02-01', logo: '/placeholder.svg', status: 'inactive', auditStatus: 'completed' },
        ]), 1000)
      )
      setStorages(storagesResponse)
    }

    fetchCompanyDetails()
  }, [id])

  if (!company) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <img src={company.logo} alt={`${company.name} logo`} className="w-24 h-24 object-contain" />
            <div>
              <h2 className="text-2xl font-bold">{company.name}</h2>
              <p>{company.email}</p>
              <p>{company.phone}</p>
              <p>Role: {company.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company Storages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storages.map((storage) => (
              <Card key={storage.id}>
                <CardContent className="p-4">
                  <img src={storage.logo} alt={`${storage.name} logo`} className="w-full h-32 object-contain mb-2" />
                  <h3 className="font-bold">{storage.name}</h3>
                  <p>Opening Balance: ${storage.openingBalance}</p>
                  <p>Opening Date: {storage.openingDate}</p>
                  <p>Status: {storage.status}</p>
                  <p>Audit Status: {storage.auditStatus}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

