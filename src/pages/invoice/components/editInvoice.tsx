import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, ArrowLeft, XCircle, Loader2, Trash } from 'lucide-react';
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

export default function EditInvoice() {
  const { id: companyId, invoiceId } = useParams<{ id: string; invoiceId: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [items, setItems] = useState([
    {
      id: 1,
      details: '',
      quantity: 1,
      rate: '',
      amount: 0
    }
  ]);

  // State for customers
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  
  const [transactionType, setTransactionType] = useState('');
  
  const [banks, setBanks] = useState<any[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');

  // State for new customer dialog
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bankName: '',
    accountNo: '',
    sortCode: '',
    beneficiary: ''
  });

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);

  const [notes, setNotes] = useState('');
  
  // Top Note State
  const [topNote, setTopNote] = useState('');
  const [showTopNote, setShowTopNote] = useState(false);

  const [showTermsAndConditions, setShowTermsAndConditions] = useState(false);
  const [termsAndConditions, setTermsAndConditions] = useState('');

  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);

  // Invoice-level tax and discount
  const [invoiceTax, setInvoiceTax] = useState('0');
  const [invoiceDiscount, setInvoiceDiscount] = useState('0');
  const [invoiceDiscountType, setInvoiceDiscountType] = useState('percentage');

  // Partial Payment State
  const [partialPayment, setPartialPayment] = useState('0');
  const [partialPaymentType, setPartialPaymentType] = useState('flat');
  const [balanceDue, setBalanceDue] = useState(0);

  // --- Data Fetching ---

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
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const fetchBanks = async () => {
    if (!companyId) return;
    setIsLoadingBanks(true);
    try {
      const response = await axiosInstance.get(
        `/bank?companyId=${companyId}&limit=10000`
      );
      setBanks(response.data.data.result || []);
    } catch (error) {
      console.error('Error fetching Banks:', error);
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const fetchInvoiceDetails = async () => {
    if (!invoiceId) return;
    try {
      const response = await axiosInstance.get(`/invoice/${invoiceId}`);
      const invoice = response.data.data;

      // Populate State
      setTransactionType(invoice.transactionType);
      
      // Handle Customer (check if populated object or just ID)
      const custId = typeof invoice.customer === 'object' ? invoice.customer._id : invoice.customer;
      setSelectedCustomer(custId);

      // Handle Bank
      const bankId = typeof invoice.bank === 'object' ? invoice.bank._id : invoice.bank;
      setSelectedBank(bankId || '');

      setInvoiceNumber(invoice.invoiceNumber || '');
      
      // Dates - Format to YYYY-MM-DD for input[type="date"]
      if (invoice.invoiceDate) setInvoiceDate(new Date(invoice.invoiceDate).toISOString().split('T')[0]);
      if (invoice.dueDate) setDueDate(new Date(invoice.dueDate).toISOString().split('T')[0]);

      setNotes(invoice.notes || '');
      setTermsAndConditions(invoice.termsAndConditions || '');
      if (invoice.termsAndConditions) setShowTermsAndConditions(true);

      // Top Note
      setTopNote(invoice.topNote || '');
      if (invoice.topNote) setShowTopNote(true);

      // Financials
      setInvoiceTax(invoice.tax?.toString() || '0');
      setInvoiceDiscount(invoice.discount?.toString() || '0');
      setInvoiceDiscountType(invoice.discountType || 'percentage');
      setPartialPayment(invoice.partialPayment?.toString() || '0');
      setPartialPaymentType(invoice.partialPaymentType || 'flat');

      // Items
      if (invoice.items && invoice.items.length > 0) {
        const formattedItems = invoice.items.map((item: any, index: number) => ({
          id: index + 1, // Reset UI IDs
          details: item.details,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        }));
        setItems(formattedItems);
      }

    } catch (error) {
      console.error('Error fetching invoice details:', error);
      toast({
        title: 'Failed to load invoice details',
        variant: 'destructive'
      });
      navigate(`/admin/company/${companyId}/invoice`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchBanks(), fetchCustomers()]);
      await fetchInvoiceDetails();
    };
    loadData();
  }, [companyId, invoiceId]);

  // --- Calculation Effect (Same as Create) ---
  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => {
      const rate =
        typeof item.rate === 'string'
          ? Number.parseFloat(item.rate) || 0
          : item.rate;
      return sum + item.quantity * rate;
    }, 0);

    setSubtotal(newSubtotal);

    const parsedTax = Number.parseFloat(invoiceTax);
    const parsedDiscount = Number.parseFloat(invoiceDiscount);
    const parsedPartialPayment = Number.parseFloat(partialPayment);

    const taxAmount =
      !isNaN(parsedTax) && parsedTax > 0 ? newSubtotal * (parsedTax / 100) : 0;

    let discountAmount = 0;
    if (!isNaN(parsedDiscount) && parsedDiscount > 0) {
      discountAmount =
        invoiceDiscountType === 'percentage'
          ? newSubtotal * (parsedDiscount / 100)
          : parsedDiscount;
    }

    const newTotal = newSubtotal + taxAmount - discountAmount;
    setTotal(newTotal);

    let paymentAmount = 0;
    if (!isNaN(parsedPartialPayment) && parsedPartialPayment > 0) {
        paymentAmount =
        partialPaymentType === 'percentage'
            ? newTotal * (parsedPartialPayment / 100)
            : parsedPartialPayment;
    }

    const newBalance = Math.max(0, newTotal - paymentAmount);
    setBalanceDue(newBalance);

  }, [items, invoiceTax, invoiceDiscount, invoiceDiscountType, partialPayment, partialPaymentType]);

  // --- Handlers ---

  const handleAddRow = () => {
    const newId =
      items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
    setItems([
      ...items,
      {
        id: newId,
        details: '',
        quantity: 1,
        rate: '',
        amount: 0
      }
    ]);
  };

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

  const handleItemChange = (id: number, field: string, value: any) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        if (field === 'rate') {
          const parsedRate = Number.parseFloat(value);
          if (!isNaN(parsedRate)) {
            updatedItem.rate = parsedRate;
          } else {
            updatedItem.rate = value;
          }
        }

        if (field === 'quantity' || field === 'rate') {
          const quantity =
            field === 'quantity' ? Number.parseFloat(value) : item.quantity;
          const rate =
            field === 'rate'
              ? typeof value === 'string'
                ? Number.parseFloat(value) || 0
                : value
              : typeof item.rate === 'string'
                ? Number.parseFloat(item.rate) || 0
                : item.rate;

          updatedItem.amount = quantity * rate;
        }
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name) {
      toast({ title: 'Customer name is required', variant: 'destructive' });
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
      setNewCustomer({
        name: '', email: '', phone: '', address: '',
        bankName: '', accountNo: '', sortCode: '', beneficiary: ''
      });
      toast({ title: 'Customer created successfully', className: 'bg-theme text-white border-none' });
    } catch (error) {
      toast({ title: 'Failed to create customer', variant: 'destructive' });
    }
  };

  const handleUpdateInvoice = async () => {
    if (!selectedCustomer) {
      toast({ title: 'Please select a customer', variant: 'destructive' });
      return;
    }

    if (transactionType !== 'outflow' && !selectedBank) {
      toast({ title: 'Please select a bank', variant: 'destructive' });
      return;
    }

    if (!transactionType) {
      toast({ title: 'Please select a transaction type', variant: 'destructive' });
      return;
    }

    if (items.some((item) => !item.details)) {
      toast({ title: 'Please fill in all item details', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const invoiceData = {
        companyId,
        customer: selectedCustomer,
        invoiceNumber,
        invoiceDate,
        dueDate,
        termsAndConditions,
        items: items.map(({ id, ...rest }) => ({
          ...rest,
          rate: typeof rest.rate === 'string' ? Number.parseFloat(rest.rate) || 0 : rest.rate
        })),
        notes,
        topNote,
        transactionType,
        // Status typically remains what it was unless specifically changed logic is applied
        amount: total,
        total: total,
        tax: Number.parseFloat(invoiceTax) || 0,
        discount: Number.parseFloat(invoiceDiscount) || 0,
        discountType: invoiceDiscountType,
        subtotal: subtotal,
        partialPayment: Number.parseFloat(partialPayment) || 0,
        partialPaymentType,
        balanceDue
      };

      if (transactionType !== 'outflow') {
        // @ts-ignore
        invoiceData.bank = selectedBank;
      }

      // PUT Request for Edit
      await axiosInstance.patch(`/invoice/${invoiceId}`, invoiceData);

      toast({
        title: 'Invoice updated successfully',
        className: 'bg-theme text-white border-none'
      });

      navigate(`/admin/company/${companyId}/invoice`);
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({ title: 'Failed to update invoice', variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex h-[400px] w-full items-center justify-center bg-white shadow-lg rounded-md">
            <Loader2 className="h-8 w-8 animate-spin text-theme" />
        </div>
    );
  }

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
        <h1 className="text-2xl font-bold">Edit Invoice</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        {/* Transaction Type */}
        <div className="space-y-2">
          <Label htmlFor="transactionType">Transaction Type*</Label>
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
        <div className="space-y-2">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer Name*</Label>
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
            </div>
          </div>
        </div>
        {transactionType !== 'outflow' && (
          <div className="space-y-2">
            <Label htmlFor="bank">Bank*</Label>
            <div className="flex items-center gap-2">
              <Select
                id="bank"
                className="w-full"
                value={banks.find((b) => b._id === selectedBank)}
                onChange={(selectedOption) =>
                  setSelectedBank(selectedOption?._id || '')
                }
                options={banks}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option._id}
                isDisabled={isLoadingBanks}
                placeholder="Select Bank Account"
                isLoading={isLoadingBanks}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Reference Invoice Number</Label>
          <div className="flex items-center gap-2">
            <Input
              className="h-10 rounded-sm"
              id="invoiceNumber"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceDate">Reference Invoice Date</Label>
          <Input
            className="h-10 rounded-sm"
            id="invoiceDate"
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            className="h-10 rounded-sm"
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8">
        <Card>
          <CardContent className="p-0">
            {/* Top Note Section */}
            <div className="border-b border-gray-200 p-4">
                {!showTopNote ? (
                    <Button variant="outline" size="sm" onClick={() => setShowTopNote(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Invoice Note
                    </Button>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center justify-start gap-4">
                            <Label htmlFor="topNote" className="text-sm font-medium">Invoice Note</Label>
                            <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8  text-red-500 hover:text-red-500"
                      onClick={() => {
                        setShowTopNote(false);
                        setTopNote('');
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                        </div>
                        <Textarea 
                            id="topNote"
                            value={topNote}
                            onChange={(e) => setTopNote(e.target.value)}
                            placeholder="Enter a note to display at the top of the invoice..."
                            className="w-full min-h-[60px] border border-gray-200"
                        />
                    </div>
                )}
            </div>

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
                      <td className="min-w-[300px] p-3">
                        <Textarea
                          className="border-gray-200"
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
                      <td className="max-w-[100px] p-3">
                        <Input
                          type="number"
                          value={item.rate}
                          onChange={(e) =>
                            handleItemChange(item.id, 'rate', e.target.value)
                          }
                          className="text-center"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          readOnly
                          value={
                            typeof item.amount === 'number'
                              ? item.amount.toFixed(2)
                              : '0.00'
                          }
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
              <div className="flex flex-col gap-2">
                <Button variant="theme" onClick={handleAddRow}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Row
                </Button>
                <div className="mb-2 flex items-center">
                  <span className="mr-4 w-28 font-medium">VAT (%)</span>
                  <Input
                    type="text"
                    min="0"
                    max="100"
                    value={invoiceTax}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      if ((value.match(/\./g) || []).length <= 1) {
                        setInvoiceTax(value);
                      }
                    }}
                    className="ml-auto w-32 text-center"
                  />
                </div>

                <div className="mb-2 flex items-center">
                  <span className="mr-4 w-28 font-medium">Discount</span>
                  <div className="flex w-full items-center gap-2">
                    <Select
                      id="invoiceDiscountType"
                       styles={{ container: (base) => ({ ...base, width: '200px' }) }}
                      value={[
                        { label: 'Percentage', value: 'percentage' },
                        { label: 'Flat', value: 'flat' }
                      ].find((opt) => opt.value === invoiceDiscountType)}
                      onChange={(selectedOption) =>
                        setInvoiceDiscountType(
                          selectedOption?.value || 'percentage'
                        )
                      }
                      options={[
                        { label: 'Percentage', value: 'percentage' },
                        { label: 'Flat', value: 'flat' }
                      ]}
                    />
                    <div className="ml-auto">
                      <Input
                        type="text"
                        min="0"
                        value={invoiceDiscount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          if ((value.match(/\./g) || []).length <= 1) {
                            setInvoiceDiscount(value);
                          }
                        }}
                        className="w-32 text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Partial Payment Input */}
                <div className="mb-2 flex items-center">
                  <span className="mr-4 w-28 font-medium">Paid Amount</span>
                  <div className="flex w-full items-center gap-2">
                    <Select
                      id="partialPaymentType"
                       styles={{ container: (base) => ({ ...base, width: '200px' }) }}
                      value={[
                        { label: 'Percentage', value: 'percentage' },
                        { label: 'Flat', value: 'flat' }
                      ].find((opt) => opt.value === partialPaymentType)}
                      onChange={(selectedOption) =>
                        setPartialPaymentType(
                          selectedOption?.value || 'flat'
                        )
                      }
                      options={[
                        { label: 'Percentage', value: 'percentage' },
                        { label: 'Flat', value: 'flat' }
                      ]}
                    />
                    <div className="ml-auto">
                      <Input
                        type="text"
                        min="0"
                        value={partialPayment}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          if ((value.match(/\./g) || []).length <= 1) {
                            setPartialPayment(value);
                          }
                        }}
                        className="w-32 text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-between gap-4 p-4">
                <div className="flex flex-col text-left">
                  <div className="mb-2 flex items-center">
                    <span className="mr-4 w-28 font-medium">Subtotal</span>
                    <span className=" ml-auto w-32 text-center font-medium">
                      {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="mb-2 flex items-center">
                    <span className="mr-4 w-28 font-medium">
                      VAT ({Number(invoiceTax) || 0}%)
                    </span>
                    <span className="ml-auto w-32 text-center font-medium">
                      +{(subtotal * (Number(invoiceTax) / 100)).toFixed(2)}
                    </span>
                  </div>
                  <div className="mb-2 flex items-center">
                    <span className="mr-4 w-32 font-medium">
                      {invoiceDiscountType === 'percentage'
                        ? `Discount (${Number(invoiceDiscount) || 0}%)`
                        : 'Discount'}
                    </span>
                    <span className="ml-auto w-32 text-center font-medium">
                      -
                      {(invoiceDiscountType === 'percentage'
                        ? subtotal * (Number(invoiceDiscount) / 100)
                        : Number(invoiceDiscount)
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div className="mb-2 border-t border-gray-100 pt-2 flex items-center">
                    <span className="mr-4 w-28 font-bold">Total</span>
                    <span className=" ml-auto w-32 text-center font-bold">
                      £{total.toFixed(2)}
                    </span>
                  </div>

                   {/* Partial Payment Summary Breakdown */}
                   {(Number(partialPayment) > 0) && (
                      <>
                        <div className="mb-2 flex items-center text-gray-600">
                            <span className="mr-4 w-32 font-medium">
                            {partialPaymentType === 'percentage'
                                ? `Paid (${Number(partialPayment) || 0}%)`
                                : 'Paid'}
                            </span>
                            <span className="ml-auto w-32 text-center font-medium">
                            -
                            {(partialPaymentType === 'percentage'
                                ? total * (Number(partialPayment) / 100)
                                : Number(partialPayment)
                            ).toFixed(2)}
                            </span>
                        </div>
                        <div className="mb-2 border-t border-gray-300 pt-2 flex items-center">
                            {/* <span className="mr-4 w-32 font-bold">Balance Due</span> */}
                            <span className="ml-auto w-32 text-center font-bold">
                            £{balanceDue.toFixed(2)}
                            </span>
                        </div>
                      </>
                   )}
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
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button variant="theme" onClick={handleUpdateInvoice} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Update Invoice
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
            {/* Same customer form fields as create invoice */}
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
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Textarea
                id="bankName"
                value={newCustomer.bankName}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, bankName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNo">Account No:</Label>
              <Textarea
                id="accountNo"
                value={newCustomer.accountNo}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, accountNo: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortCode">Sort Code:</Label>
              <Textarea
                id="sortCode"
                value={newCustomer.sortCode}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, sortCode: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beneficiary">Beneficiary:</Label>
              <Textarea
                id="beneficiary"
                value={newCustomer.beneficiary}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, beneficiary: e.target.value })
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
            <Button variant="theme" onClick={handleCreateCustomer}>
              Create Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}