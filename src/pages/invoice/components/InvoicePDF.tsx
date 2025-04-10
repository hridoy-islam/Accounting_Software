import { useState, useEffect } from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
  
} from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import moment from 'moment';



const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 10,
    borderBottomColor: '#000',
    paddingBottom: 10
  },
  companyInfo: {
    marginBottom: 10
  },
  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 10
  },
  title: {
    fontSize: 18,
    fontWeight: 'semibold',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 10,
    fontWeight: 'semibold',
    marginBottom: 10
  },
  section: {
    marginBottom: 10
  },
  table: {
    display: 'flex',
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 20
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000'
  },
  tableColNum: {
    width: '5%',
    padding: 5
  },
  tableColDesc: {
    width: '45%',
    padding: 5
  },
  tableColQty: {
    width: '15%',
    padding: 5
  },
  tableColRate: {
    width: '15%',
    padding: 5
  },
  tableColAmount: {
    width: '20%',
    padding: 5,
    textAlign: 'right'
  },
  totals: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  totalRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 5
  },
  notes: {
    marginTop: 20,
    paddingTop: 10,
    borderTopColor: '#000'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666'
  }
});

const InvoicePDF = ({ invoice }: { invoice }) => {
  const [date, setDate] = useState('');

  useEffect(() => {
    if (invoice.invoiceDate) {
      const formattedDate = moment(invoice.invoiceDate).format('DD/MM/YYYY');
      setDate(formattedDate);
    }
  }, [invoice.invoiceDate]);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.title}>{invoice.companyId.name}</Text>
            <Text>{invoice.companyId.email}</Text>
            <Text>{invoice.companyId.address}</Text>
          </View>
        </View>

        {/* Bill To / Invoice Info */}
        <View style={styles.invoiceInfo}>
          <View>
            <Text style={styles.subtitle}>Bill To</Text>
            <Text style={[styles.boldText, { marginBottom: 5 }]}>
              {typeof invoice.customer === 'object'
                ? invoice.customer.name
                : ''}
            </Text>
           
          </View>
          <View>
            <Text style={{ fontWeight: 'semibold', fontSize: 20, paddingBottom: 5 }}>
              INVOICE
            </Text>
            <Text style={styles.subtitle}>Invoice # {invoice.invId || ''}</Text>
            <Text style={styles.subtitle}>Invoice Date: {date}</Text>
            <Text style={styles.subtitle}>Terms: Due On Receipt</Text>
            <Text style={styles.subtitle}>
              Due Date: {moment(invoice.createdAt).format('DD/MM/YYYY')}
            </Text>
          </View>
        </View>

        {/* Invoice Details Table */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Invoice Details</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, { backgroundColor: '#f2f2f2' }]}>
              <Text style={styles.tableColNum}>#</Text>
              <Text style={styles.tableColDesc}>Item & Description</Text>
              <Text style={styles.tableColQty}>Qty</Text>
              <Text style={styles.tableColRate}>Rate</Text>
              <Text style={styles.tableColAmount}>Amount</Text>
            </View>

            {invoice.items?.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableColNum}>{index + 1}</Text>
                <Text style={styles.tableColDesc}>{item.details}</Text>
                <Text style={styles.tableColQty}>{item.quantity}</Text>
                <Text style={styles.tableColRate}>{item.rate.toFixed(2)}</Text>
                <Text style={styles.tableColAmount}>
                  {item.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={{ width: '100%', marginTop: -20 }}>
            <View style={styles.totalRow}>
              <Text style={[styles.boldText, { fontSize: 12 }]}>
                SubTotal: {invoice.amount?.toFixed(2) || ''}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.boldText, { fontSize: 12 }]}>
                Total: £{invoice.amount?.toFixed(2) || ''}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.boldText, { fontSize: 12 }]}>
              Balance Due: £{invoice.amount?.toFixed(2) || ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes and Terms */}
        <View style={styles.notes}>
          {invoice.notes && (
            <>
              <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Notes</Text>
              <Text style={{ marginBottom: 5 }}>{invoice.notes || ''}</Text>
            </>
          )}
          {invoice.termsAndConditions && (
            <Text style={{ fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}>
              {invoice.termsAndConditions}
            </Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
};

export const InvoicePDFDownload = ({ invoice }: { invoice }) => {
  return (
    <PDFDownloadLink
      document={<InvoicePDF invoice={invoice} />}
      fileName={`invoice_${invoice.invId}.pdf`}
    >
     
        <div className="flex cursor-pointer flex-row items-center text-sm font-medium">
          <Download className="mr-2 h-4 w-4" />
        Download PDF
        </div>
    
    </PDFDownloadLink>
  );
};