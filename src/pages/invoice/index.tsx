import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { InvoiceList } from './components/InvoiceList';
import type { Invoice } from '@/types/invoice';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { Input } from '@/components/ui/input';
import { PersonIcon } from '@radix-ui/react-icons';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { InvoiceDialog } from './components/InvoiceDialog';
import { toast } from '@/components/ui/use-toast';

const InvoicePage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogFormOpen, setIsDialogFormOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  const [companies, setCompanies] = useState([]);




  const form = useForm({
    defaultValues: {
      customer: '',
      invoiceDate: '',
      invoiceNumber: '',
      description: '',
      status: 'due',
      transactionType: 'inflow',
      amount: 0
    }
  });

  const fetchInvoices = async (
    page: number,
    entriesPerPage: number,
    searchTerm = ''
  ) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: entriesPerPage,
        ...(searchTerm && { searchTerm }),
        ...(selectedCustomer && { customer: selectedCustomer }),
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate })
      };

      const response = await axiosInstance.get(`/invoice/company/${id}`, {
        params
      });
      setInvoices(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axiosInstance.get('/users');
        setCompanies(res.data.data); 
      } catch (err) {
        console.error('Failed to fetch companies:', err);
      }
    };
  
    fetchCompanies();
  }, []);

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const response = await axiosInstance.get(
        `/customer?companyId=${id}&limit=all`
      );
      setCustomers(response.data.data.result || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchInvoices(currentPage, entriesPerPage, searchTerm);
  }, [id]);

  useEffect(() => {
    fetchInvoices(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage]);

  const handleEdit = (invoice: Invoice) => {
    form.reset({
      ...invoice,
      customer: invoice.customer?._id || '',
      invoiceDate: invoice.invoiceDate
        ? new Date(invoice.invoiceDate).toISOString().split('T')[0]
        : ''
    });
    setCurrentInvoice(invoice);
    setIsDialogFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.patch(`/invoice/${id}`, { isDeleted: true });
      setInvoices((prev) => prev.filter((invoice) => invoice._id !== id));
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleSearch = () => {
    fetchInvoices(currentPage, entriesPerPage, searchTerm);
  };

  const navigate = useNavigate();
  const handleCustomer = () =>
    navigate(`/admin/company/${id}/invoice/customer`);

  const handleCreate = () => {
    form.reset();
    setCurrentInvoice(null);
    setIsDialogFormOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        companyId: id,
        customer: data.customer || undefined,
        amount: Number(data.amount)
      };
  
      let updatedInvoices = [...invoices];
      
      if (currentInvoice) {
        // Update existing invoice
        const response = await axiosInstance.patch(
          `/invoice/${currentInvoice._id}`, 
          payload
        );
        
        updatedInvoices = invoices.map(invoice => {
          if (invoice._id === currentInvoice._id) {
            return {
              ...response.data.data,
              customer: invoice.customer || response.data.data.customer 
              
            };
          }
          return invoice;
        });
      } else {
        const response = await axiosInstance.post('/invoice', payload);
        
        const customer = customers.find(c => c._id === data.customer);
        
        updatedInvoices = [{
          ...response.data.data,
          customer: customer || response.data.data.customer
        }, ...invoices];
      }
  
      setInvoices(updatedInvoices);
      setIsDialogFormOpen(false);
      fetchInvoices(currentPage, entriesPerPage, searchTerm);
      
      toast({
       
        title: currentInvoice 
          ? 'Your invoice has been updated successfully' 
          : 'Your invoice has been created successfully',

          className:'bg-theme text-white',
      });
  
    } catch (error) {
      console.error('Error submitting invoice:', error);
      toast({
      
        title:  'Failed to submit invoice',
        variant: 'destructive'
      });
    }
  };


  const handleMarkAsPaid = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDialogOpen(true);
    // fetchInvoices(currentPage, entriesPerPage, searchTerm);
  };

  const handleClose = () => {
    setIsDialogFormOpen(false);
    setIsDialogOpen(false);
    setSelectedInvoice(null);
  };

  return (
    <div className="mb-2 rounded-md bg-white p-4 shadow-lg">
      <div className="mb-2 flex flex-col justify-between">
        <div className="flex flex-row items-center justify-between">
          <h1 className="mb-2 text-3xl font-bold">Invoice Management</h1>
          <div className="flex flex-row items-center justify-center gap-2">
            <Button variant="theme" onClick={handleCustomer}>
              <PersonIcon className="mr-2 h-4 w-4" />
              Customer
            </Button>
            <Button variant="theme" onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-row items-center justify-start space-x-4">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Invoice Number"
            className="h-8 max-w-[300px]"
          />

          <div className="flex flex-row items-center gap-2">
            <p className="text-xs font-medium">From Date</p>
            <Input
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              type="date"
              className="w-40"
            />
          </div>

          <div className="flex flex-row items-center gap-2">
            <p className="text-xs font-medium">To Date</p>
            <Input
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              type="date"
              className="w-40"
            />
          </div>

          <div className="flex w-64 items-center gap-1">
            <p className="whitespace-nowrap text-xs font-medium">
              Select Customer
            </p>
            <Select
              onValueChange={setSelectedCustomer}
              value={selectedCustomer}
              disabled={isLoadingCustomers}
            >
              <SelectTrigger className="w-40">
                <SelectValue
                  placeholder={
                    isLoadingCustomers ? 'Loading...' : 'Select Customer'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer._id} value={customer._id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="bg-theme text-white" onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      <InvoiceList
        invoices={invoices}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMarkAsPaid={handleMarkAsPaid}
        loading={loading}
      />

      <Dialog open={isDialogFormOpen} onOpenChange={setIsDialogFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {currentInvoice ? 'Edit Invoice' : 'Create Invoice'}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Customer Select */}
              <div className="space-y-2">
                <label>Customer</label>
                <Select
                  onValueChange={(value) => form.setValue('customer', value)}
                  value={form.watch('customer')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Invoice Date */}
              <div className="space-y-2">
                <label>Invoice Date</label>
                <Input
                  {...form.register('invoiceDate')}
                  type="date"
                  value={form.watch('invoiceDate')}
                  onChange={(e) => form.setValue('invoiceDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label>Invoice Number</label>
                <Input {...form.register('invoiceNumber')} />
              </div>

              {/* Transaction Type */}
              <div className="space-y-2">
                <label>Transaction Type</label>
                <Select
                  onValueChange={(value) =>
                    form.setValue('transactionType', value)
                  }
                  value={form.watch('transactionType')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inflow">Inflow</SelectItem>
                    <SelectItem value="outflow">Outflow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label>Amount</label>
                <Input
                  {...form.register('amount')}
                  type="number"
                  onChange={(e) =>
                    form.setValue('amount', parseFloat(e.target.value))
                  }
                />
              </div>
            </div>

            {/* Description (full width) */}
            <div className="space-y-2">
              <label>Description</label>
              <Textarea {...form.register('description')} />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <Button type="submit">
                {currentInvoice ? 'Update Invoice' : 'Create Invoice'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DataTablePagination
        pageSize={entriesPerPage}
        setPageSize={setEntriesPerPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <InvoiceDialog
        invoice={selectedInvoice}
        open={isDialogOpen}
        onClose={handleClose}
        // onConfirm={confirmPayment}
        setInvoices={setInvoices}
      />
    </div>
  );
};

export default InvoicePage;
