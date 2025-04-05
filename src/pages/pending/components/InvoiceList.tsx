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

import { Badge } from '@/components/ui/badge';
import {

  Receipt,
  Loader,
  
} from 'lucide-react';

import moment from 'moment';
import { Invoice } from 'src/types/invoice';
import  InvoiceDetailsDialog  from './InvoiceDetailsDialog'; 

interface InvoiceListProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoiceId: string) => void;
  onMarkAsPaid: (invoice: Invoice) => void;
  loading: boolean;
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

  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  return (
    <div className="  shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-right">Invoice Date</TableHead>
            <TableHead className="text-right">Invoice Number</TableHead>
            <TableHead className="text-right">Billed From</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right">Type</TableHead>
            <TableHead className="text-right">Payment</TableHead>
          
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
                <p className="text-muted-foreground">No Pending Transaction found.</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
      
            invoices.map((invoice) => (
              <TableRow  key={invoice._id} className="group">
                <TableCell  onClick={() => handleRowClick(invoice)} className="text-right">
                  {moment(invoice.invoiceDate).format('MM/DD/YY')}
                </TableCell>
                <TableCell  onClick={() => handleRowClick(invoice)} className="text-right">
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell  onClick={() => handleRowClick(invoice)} className="text-right">
                  {invoice?.companyId?.name}
                </TableCell>
           
                <TableCell  onClick={() => handleRowClick(invoice)} className="text-right">
                  <div className="flex items-center justify-end gap-2">
                  
                    £{invoice.amount.toFixed(2)}
                  </div>
                </TableCell>
                <TableCell  onClick={() => handleRowClick(invoice)} className="text-right">
                  <Badge
                    variant={
                      invoice.status === 'paid' ? 'default' : 'secondary'
                    }
                    className={
                      invoice.status === 'paid'
                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                        : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                    }
                  >
                    {invoice.status.charAt(0).toUpperCase() +
                      invoice.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell  onClick={() => handleRowClick(invoice)} className="text-right">
                  <Badge
                    variant="outline"
                    className={
                      invoice.transactionType === 'inflow'
                        ? 'border-green-500/20 text-green-500'
                        : 'border-red-500/20 text-red-500'
                    }
                  >
                    {invoice.transactionType === 'inflow'
                      ? 'Inflow'
                      : 'Outflow'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {invoice.status === 'paid' ? (
                    <div
                    
                      className=" text-xs text-gray-600 hover:text-gray-800"
                    >
                      Completed
                    </div>
                  ) : (
                    <Button
                      onClick={() => onMarkAsPaid(invoice)} 
                     variant="theme"
                     size="sm"
                    >
                      Complete Transaction
                    </Button>
                  )}
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
    </div>
  );
}
