import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Landmark, PlusCircle, RefreshCcw, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { InvoiceList, getInvoiceBalanceDue } from './components/InvoiceList';
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
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FieldError,
  invoiceDialogSchema
} from './components/invoice-form-validation';
import { InvoicePaymentDialog } from './components/InvoicePaymentDialog';
import { toast, useToast } from '@/components/ui/use-toast';
import { usePermission } from '@/hooks/usePermission';

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
  const [status, setStatus] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Transaction fields needed to record a payment from the list
  const [categories, setCategories] = useState<any[]>([]);
  const [methods, setMethods] = useState<any[]>([]);
  const [storages, setStorages] = useState<any[]>([]);
  const { hasPermission } = usePermission();
  const { toast } = useToast();
  const form = useForm<any>({
    resolver: zodResolver(invoiceDialogSchema),
    defaultValues: {
      customer: '',
      invoiceDate: '',
      invoiceNumber: '',
      description: '',
      status: 'due',
      transactionType: 'inflow',
      amount: 0,
      details: '',
      invDoc: ''
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
        ...(toDate && { toDate }),
        ...(status && { status })
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

  const refreshTransactions = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const response = await axiosInstance.get(
        `/customer?companyId=${id}&limit=all`
      );
      setCustomers(response?.data.data.result || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: error?.response?.data?.message || 'Failed to fetch customers',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const fetchTransactionOptions = async () => {
    if (!id) return;
    try {
      const [categoriesRes, methodsRes, storagesRes] = await Promise.all([
        axiosInstance.get(`/categories/company/${id}?limit=10000`),
        axiosInstance.get(`/methods/company/${id}?limit=10000`),
        axiosInstance.get(`/storages/company/${id}?limit=10000`)
      ]);
      setCategories(categoriesRes.data.data.result || []);
      setMethods(methodsRes.data.data.result || []);
      setStorages(storagesRes.data.data.result || []);
    } catch (error) {
      console.error('Error fetching transaction options:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchTransactionOptions();
    fetchInvoices(currentPage, entriesPerPage, searchTerm);
  }, [id, refreshKey]);

  useEffect(() => {
    fetchInvoices(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage]);

  const handleEdit = (invoice: Invoice) => {
    form.reset({
      ...(invoice as any),
      customer: invoice?.customer?._id || '',
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
      setInvoices((prev) => prev.filter((invoice) => invoice?._id !== id));

      toast({
        title: 'Invoice deleted successfully',
        className: 'bg-theme text-white border-none'
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: error?.response?.data?.message || 'Error deleting invoice',
        variant: 'destructive'
      });
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

      let response;
      let updatedInvoices = [...invoices];

      if (currentInvoice) {
        // Update existing invoice
        response = await axiosInstance.patch(
          `/invoice/${currentInvoice._id}`,
          payload
        );

        updatedInvoices = invoices.map((invoice) => {
          if (invoice._id === currentInvoice._id) {
            return {
              ...response.data.data,
              customer: invoice?.customer || response.data.data.customer
            };
          }
          return invoice;
        });
      } else {
        // Create new invoice
        response = await axiosInstance.post('/invoice', payload);

        const customer = customers.find((c) => c._id === data.customer);
        updatedInvoices = [
          {
            ...response.data.data,
            customer: customer || response.data.data.customer
          },
          ...invoices
        ];
      }

      // UI updates and success toast
      setInvoices(updatedInvoices);
      setIsDialogFormOpen(false);
      setIsDialogOpen(false);

      toast({
        title: currentInvoice
          ? 'Invoice updated successfully'
          : 'Invoice created successfully',
        className: 'bg-theme text-white border-none'
      });
    } catch (error: any) {
      console.error('Error submitting invoice:', error);

      toast({
        title: 'Failed to submit invoice',
        variant: 'destructive'
      });
    }
  };

  // Opens the payment dialog with whatever is still outstanding on the invoice
  const handleMarkAsPaid = (invoice: Invoice) => {
    const inv = invoice as any;
    const total = Number(inv?.total) || Number(inv?.amount) || 0;

    setSelectedInvoice({
      ...inv,
      total,
      balanceDue: getInvoiceBalanceDue(inv)
    });
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogFormOpen(false);
    setIsDialogOpen(false);
    setSelectedInvoice(null);
  };

  const handleCreateInvoice = () => {
    navigate(`/admin/company/${id}/invoice/new`);
  };
  const handleViewBank = () => {
    navigate(`/admin/company/${id}/invoice/bank-list`);
  };

  return (
    <div className="mb-2 rounded-md bg-white p-4 shadow-lg">
      <div className="mb-2 flex flex-col justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
            Invoice Management
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="theme" onClick={() => refreshTransactions()}>
              <div className="flex flex-row items-center justify-center gap-2">
                <RefreshCcw size="18" />
                Refresh
              </div>
            </Button>
            <Button variant="theme" onClick={handleCustomer}>
              <PersonIcon className="mr-2 h-4 w-4" />
              Customer
            </Button>
            {hasPermission('Invoice', 'create') && (
              <Button variant="theme" onClick={() => handleViewBank()}>
                <Landmark className="mr-2 h-4 w-4" />
                Bank List
              </Button>
            )}
            {hasPermission('Invoice', 'create') && (
              <Button variant="theme" onClick={() => handleCreateInvoice()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="w-full space-y-1">
            <p className="text-xs font-medium">Search</p>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Invoice Number"
              className="w-full"
            />
          </div>

          <div className="w-full space-y-1">
            <p className="text-xs font-medium">From Date</p>
            <Input
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              type="date"
              className="w-full"
            />
          </div>

          <div className="w-full space-y-1">
            <p className="text-xs font-medium">To Date</p>
            <Input
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              type="date"
              className="w-full"
            />
          </div>

          <div className="w-full space-y-1">
            <p className="text-xs font-medium">Status</p>
            <Select onValueChange={setStatus} value={status}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due">Due</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full space-y-1">
            <p className="text-xs font-medium">Customer</p>
            <Select
              onValueChange={setSelectedCustomer}
              value={selectedCustomer}
              disabled={isLoadingCustomers}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    isLoadingCustomers ? 'Loading...' : 'Select Customer'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer._id} value={customer._id}>
                    {customer?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex w-full items-end">
            <Button
              className="w-full bg-theme text-white"
              onClick={handleSearch}
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
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
                <FieldError
                  message={form.formState.errors.customer?.message as string}
                />
              </div>

              <div className="space-y-2">
                <label>Invoice Date</label>
                <Input
                  {...form.register('invoiceDate')}
                  type="date"
                  value={form.watch('invoiceDate')}
                  onChange={(e) => form.setValue('invoiceDate', e.target.value)}
                />
                <FieldError
                  message={form.formState.errors.invoiceDate?.message as string}
                />
              </div>

              <div className="space-y-2">
                <label>Reference Invoice Number</label>
                <Input {...form.register('invoiceNumber')} />
                <FieldError
                  message={
                    form.formState.errors.invoiceNumber?.message as string
                  }
                />
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
                <FieldError
                  message={
                    form.formState.errors.transactionType?.message as string
                  }
                />
              </div>

              <div className="space-y-2">
                <label>Details</label>
                <Input {...form.register('details')} />
                <FieldError
                  message={form.formState.errors.details?.message as string}
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label>Amount</label>
                <Input
                  {...form.register('amount')}
                  type="number"
                  onChange={(e) =>
                    form.setValue(
                      'amount',
                      e.target.value === '' ? '' : parseFloat(e.target.value)
                    )
                  }
                />
                <FieldError
                  message={form.formState.errors.amount?.message as string}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label>Description</label>
              <Textarea {...form.register('description')} />
              <FieldError
                message={form.formState.errors.description?.message as string}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose()}
              >
                Cancel
              </Button>
              <Button type="submit" variant="theme">
                {currentInvoice ? 'Update Invoice' : 'Create Invoice'}
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

      <InvoicePaymentDialog
        open={isDialogOpen}
        onOpenChange={(open: boolean) => {
          setIsDialogOpen(open);
          if (!open) setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        categories={categories}
        methods={methods}
        storages={storages}
        editingPayment={null}
        onSaved={() => fetchInvoices(currentPage, entriesPerPage, searchTerm)}
      />
    </div>
  );
};

export default InvoicePage;
