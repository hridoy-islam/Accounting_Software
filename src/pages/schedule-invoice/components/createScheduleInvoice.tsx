import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Trash2,
  ArrowLeft,
  Trash,
  CalendarClock
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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

export default function CreateScheduleInvoice() {
  const { id: companyId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- EXISTING STATE ---
  const [items, setItems] = useState([
    {
      id: 1,
      details: '',
      quantity: 1,
      rate: '',
      amount: 0
    }
  ]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [banks, setBanks] = useState<any[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
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
  const [topNote, setTopNote] = useState('');
  const [showTopNote, setShowTopNote] = useState(false);
  const [showTermsAndConditions, setShowTermsAndConditions] = useState(false);
  const [termsAndConditions, setTermsAndConditions] = useState('');
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
  const [scheduleDay, setScheduleDay] = useState<number>();
  const [scheduleMonth, setScheduleMonth] = useState<number>(
    new Date().getMonth() + 1
  ); // 1-12
  const [scheduleDueDays, setScheduleDueDays] = useState<string>('');

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
      toast({
        title: 'Failed to load Banks',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingBanks(false);
    }
  };

  useEffect(() => {
    fetchBanks();
    fetchCustomers();
  }, [companyId]);

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
  }, [
    items,
    invoiceTax,
    invoiceDiscount,
    invoiceDiscountType,
    partialPayment,
    partialPaymentType
  ]);

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
    if (isRecurring && (!scheduleFrequency || !scheduleDay)) {
      toast({
        title: 'Please configure the schedule settings',
        variant: 'destructive'
      });
      setIsScheduleDialogOpen(true);
      return;
    }

    // Determine lastRunDate: use invoiceDate if set, else today
    const todayISO = new Date().toISOString().split('T')[0];
    const actualInvoiceDate = invoiceDate || todayISO;
    const actualLastRunDate = isRecurring ? actualInvoiceDate : undefined;

    try {
      const invoiceData = {
        companyId,
        customer: selectedCustomer,
        invoiceNumber,
        invoiceDate: actualInvoiceDate,
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
        status: 'due',
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
          frequencyDueDate: Number(scheduleDueDays) || 0,
          lastRunDate: actualLastRunDate // First run is NOW
        })
      };

      if (transactionType !== 'outflow') {
        // @ts-ignore
        invoiceData.bank = selectedBank;
      }

      console.log('Invoice Data to be sent:', invoiceData);

      // Changed endpoint to /schedule-invoice
      await axiosInstance.post('/schedule-invoice', invoiceData);

      toast({
        title: isRecurring
          ? 'Invoice scheduled successfully'
          : 'Invoice saved successfully',
        className: 'bg-theme text-white border-none'
      });

      // Changed redirect to schedule-invoice
      navigate(`/admin/company/${companyId}/schedule-invoice`);
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
      <div className="mb-6 flex items-center justify-between">
        <div className=" flex items-center">
          <Button
            variant="theme"
            // Changed redirect
            onClick={() =>
              navigate(`/admin/company/${companyId}/schedule-invoice`)
            }
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Create Schedule Invoice</h1>
        </div>
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
        {/* <div className="space-y-2">
          <Label htmlFor="invoiceDate">Reference Invoice Date</Label>
          <Input
            className="h-10 rounded-sm"
            id="invoiceDate"
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
          />
        </div>
         */}
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
                <div className="mb-2 flex items-center">
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
                  <div className="mb-2 flex items-center border-t border-gray-100 pt-2">
                    <span className="mr-4 w-28 font-bold">Total</span>
                    <span className=" ml-auto w-32 text-center font-bold">
                      £{total.toFixed(2)}
                    </span>
                  </div>
                  {Number(partialPayment) > 0 && (
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
                      <div className="mb-2 flex items-center border-t border-gray-300 pt-2 ">
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
            // Changed redirect
            onClick={() =>
              navigate(`/admin/company/${companyId}/schedule-invoice`)
            }
          >
            Cancel
          </Button>
          <Button variant="theme" onClick={() => handleSaveInvoice()}>
            {isRecurring ? 'Save Schedule' : 'Save Invoice'}
          </Button>
        </div>
      </div>

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
          if (open) {
            // No need to reset nextRunDate anymore
          }
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
                  onChange={(opt: any) => setScheduleFrequency(opt?.value)}
                  options={[
                    { label: 'Monthly', value: 'monthly' },
                    { label: 'Yearly', value: 'yearly' }
                  ]}
                />
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
                        onChange={(opt: any) => setScheduleMonth(opt?.value)}
                        menuPlacement="auto"
                      />
                    </div>
                  )}

                  <div
                    className={`${scheduleFrequency !== 'yearly' ? 'col-span-2' : 'col-span-1'}`}
                  >
                    <Select
                      placeholder="Enter a day (1–30)"
                      options={daysOptions}
                      value={daysOptions.find((d) => d.value === scheduleDay)}
                      onChange={(opt: any) => setScheduleDay(opt?.value)}
                      menuPlacement="auto"
                      maxMenuHeight={200}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDays" className="text-sm font-medium">
                  Due date duration (in days)
                </Label>
                <Input
                  id="dueDays"
                  type="number"
                  min="0"
                  placeholder="e.g., 30"
                  value={scheduleDueDays}
                  onChange={(e) => setScheduleDueDays(e.target.value)}
                />
                <p className="text-xs font-semibold text-gray-500">
                  We will automatically set future due dates based on the
                  duration you choose
                </p>
              </div>

              {scheduleFrequency && scheduleDay && (
                <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                  <p>
                    Invoice will generate on{' '}
                    <span className="font-semibold text-theme">
                      {scheduleDay}
                      {scheduleFrequency === 'yearly' && (
                        <>
                          {' '}
                          <span className="font-semibold text-theme">
                            {
                              monthOptions.find(
                                (m) => m.value === scheduleMonth
                              )?.label
                            }
                          </span>
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
                setIsRecurring(false);
                setScheduleFrequency(undefined);
                setScheduleDay(undefined);
                setScheduleMonth(new Date().getMonth() + 1);
                setScheduleDueDays('0');
                setIsScheduleDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="theme"
              disabled={!scheduleFrequency || !scheduleDay}
              onClick={() => {
                if (!scheduleFrequency || !scheduleDay) return;
                setIsRecurring(true);
                setIsScheduleDialogOpen(false);
              }}
            >
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
                  setNewCustomer({
                    ...newCustomer,
                    beneficiary: e.target.value
                  })
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
