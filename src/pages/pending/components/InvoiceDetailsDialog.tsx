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
    if (field === null || field === undefined) return 'N/A';
    if (typeof field === 'string') return field.charAt(0).toUpperCase() + field.slice(1);;
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
      <DialogContent className="sm:max-w-[400px] lg:max-w-[600px] h-[60vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Invoice Details
            {invoice.invoiceNumber && (
              <span className="text-sm text-gray-500">
                ({getDisplayValue(invoice.invoiceNumber)})
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

       

        <div className="space-y-6 py-4">
          {/* Main Grid - 3 Columns */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Left Grid - Basic Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Invoice Date</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {moment(invoice.invoiceDate).format('MMM DD YYYY')}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">
                  {moment(invoice.createdAt).format('MMM DD YYYY')}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Imported From</p>
                <p className="font-medium">
                  {getDisplayValue(invoice.companyId?.name)}
                </p>
              </div>
            </div>

            {/* Middle Grid - Invoice Details */}
            <div className="space-y-6">
              

         
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-sm">
                    {getDisplayValue(invoice.description)}
                  </p>
                </div>
          
            </div>

            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}