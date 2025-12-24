import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
  Image
} from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import moment from 'moment';

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

const InvoicePDF = ({ invoice }: { invoice: any }) => {
  // --- Logic ---
  const calculatePaidAmount = () => {
    if (!invoice.partialPayment) return 0;
    const total = invoice.total || 0;
    if (invoice.partialPaymentType === 'percentage') {
      return (total * invoice.partialPayment) / 100;
    }
    return invoice.partialPayment;
  };

  const paidAmount = calculatePaidAmount();
  const balanceDue = Math.max(0, (invoice.total || 0) - paidAmount);
  const isOutflow = invoice.transactionType === 'outflow';

  // --- Helper to render Address Lines ---
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

          <View style={styles.customerRight}>
            <Text style={styles.bold}>Account Number</Text>
            {/* If Inflow, usually Client ID. If Outflow, potentially their Account Number ref */}
            <Text>{typeof invoice.customer === 'object' ? invoice.customer.accountNo : '1005'}</Text>
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
                <Text style={styles.colRate}>£{item.rate.toFixed(2)}</Text>
                <Text style={styles.colAmount}>£{item.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>£{invoice.subtotal?.toFixed(2) || '0.00'}</Text>
            </View>

            {invoice.tax > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>VAT ({invoice.tax}%)</Text>
                <Text style={styles.totalValue}>+£{((invoice.subtotal * invoice.tax) / 100).toFixed(2)}</Text>
              </View>
            )}

            {invoice.discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Discount {invoice.discountType === 'percentage' ? `(${invoice.discount}%)` : ''}
                </Text>
                <Text style={styles.totalValue}>
                  -£{(invoice.discountType === 'percentage'
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
                   <Text style={[styles.totalLabel, {fontStyle:'italic'}]}>(+) Total</Text>
                   <Text style={styles.totalValue}>£{invoice.total?.toFixed(2)}</Text>
                 </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { fontStyle: 'italic' }]}>(-) Payment(s) Received</Text>
                  <Text style={styles.totalValue}>£{paidAmount.toFixed(2)}</Text>
                </View>
                <View style={[styles.totalRow, { marginTop: 5 }]}>
                  <Text style={styles.totalLabel}>New Balance</Text>
                  <Text style={styles.totalValue}>£{balanceDue.toFixed(2)}</Text>
                </View>
              </>
            ) : (
               <View style={[styles.totalRow, { marginTop: 5 }]}>
                  <Text style={styles.totalLabel}>New Balance</Text>
                  <Text style={styles.totalValue}>£{invoice.total?.toFixed(2)}</Text>
               </View>
            )}
          </View>
        </View>

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

export const InvoicePDFDownload = ({ invoice }: { invoice: any }) => {
  return (
    <PDFDownloadLink
      document={<InvoicePDF invoice={invoice} />}
      fileName={`invoice_${invoice.invId}.pdf`}
    >
        {({ blob, url, loading, error }) => (
          <div className="flex cursor-pointer flex-row items-center text-sm font-medium">
             <Download className="mr-2 h-4 w-4" />
             {loading ? 'Loading...' : 'Download PDF'}
          </div>
        )}
    </PDFDownloadLink>
  );
};

export default InvoicePDF;