import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
  Image,
  PDFViewer
} from '@react-pdf/renderer';
import { Download, Eye } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#000'
  },
  // --- Header Section ---
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    width: '100%'
  },
  headerLeft: {
    width: '35%',
    flexDirection: 'column'
  },
  headerCenter: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  headerRight: {
    width: '35%',
    alignItems: 'flex-end',
    flexDirection: 'column'
  },
  // --- Customer / Bill To Section ---
  customerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  customerLeft: {
    width: '60%'
  },
  customerRight: {
    width: '40%',
    alignItems: 'flex-end'
  },
  // --- Main Content Box ---
  mainBox: {
    borderWidth: 1,
    borderColor: '#000',
    minHeight: 350,
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 5,
    paddingHorizontal: 5
  },
  tableHeaderLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold' // Use built-in bold font family
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 5
  },
  // Column widths
  colNum: { width: '5%' },
  colDesc: { width: '55%' },
  colQty: { width: '10%', textAlign: 'center' },
  colRate: { width: '15%', textAlign: 'right' },
  colAmount: { width: '15%', textAlign: 'right' },

  // --- Totals Section ---
  totalsContainer: {
    paddingRight: 5,
    paddingBottom: 10,
    alignItems: 'flex-end',
    marginTop: 20
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 3,
    width: '50%'
  },
  totalLabel: {
    width: '60%',
    textAlign: 'right',
    paddingRight: 10,
    fontSize: 10
  },
  totalValue: {
    width: '40%',
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    fontSize: 10
  },
  
  // --- Footer / Bank Details ---
  footerContainer: {
    marginTop: 5,
    flexDirection: 'column',
    justifyContent: 'flex-start'
  },
  bankTitle: {
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
    fontSize: 10,
    textDecoration: 'underline'
  },
  bankText: {
    fontSize: 10,
    marginBottom: 2
  },
  
  // --- Transactions (payments recorded against the invoice) ---
  txContainer: {
    marginTop: 5,
    marginBottom: 10
  },
  txTable: {
    width: '100%'
  },
  txHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 4
  },
  txRow: {
    flexDirection: 'row',
    paddingVertical: 3
  },
  txTotalRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingVertical: 4
  },
  txDate: { width: '35%' },
  txMethod: { width: '40%' },
  txAmount: { width: '25%', textAlign: 'right' },
  txSummaryLabel: { width: '75%', textAlign: 'right', paddingRight: 10 },

  // Utilities
  bold: {
    fontFamily: 'Helvetica-Bold'
  },
  title: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4
  },
  logo: {
    width: 80,
    height: 40,
    objectFit: 'contain',
    marginTop:-5
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const InvoicePDF = ({ invoice, payments, currencySymbol = '£', currencyCode = 'GBP' }: { invoice: any; payments?: any[]; currencySymbol?: string; currencyCode?: string }) => {
  const currencyLabel =
    currencySymbol === '$' || currencySymbol === '£'
      ? currencySymbol
      : currencyCode;

  // --- Logic ---
  const calculatePaidAmount = () => {
    if (!invoice.partialPayment) return 0;
    const total = invoice.total || 0;
    if (invoice.partialPaymentType === 'percentage') {
      return (total * invoice.partialPayment) / 100;
    }
    return invoice.partialPayment;
  };

  // Payment transactions recorded against this invoice
  const transactions: any[] = payments || invoice.payments || [];
  const paidFromTransactions = transactions.reduce(
    (sum: number, payment: any) => sum + (Number(payment.transactionAmount) || 0),
    0
  );

  const paidAmount = calculatePaidAmount() + paidFromTransactions;
  const balanceDue = Math.max(0, (invoice.total || 0) - paidAmount);
  const isOutflow = invoice.transactionType === 'outflow';

  // --- Helper to render Address Lines ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderAddress = (entity: any) => {
    if (!entity) return null;
    return (
      <>
        <Text>{entity.address || ''}</Text>
        {/* Combine City, State, PostCode into one line */}
        <Text>
          {[entity.city, entity.state, entity.postCode].filter(Boolean).join(', ')}
        </Text>
        <Text>{entity.country || ''}</Text>
      </>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* --- HEADER --- */}
        <View style={styles.headerContainer}>
          {/* Left: Company Details */}
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{invoice.companyId.name}</Text>
            {/* UPDATED: Company Address */}
            {renderAddress(invoice.companyId)}
            
            <Text>{invoice.companyId.email}</Text>
            <Text>{invoice.companyId.phone}</Text> 
          </View>

          {/* Center: Logo */}
          <View style={styles.headerCenter}>
             {invoice.companyId?.imageUrl ? (
               <Image 
                 src={invoice.companyId.imageUrl} 
                 style={styles.logo} 
               />
             ) : null}
          </View>

          {/* Right: Invoice Meta */}
          <View style={styles.headerRight}>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={styles.bold}>
                {isOutflow ? 'REMIT ID: ' : 'INVOICE NO: '}
              </Text>
              <Text style={styles.bold}>{invoice.invId}</Text>
            </View>
            
            <View style={{ flexDirection: 'row', marginBottom: 2 }}>
              <Text style={{ width: 70, textAlign: 'right' }}>
                {isOutflow ? 'Remit Date' : 'Invoice Date'}
              </Text>
              <Text style={{ width: 70, textAlign: 'right' }}>
                {invoice.invoiceDate ? moment(invoice.invoiceDate).format('DD/MM/YYYY') : ''}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', marginBottom: 2 }}>
              <Text style={{ width: 70, textAlign: 'right' }}>Due Date</Text>
              <Text style={{ width: 70, textAlign: 'right' }}>
                {invoice.dueDate ? moment(invoice.dueDate).format('DD/MM/YYYY') : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* --- CUSTOMER SECTION --- */}
       <View style={[styles.customerSection, { marginTop: -20 }]}>
          <View style={styles.customerLeft}>
            <Text style={[styles.bold, { marginBottom: 2 }]}>
              {typeof invoice.customer === 'object' ? invoice.customer.name.toUpperCase() : ''}
            </Text>
            {/* UPDATED: Customer Address */}
            {typeof invoice.customer === 'object' ? renderAddress(invoice.customer) : null}
          </View>

          
        </View>

        {/* --- MAIN TABLE BOX --- */}
        <View style={styles.mainBox}>
          <View>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.colNum, styles.tableHeaderLabel]}>#</Text>
              <Text style={[styles.colDesc, styles.tableHeaderLabel]}>Description</Text>
              <Text style={[styles.colQty, styles.tableHeaderLabel]}>Qty</Text>
              <Text style={[styles.colRate, styles.tableHeaderLabel]}>Rate</Text>
              <Text style={[styles.colAmount, styles.tableHeaderLabel]}>Amount</Text>
            </View>

            {invoice.topNote && (
              <View style={{ padding: 5 }}>
                <Text style={{ fontSize: 9, fontStyle: 'italic' }}>{invoice.topNote}</Text>
              </View>
            )}

            {/* Items */}
            {invoice.items?.map((item: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.colNum}>{index + 1}</Text>
                <Text style={styles.colDesc}>{item.details}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colRate}>{currencyLabel}{item.rate.toFixed(2)}</Text>
                <Text style={styles.colAmount}>{currencyLabel}{item.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{currencyLabel}{invoice.subtotal?.toFixed(2) || '0.00'}</Text>
            </View>

            {invoice.tax > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>VAT ({invoice.tax}%)</Text>
                <Text style={styles.totalValue}>+{currencyLabel}{((invoice.subtotal * invoice.tax) / 100).toFixed(2)}</Text>
              </View>
            )}

            {invoice.discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Discount {invoice.discountType === 'percentage' ? `(${invoice.discount}%)` : ''}
                </Text>
                <Text style={styles.totalValue}>
                  -{currencyLabel}{(invoice.discountType === 'percentage'
                    ? (invoice.subtotal * invoice.discount) / 100
                    : invoice.discount
                  ).toFixed(2)}
                </Text>
              </View>
            )}

            <View style={[styles.totalRow, { marginTop: 5 }]}>
              {paidAmount > 0 ? (
                <>
                   {/* If there is a paid amount, we can optionally show the Total before the balance */}
                </>
              ) : null}
            </View>

            {paidAmount > 0 ? (
              <>
                 <View style={styles.totalRow}>
                   <Text style={[styles.totalLabel, {fontStyle:'italic'}]}>Total</Text>
<Text style={styles.totalValue}>{currencyLabel}{invoice.total?.toFixed(2)}</Text>
                 </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { fontStyle: 'italic' }]}>Paid</Text>
                  <Text style={styles.totalValue}>{currencyLabel}{paidAmount.toFixed(2)}</Text>
                </View>
                <View style={[styles.totalRow, { marginTop: 5 }]}>
                  <Text style={styles.totalLabel}>New Balance</Text>
                  <Text style={styles.totalValue}>{currencyLabel}{balanceDue.toFixed(2)}</Text>
                </View>
              </>
            ) : (
               <View style={[styles.totalRow, { marginTop: 5 }]}>
                  <Text style={styles.totalLabel}>New Balance</Text>
                  <Text style={styles.totalValue}>{currencyLabel}{invoice.total?.toFixed(2)}</Text>
               </View>
            )}
          </View>
        </View>

        {/* --- TRANSACTIONS --- */}
        {transactions.length > 0 && (
          <View style={styles.txContainer}>
            <View style={styles.txTable}>
              <Text style={styles.bankTitle}>Transactions</Text>

              <View style={styles.txHeader}>
                <Text style={[styles.txDate, styles.tableHeaderLabel]}>Date</Text>
                <Text style={[styles.txMethod, styles.tableHeaderLabel]}>Method</Text>
                <Text style={[styles.txAmount, styles.tableHeaderLabel]}>Amount</Text>
              </View>

              {transactions.map((payment: any, index: number) => (
                <View key={payment._id || index} style={styles.txRow}>
                  <Text style={styles.txDate}>
                    {payment.transactionDate
                      ? moment(payment.transactionDate).format('DD/MM/YYYY')
                      : ''}
                  </Text>
                  <Text style={styles.txMethod}>
                    {payment.transactionMethod?.name || payment.transactionMethod || '-'}
                  </Text>
                  <Text style={styles.txAmount}>
                    {currencyLabel}{(Number(payment.transactionAmount) || 0).toFixed(2)}
                  </Text>
                </View>
              ))}

              <View style={styles.txTotalRow}>
                <Text style={[styles.txSummaryLabel, styles.bold]}>Total Paid</Text>
                <Text style={[styles.txAmount, styles.bold]}>
                  {currencyLabel}{paidFromTransactions.toFixed(2)}
                </Text>
              </View>

              <View style={styles.txRow}>
                <Text style={[styles.txSummaryLabel, styles.bold]}>New Balance</Text>
                <Text style={[styles.txAmount, styles.bold]}>
                  {currencyLabel}{balanceDue.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* --- ACCOUNT DETAILS (Footer) --- */}
        <View style={styles.footerContainer}>
          <Text style={styles.bankTitle}>Account Details</Text>
          
          <View>
             {/* If Outflow, we show Customer Details (Beneficiary). If Inflow, we show Our Company Details */}
             
             {isOutflow ? (
                /* OUTFLOW: Show Customer Bank Details */
                <>
                  <Text style={[styles.bold, { marginBottom: 2 }]}>
                    {invoice.customer?.name?.toUpperCase()}
                  </Text>
                  <Text style={styles.bankText}>Bank: {invoice.customer?.bankName}</Text>
                  <Text style={styles.bankText}>Sort Code: {invoice.customer?.sortCode}</Text>
                  <Text style={styles.bankText}>Account No: {invoice.customer?.accountNo}</Text>
                  {invoice.customer?.beneficiary && (
                     <Text style={styles.bankText}>Beneficiary: {invoice.customer.beneficiary}</Text>
                  )}
                </>
              ) : (
                /* INFLOW: Show Company Bank Details */
                <>
                  <Text style={[styles.bold, { marginBottom: 2 }]}>
                    {invoice.companyId?.name?.toUpperCase()}
                  </Text>
                  {/* Using invoice.bank object for company bank details */}
                  {invoice.bank ? (
                    <>
                       <Text style={styles.bankText}>Bank: {invoice.bank.name}</Text>
                       <Text style={styles.bankText}>Sort Code: {invoice.bank.sortCode}</Text>
                       <Text style={styles.bankText}>Account No: {invoice.bank.accountNo}</Text>
                       {invoice.bank.beneficiary && (
                         <Text style={styles.bankText}>Beneficiary: {invoice.bank.beneficiary}</Text>
                       )}
                    </>
                  ) : (
                    <Text style={{fontSize: 9, color: '#666'}}>No bank details available</Text>
                  )}
                </>
              )}
          </View>

          {invoice.notes && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Notes:</Text>
              <Text>{invoice.notes}</Text>
            </View>
          )}
        </View>

      </Page>
    </Document>
  );
};

