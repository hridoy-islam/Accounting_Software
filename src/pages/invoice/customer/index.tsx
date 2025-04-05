import { useEffect, useState } from 'react';
import { ArrowLeft, Eye, Loader, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { toast } from '@/components/ui/use-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CustomerDialog } from './components/customer-dialog';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/shared/data-table-pagination';

export default function CustomerPage() {
  const [customers, setcustomers] = useState<any>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("")
  const{id} = useParams()

  const fetchData = async (page, entriesPerPage, searchTerm = "") => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/customer?companyId=${id}`, {
        params: {
          page,
          limit: entriesPerPage,
          ...(searchTerm ? { searchTerm } : {}),
        }
      });
      setcustomers(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      let response;

      response = await axiosInstance.post(`/customer`, data);

      // Check if the API response indicates success
      if (response.data && response.data.success === true) {
        toast({
          title: 'customer Created successfully',
          className: 'bg-theme border-none text-white'
        });
      } else if (response.data && response.data.success === false) {
        toast({
          title: 'Unexpected response. Please try again.',
          className: 'bg-destructive border-none text-white'
        });
      } else {
        toast({
          title: 'Unexpected response. Please try again.',
          className: 'bg-destructive border-none text-white'
        });
      }

      // Refresh data
      fetchData(currentPage, entriesPerPage);
    } catch (error) {
      // Display an error toast if the request fails
      toast({
        title: 'An error occurred. Please try again.',
        className: 'bg-destructive border-none text-white'
      });
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm); // Refresh data
  }, [currentPage, entriesPerPage]);

  const handleSearch = () => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  };


  const navigate = useNavigate();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">All customers</h1>


        <div className="space-x-4">
          <Button
            variant="theme"
            size={'sm'}
            onClick={() => {
              navigate(`/admin/company/${id}/invoice`); // Navigate to the desired route
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back To Invoice
          </Button>
          <Button
            variant="theme"
            size={'sm'}
            onClick={() => {
              setDialogOpen(true); // Open dialog to create a new customer
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New customer
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, address"
          className="max-w-[400px] h-8"
        />
        <Button
          size='sm'
          onClick={handleSearch} // Handle search click
           variant="theme"
        >
          Search
        </Button>
      </div>
      <div className="rounded-md bg-white p-4 shadow-2xl">
        {initialLoading ? (
          <div className="flex h-10 w-full flex-col items-center justify-center">
          <div className="flex flex-row items-center gap-4">
            <p className="font-semibold">Please Wait..</p>
            <div className="h-5 w-5 animate-spin rounded-full border-4 border-dashed border-theme"></div>
          </div>
        </div>
        ) : customers.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No records found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>

                <TableHead className="w-32 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>
                  <Link to={`/admin/company/${id}/invoice/customer/${customer._id}`}>{customer?.name}</Link>
                  </TableCell>
                  <TableCell>
                  <Link to={`/admin/company/${id}/invoice/customer/${customer._id}`}>{customer?.email}</Link>
                  </TableCell>
                  <TableCell>
                  <Link to={`/admin/company/${id}/invoice/customer/${customer._id}`}>{customer?.phone}</Link>
                  </TableCell>
                  <TableCell>
                  <Link to={`/admin/company/${id}/invoice/customer/${customer._id}`}>{customer?.address}</Link>
                  </TableCell>
                  <TableCell className="space-x-1 text-center">
                  <Link to={`/admin/company/${id}/invoice/customer/${customer._id}`}>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <DataTablePagination
          pageSize={entriesPerPage}
          setPageSize={setEntriesPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      <CustomerDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
        }}
        onSubmit={handleSubmit}
        initialData={null}
      />
    </div>
  );
}
