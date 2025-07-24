import { useState, useEffect } from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink
} from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import moment from 'moment';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica'
  },
  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30
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
    width: '61%',
    padding: 5
  },
  tableColQty: {
    width: '12%',
    padding: 5
  },
  tableColRate: {
    width: '12%',
    padding: 5
  },
  tableColAmount: {
    width: '12%',
    padding: 5,
    textAlign: 'right'
  },
  totals: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  totalRow: {
    width: '98%',
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
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.invoiceInfo}>
          <View style={{ width: '50%' }}>
            <Text style={styles.title}>{invoice.companyId.name}</Text>
            <Text style={{ marginBottom: 4 }}>{invoice.companyId.email}</Text>
            <Text style={{ marginBottom: 4 }}>{invoice.companyId.address}</Text>

            {/* Payment Information Section */}
            <View style={{ marginTop: 20 }}>
              <Text style={[styles.title, { marginBottom: 5 }]}>
                Payment Information
              </Text>
              {invoice.transactionType === 'outflow' ? (
                <>
                  <Text style={{ marginBottom: 4 }}>
                    Bank: {invoice.customer?.bankName}
                  </Text>
                  <Text style={{ marginBottom: 4 }}>
                    Account No: {invoice.customer?.accountNo}
                  </Text>
                  <Text style={{ marginBottom: 4 }}>
                    Sort Code: {invoice.customer?.sortCode}
                  </Text>
                  {invoice.customer?.beneficiary && (
                    <Text style={{ marginBottom: 4 }}>
                      Beneficiary: {invoice.customer.beneficiary}
                    </Text>
                  )}
                </>
              ) : (
                invoice.bank && (
                  <>
                    <Text style={{ marginBottom: 4 }}>
                      Bank: {invoice.bank.name}
                    </Text>
                    <Text style={{ marginBottom: 4 }}>
                      Account No: {invoice.bank.accountNo}
                    </Text>
                    <Text style={{ marginBottom: 4 }}>
                      Sort Code: {invoice.bank.sortCode}
                    </Text>
                    {invoice.bank.beneficiary && (
                      <Text style={{ marginBottom: 4 }}>
                        Beneficiary: {invoice.bank.beneficiary}
                      </Text>
                    )}
                  </>
                )
              )}
            </View>
          </View>

          {/* Right: Invoice Info */}
          <View style={{ width: '35%' }}>
            <Text
              style={{
                fontWeight: 'semibold',
                fontSize: 20,
                paddingBottom: 5,
                textAlign: 'right'
              }}
            >
              {invoice.transactionType === 'outflow' ? 'REMIT' : 'INVOICE'}
            </Text>
            {[
              {
                label:
                  invoice.transactionType === 'outflow'
                    ? 'Remit ID:'
                    : 'Invoice:',
                value: invoice.invId || ''
              },
              {
                label: 'Invoice Date:',
                value: moment(invoice.invoiceDate).format('DD MMM YYYY')
              },
              { label: 'Terms:', value: 'Due On Receipt' },
              {
                label: 'Due Date:',
                value: moment(invoice.createdAt).format('DD MMM YYYY')
              }
            ].map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 2
                }}
              >
                <Text style={[styles.subtitle, { flex: 1, textAlign: 'left' }]}>
                  {item.label}
                </Text>
                <Text
                  style={[styles.subtitle, { flex: 1, textAlign: 'right' }]}
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>
                          {invoice.transactionType === 'outflow' ? 'Remit To' : 'Bill To'}

            </Text>
          <Text style={[styles.boldText, { marginBottom: 5 }]}>
            {typeof invoice.customer === 'object' ? invoice.customer.name : ''}
          </Text>
        </View>

        {/* Invoice Details Table */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>
                          {invoice.transactionType === 'outflow' ? 'Remit Details' : 'Invoice Details'}
            </Text>
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

        <View style={styles.totals}>
          <View style={{ width: '35%' }}>
            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
              <Text
                style={[
                  styles.tableColAmount,
                  { width: '50%', textAlign: 'left' }
                ]}
              >
                Subtotal:
              </Text>
              <Text style={[styles.tableColAmount, { width: '50%' }]}>
                £{invoice.subtotal?.toFixed(2) || '0.00'}
              </Text>
            </View>

            {invoice.tax > 0 && (
              <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                <Text
                  style={[
                    styles.tableColAmount,
                    { width: '50%', textAlign: 'left' }
                  ]}
                >
                  VAT ({invoice.tax}%):
                </Text>
                <Text style={[styles.tableColAmount, { width: '50%' }]}>
                  +£{((invoice.subtotal * invoice.tax) / 100).toFixed(2)}
                </Text>
              </View>
            )}

            {invoice.discount > 0 && (
              <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                <Text
                  style={[
                    styles.tableColAmount,
                    { width: '50%', textAlign: 'left' }
                  ]}
                >
                  Discount{' '}
                  {invoice.discountType === 'percentage'
                    ? `(${invoice.discount}%)`
                    : ''}
                  :
                </Text>
                <Text style={[styles.tableColAmount, { width: '50%' }]}>
                  -£
                  {(invoice.discountType === 'percentage'
                    ? (invoice.subtotal * invoice.discount) / 100
                    : invoice.discount
                  ).toFixed(2)}
                </Text>
              </View>
            )}

            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
              <Text
                style={[
                  styles.tableColAmount,
                  { width: '50%', textAlign: 'left', fontWeight: 'bold' }
                ]}
              >
                Total:
              </Text>
              <Text
                style={[
                  styles.tableColAmount,
                  { width: '50%', fontWeight: 'bold' }
                ]}
              >
                £{invoice.total?.toFixed(2) || '0.00'}
              </Text>
            </View>

            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
              <Text
                style={[
                  styles.tableColAmount,
                  { width: '50%', textAlign: 'left', fontWeight: 'bold' }
                ]}
              >
                Balance Due:
              </Text>
              <Text
                style={[
                  styles.tableColAmount,
                  { width: '50%', fontWeight: 'bold' }
                ]}
              >
                £{invoice.total?.toFixed(2) || '0.00'}
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
            <Text
              style={{ fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}
            >
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
