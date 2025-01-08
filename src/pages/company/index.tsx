import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import placeholder from "@/assets/imges/home/logos/placeholder.jpg"


interface Company {
  id: number
  email: string
  name: string
  phone: string
  logo: string
}

export function Company() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Company>()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCompanies = async () => {
      const response = await new Promise<Company[]>((resolve) =>
        setTimeout(() =>
          resolve([
            { id: 1, email: 'company1@example.com', name: 'Company 1', phone: '1234567890',  logo: '' },
            { id: 2, email: 'company2@example.com', name: 'Company 2', phone: '0987654321',  logo: '' },
          ]), 1000)
      )
      setCompanies(response)
    }

    fetchCompanies()
  }, [])

  const onSubmit = async (data: any) => {
    const logoFile = data.logo[0]
    const logoUrl = await convertToBase64(logoFile)
    const newCompany = { ...data, id: Date.now(), logo: logoUrl }
    setCompanies((prevCompanies) => [...prevCompanies, newCompany])
    reset()

    // Close the dialog after successful submission
    setIsDialogOpen(false)
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
      {/* Add New Company Button */}
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
          <DialogTrigger asChild>
            <Button className="hover:bg-[#a78bfa] hover:text-white" onClick={() => setIsDialogOpen(true)}>
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Company Email</Label>
                <Input id="email" type="email" {...register('email', { required: 'Email is required' })} />
                {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
              </div>
              <div>
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" {...register('name', { required: 'Company Name is required' })} />
                {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
              </div>
              <div>
                <Label htmlFor="phone">Company Phone</Label>
                <Input id="phone" type="tel" {...register('phone', { required: 'Phone number is required' })} />
                {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
              </div>
            
              <div>
                <Label htmlFor="logo">Company Logo</Label>
                <Input id="logo" type="file" accept="image/*" {...register('logo', { required: 'Logo is required' })} />
                {errors.logo && <span className="text-red-500 text-sm">{errors.logo.message}</span>}
              </div>
              <Button type="submit" variant="default" className='hover:bg-[#a78bfa] hover:text-white'>Submit</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Registered Companies */}
      <Card>
        <CardHeader className='p-6'>
          <CardTitle>Registered Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {companies.map((company) => (
              <Card
                key={company.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`${company.id}`)}
              >
                <CardContent className="p-4">
                  <img src={company.logo || placeholder} alt={`${company.name} logo`} className="w-full h-auto object-cover mb-2" />
                  <h3 className="font-bold">{company.name}</h3>
                  <p>{company.email}</p>
                  <p>{company.phone}</p>
      
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
