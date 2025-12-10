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
import { MoreVertical, Trash2, Receipt, Pen } from 'lucide-react';

import { Invoice } from 'src/types/invoice';
import InvoiceDetailsDialog from './InvoiceDetailsDialog';
import { ImageUploader } from './invoiceDoc-uploader';
import { useNavigate, useParams } from 'react-router-dom';
import { InvoicePDFDownload } from './InvoicePDF';
import { usePermission } from '@/hooks/usePermission';

interface InvoiceListProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoiceId: string) => void;
  loading: Boolean;
}

export function InvoiceList({
  invoices = [],
  onEdit,
  onDelete,
  loading
}: InvoiceListProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { id: companyId } = useParams();

  // Define Month Options locally for display mapping
  const monthOptions = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 }
  ];

  // Helper function to format the date suffix
  function getOrdinalSuffix(i: number) {
    if (!i) return '';
    const j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }

  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const handleUploadComplete = (data) => {
    setUploadOpen(false);
    setSelectedInvoice(null);
  };

  const navigate = useNavigate();
  const { hasPermission } = usePermission();

  return (
    <div className="shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-left">Customer</TableHead>
            <TableHead className="text-left">Amount</TableHead>
            <TableHead className="text-left">Type</TableHead>
            <TableHead className="text-left">Schedule</TableHead>
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

                  <TableCell
                    onClick={() => handleRowClick(invoice)}
                    className="text-left"
                  >
                    {/* FIXED SECTION START */}
                    {invoice.frequency && invoice.scheduledDay ? (
                      <span className="flex items-center gap-1 text-xs sm:text-sm">
                        <span className="font-semibold text-inherit">
                          {String(invoice.scheduledDay)}
                           {" "} of every{' '}
                          {invoice.frequency === 'monthly' ? 'month' : 'year'}
                        </span>

                        {invoice.frequency === 'yearly' &&
                          invoice.scheduledMonth && (
                            <span className="font-semibold text-inherit">
                              {' '}
                              of{' '}
                              {
                                monthOptions.find(
                                  (m) => m.value === invoice.scheduledMonth
                                )?.label
                              }
                            </span>
                          )}
                      </span>
                    ) : (
                      'Schedule Invoice'
                    )}

                    {/* FIXED SECTION END */}
                  </TableCell>

                  <TableCell className="flex flex-row items-center justify-end gap-2 text-right">
                    {hasPermission('Invoice', 'edit') && (
                      <Button
                        variant="theme"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          navigate(
                            `/admin/company/${companyId}/schedule-invoice/${invoice._id}`
                          )
                        }
                      >
                        <Pen />
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="theme" className="h-8 w-8 p-0 ">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem>
                          <InvoicePDFDownload invoice={invoice} />
                        </DropdownMenuItem>

                        {hasPermission('Invoice', 'delete') && (
                          <DropdownMenuItem
                            className="text-red-500 focus:bg-red-800 focus:text-white"
                            onClick={() => onDelete(invoice._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Invoice
                          </DropdownMenuItem>
                        )}
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
