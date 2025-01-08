import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Company {
  id: number
  email: string
  name: string
  phone: string
  role: string
  logo: string
}

export function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([])
  const { register, handleSubmit, reset } = useForm<Company>()
  const navigate = useNavigate()

  useEffect(() => {
    // Simulating API call to fetch companies
    const fetchCompanies = async () => {
      // In a real application, this would be an API call
      const response = await new Promise<Company[]>((resolve) => 
        setTimeout(() => resolve([
          { id: 1, email: 'company1@example.com', name: 'Company 1', phone: '1234567890', role: 'Admin', logo: '/placeholder.svg' },
          { id: 2, email: 'company2@example.com', name: 'Company 2', phone: '0987654321', role: 'User', logo: '/placeholder.svg' },
        ]), 1000)
      )
      setCompanies(response)
    }

    fetchCompanies()
  }, [])

  const onSubmit = async (data: any) => {
    const logoFile = data.logo[0] // Accessing the file from the form data
    const logoUrl = await convertToBase64(logoFile) // Convert the file to base64
    const newCompany = { ...data, id: Date.now(), logo: logoUrl }
    setCompanies([...companies, newCompany])
    reset()
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Company</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email', { required: true })} />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name', { required: true })} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" {...register('phone', { required: true })} />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input id="role" {...register('role', { required: true })} />
            </div>
            <div>
              <Label htmlFor="logo">Logo</Label>
              <Input id="logo" type="file" accept="image/*" {...register('logo', { required: true })} />
            </div>
            <Button type="submit">Add Company</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registered Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <Card key={company.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`${company.id}`)}>
                <CardContent className="p-4">
                  <img src={company.logo} alt={`${company.name} logo`} className="w-full h-32 object-contain mb-2" />
                  <h3 className="font-bold">{company.name}</h3>
                  <p>{company.email}</p>
                  <p>{company.phone}</p>
                  <p>{company.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
