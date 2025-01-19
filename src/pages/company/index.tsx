import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom'; // Import useNavigate for routing
import { Pen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axiosInstance from '@/lib/axios';
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

  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/companies?createdBy=${user._id}`);
      setCompanies(response.data.data.result);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: any) => {
    if (companyToEdit) {
      const {companyName, email, phone, companyAddress} =  data
      await axiosInstance.patch(`/companies/${companyToEdit?._id}`, {
        companyName, email, phone, companyAddress
      });
      toast({
        title: 'Record Updated successfully',
        className: 'bg-background border-none text-white'
      });
      fetchData();
      setCompanyToEdit(null);
    } else {
      const formattedData = { ...data, createdBy: user._id };
      await axiosInstance.post('/companies', formattedData);
      fetchData();
    }

    reset();
    setIsDialogOpen(false);
    setCompanyToEdit(null);
  };

  const editCompany = (company: TCompany) => {
    setIsDialogOpen(true);
    setCompanyToEdit(company);
    reset(company);
  };

  return (
    <div className="space-y-4 rounded-lg bg-white shadow-md">
      <div className="p-4 ">
        
        <h1 className="pb-6 text-2xl font-semibold">Company Management</h1>

        <div className="flex justify-between ">
          <Input
            placeholder="Search companies..."
            className="max-w-md border-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update search query state
          />
          <Button
            variant="theme"
            
            onClick={() => {
              setCompanyToEdit(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Company
          </Button>
        </div>
      </div>
      <div className="space-y-1">
        <div className="rounded-md  p-4 ">
          <Table>
            <TableHeader>
              <TableRow className="">
                <TableHead className="">Logo</TableHead>
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
                  <TableCell className="">
                    <img
                      src={company?.logo || placeholder}
                      alt={company.companyName}
                      className="mx-auto h-10 w-10 object-cover"
                    />
                  </TableCell>
                  <TableCell className=""><Link to={company._id}>{company.companyName}</Link></TableCell>
                  <TableCell className="">{company.email}</TableCell>
                  <TableCell className="">{company.phone}</TableCell>
                  <TableCell className="">{company.companyAddress}</TableCell>
                  <TableCell className="">
                  <Link to={company._id}>
                    <Button
                      variant="theme"
                      // Navigate to company details page
                      className=" w-full"
                    >
                      View
                    </Button>
                    </Link>
                  </TableCell>

                  <TableCell className="space-x-4 ">
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
              <div></div>

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
