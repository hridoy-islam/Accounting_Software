import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Trash2, ArrowLeft } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Select from 'react-select';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function CreateInvoice() {
  const { id: companyId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [items, setItems] = useState([
    { id: 1, details: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  // State for customers
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [transactionType, setTransactionType] = useState('');

  // State for new customer dialog
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');


  const [notes, setNotes] = useState('');
  const [showTermsAndConditions, setShowTermsAndConditions] = useState(false);
  const [termsAndConditions, setTermsAndConditions] = useState('');

  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!companyId) return;

      setIsLoadingCustomers(true);
      try {
        const response = await axiosInstance.get(
          `/customer?companyId=${companyId}&limit=all`
        );
        setCustomers(response.data.data.result || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast({
          title: 'Failed to load customers',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, [companyId]);

  // Calculate total when items change
  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + item.amount, 0);
    setTotal(newTotal);
  }, [items]);

  const handleAddRow = () => {
    const newId =
      items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
    setItems([
      ...items,
      { id: newId, details: '', quantity: 1, rate: 0, amount: 0 }
    ]);
  };

  // Handle removing a row
  const handleRemoveRow = (id: number) => {
    if (items.length === 1) {
      toast({
        title: 'Cannot remove all items',
        description: 'At least one item is required',
        variant: 'destructive'
      });
      return;
    }

    setItems(items.filter((item) => item.id !== id));
  };

  // Handle item change
  const handleItemChange = (id: number, field: string, value: any) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // Recalculate amount if quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
          const quantity =
            field === 'quantity' ? Number.parseFloat(value) : item.quantity;
          const rate = field === 'rate' ? Number.parseFloat(value) : item.rate;
          updatedItem.amount = quantity * rate;
        }

        return updatedItem;
      }
      return item;
    });

    setItems(updatedItems);
  };

  // Handle creating a new customer
  const handleCreateCustomer = async () => {
    if (!newCustomer.name) {
      toast({
        title: 'Customer name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await axiosInstance.post('/customer', {
        ...newCustomer,
        companyId
      });

      const createdCustomer = response.data.data;
      setCustomers([...customers, createdCustomer]);
      setSelectedCustomer(createdCustomer._id);
      setIsNewCustomerDialogOpen(false);
      setNewCustomer({ name: '', email: '', phone: '', address: '' });

      toast({
        title: 'Customer created successfully',
        className: 'bg-theme text-white border-none'
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: 'Failed to create customer',
        variant: 'destructive'
      });
    }
  };

  // Handle saving invoice
  const handleSaveInvoice = async () => {
    if (!selectedCustomer) {
      toast({
        title: 'Please select a customer',
        variant: 'destructive'
      });
      return;
    }

    if (items.some((item) => !item.details)) {
      toast({
        title: 'Please fill in all item details',
        variant: 'destructive'
      });
      return;
    }

    try {
      const invoiceData = {
        companyId,
        customer: selectedCustomer,
        invoiceNumber,
        invoiceDate,
        termsAndConditions,
        items: items.map(({ id, ...rest }) => rest),
        notes,
        transactionType,
        status: 'due',
        amount: total,
   
      };

      await axiosInstance.post('/invoice', invoiceData);

      toast({
        title: 'Invoice save successfully',
        className: 'bg-theme text-white border-none'
      });

      navigate(`/admin/company/${companyId}/invoice`);
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: 'Failed to save invoice',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="mb-2 rounded-md bg-white p-4 shadow-lg">
      <div className="mb-6 flex items-center">
        <Button
          variant="theme"
          onClick={() => navigate(`/admin/company/${companyId}/invoice`)}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Invoice</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="space-y-2">
          <div className="space-y-2">
            <Label htmlFor="customer" >
              Customer Name*
            </Label>
            <div className="flex items-center gap-2">
              <Select
                id="customer"
                className="w-full"
                value={customers.find((c) => c._id === selectedCustomer)}
                onChange={(selectedOption) =>
                  setSelectedCustomer(selectedOption?._id || '')
                }
                options={customers}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option._id}
                isDisabled={isLoadingCustomers}
                placeholder="Select or add customer"
                isLoading={isLoadingCustomers}
              />
              <Button
                variant="theme"
                size="icon"
                onClick={() => setIsNewCustomerDialogOpen(true)}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber" >
            Reference Invoice Number
          </Label>
          <div className="flex items-center gap-2">
            <Input
                className='rounded-sm h-10'
              id="invoiceNumber"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceDate" >
            Reference Invoice Date
          </Label>
          <Input
          className='rounded-sm h-10'
            id="invoiceDate"
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
          />
        </div>
        {/* Transaction Type */}
        <div className="space-y-2">
          <Label htmlFor="transactionType" >
            Transaction Type*
          </Label>
          <Select
            id="transactionType"
            className="w-full"
            value={[
              { label: 'Inflow', value: 'inflow' },
              { label: 'Outflow', value: 'outflow' }
            ].find((opt) => opt.value === transactionType)}
            onChange={(selectedOption) =>
              setTransactionType(selectedOption?.value || '')
            }
            options={[
              { label: 'Inflow', value: 'inflow' },
              { label: 'Outflow', value: 'outflow' }
            ]}
            placeholder="Select type"
          />
        </div>
      </div>

      <div className="mt-8">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="p-3 text-left">ITEM DETAILS</th>
                    <th className="p-3 text-center">QUANTITY</th>
                    <th className="p-3 text-center">RATE</th>
                    <th className="p-3 text-center">AMOUNT</th>
                    <th className="w-10 p-3 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="min-w-[400px] p-3">
                        <Textarea
                        className='border-gray-200'
                          value={item.details}
                          onChange={(e) =>
                            handleItemChange(item.id, 'details', e.target.value)
                          }
                          placeholder="Type or click to select an item"
                        />
                      </td>
                      <td className="max-w-[40px] p-3">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              'quantity',
                              Number.parseFloat(e.target.value)
                            )
                          }
                          className="text-center"
                        />
                      </td>
                      <td className="max-w-[140px] p-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              'rate',
                              Number.parseFloat(e.target.value)
                            )
                          }
                          className="text-center"
                        />
                      </td>

                      <td className="p-3">
                        <Input
                          type="number"
                          readOnly
                          value={item.amount.toFixed(2)}
                          className="text-center"
                        />
                      </td>
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRow(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between p-4">
              <div className="flex gap-2">
                <Button variant="theme" onClick={handleAddRow}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Row
                </Button>
              </div>

              <div className="text-right">
                <div className="mb-2 flex justify-end">
                  <span className="mr-8 font-medium">Total</span>
                  <span className="w-32 font-medium">£{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Thanks for your business."
            className="min-h-[80px] max-w-[500px] border-gray-200"
          />
          <p className="text-sm text-gray-500">
            Will be displayed on the invoice
          </p>
        </div>

        <div>
          <Button
            variant="link"
            className="p-0 text-blue-500"
            onClick={() => setShowTermsAndConditions(!showTermsAndConditions)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Terms and conditions
          </Button>

          {showTermsAndConditions && (
            <div className="mt-2 space-y-2">
              <Textarea
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                placeholder="Enter your terms and conditions"
                className="min-h-[60px] max-w-[500px] border-gray-200"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <div className="flex w-full flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/company/${companyId}/invoice`)}
          >
            Cancel
          </Button>
          <Button variant="theme" onClick={() => handleSaveInvoice()}>
            Save
          </Button>
        </div>
      </div>

      <Dialog
        open={isNewCustomerDialogOpen}
        onOpenChange={setIsNewCustomerDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Name*</Label>
              <Input
                id="customerName"
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerAddress">Address</Label>
              <Textarea
                id="customerAddress"
                value={newCustomer.address}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, address: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewCustomerDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant='theme' onClick={handleCreateCustomer}>Create Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
