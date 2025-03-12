import { Button } from "@/components/ui/button"
import { TransactionDialog } from "../transaction/components/transaction-dialog"
import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';

import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceDialog } from './components/InvoiceDialog';
import type { Invoice, PaymentDetails } from '@/types/invoice';
import { useParams } from "react-router-dom";
import axiosInstance from "@/lib/axios"
const InvoicePage = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  
    const { id } = useParams<{ id: string }>();


    
    const handleClose = () => {
      setIsDialogOpen(false); 
      setSelectedInvoice(null); 
    };
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await axiosInstance.get(`/invoice/company/${id}`);
                const filteredInvoices = response.data.data.result.filter(invoice => !invoice.isDeleted); 
            setInvoices(filteredInvoices);
            } catch (error) {
                console.error('Error fetching invoices:', error);
            }
        };

        fetchInvoices();
    }, [id,isFormOpen,invoices, handleClose]);
    
  
   
    const handleEdit = (invoice: Invoice) => {
      setEditingInvoice(invoice);
      setIsFormOpen(true);
    };
  
    const handleDelete = async (id: string) => {
      try {
        await axiosInstance.patch(`/invoice/${id}`, { isDeleted: true });
    
        setInvoices((prevInvoices) => prevInvoices.filter((invoice) => invoice.id !== id));
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    };
    
  
    const handleMarkAsPaid = (invoice: Invoice) => {
      setSelectedInvoice(invoice);
      setIsDialogOpen(true);
    };
  
    // const confirmPayment = (paymentDetails: PaymentDetails) => {
    //   if (selectedInvoice) {
    //     setInvoices(
    //       invoices.map((invoice) =>
    //         invoice._id === selectedInvoice._id
    //           ? { 
    //               ...invoice, 
    //               status: 'Paid',
    //               paymentDetails
    //             }
    //           : invoice
    //       )
    //     );
    //     setIsDialogOpen(false);
    //     setSelectedInvoice(null);
    //   }
    // };
  
    return (
      <div className="rounded-md bg-white p-4 shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          {!isFormOpen && (
          <Button variant="theme" onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Invoice
          </Button>)}
        </div>
  
        {isFormOpen ? (
          <div className=" flex flex-col items-center ">
            <h2 className="text-3xl font-semibold mb-8">
              {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
            </h2>
            <InvoiceForm
             setIsFormOpen={setIsFormOpen} 
             editingInvoice={editingInvoice}
             setEditingInvoice={setEditingInvoice}
            />
          </div>
        ) : (
          <InvoiceList
            invoices={invoices}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMarkAsPaid={handleMarkAsPaid}
          />
        )}
  
        <InvoiceDialog
          invoice={selectedInvoice}
          open={isDialogOpen}
          onClose={handleClose}
          // onConfirm={confirmPayment}
          setInvoices={setInvoices}
        />
      </div>
    );
  }
  


export default InvoicePage