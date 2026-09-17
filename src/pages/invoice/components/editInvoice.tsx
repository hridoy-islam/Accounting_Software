import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Trash2,
  ArrowLeft,
  Trash,
  CalendarClock,
  Wallet,
  Pencil,
  Paperclip
} from 'lucide-react';
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
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrency } from '@/hooks/useCurrency';
import {
  customerFormSchema,
  FieldError,
  FieldErrors,
  scheduleFormSchema,
  validateWithSchema
} from './invoice-form-validation';
import { InvoicePaymentDialog } from './InvoicePaymentDialog';

export default function EditInvoice() {
  const { id: companyId, invoiceId } = useParams<{
    id: string;
    invoiceId: string;
  }>();
  const navigate = useNavigate();

  const { symbol } = useCurrency();

  // --- LOADING STATE (Consolidated) ---
  const [isPageLoading, setIsPageLoading] = useState(true);

  // --- DATA STATE ---
  const [items, setItems] = useState([
    {
      id: 1,
      details: '',
      quantity: 1,
      rate: '' as any,
      amount: 0
    }
  ]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');

  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [transactionType, setTransactionType] = useState('');

  // --- PAYMENT STATE ---
  const [invId, setInvId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [methods, setMethods] = useState<any[]>([]);
  const [storages, setStorages] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<any | null>(null);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);

  // New Customer Dialog State
  const [customerErrors, setCustomerErrors] = useState<FieldErrors>({});
  const [scheduleErrors, setScheduleErrors] = useState<FieldErrors>({});
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

  // Invoice Meta
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [topNote, setTopNote] = useState('');
  const [showTopNote, setShowTopNote] = useState(false);
  const [showTermsAndConditions, setShowTermsAndConditions] = useState(false);
  const [termsAndConditions, setTermsAndConditions] = useState('');

  // Calculations
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [invoiceTax, setInvoiceTax] = useState('0');
  const [invoiceDiscount, setInvoiceDiscount] = useState('0');
  const [invoiceDiscountType, setInvoiceDiscountType] = useState('percentage');
  const [partialPayment, setPartialPayment] = useState('0');
  const [partialPaymentType, setPartialPaymentType] = useState('flat');
  const [balanceDue, setBalanceDue] = useState(0);

  // --- SCHEDULE STATE ---
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState<
    string | undefined
  >(undefined);
  const [scheduleDay, setScheduleDay] = useState<number | undefined>(undefined);
  const [scheduleMonth, setScheduleMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [scheduleDueDays, setScheduleDueDays] = useState<string>('0');

  // Helper options
  const daysOptions = Array.from({ length: 31 }, (_, i) => ({
    label: `${i + 1}`,
    value: i + 1
  }));
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

  function getOrdinalSuffix(i: number) {
    const j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }

  // --- DATA FETCHING ---

  // NOTE: Loading state is handled by the useEffect wrapper, not individual functions
  const fetchCustomers = async () => {
    if (!companyId) return;
    try {
      const response = await axiosInstance.get(
        `/customer?companyId=${companyId}&limit=all`
      );
      setCustomers(response.data.data.result || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchBanks = async () => {
    if (!companyId) return;
    try {
      const response = await axiosInstance.get(
        `/bank?companyId=${companyId}&limit=10000`
      );
      setBanks(response.data.data.result || []);
    } catch (error) {
      console.error('Error fetching Banks:', error);
    }
  };

  // Categories/methods/storages are the transaction fields a payment needs
  const fetchTransactionOptions = async () => {
    if (!companyId) return;
    try {
      const [categoriesRes, methodsRes, storagesRes] = await Promise.all([
        axiosInstance.get(`/categories/company/${companyId}?limit=10000`),
        axiosInstance.get(`/methods/company/${companyId}?limit=10000`),
        axiosInstance.get(`/storages/company/${companyId}?limit=10000`)
      ]);
      setCategories(categoriesRes.data.data.result || []);
      setMethods(methodsRes.data.data.result || []);
      setStorages(storagesRes.data.data.result || []);
    } catch (error) {
      console.error('Error fetching transaction options:', error);
    }
  };

  const fetchPayments = async () => {
    if (!invoiceId) return;
    try {
      const response = await axiosInstance.get(
        `/invoice/${invoiceId}/payments`
      );
      setPayments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching invoice payments:', error);
    }
  };

  const fetchInvoiceDetails = async () => {
    if (!invoiceId) return;
    try {
      const response = await axiosInstance.get(`/invoice/${invoiceId}`);
      const data = response.data.data;

      // Populate State
      setInvId(data.invId || '');
      setTransactionType(data.transactionType || 'inflow');
      setSelectedCustomer(
        typeof data.customer === 'object' ? data.customer._id : data.customer
      );
      if (data.bank) {
        setSelectedBank(
          typeof data.bank === 'object' ? data.bank._id : data.bank
        );
      }
      setInvoiceNumber(data.invoiceNumber || '');

      // Handle Dates
      if (data.invoiceDate) setInvoiceDate(data.invoiceDate.split('T')[0]);
      if (data.dueDate) setDueDate(data.dueDate.split('T')[0]);

      // Items
      if (data.items && data.items.length > 0) {
        const formattedItems = data.items.map((item: any, index: number) => ({
          id: index + 1,
          details: item.details,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        }));
        setItems(formattedItems);
      }

      // Financials
      setInvoiceTax(String(data.tax || 0));
      setInvoiceDiscount(String(data.discount || 0));
      setInvoiceDiscountType(data.discountType || 'percentage');
      setPartialPayment(String(data.partialPayment || 0));
      setPartialPaymentType(data.partialPaymentType || 'flat');

      // Notes & Terms
      setNotes(data.notes || '');
      if (data.topNote) {
        setTopNote(data.topNote);
        setShowTopNote(true);
      }
      setTermsAndConditions(data.termsAndConditions || '');
      if (data.termsAndConditions) setShowTermsAndConditions(true);

      // Recurring Settings
      if (data.isRecurring) {
        setIsRecurring(true);
        setScheduleFrequency(data.frequency);
        setScheduleDay(data.scheduledDay);
        if (data.scheduledMonth) setScheduleMonth(data.scheduledMonth);
        setScheduleDueDays(String(data.frequencyDueDate || 0));
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      toast({
        title: 'Failed to load invoice details',
        variant: 'destructive'
      });
      navigate(`/admin/company/${companyId}/invoice`);
    }
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
      setIsPageLoading(true); // Start loading
      try {
        // Fetch all data in parallel for speed
        await Promise.all([
          fetchBanks(),
          fetchCustomers(),
          fetchInvoiceDetails(),
          fetchTransactionOptions(),
          fetchPayments()
        ]);
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsPageLoading(false); // Stop loading regardless of success/failure
      }
    };

    if (companyId && invoiceId) {
      init();
    }
  }, [companyId, invoiceId]);

  // Total already received through recorded payment transactions
  const paidFromPayments = payments.reduce(
    (sum, payment) => sum + (Number(payment.transactionAmount) || 0),
    0
  );

  // Calculation Effect
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

    const newBalance = Math.max(0, newTotal - paymentAmount - paidFromPayments);
    setBalanceDue(newBalance);
  }, [
    items,
    invoiceTax,
    invoiceDiscount,
    invoiceDiscountType,
    partialPayment,
    partialPaymentType,
    paidFromPayments
  ]);

  // --- HANDLERS ---

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

  const handleCustomerChange = (field: string, value: string) => {
    setNewCustomer((prev) => ({ ...prev, [field]: value }));
    setCustomerErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const clearScheduleError = (field: string) =>
    setScheduleErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });

  // Validates the schedule dialog before it is accepted
  const handleConfirmSchedule = () => {
    const result = validateWithSchema(scheduleFormSchema, {
      frequency: scheduleFrequency,
      scheduledDay: scheduleDay,
      scheduledMonth:
        scheduleFrequency === 'yearly' ? scheduleMonth : undefined,
      dueDays: scheduleDueDays
    });

    setScheduleErrors(result.errors);
    if (!result.success) return;

    setIsRecurring(true);
    setIsScheduleDialogOpen(false);
  };

  const handleCreateCustomer = async () => {
    const { success, errors } = validateWithSchema(
      customerFormSchema,
      newCustomer
    );
    setCustomerErrors(errors);
    if (!success) return;

    try {
      const response = await axiosInstance.post('/customer', {
        ...newCustomer,
        companyId
      });
      const createdCustomer = response.data.data;
      setCustomers([...customers, createdCustomer]);
      setSelectedCustomer(createdCustomer._id);
      setIsNewCustomerDialogOpen(false);
      setCustomerErrors({});
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        bankName: '',
        accountNo: '',
        sortCode: '',
        beneficiary: ''
      });
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

  const handleOpenPaymentDialog = (payment: any = null) => {
    if (!transactionType) {
      toast({
        title: 'Please select a transaction type first',
        variant: 'destructive'
      });
      return;
    }
    setEditingPayment(payment);
    setIsPaymentDialogOpen(true);
  };

  // Deleting the payment here also deletes the linked transaction
  const handleDeletePayment = async () => {
    if (!deletingPayment) return;
    setIsDeletingPayment(true);
    try {
      await axiosInstance.delete(
        `/invoice/${invoiceId}/payments/${deletingPayment._id}`
      );
      await fetchPayments();
      setDeletingPayment(null);
      toast({
        title: 'Payment deleted successfully',
        className: 'bg-theme text-white border-none'
      });
    } catch (error: any) {
      console.error('Error deleting payment:', error);
      toast({
        title: error?.response?.data?.message || 'Failed to delete payment',
        variant: 'destructive'
      });
    } finally {
      setIsDeletingPayment(false);
    }
  };

  const handleSaveInvoice = async () => {
    if (!selectedCustomer) {
      toast({
        title: 'Please select a customer',
        variant: 'destructive'
      });
      return;
    }
    if (transactionType !== 'outflow' && !selectedBank) {
      toast({
        title: 'Please select a bank',
        variant: 'destructive'
      });
      return;
    }
    if (!transactionType) {
      toast({
        title: 'Please select a transaction type',
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

    const todayISO = new Date().toISOString().split('T')[0];
    const actualInvoiceDate = invoiceDate || todayISO;

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
          rate:
            typeof rest.rate === 'string'
              ? Number.parseFloat(rest.rate) || 0
              : rest.rate
        })),
        notes,
        topNote,
        transactionType,
        amount: total,
        total: total,
        tax: Number.parseFloat(invoiceTax) || 0,
        discount: Number.parseFloat(invoiceDiscount) || 0,
        discountType: invoiceDiscountType,
        subtotal: subtotal,
        partialPayment: Number.parseFloat(partialPayment) || 0,
        partialPaymentType,
        balanceDue,
        isRecurring,
        // --- RECURRING FIELDS ---
        ...(isRecurring && {
          frequency: scheduleFrequency,
          scheduledDay: scheduleDay,
          scheduledMonth:
            scheduleFrequency === 'yearly' ? scheduleMonth : undefined,
          frequencyDueDate: Number(scheduleDueDays) || 0
        })
      };

      if (transactionType !== 'outflow') {
        // @ts-ignore
        invoiceData.bank = selectedBank;
      }

      await axiosInstance.patch(`/invoice/${invoiceId}`, invoiceData);

      toast({
        title: 'Invoice updated successfully',
        className: 'bg-theme text-white border-none'
      });
      navigate(`/admin/company/${companyId}/invoice`);
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: 'Failed to update invoice',
        variant: 'destructive'
      });
    }
  };

  // --- RENDER ---

  if (isPageLoading) {
    return (
      <div className="flex h-10 w-full flex-col items-center justify-center">
        <div className="flex flex-row items-center gap-4">
          <p className="font-semibold">Please Wait..</p>
          <div className="h-5 w-5 animate-spin rounded-full border-4 border-dashed border-theme"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2 rounded-md bg-white p-4 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <div className=" flex items-center">
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
        <div className="flex items-center gap-2">
          <Button
                variant="theme"
                onClick={() => handleOpenPaymentDialog()}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Make Payment
              </Button>
          <Button
            variant="outline"
            className={`${isRecurring ? 'hover:bg-theme/90 border-none bg-theme text-white' : ''}`}
            onClick={() => {
              setIsScheduleDialogOpen(true);
            }}
          >
            <CalendarClock className="mr-2 h-4 w-4" />
            {isRecurring && scheduleFrequency && scheduleDay ? (
              <span className="flex items-center gap-1 text-xs sm:text-sm">
                <span className="font-semibold text-inherit">
                  Scheduled ( {scheduleDay} of every{' '}
                  {scheduleFrequency === 'monthly' ? 'month' : 'year'}
                </span>
                {scheduleFrequency === 'yearly' && (
                  <span className="font-semibold text-inherit">
                    {' '}
                    of{' '}
                    {monthOptions.find((m) => m.value === scheduleMonth)?.label}
                  </span>
                )}
                )
              </span>
            ) : (
              'Schedule Invoice'
            )}
          </Button>
        </div>
      </div>

      {/* --- FORM CONTENT --- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
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
                placeholder="Select or add customer"
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
                placeholder="Select Bank Account"
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
            <div className="border-b border-gray-200 p-4">
              {!showTopNote ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTopNote(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Invoice Note
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-start gap-4">
                    <Label htmlFor="topNote" className="text-sm font-medium">
                      Invoice Note
                    </Label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-500"
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
                    className="min-h-[60px] w-full border border-gray-200"
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

            <div className="ml-2 mt-4 flex flex-wrap items-center gap-2">
              <Button variant="theme" onClick={handleAddRow}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Row
              </Button>
            </div>
            <div className=" flex items-center justify-end pr-12 -mt-8">
              <span className="mr-4 w-48 font-bold">Total Invoice Amount</span>
              <span className="w-32 text-center font-bold">
                {symbol}
                {total.toFixed(2)}
              </span>
            </div>

            {/* --- PAYMENTS --- */}
            <div className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 p-4">
                    <div>
                      <h2 className="text-lg font-semibold">Payments</h2>
                      <p className="text-sm text-black">
                        Each payment is recorded as a{' '}
                        {transactionType || 'linked'} transaction and kept in
                        sync with it.
                      </p>
                    </div>
                    {/* <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-black">Paid / Balance Due</p>
                        <p className="font-semibold">
                          {symbol}
                          {paidFromPayments.toFixed(2)} / {symbol}
                          {balanceDue.toFixed(2)}
                        </p>
                      </div>
                    </div> */}
                  </div>

                  {payments.length === 0 ? (
                    <p className="p-6 text-center text-sm text-black">
                      No payment has been recorded for this invoice yet.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 text-sm">
                            <th className="p-3 text-left">DATE</th>
                            <th className="p-3 text-left">TRANSACTION ID</th>
                            <th className="p-3 text-left">CATEGORY</th>
                            <th className="p-3 text-left">METHOD</th>
                            <th className="p-3 text-left">STORAGE</th>
                            <th className="p-3 text-center">DOC</th>
                            <th className="p-3 text-right">AMOUNT</th>
                            <th className="w-24 p-3 text-center">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment) => (
                            <tr
                              key={payment._id}
                              className="border-b border-gray-200 text-sm"
                            >
                              <td className="p-3">
                                {payment.transactionDate
                                  ? new Date(
                                      payment.transactionDate
                                    ).toLocaleDateString()
                                  : '-'}
                              </td>
                              <td className="p-3">{payment.tcid || '-'}</td>
                              <td className="p-3">
                                {payment.transactionCategory?.name || '-'}
                              </td>
                              <td className="p-3">
                                {payment.transactionMethod?.name || '-'}
                              </td>
                              <td className="p-3">
                                {payment.storage?.storageName || '-'}
                              </td>
                              <td className="p-3 text-center">
                                {payment.transactionDoc ? (
                                  <a
                                    href={payment.transactionDoc}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:bg-theme/90 inline-flex items-center gap-1.5 rounded-md bg-theme px-3 py-1.5 text-sm font-medium text-white transition"
                                  >
                                    <Paperclip className="h-4 w-4" />
                                    View Document
                                  </a>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="p-3 text-right font-medium">
                                {symbol}
                                {(
                                  Number(payment.transactionAmount) || 0
                                ).toFixed(2)}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    size="icon"
                                    onClick={() =>
                                      handleOpenPaymentDialog(payment)
                                    }
                                    className="hover:bg-theme/90 bg-theme text-white"
                                  >
                                    <Pencil className="h-4 w-4 " />
                                  </Button>
                                  <Button
                                    variant={'destructive'}
                                    size="icon"
                                    onClick={() => setDeletingPayment(payment)}
                                  >
                                    <Trash2 className="h-4 w-4 " />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex items-center justify-end border-t border-gray-200 p-4">
                    <span className="mr-4 w-40 font-bold">
                      Total Paid Amount
                    </span>
                    <span className="w-32 text-center font-bold">
                      {symbol}
                      {paidFromPayments.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-between p-4">
              <div className="flex flex-col gap-2">
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
                      styles={{
                        container: (base) => ({ ...base, width: '200px' })
                      }}
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
                {/* <div className="mb-2 flex items-center">
                  <span className="mr-4 w-28 font-medium">Paid Amount</span>
                  <div className="flex w-full items-center gap-2">
                    <Select
                      id="partialPaymentType"
                      styles={{
                        container: (base) => ({ ...base, width: '200px' })
                      }}
                      value={[
                        { label: 'Percentage', value: 'percentage' },
                        { label: 'Flat', value: 'flat' }
                      ].find((opt) => opt.value === partialPaymentType)}
                      onChange={(selectedOption) =>
                        setPartialPaymentType(selectedOption?.value || 'flat')
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
                </div> */}
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
                  <div className="mb-2 flex items-center border-t border-gray-100 pt-2">
                    <span className="mr-4 w-28 font-bold">Total</span>
                    <span className=" ml-auto w-32 text-center font-bold">
                      {symbol}
                      {total.toFixed(2)}
                    </span>
                  </div>
                  {paidFromPayments > 0 && (
                    <div className="mb-2 flex items-center text-black">
                      <span className="mr-4 w-48 font-medium">
                        Total paid
                      </span>
                      <span className="ml-auto w-32 text-center font-medium">
                        -{paidFromPayments.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {Number(partialPayment) > 0 && (
                    <>
                      <div className="mb-2 flex items-center text-black">
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
                    </>
                  )}
                  {(Number(partialPayment) > 0 || paidFromPayments > 0) && (
                    <div className="mb-2 flex items-center border-t border-gray-300 pt-2 ">
                      <span className="mr-4 w-28 font-bold">Balance Due</span>
                      <span className="ml-auto w-32 text-center font-bold">
                        {symbol}
                        {balanceDue.toFixed(2)}
                      </span>
                    </div>
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
          <p className="text-sm text-black">Will be displayed on the invoice</p>
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
            {isRecurring ? 'Update Schedule' : 'Update Invoice'}
          </Button>
        </div>
      </div>

      {/* PAYMENT DIALOG */}
      <InvoicePaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={(open: boolean) => {
          setIsPaymentDialogOpen(open);
          if (!open) setEditingPayment(null);
        }}
        invoice={{
          _id: invoiceId,
          invId,
          invoiceNumber,
          invoiceDate,
          transactionType,
          total,
          balanceDue
        }}
        categories={categories}
        methods={methods}
        storages={storages}
        editingPayment={editingPayment}
        onSaved={fetchPayments}
      />

      {/* DELETE PAYMENT CONFIRMATION */}
      <Dialog
        open={!!deletingPayment}
        onOpenChange={(open) => {
          if (!open) setDeletingPayment(null);
        }}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Delete Payment</DialogTitle>
            <DialogDescription>
              This also deletes the linked transaction
              {deletingPayment?.tcid ? ` (${deletingPayment.tcid})` : ''} and
              updates the storage balance. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              disabled={isDeletingPayment}
              onClick={() => setDeletingPayment(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeletingPayment}
              onClick={handleDeletePayment}
            >
              {isDeletingPayment ? 'Deleting...' : 'Delete Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SCHEDULE DIALOG */}
      <Dialog
        open={isScheduleDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (isRecurring && (!scheduleFrequency || !scheduleDay)) {
              setIsRecurring(false);
              setScheduleFrequency('monthly');
              setScheduleDueDays('0');
            }
          }
          setIsScheduleDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Invoice Settings</DialogTitle>
            <DialogDescription>
              Configure how this invoice should be automatically generated.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <>
              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-sm font-medium">
                  How often would you like the invoice to be scheduled?{' '}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="frequency"
                  value={[
                    { label: 'Monthly', value: 'monthly' },
                    { label: 'Yearly', value: 'yearly' }
                  ].find((opt) => opt.value === scheduleFrequency)}
                  onChange={(opt: any) => {
                    setScheduleFrequency(opt?.value);
                    clearScheduleError('frequency');
                  }}
                  options={[
                    { label: 'Monthly', value: 'monthly' },
                    { label: 'Yearly', value: 'yearly' }
                  ]}
                />
                <FieldError message={scheduleErrors.frequency} />
              </div>

              <div className="space-y-2">
                {/* Dynamic label */}
                <Label className="text-sm font-medium">
                  {scheduleFrequency === 'yearly'
                    ? 'Choose the month and day the invoice should be issued'
                    : 'Choose the day the invoice should be issued'}{' '}
                  <span className="text-red-500">*</span>
                </Label>

                <div className="grid grid-cols-2 gap-4">
                  {scheduleFrequency === 'yearly' && (
                    <div className="col-span-1">
                      <Select
                        placeholder="Select Month"
                        options={monthOptions}
                        value={monthOptions.find(
                          (m) => m.value === scheduleMonth
                        )}
                        onChange={(opt: any) => {
                          setScheduleMonth(opt?.value);
                          clearScheduleError('scheduledMonth');
                        }}
                        menuPlacement="auto"
                      />
                      <FieldError message={scheduleErrors.scheduledMonth} />
                    </div>
                  )}

                  <div
                    className={`${scheduleFrequency !== 'yearly' ? 'col-span-2' : 'col-span-1'}`}
                  >
                    <Select
                      placeholder="Select Day"
                      options={daysOptions}
                      value={daysOptions.find((d) => d.value === scheduleDay)}
                      onChange={(opt: any) => {
                        setScheduleDay(opt?.value);
                        clearScheduleError('scheduledDay');
                      }}
                      menuPlacement="auto"
                      maxMenuHeight={200}
                    />
                    <FieldError message={scheduleErrors.scheduledDay} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDays" className="text-sm font-medium">
                  Due date duration (in days){' '}
                </Label>
                <Input
                  id="dueDays"
                  type="number"
                  min="0"
                  placeholder="e.g. 7"
                  value={scheduleDueDays}
                  onChange={(e) => {
                    setScheduleDueDays(e.target.value);
                    clearScheduleError('dueDays');
                  }}
                />
                <FieldError message={scheduleErrors.dueDays} />
                <p className="text-xs font-semibold text-black">
                  We will automatically set future due dates based on the
                  duration you choose
                </p>
              </div>

              {scheduleFrequency && scheduleDay && (
                <div className="rounded-md bg-gray-50 p-3 text-sm text-black">
                  <p>
                    Invoice will generate on{' '}
                    <span className="font-semibold text-theme">
                      {scheduleDay}
                      {scheduleFrequency === 'yearly' && (
                        <>
                          {' '}
                          {
                            monthOptions.find((m) => m.value === scheduleMonth)
                              ?.label
                          }
                        </>
                      )}{' '}
                      of every{' '}
                      {scheduleFrequency === 'monthly' ? 'month' : 'year'}
                    </span>
                  </p>
                </div>
              )}
            </>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsScheduleDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button variant="theme" onClick={handleConfirmSchedule}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEW CUSTOMER DIALOG */}
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
                onChange={(e) => handleCustomerChange('name', e.target.value)}
              />
              <FieldError message={customerErrors.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={newCustomer.email}
                onChange={(e) => handleCustomerChange('email', e.target.value)}
              />
              <FieldError message={customerErrors.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                value={newCustomer.phone}
                onChange={(e) => handleCustomerChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress">Address</Label>
              <Textarea
                id="customerAddress"
                value={newCustomer.address}
                onChange={(e) =>
                  handleCustomerChange('address', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Textarea
                id="bankName"
                value={newCustomer.bankName}
                onChange={(e) =>
                  handleCustomerChange('bankName', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNo">Account No:</Label>
              <Textarea
                id="accountNo"
                value={newCustomer.accountNo}
                onChange={(e) =>
                  handleCustomerChange('accountNo', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortCode">Sort Code:</Label>
              <Textarea
                id="sortCode"
                value={newCustomer.sortCode}
                onChange={(e) =>
                  handleCustomerChange('sortCode', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beneficiary">Beneficiary:</Label>
              <Textarea
                id="beneficiary"
                value={newCustomer.beneficiary}
                onChange={(e) =>
                  handleCustomerChange('beneficiary', e.target.value)
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
