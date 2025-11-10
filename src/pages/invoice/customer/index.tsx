import { useEffect, useState } from 'react';
import { ArrowLeft, Eye, Pen, Plus } from 'lucide-react';
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
import { toast } from '@/components/ui/use-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CustomerDialog } from './components/customer-dialog';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { usePermission } from '@/hooks/usePermission';

export default function CustomerPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const { id } = useParams();
  const { hasPermission } = usePermission();

  const fetchData = async (page: number, limit: number, searchTerm = '') => {
    try {
      setInitialLoading(true);
      const response = await axiosInstance.get(`/customer`, {
        params: {
          companyId: id,
          page,
          limit,
          ...(searchTerm ? { searchTerm } : {}),
        }
      });
      setCustomers(response.data.data.result || []);
      setTotalPages(response.data.data.meta.totalPage || 1);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Failed to load customers.',
        className: 'bg-destructive border-none text-white'
      });
    } finally {
      setInitialLoading(false);
    }
  };

const handleSubmit = async (data: any) => {
  try {
    let response;
    if (editingCustomer) {
      // Update existing customer
      response = await axiosInstance.patch(`/customer/${editingCustomer._id}`, data);
      if (response.data?.success) {
        const updatedCustomer = { ...editingCustomer, ...data };
        // Optimistically update local state
        setCustomers((prev) =>
          prev.map((cust) => (cust._id === editingCustomer._id ? updatedCustomer : cust))
        );
        toast({
          title: 'Customer updated successfully',
          className: 'bg-theme border-none text-white'
        });
      }
    } else {
      // Create new customer
      response = await axiosInstance.post(`/customer`, { ...data, companyId: id });
      if (response.data?.success && response.data.data) {
        const newCustomer = response.data.data; // assuming API returns created customer
        // Optimistically add to local state
        setCustomers((prev) => [newCustomer, ...prev]); // or [...prev, newCustomer] depending on order
        toast({
          title: 'Customer created successfully',
          className: 'bg-theme border-none text-white'
        });
      }
    }

    // ❌ Do NOT call fetchData() here

    // Close dialog
    setDialogOpen(false);
    setEditingCustomer(null);
  } catch (error) {
    toast({
      title: 'An error occurred. Please try again.',
      className: 'bg-destructive border-none text-white'
    });
    // Optionally: rollback optimistic update on error (advanced)
  }
};

  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage, searchTerm]);

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchData(1, entriesPerPage, searchTerm);
  };

  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">All Customers</h1>

        <div className="space-x-4">
          <Button
            variant="theme"
            size={'sm'}
            onClick={() => navigate(`/admin/company/${id}/invoice`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back To Invoice
          </Button>
          {hasPermission('Customer', 'create') && (
            <Button
              variant="theme"
              size={'sm'}
              onClick={() => {
                setEditingCustomer(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Customer
            </Button>
          )}
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
        <Button size="sm" onClick={handleSearch} variant="theme">
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
                    <Link to={`/admin/company/${id}/invoice/customer/${customer._id}`}>
                      {customer.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`/admin/company/${id}/invoice/customer/${customer._id}`}>
                      {customer.email}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`/admin/company/${id}/invoice/customer/${customer._id}`}>
                      {customer.phone}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`/admin/company/${id}/invoice/customer/${customer._id}`}>
                      {customer.address}
                    </Link>
                  </TableCell>
                  <TableCell className="space-x-1 text-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/admin/company/${id}/invoice/customer/${customer._id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {hasPermission('Customer', 'edit') && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={async () => {
                          try {
                            const res = await axiosInstance.get(`/customer/${customer._id}`);
                            setEditingCustomer(res.data.data);
                            setDialogOpen(true);
                          } catch (err) {
                            toast({
                              title: 'Failed to load customer data.',
                              className: 'bg-destructive border-none text-white'
                            });
                          }
                        }}
                      >
                        <Pen className="h-4 w-4" />
                      </Button>
                    )}
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
          if (!open) {
            setEditingCustomer(null);
          }
        }}
        onSubmit={handleSubmit}
        initialData={editingCustomer}
      />
    </div>
  );
}