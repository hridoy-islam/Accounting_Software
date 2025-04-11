"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { PlusCircle, Trash2, ArrowLeft } from "lucide-react"
import axiosInstance from "@/lib/axios"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Select from "react-select"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import moment from "moment"

export default function EditInvoice() {
  const { id: companyId, invoiceId } = useParams<{ id: string; invoiceId: string }>()
  const navigate = useNavigate()

  // State for invoice items
  const [items, setItems] = useState<any[]>([])

  // State for customers
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [transactionType, setTransactionType] = useState("")
  const [banks, setBanks] = useState<any[]>([])
  const [isLoadingBanks, setIsLoadingBanks] = useState(false)
  const [selectedBank, setSelectedBank] = useState("")

  // State for new customer dialog
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  // State for invoice details
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [invoiceDate, setInvoiceDate] = useState("")
  const [notes, setNotes] = useState("")
  const [showTermsAndConditions, setShowTermsAndConditions] = useState(false)
  const [termsAndConditions, setTermsAndConditions] = useState("")
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [invoiceStatus, setInvoiceStatus] = useState("")

  // Add state variables for invoice-level tax and discount
  const [invoiceTax, setInvoiceTax] = useState("")
  const [invoiceDiscount, setInvoiceDiscount] = useState("")
  const [invoiceDiscountType, setInvoiceDiscountType] = useState("percentage")
  const [subtotal, setSubtotal] = useState(0)

  // Fetch invoice data
  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!companyId || !invoiceId) return

      setIsLoading(true)
      try {
        const response = await axiosInstance.get(`/invoice/${invoiceId}`)
        const invoice = response.data.data

        setSelectedCustomer(invoice.customer || "")
        setSelectedBank(invoice.bank || "")
        setInvoiceNumber(invoice.invoiceNumber || "")
        setInvoiceDate(invoice.invoiceDate ? moment(invoice.invoiceDate).format("YYYY-MM-DD") : "")
        setTransactionType(invoice.transactionType || "")
        setNotes(invoice.notes || "")
        setInvoiceStatus(invoice.status || "")

        // Set tax, discount, and subtotal
        setInvoiceTax(invoice.tax ? invoice.tax.toString() : "0")
        setInvoiceDiscount(invoice.discount ? invoice.discount.toString() : "0")
        setInvoiceDiscountType(invoice.discountType || "percentage")
        setSubtotal(invoice.subtotal || 0)

        if (invoice.termsAndConditions) {
          setShowTermsAndConditions(true)
          setTermsAndConditions(invoice.termsAndConditions)
        }

        // Set items
        if (invoice.items && invoice.items.length > 0) {
          const formattedItems = invoice.items.map((item: any, index: number) => ({
            id: index + 1,
            details: item.details || "",
            quantity: item.quantity || 1,
            rate: item.rate || 0,
            amount: item.amount || 0,
          }))
          setItems(formattedItems)
        } else {
          setItems([{ id: 1, details: "", quantity: 1, rate: 0, amount: 0 }])
        }
      } catch (error) {
        console.error("Error fetching invoice:", error)
        toast({
          title: "Failed to load invoice",
          variant: "destructive",
        })
        navigate(`/admin/company/${companyId}/invoice`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvoiceData()
  }, [companyId, invoiceId, navigate])

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!companyId) return

      setIsLoadingCustomers(true)
      try {
        const response = await axiosInstance.get(`/customer?companyId=${companyId}&limit=all`)
        setCustomers(response.data.data.result || [])
      } catch (error) {
        console.error("Error fetching customers:", error)
        toast({
          title: "Failed to load customers",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCustomers(false)
      }
    }

    fetchCustomers()
  }, [companyId])

  // Fetch banks
  useEffect(() => {
    const fetchBanks = async () => {
      if (!companyId) return

      setIsLoadingBanks(true)
      try {
        const response = await axiosInstance.get(`/bank?companyId=${companyId}&limit=10000`)
        setBanks(response.data.data.result || [])
      } catch (error) {
        console.error("Error fetching Banks:", error)
        toast({
          title: "Failed to load Banks",
          variant: "destructive",
        })
      } finally {
        setIsLoadingBanks(false)
      }
    }

    fetchBanks()
  }, [companyId])

  // Calculate total when items change
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

    const taxAmount =
      !isNaN(parsedTax) && parsedTax > 0 ? newSubtotal * (parsedTax / 100) : 0;

    // Compute discount only if valid
    let discountAmount = 0;
    if (!isNaN(parsedDiscount) && parsedDiscount > 0) {
      discountAmount =
        invoiceDiscountType === 'percentage'
          ? newSubtotal * (parsedDiscount / 100)
          : parsedDiscount;
    }

    const newTotal = newSubtotal + taxAmount - discountAmount;
    setTotal(newTotal);
  }, [items, invoiceTax, invoiceDiscount, invoiceDiscountType]);

  // Handle adding a new row
  const handleAddRow = () => {
    const newId = items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1
    setItems([...items, { id: newId, details: "", quantity: 1, rate: 0, amount: 0 }])
  }

  // Handle removing a row
  const handleRemoveRow = (id: number) => {
    if (items.length === 1) {
      toast({
        title: "Cannot remove all items",
        description: "At least one item is required",
        variant: "destructive",
      })
      return
    }

    setItems(items.filter((item) => item.id !== id))
  }

  // Handle item change
  const handleItemChange = (id: number, field: string, value: any) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }

        // Handle rate validation and parsing
        if (field === "rate") {
          // Ensure rate is a valid number
          const parsedRate = Number.parseFloat(value)
          if (!isNaN(parsedRate)) {
            updatedItem.rate = parsedRate
          } else {
            updatedItem.rate = value // Keep as string for input
          }
        }

        // Recalculate amount if quantity or rate changes
        if (field === "quantity" || field === "rate") {
          const quantity = field === "quantity" ? Number.parseFloat(value) : item.quantity
          const rate =
            field === "rate"
              ? typeof value === "string"
                ? Number.parseFloat(value) || 0
                : value
              : typeof item.rate === "string"
                ? Number.parseFloat(item.rate) || 0
                : item.rate

          updatedItem.amount = quantity * rate
        }

        return updatedItem
      }
      return item
    })

    setItems(updatedItems)
  }

  // Handle creating a new customer
  const handleCreateCustomer = async () => {
    if (!newCustomer.name) {
      toast({
        title: "Customer name is required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await axiosInstance.post("/customer", {
        ...newCustomer,
        companyId,
      })

      const createdCustomer = response.data.data
      setCustomers([...customers, createdCustomer])
      setSelectedCustomer(createdCustomer._id)
      setIsNewCustomerDialogOpen(false)
      setNewCustomer({ name: "", email: "", phone: "", address: "" })

      toast({
        title: "Customer created successfully",
        className: "bg-theme text-white border-none",
      })
    } catch (error) {
      console.error("Error creating customer:", error)
      toast({
        title: "Failed to create customer",
        variant: "destructive",
      })
    }
  }

  const handleUpdateInvoice = async () => {
    if (!selectedCustomer) {
      toast({
        title: "Please select a customer",
        variant: "destructive",
      })
      return
    }

    if (!selectedBank) {
      toast({
        title: "Please select a bank",
        variant: "destructive",
      })
      return
    }

    if (!transactionType) {
      toast({
        title: "Please select a transaction type",
        variant: "destructive",
      })
      return
    }

    if (items.some((item) => !item.details)) {
      toast({
        title: "Please fill in all item details",
        variant: "destructive",
      })
      return
    }

    try {
      const invoiceData = {
        companyId,
        customer: selectedCustomer,
        bank: selectedBank,
        invoiceNumber,
        invoiceDate,
        termsAndConditions: showTermsAndConditions ? termsAndConditions : "",
        items: items.map(({ id, ...rest }) => ({
          ...rest,
          rate: typeof rest.rate === "string" ? Number.parseFloat(rest.rate) || 0 : rest.rate,
        })),
        notes,
        transactionType,
        status: invoiceStatus,
        amount: total,
        total: total,
        tax: Number.parseFloat(invoiceTax) || 0,
        discount: Number.parseFloat(invoiceDiscount) || 0,
        discountType: invoiceDiscountType,
        subtotal: subtotal,
      }

      await axiosInstance.patch(`/invoice/${invoiceId}`, invoiceData)

      toast({
        title: "Invoice updated successfully",
        className: "bg-theme text-white border-none",
      })

      navigate(`/admin/company/${companyId}/invoice`)
    } catch (error) {
      console.error("Error updating invoice:", error)
      toast({
        title: "Failed to update invoice",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
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
      </div>
    )
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
              <Button variant="theme" size="icon" onClick={() => setIsNewCustomerDialogOpen(true)}>
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Reference Invoice Number</Label>
          <Input
            className="h-10 rounded-sm"
            id="invoiceNumber"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
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
                          type="text"
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
                <Button variant="theme" onClick={handleAddRow}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Row
                </Button>
              </div>

              <div className="flex flex-wrap justify-between gap-4 p-4">
                <div className="flex flex-col text-left">
                  <div className="mb-2 flex items-center">
                    <span className="mr-4 w-28 font-medium">Subtotal</span>
                    <span className="ml-auto w-32 text-center font-medium">
                      £{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="mb-2 flex items-center">
                    <span className="mr-4 w-28 font-medium">
                      VAT ({Number(invoiceTax) || 0}%)
                    </span>
                    <span className="ml-auto w-32 text-center font-medium">
                      £{(subtotal * (Number(invoiceTax) / 100)).toFixed(2)}
                    </span>
                  </div>
                  <div className="mb-2 flex items-center">
                    <span className="mr-4 w-32 font-medium">
                      {invoiceDiscountType === 'percentage'
                        ? `Discount (${Number(invoiceDiscount) || 0}%)`
                        : 'Discount'}
                    </span>
                    <span className="ml-auto w-32 text-center font-medium">
                      £{(invoiceDiscountType === 'percentage'
                        ? subtotal * (Number(invoiceDiscount) / 100)
                        : Number(invoiceDiscount)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="mb-2 flex items-center">
                    <span className="mr-4 w-28 font-medium">Total</span>
                    <span className="ml-auto w-32 text-center font-bold">
                      £{total.toFixed(2)}
                    </span>
                  </div>
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
          <Button variant="theme" onClick={handleUpdateInvoice}>
            Update Invoice
          </Button>
        </div>
      </div>

      {/* New Customer Dialog */}
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
            <Button variant="theme" onClick={handleCreateCustomer}>
              Create Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