export const InvoicePDFDownload = ({ invoice, payments, currencySymbol = '£', currencyCode = 'GBP' }: { invoice: any; payments?: any[]; currencySymbol?: string; currencyCode?: string }) => {
  return (
    <PDFDownloadLink
      document={<InvoicePDF invoice={invoice} payments={payments} currencySymbol={currencySymbol} currencyCode={currencyCode} />}
      fileName={`invoice_${invoice.invId}.pdf`}
    >
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {({ loading }: any) => (
          <div className="flex cursor-pointer flex-row items-center text-sm font-medium">
             {loading ? 'Loading...' : 'Download PDF'}
          </div>
        )}
    </PDFDownloadLink>
  );
};

export const InvoicePDFPreview = ({ invoice, currencySymbol = '£', currencyCode = 'GBP' }: { invoice: any; currencySymbol?: string; currencyCode?: string }) => {
  const [open, setOpen] = useState(false);
  const [payments, setPayments] = useState<any[]>(invoice?.payments || []);

  // The list endpoint does not carry the payment transactions, so they are
  // pulled in when the preview is opened.
  useEffect(() => {
    if (!open || !invoice?._id) return;

    let cancelled = false;
    const fetchPayments = async () => {
      try {
        const response = await axiosInstance.get(
          `/invoice/${invoice._id}/payments`
        );
        if (!cancelled) setPayments(response.data?.data || []);
      } catch (error) {
        console.error('Error fetching invoice payments:', error);
      }
    };

    fetchPayments();
    return () => {
      cancelled = true;
    };
  }, [open, invoice?._id]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={'sm'} className="gap-2 bg-theme text-white text-xs hover:bg-theme/90">
          Preview
        </Button>
      </DialogTrigger>
      
      <DialogContent className="flex h-[90vh] max-w-5xl flex-col p-0 sm:max-w-5xl">
        
        <div className="flex items-center justify-between border-b px-6 py-2">
          <DialogTitle className="text-lg font-semibold">
            Invoice Preview: {invoice.invId}
          </DialogTitle>
          
          <div className="mr-8">
            <PDFDownloadLink
              document={<InvoicePDF invoice={invoice} payments={payments} currencySymbol={currencySymbol} currencyCode={currencyCode} />}
              fileName={`invoice_${invoice.invId}.pdf`}
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {({ loading }: any) => (
                <Button size="sm"  className=" gap-2 bg-theme text-white  hover:bg-theme/90">
                  <Download className="h-4 w-4 mr-2" />
                  {loading ? 'Preparing...' : 'Download PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>

        <div className="flex-1 overflow-hidden ">
          <PDFViewer
            width="100%"
            height="100%"
            showToolbar={false}
            className="h-full w-full border-none"
          >
            <InvoicePDF invoice={invoice} payments={payments} currencySymbol={currencySymbol} currencyCode={currencyCode} />
          </PDFViewer>
        </div>
        
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePDF;