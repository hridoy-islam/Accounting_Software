import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { PlusCircle, Search } from 'lucide-react';

import { InvoiceList } from './components/InvoiceList';
import type { Invoice } from '@/types/invoice';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { Input } from '@/components/ui/input';

import { DataTablePagination } from '@/components/shared/data-table-pagination';

import { useForm } from 'react-hook-form';
import { InvoiceDialog } from './components/InvoiceDialog';

const PendingTransactionPage = () => {
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
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
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
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate })
      };

      const response = await axiosInstance.get(
        `/pending-transaction/company/${id}`,
        {
          params
        }
      );
      setInvoices(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(currentPage, entriesPerPage, searchTerm);
  }, [id]);

  useEffect(() => {
    fetchInvoices(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage]);

  const handleEdit = (invoice: Invoice) => {
    form.reset({
      ...invoice,
      invoiceDate: invoice.invoiceDate
        ? new Date(invoice.invoiceDate).toISOString().split('T')[0]
        : ''
    });
    setCurrentInvoice(invoice);
    setIsDialogFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.patch(`/pending-transaction/${id}`, {
        isDeleted: true
      });
      setInvoices((prev) => prev.filter((invoice) => invoice._id !== id));
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchInvoices(currentPage, entriesPerPage, searchTerm);
  };

  const handleMarkAsPaid = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDialogOpen(true);
    // fetchInvoices(currentPage, entriesPerPage, searchTerm);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setSelectedInvoice(null);
  };
  // const handleClose = () => {
  //   setIsDialogOpen(false);
  //   setSelectedInvoice(null);
  // };

  return (
    <div className="mb-2 rounded-md bg-white p-4 shadow-lg">
      <div className="mb-2 flex flex-col justify-between">
        <div className="flex flex-row items-center justify-between">
          <h1 className="mb-2 text-3xl font-bold">Pending Transaction</h1>
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
            <p>From Date</p>
            <Input
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              type="date"
              className="w-40"
            />
          </div>

          <div className="flex flex-row items-center gap-2">
            <p>To Date</p>
            <Input
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              type="date"
              className="w-40"
            />
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

export default PendingTransactionPage;
