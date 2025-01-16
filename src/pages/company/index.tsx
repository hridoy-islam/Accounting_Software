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
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import placeholder from '@/assets/imges/home/logos/placeholder.jpg';

export interface TCompany {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  companyAddress: string;
  assignUser?: string[];
  logo?: string;
}

export function Company() {
  const [companies, setCompanies] = useState<TCompany[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<TCompany[]>([]); // State for filtered companies
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<TCompany | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TCompany>();
  const navigate = useNavigate(); // Initialize the navigate hook

  useEffect(() => {
    const fetchedCompanies = [
      {
        id: '1',
        email: 'company1@example.com',
        companyName: 'Company 1',
        phone: '1234567890',
        companyAddress: 'ABC',
        logo: ''
      },
      {
        id: '2',
        email: 'company2@example.com',
        companyName: 'Company 2',
        phone: '0987654321',
        companyAddress: 'XYZ',
        logo: ''
      }
    ];
    setCompanies(fetchedCompanies);
    setFilteredCompanies(fetchedCompanies);
  }, []);

  useEffect(() => {
    // Filter companies based on the search query
    const results = companies.filter(
      (company) =>
        company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          company.id === companyToEdit.id
            ? { ...companyToEdit, ...data, logo: logoUrl }
            : company
        )
      );
    } else {
      const newCompany = { ...data, logo: logoUrl };
      setCompanies((prevCompanies) => [...prevCompanies, newCompany]);
    }

    reset();
    setIsDialogOpen(false);
    setCompanyToEdit(null);
  };

  const deleteCompany = (id: string) => {
    setCompanies(companies.filter((company) => company.id !== id));
  };

  const editCompany = (company: TCompany) => {
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
              <TableRow className="text-center">
                <TableHead className="text-center">Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>View Company</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="text-center">
                    <img
                      src={company.logo || placeholder}
                      alt={company.companyName}
                      className="mx-auto h-10 w-10 object-cover"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {company.companyName}
                  </TableCell>
                  <TableCell className="text-center">{company.email}</TableCell>
                  <TableCell className="text-center">{company.phone}</TableCell>
                  <TableCell className="text-center align-middle">
                    <Button
                      variant="theme"
                      onClick={() => navigate(`${company.id}`)} // Navigate to company details page
                      className="inline-block"
                    >
                      View
                    </Button>
                  </TableCell>

                  <TableCell className="space-x-4 text-center">
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
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Dialog for adding/editing a company */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => setIsDialogOpen(open)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {companyToEdit ? 'Edit Company' : 'Add New Company'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  {...register('companyName', {
                    required: 'Company Name is required'
                  })}
                />
                {errors.companyName && (
                  <span className="text-sm text-red-500">
                    {errors.companyName.message}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="email">Company Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && (
                  <span className="text-sm text-red-500">
                    {errors.email.message}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Company Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone', {
                    required: 'Phone number is required'
                  })}
                />
                {errors.phone && (
                  <span className="text-sm text-red-500">
                    {errors.phone.message}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="address">Company Address</Label>
                <Input
                  id="address"
                  {...register('companyAddress', {
                    required: 'Address is required'
                  })}
                />
                {errors.companyAddress && (
                  <span className="text-sm text-red-500">
                    {errors.companyAddress.message}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="logo">Company Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  {...register('logo', { required: 'Logo is required' })}
                />
                {errors.logo && (
                  <span className="text-sm text-red-500">
                    {errors.logo.message}
                  </span>
                )}
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
