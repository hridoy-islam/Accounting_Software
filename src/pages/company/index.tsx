import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import { Pen, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import placeholder from '@/assets/imges/home/logos/placeholder.jpg';

interface Company {
  id: number;
  email: string;
  name: string;
  phone: string;
  logo: string;
}

export function Company() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]); // State for filtered companies
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Company>();
  const navigate = useNavigate(); // Initialize the navigate hook

  useEffect(() => {
    // Simulating fetch from API
    const fetchedCompanies = [
      { id: 1, email: 'company1@example.com', name: 'Company 1', phone: '1234567890', logo: '' },
      { id: 2, email: 'company2@example.com', name: 'Company 2', phone: '0987654321', logo: '' },
    ];
    setCompanies(fetchedCompanies);
    setFilteredCompanies(fetchedCompanies);
  }, []);

  useEffect(() => {
    // Filter companies based on the search query
    const results = companies.filter((company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCompanies(results);
  }, [searchQuery, companies]);

  const onSubmit = async (data: any) => {
    const logoFile = data.logo[0];
    const logoUrl = await convertToBase64(logoFile);

    if (companyToEdit) {
      setCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company.id === companyToEdit.id ? { ...companyToEdit, ...data, logo: logoUrl } : company
        )
      );
    } else {
      const newCompany = { ...data, id: Date.now(), logo: logoUrl };
      setCompanies((prevCompanies) => [...prevCompanies, newCompany]);
    }

    reset();
    setIsDialogOpen(false);
    setCompanyToEdit(null);
  };

  const deleteCompany = (id: number) => {
    setCompanies(companies.filter((company) => company.id !== id));
  };

  const editCompany = (company: Company) => {
    setIsDialogOpen(true);
    setCompanyToEdit(company);
    reset(company);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="space-y-4 p-4 md:p-8">
      <Breadcrumbs
        items={[
          { title: 'Dashboard', link: '/admin' },
          { title: 'Company', link: '/companies' }
        ]}
      />
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Company Management</h1>

        <div className="flex justify-between">
          <Input
            placeholder="Search companies..."
            className="max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update search query state
          />
          <Button
            className="bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80"
            onClick={() => {
              setCompanyToEdit(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Company
          </Button>
        </div>

        <div className="rounded-md bg-white p-4 shadow-2xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>View Company</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.id}</TableCell>
                  <TableCell>
                    <img
                      src={company.logo || placeholder}
                      alt={company.name}
                      className="w-10 h-10 object-cover"
                    />
                  </TableCell>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.email}</TableCell>
                  <TableCell>{company.phone}</TableCell>
                  <TableCell>
                    <Button
                      variant="theme"
                      onClick={() => navigate(`${company.id}`)} // Navigate to company details page
                      className="flex items-center"
                    >
                      View
                    </Button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      className="border-none bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80"
                      size="icon"
                      onClick={() => editCompany(company)}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="border-none bg-red-500 text-white hover:bg-red-500/90"
                      size="icon"
                      onClick={() => deleteCompany(company.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Dialog for adding/editing a company */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{companyToEdit ? 'Edit Company' : 'Add New Company'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Company Name is required' })}
                />
                {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
              </div>
              <div>
                <Label htmlFor="email">Company Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
              </div>
              <div>
                <Label htmlFor="phone">Company Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone', { required: 'Phone number is required' })}
                />
                {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
              </div>
              <div>
                <Label htmlFor="logo">Company Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  {...register('logo', { required: 'Logo is required' })}
                />
                {errors.logo && <span className="text-red-500 text-sm">{errors.logo.message}</span>}
              </div>
              <Button
                type="submit"
                variant="default"
                className="bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80"
              >
                {companyToEdit ? 'Update' : 'Submit'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
