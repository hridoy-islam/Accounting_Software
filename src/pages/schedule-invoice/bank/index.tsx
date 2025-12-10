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
import { BankDialog } from './components/bank-dialog';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { usePermission } from '@/hooks/usePermission';

export default function BankPage() {
  const [banks, setBanks] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<any>(null);
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
      const response = await axiosInstance.get(`/bank`, {
        params: {
          companyId: id,
          page,
          limit,
          ...(searchTerm ? { searchTerm } : {}),
        }
      });
      setBanks(response.data.data.result || []);
      setTotalPages(response.data.data.meta.totalPage || 1);
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast({
        title: 'Failed to load banks.',
        className: 'bg-destructive border-none text-white'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingBank) {
        // Update
        const response = await axiosInstance.patch(`/bank/${editingBank._id}`, data);
        if (response.data?.success) {
          const updatedBank = { ...editingBank, ...data };
          setBanks((prev) =>
            prev.map((bank) => (bank._id === editingBank._id ? updatedBank : bank))
          );
          toast({
            title: 'Bank updated successfully',
            className: 'bg-theme border-none text-white'
          });
        }
      } else {
        // Create
        const response = await axiosInstance.post(`/bank`, { ...data, companyId: id });
        if (response.data?.success && response.data.data) {
          const newBank = response.data.data;
          // Only update local state if on page 1 and no active search
          if (currentPage === 1 && searchTerm.trim() === '') {
            setBanks((prev) => [newBank, ...prev]); // latest on top
            // Optional: update totalPages if needed
            const newTotalPages = Math.ceil((banks.length + 1) / entriesPerPage);
            if (newTotalPages > totalPages) setTotalPages(newTotalPages);
          }
          toast({
            title: 'Bank created successfully',
            className: 'bg-theme border-none text-white'
          });
        }
      }

      setDialogOpen(false);
      setEditingBank(null);
    } catch (error) {
      toast({
        title: 'An error occurred. Please try again.',
        className: 'bg-destructive border-none text-white'
      });
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage, searchTerm]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1, entriesPerPage, searchTerm);
  };

  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">All Bank List</h1>

        <div className="flex flex-row items-center gap-4">
          <Button
            className="bg-theme text-white"
            size={'sm'}
            onClick={() => navigate(`/admin/company/${id}/invoice`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back To Invoice List
          </Button>

          {hasPermission('Bank', 'create') && (
            <Button
              className="bg-theme text-white"
              size={'sm'}
              onClick={() => {
                setEditingBank(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Bank Account
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Name, Account Number, Sort Code"
          className="max-w-[400px] h-8"
        />
        <Button
          size="sm"
          onClick={handleSearch}
          className="border-none min-w-[100px] bg-theme text-white"
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
        ) : banks.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">No records found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Sort Code</TableHead>
                <TableHead>Beneficiary</TableHead>
                <TableHead className="w-32 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banks.map((bank) => (
                <TableRow key={bank._id}>
                  <TableCell>
                    <Link to={`${bank._id}`}>{bank.name}</Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`${bank._id}`}>{bank.accountNo}</Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`${bank._id}`}>{bank.sortCode}</Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`${bank._id}`}>{bank.beneficiary}</Link>
                  </TableCell>
                  <TableCell className="space-x-1 text-center">
                    <Link to={`${bank._id}`}>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {hasPermission('Bank', 'edit') && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={async () => {
                          try {
                            const res = await axiosInstance.get(`/bank/${bank._id}`);
                            setEditingBank(res.data.data);
                            setDialogOpen(true);
                          } catch (err) {
                            toast({
                              title: 'Failed to load bank data.',
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

      <BankDialog
        key={editingBank?._id}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingBank(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingBank}
      />
    </div>
  );
}