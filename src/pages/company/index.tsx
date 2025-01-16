import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import { Pen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axiosInstance from '@/lib/axios'
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
import { toast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';

export interface TCompany {
  _id: string;
  companyName: string;
  email: string;
  phone: string;
  companyAddress: string;
}

export function Company() {
  const user = useSelector((state: any) => state.auth.user); // Get user from Redux state
  const [companies, setCompanies] = useState<TCompany[]>([]);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<TCompany | null>(null);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TCompany>();
  const navigate = useNavigate(); // Initialize the navigate hook

  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/companies?createdBy=${user._id}`);
      setCompanies(response.data.data.result);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  useEffect(() => {
    fetchData()
  }, []);

  const onSubmit = async (data: any) => {

    if (companyToEdit) {
      await axiosInstance.patch(`/companies/${companyToEdit?._id}`, data);
      toast({ title: "Record Updated successfully", className: "bg-background border-none text-white", });
      fetchData();
      setCompanyToEdit(undefined)
    } else {
      const formattedData = {...data, createdBy: user._id}
      await axiosInstance.post('/companies', formattedData)
      fetchData();
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
                <TableHead>Address</TableHead>
                <TableHead>View Company</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company._id}>
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
                  <TableCell className="text-center">{company.companyAddress}</TableCell>
                  <TableCell className="text-center align-middle">
                    <Button
                      variant="theme"
                      // Navigate to company details page
                      className="inline-block"
                    >
                      <Link to={company._id}>
                      View
                      </Link>
                      
                    </Button>
                  </TableCell>

                  <TableCell className="space-x-4 text-center">
                    <Button
                      variant={'default'}
                      className="bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80"
                      size="icon"
                      onClick={() => editCompany(company)}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                    {/* <Button
                      variant="ghost"
                      className="border-none bg-red-500 text-white hover:bg-red-500/90"
                      size="icon"
                      onClick={() => deleteCompany(company.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button> */}
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
