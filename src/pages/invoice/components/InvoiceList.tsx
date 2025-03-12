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
  CheckCircle,
  Receipt,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

import moment from 'moment';
import { Invoice } from 'src/types/invoice';

interface InvoiceListProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoiceId: string) => void;
  onMarkAsPaid: (invoice: Invoice) => void;
}

export function InvoiceList({
  invoices = [],
  onEdit,
  onDelete,
  onMarkAsPaid
}: InvoiceListProps) {
  if (!Array.isArray(invoices)) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Receipt className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Invalid data format for invoices.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="  shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-right">Date</TableHead>
            <TableHead className="text-right">Invoice Number</TableHead>
            <TableHead className="text-right">Billed From</TableHead>
            <TableHead className="text-right">Billed To</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right">Type</TableHead>
            <TableHead className="text-right">Payment</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
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
                <TableCell className="text-right">
                  {moment(invoice.invoiceDate).format('DD/MM/YY')}
                </TableCell>
                <TableCell className="text-right">
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell className="text-right">
                  {invoice.billedFrom}
                </TableCell>
                <TableCell className="text-right">{invoice.billedTo}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {invoice.transactionType === 'inflow' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    £{invoice.amount.toFixed(2)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={
                      invoice.status === 'paid' ? 'default' : 'secondary'
                    }
                    className={
                      invoice.status === 'paid'
                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                        : ''
                    }
                  >
                    {invoice.status.charAt(0).toUpperCase() +
                      invoice.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
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
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="theme" className="h-8 w-8 p-0 ">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem onClick={() => onEdit(invoice)}>
                        <FileEdit className="mr-2 h-4 w-4" />
                        Edit Invoice
                      </DropdownMenuItem>
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
      </Table>
    </div>
  );
}
