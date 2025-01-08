import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  const [storages, setStorages] = useState<Storage[]>([
    { id: 1, companyId: 101, name: 'Storage A', openingBalance: 500, openingDate: '2024-01-01', logo: '', status: 'active', auditStatus: 'pending' },
    { id: 2, companyId: 102, name: 'Storage B', openingBalance: 200, openingDate: '2024-02-15', logo: '', status: 'inactive', auditStatus: 'completed' },
    { id: 3, companyId: 103, name: 'Storage C', openingBalance: 350, openingDate: '2024-03-10', logo: '', status: 'active', auditStatus: 'pending' },
    { id: 4, companyId: 104, name: 'Storage D', openingBalance: 800, openingDate: '2024-04-01', logo: '', status: 'inactive', auditStatus: 'completed' },
    { id: 5, companyId: 105, name: 'Storage E', openingBalance: 600, openingDate: '2024-05-20', logo: '', status: 'active', auditStatus: 'pending' },
    { id: 6, companyId: 106, name: 'Storage F', openingBalance: 900, openingDate: '2024-06-15', logo: '', status: 'inactive', auditStatus: 'completed' },
    { id: 7, companyId: 107, name: 'Storage G', openingBalance: 450, openingDate: '2024-07-10', logo: '', status: 'active', auditStatus: 'pending' },
    { id: 8, companyId: 108, name: 'Storage H', openingBalance: 700, openingDate: '2024-08-01', logo: '', status: 'inactive', auditStatus: 'completed' },
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [storageToEdit, setStorageToEdit] = useState<Storage | null>(null)
  const { register, handleSubmit, reset } = useForm<Storage>()

  const storagesPerPage = 5

  const onSubmit = (data: Storage) => {
    if (storageToEdit) {
      setStorages(storages.map(storage => storage.id === storageToEdit.id ? { ...storageToEdit, ...data } : storage))
    } else {
      const newStorage = { ...data, id: Date.now() }
      setStorages([...storages, newStorage])
    }
    reset()
    setIsDialogOpen(false)
    setStorageToEdit(null)
  }

  const deleteStorage = (id: number) => {
    setStorages(storages.filter((storage) => storage.id !== id))
  }

  const editStorage = (storage: Storage) => {
    setIsDialogOpen(true)
    setStorageToEdit(storage)
    reset(storage)
  }

  const filteredStorages = storages.filter((storage) =>
    storage.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const paginatedStorages = filteredStorages.slice(
    (currentPage - 1) * storagesPerPage,
    currentPage * storagesPerPage
  )

  const totalPages = Math.ceil(filteredStorages.length / storagesPerPage)

  return (
    <div className="space-y-8">

      <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{storageToEdit ? 'Edit Storage' : 'Add New Storage'}</DialogTitle>
          </DialogHeader>
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
            <Button type="submit">{storageToEdit ? 'Save Changes' : 'Add Storage'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Centered Search Input and Add New Storage Button */}
      <div className="flex justify-center space-x-4">
        <Input
          placeholder="Search Storages"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-xs"
        />
        <Button onClick={() => { setStorageToEdit(null); setIsDialogOpen(true); }} className="w-full max-w-xs hover:bg-black hover:text-white">
          Add Storage
        </Button>
      </div>

      {/* Storage Profiles Table */}
      <div className="w-full flex justify-center">
        <Card className="w-full sm:w-3/4 lg:w-2/3">
          <CardHeader>
            <CardTitle>Storage Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="overflow-x-auto">
              <table className="min-w-full">
  <thead>
    <tr>
      <th className="border-b px-4 py-2 text-left">Storage Name</th>
      <th className="border-b px-4 py-2 text-left">Company ID</th>
      <th className="border-b px-4 py-2 text-left">Opening Balance</th>
      <th className="border-b px-4 py-2 text-left">Opening Date</th>
      <th className="border-b px-4 py-2 text-left">Logo</th>
      <th className="border-b px-4 py-2 text-left">Status</th>
      <th className="border-b px-4 py-2 text-left">Audit Status</th>
      <th className="border-b px-4 py-2 text-right">Actions</th>
    </tr>
  </thead>
  <tbody>
    {paginatedStorages.map((storage) => (
      <tr key={storage.id}>
        <td className="border-b px-4 py-2">{storage.name}</td>
        <td className="border-b px-4 py-2">{storage.companyId}</td>
        <td className="border-b px-4 py-2">{storage.openingBalance}</td>
        <td className="border-b px-4 py-2">{storage.openingDate}</td>
        <td className="border-b px-4 py-2">{storage.logo || 'No logo'}</td>
        <td className="border-b px-4 py-2">{storage.status}</td>
        <td className="border-b px-4 py-2">{storage.auditStatus}</td>
        <td className="border-b px-4 py-2 text-right">
          <Button onClick={() => editStorage(storage)} className="mr-2">Edit</Button>
          <Button onClick={() => deleteStorage(storage.id)} variant="destructive">
            Delete
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <div>Page {currentPage} of {totalPages}</div>
                <Button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
