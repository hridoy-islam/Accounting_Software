import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  MoreVertical,
  FileEdit,
  Trash2,
  Download,
  Receipt,
  Loader,
  Pen,
  Upload
} from 'lucide-react';

import moment from 'moment';
import { Invoice } from 'src/types/invoice';
import InvoiceDetailsDialog from './InvoiceDetailsDialog';
import { ImageUploader } from './invoiceDoc-uploader';

interface InvoiceListProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoiceId: string) => void;
  onMarkAsPaid: (invoice: Invoice) => void;
  loading: Boolean;
}

export function InvoiceList({
  invoices = [],
  onEdit,
  onDelete,
  onMarkAsPaid,
  loading
}: InvoiceListProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const handleUploadComplete = (data) => {
    setUploadOpen(false);
    setSelectedInvoice(null);
  };

  return (
    <div className="  shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-left">INV ID</TableHead>
            <TableHead className="text-left">Created At</TableHead>
            <TableHead className="text-left">Invoice Date</TableHead>
            <TableHead className="text-left">Reference Invoice Number</TableHead>
            <TableHead className="text-left">Customer</TableHead>
            <TableHead className="text-left">Amount</TableHead>
            <TableHead className="text-left">Status</TableHead>
            <TableHead className="text-left">Type</TableHead>
            <TableHead className="text-left">Payment</TableHead>

            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        {loading ? (
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
        ) : (
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Receipt className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No invoices found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice._id} className="group">
                  <TableCell
                    onClick={() => handleRowClick(invoice)}
                    className="text-left"
                  >
                    {invoice.invId}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRowClick(invoice)}
                    className="text-left"
                  >
                    {moment(invoice?.createdAt).format('MM/DD/YY')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRowClick(invoice)}
                    className="text-left"
                  >
                    {moment(invoice.invoiceDate).format('MM/DD/YY')}
                  </TableCell>
                  
                  <TableCell
                    onClick={() => handleRowClick(invoice)}
                    className="text-left"
                  >
                    {invoice.invoiceNumber}
                  </TableCell>

                  <TableCell
                    onClick={() => handleRowClick(invoice)}
                    className="text-left"
                  >
                    {invoice?.customer?.name}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRowClick(invoice)}
                    className="text-left"
                  >
                    <div className="flex items-center justify-start gap-2">
                      £{invoice.amount.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell
                    onClick={() => handleRowClick(invoice)}
                    className="text-left"
                  >
                    <Badge
                      variant={
                        invoice.status === 'paid' ? 'default' : 'secondary'
                      }
                      className={
                        invoice.status === 'paid' ? 'bg-paid' : 'bg-due'
                      }
                    >
                      {invoice.status.charAt(0).toUpperCase() +
                        invoice.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell
                    onClick={() => handleRowClick(invoice)}
                    className="text-left"
                  >
                    <Badge
                      variant="default"
                      className={
                        invoice.transactionType === 'inflow'
                          ? 'bg-inflow'
                          : 'bg-outflow'
                      }
                    >
                      {invoice.transactionType === 'inflow'
                        ? 'Inflow'
                        : 'Outflow'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    {invoice.status === 'paid' ? (
                      <div
                        // Assuming you have a function to revert the payment
                        className=" text-xs text-gray-600 hover:text-gray-800"
                      >
                        Completed
                      </div>
                    ) : (
                      <Button
                        onClick={() => onMarkAsPaid(invoice)} // Function to mark invoice as paid
                        variant="theme"
                        size="sm"
                      >
                        Mark as Paid
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="flex flex-row items-center justify-end gap-2 text-right">
                    <Button
                      variant="theme"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setUploadOpen(true);
                      }}
                    >
                      <Upload />
                    </Button>
                    <Button
                      variant="theme"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(invoice)}
                    >
                      <Pen />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="theme" className="h-8 w-8 p-0 ">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 focus:bg-red-800 focus:text-white"
                          onClick={() => onDelete(invoice._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        )}
      </Table>

      <InvoiceDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        invoice={selectedInvoice}
      />

      <ImageUploader
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploadComplete={handleUploadComplete}
        entityId={selectedInvoice?._id}
      />
    </div>
  );
}
