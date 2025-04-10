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
import { usePermission } from '@/hooks/usePermission';


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
  const {hasPermission} = usePermission();
  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  return (
    <div className="shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-left">Imported Date</TableHead>
            <TableHead className="text-left">Invoice Date</TableHead>
            <TableHead className="text-left">Invoice Number</TableHead>
            <TableHead className="text-left">Imported From</TableHead>
            <TableHead className="text-left">Amount</TableHead>
            <TableHead className="text-left">Type</TableHead>
            {hasPermission('TransactionList', 'create') &&(
            <TableHead className="text-right">Payment</TableHead>)}
          
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
                <TableCell  onClick={() => handleRowClick(invoice)} className="text-left">
                  {moment(invoice.createdAt).format('MM/DD/YY')}
                </TableCell>
                <TableCell  onClick={() => handleRowClick(invoice)} className="text-left">
                  {moment(invoice.invoiceDate).format('MM/DD/YY')}
                </TableCell>
                <TableCell  onClick={() => handleRowClick(invoice)} className="text-left">
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell  onClick={() => handleRowClick(invoice)} className="text-left">
                  {invoice?.companyId?.name}
                </TableCell>
           
                <TableCell  onClick={() => handleRowClick(invoice)} className="text-left">
                  <div className="flex items-center justify-start gap-2">
                  
                    £{invoice.amount.toFixed(2)}
                  </div>
                </TableCell>
                
                <TableCell  onClick={() => handleRowClick(invoice)} className="text-left">
                  <Badge
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

                {hasPermission('TransactionList', 'create') &&(
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
                </TableCell>)}
               
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
