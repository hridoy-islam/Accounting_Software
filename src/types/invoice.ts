

export interface Invoice {
  __id: string
  billedFrom: string;
  billedTo: string;
  invoiceDate: Date;
  invoiceNumber: string;
  description: string;
  status: string;
  transactionType: string;
  amount: number;
  details?: string;
  companyId:string;
  invDoc?: string;
}

export interface InvoiceFormData extends Omit<Invoice, '_id' | 'transactionDate'> {
  transactionDate: string;
}