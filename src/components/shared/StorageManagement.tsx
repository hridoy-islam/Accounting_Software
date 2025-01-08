import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export function StorageManagement() {
  const [storages, setStorages] = useState<Storage[]>([])
  const { register, handleSubmit, reset } = useForm<Storage>()

  const onSubmit = (data: Storage) => {
    const newStorage = { ...data, id: Date.now() }
    setStorages([...storages, newStorage])
    reset()
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Storage Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="companyId">Company ID</Label>
              <Input id="companyId" type="number" {...register('companyId', { required: true })} />
            </div>
            <div>
              <Label htmlFor="name">Storage Name</Label>
              <Input id="name" {...register('name', { required: true })} />
            </div>
            <div>
              <Label htmlFor="openingBalance">Opening Balance</Label>
              <Input id="openingBalance" type="number" {...register('openingBalance', { required: true })} />
            </div>
            <div>
              <Label htmlFor="openingDate">Opening Date</Label>
              <Input id="openingDate" type="date" {...register('openingDate', { required: true })} />
            </div>
            <div>
              <Label htmlFor="logo">Logo URL</Label>
              <Input id="logo" {...register('logo', { required: true })} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => register('status').onChange({ target: { value } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="auditStatus">Audit Status</Label>
              <Select onValueChange={(value) => register('auditStatus').onChange({ target: { value } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audit status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Create Storage</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storages.map((storage) => (
              <Card key={storage.id}>
                <CardContent className="p-4">
                  <img src={storage.logo} alt={`${storage.name} logo`} className="w-full h-32 object-contain mb-2" />
                  <h3 className="font-bold">{storage.name}</h3>
                  <p>Company ID: {storage.companyId}</p>
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

