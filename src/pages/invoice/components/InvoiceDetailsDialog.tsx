import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileIcon } from 'lucide-react';
import { Invoice } from 'src/types/invoice';
import moment from 'moment';
import { Button } from '@/components/ui/button';

interface InvoiceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

export default function InvoiceDetailsDialog({
  open,
  onOpenChange,
  invoice
}: InvoiceDetailsDialogProps) {
  if (!invoice) return null;

  const getDisplayValue = (field: any): string => {
    if (field === null || field === '' || field === undefined) return 'N/A';
    if (typeof field === 'string')
      return field.charAt(0).toUpperCase() + field.slice(1);
    if (typeof field === 'number') return field.toString();
    if (typeof field === 'boolean') return field ? 'Yes' : 'No';

    if (typeof field === 'object') {
      if (field.name) return field.name;
      if (field.storageName) return field.storageName;
      if (field.label) return field.label;
      if (field._id) return field._id;
      try {
        return JSON.stringify(field);
      } catch {
        return 'N/A';
      }
    }
    return 'N/A';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[48vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Invoice Details
            {invoice.invId && (
              <span className="text-sm text-gray-500">
                ({getDisplayValue(invoice.invId)})
              </span>
            )}
            {invoice.transactionType && (
              <Badge
                className={`capitalize ${
                  invoice.transactionType === 'inflow'
                    ? 'bg-inflow'
                    : 'bg-outflow'
                }`}
              >
                {getDisplayValue(invoice.transactionType)}
              </Badge>
            )}
          </DialogTitle>
          {/* Amount Section */}
          <div className="border-b pb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                £ {invoice.amount.toFixed(2)}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto py-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Invoice Date</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {invoice?.invoiceDate
                      ? moment(invoice.invoiceDate).format('DD MMM YYYY')
                      : '—'}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">
                  Reference Invoice Number
                </p>
                <p className="font-medium">
                  {getDisplayValue(invoice.invoiceNumber)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">
                  {moment(invoice?.createdAt).format('DD MMM YYYY')}
                </p>
              </div>
            </div>

            {/* Middle Grid - Invoice Details */}
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{getDisplayValue(invoice.status)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Company</p>
                <p className="font-medium">
                  {getDisplayValue(invoice.companyId?.name)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">
                  {getDisplayValue(invoice.customer?.name)}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Transaction Document</h3>
                {invoice.invDoc ? (
                  <Button
                    variant="theme"
                    onClick={() =>
                      window.open(
                        getDisplayValue(invoice.invDoc),
                        '_blank',
                        'noopener,noreferrer'
                      )
                    }
                    className="inline-flex items-center gap-2 text-primary "
                  >
                    <FileIcon className="h-4 w-4" />
                    <span className="text-xs">View Document</span>
                  </Button>
                ) : (
                  <p className="text-sm text-gray-500">No Document Available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
