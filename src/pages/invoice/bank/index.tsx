import { useEffect, useState } from 'react';
import { ArrowLeft, Eye, Plus } from 'lucide-react';
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


import { Input } from '@/components/ui/input';
import { BankDialog } from './components/bank-dialog';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { usePermission } from '@/hooks/usePermission';

export default function BankPage() {
  const [banks, setBanks] = useState<any>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("")
  const {id}= useParams()
  const {hasPermission} = usePermission();

  const navigate = useNavigate();

  const fetchData = async (page, entriesPerPage, searchTerm = "") => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/bank?companyId=${id}`, {
        params: {
          page,
          limit: entriesPerPage,
          ...(searchTerm ? { searchTerm } : {}),
        }
      });
      setBanks(response.data.data.result);
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
      const payload ={
        ...data,
        companyId: id
      }
      response = await axiosInstance.post('/bank', payload);

      // Check if the API response indicates success
      if (response.data && response.data.success === true) {
        toast({
          title: 'Bank Created successfully',
          className: 'bg-theme border-none text-white'
        });
      } else if (response.data && response.data.success === false) {
        toast({
          title: 'Operation failed',
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


  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">All Bank List</h1>

        <div className='flex flex-row items-center gap-4'>

        <div className="flex flex-row items-start justify-end">
          <Button
            className="bg-theme text-white "
            size={'sm'}
            onClick={() => navigate(`/admin/company/${id}/invoice`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back To Bank List
          </Button>
        </div>
        {hasPermission('Invoice', 'create') &&(
        <div className="space-x-4">
        
          <Button
            className="bg-theme text-white"
            size={'sm'}
            onClick={() => {
              setDialogOpen(true); 
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Bank Account
          </Button>
        </div>)}

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
          size='sm'
          onClick={handleSearch} 
          className="border-none min-w-[100px] bg-theme text-white "
        >
          Search
        </Button>
      </div>
      <div className="rounded-md bg-white p-4 shadow-2xl">
        {initialLoading ? (
          <div className="flex justify-center">
            <TableBody>
            <TableRow>
              <TableCell colSpan={9} className="h-32 text-center">
                <div className="flex h-10 w-full flex-col items-center justify-center">
                  <div className="flex flex-row items-center gap-4">
                    <p className="font-semibold">Please Wait..</p>
                    <div className="h-5 w-5 animate-spin rounded-full border-4 border-dashed border-theme"></div>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
          </div>
        ) : banks.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No records found.
          </div>
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
                    <Link to={`${bank._id}`}>{bank?.name}</Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`${bank._id}`}>{bank?.accountNo}</Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`${bank._id}`}>{bank?.sortCode}</Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`${bank._id}`}>{bank?.beneficiary}</Link>
                  </TableCell>

                  <TableCell className="space-x-1 text-center">
                    <Link to={`${bank._id}`}>
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
      <BankDialog
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
