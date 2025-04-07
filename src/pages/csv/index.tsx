import type React from 'react';
import { format, parse } from 'date-fns';
import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axiosInstance from '@/lib/axios';
import { useParams } from 'react-router-dom';

import TransactionTableForm from './components/TransactionTableForm';
import { toast } from '@/components/ui/use-toast';

// Define types
interface Transaction {
  transactionDate: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  details?: string;
  description?: string;
  transactionAmount: number;
  transactionCategory: string;
  transactionMethod: string;
  storage: string;
  transactionType: 'inflow' | 'outflow';
}

interface CSVRow {
  Date: string;
  Type: string;
  Description: string;
  'Paid Out': string;
  'Paid In': string;
  Balance: string;
}

interface TCSV {
  companyId: string;
  transactions: {
    date: string;
    description: string;
    paidOut: number;
    paidIn: number;
  }[];
}

interface Category {
  id: string;
  name: string;
}

interface Method {
  id: string;
  name: string;
}

interface Storage {
  id: string;
  storageName: string;
}

export default function CsvUploadPage() {
  const { id } = useParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [methods, setMethods] = useState<Method[]>([]);
  const [storages, setStorages] = useState<Storage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hide, setHide] = useState(false);
  const [csvDocId, setCsvDocId] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get<{ data: { result: TCSV[] } }>(
        `/csv?companyId=${id}`
      );

      if (response.data?.data?.result?.[0]) {
        const csvDoc = response.data.data.result[0];
        setCsvDocId(csvDoc._id); // Store the CSV document ID

        const transformedTransactions = csvDoc.transactions
          .map((transaction) => {
            const transactionType =
              transaction.paidIn > 0 ? 'inflow' : 'outflow';
            const amount =
              transaction.paidIn > 0 ? transaction.paidIn : transaction.paidOut;

            return {
              ...transaction,
              _id: transaction._id, // Preserve the ID
              transactionDate: transaction.date,
              transactionAmount: amount,
              transactionType
            };
          })
          .filter(Boolean) as Transaction[];

        setTransactions(transformedTransactions);
        setHide(transformedTransactions.length > 0);
      } else {
        setTransactions([]);
        setHide(false);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
      setHide(false);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [categoriesRes, methodsRes, storagesRes] = await Promise.all([
        axiosInstance.get(`/categories/company/${id}?limit=all`),
        axiosInstance.get(`/methods/company/${id}?limit=all`),
        axiosInstance.get(`/storages/company/${id}?limit=all`)
      ]);
      setCategories(categoriesRes.data.data.result);
      setMethods(methodsRes.data.data.result);
      setStorages(storagesRes.data.data.result);

      // Fetch transactions separately
      await fetchTransactions();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle CSV file parsing and saving to database
  const handleUploadClick = () => {
    if (!selectedFile) {
      toast({
        title: 'Please select a file first.'
      });
      return;
    }

    setIsUploading(true);
    setIsLoading(true);

    setTransactions([]);

    Papa.parse<CSVRow>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        // Filter valid rows from CSV
        const validRows = results.data
          .filter(
            (row) => row.Date?.trim() && (row['Paid In'] || row['Paid Out'])
          )
          .map((row) => {
            let parsedDate: Date | null = null;

            try {
              parsedDate = parse(row.Date.trim(), 'dd-MMM-yy', new Date());
            } catch (error) {
              console.error('Error parsing date:', row.Date, error);
            }

            const formattedDate = parsedDate
              ? format(parsedDate, 'yyyy-MM-dd')
              : row.Date.trim();

            const paidIn = row['Paid In']
              ? parseFloat(row['Paid In'].replace(/[^0-9.-]+/g, ''))
              : 0;

            const paidOut = row['Paid Out']
              ? parseFloat(row['Paid Out'].replace(/[^0-9.-]+/g, ''))
              : 0;

            return {
              date: formattedDate,
              description: row.Description?.trim() || '',
              paidOut: paidOut,
              paidIn: paidIn
            };
          });

        // Create a single TCSV object with the company ID and all transactions
        const csvData = {
          companyId: id,
          transactions: validRows
        };

        try {
          // Send CSV data to database
          const response = await axiosInstance.post('/csv', csvData);

          if (response.status === 200) {
            toast({
              title: 'CSV data successfully uploaded to database'
            });

            // After successful upload, fetch the transactions again
            await fetchTransactions();
          } else {
            toast({
              title: 'Failed to upload CSV data',
              description: 'Please try again later'
            });
          }
        } catch (error) {
          console.error('Error saving CSV data:', error);
          toast({
            title: 'Failed to upload CSV data',
            description: 'Server error'
          });
        }

        setIsLoading(false);
        setIsUploading(false);

        // Clear the file input value
        const fileInput = document.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setIsLoading(false);
        setIsUploading(false);
        toast({
          title: 'Error parsing CSV file',
          description: 'Please check the file format'
        });
      }
    });
  };

  const handleSubmitTransactions = async (transaction) => {
    try {
      setIsLoading(true);
      const payload = {
        ...transaction,
        companyId: id
      };

      const response = await axiosInstance.post('/transactions', payload);

      if (response.status === 200) {
        toast({
          title: 'Transaction Successfully Submitted',
          className:"bg-theme text-white border-theme",
        });

        const updatedTransactions = transactions.filter(
          (t) => t._id !== transaction._id
        );
        setTransactions(updatedTransactions);
      } else {
        toast({
          title: 'Failed to submit transaction',
          className:"destructive border-none",
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to submit transaction',
        className:"destructive border-none",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg">
      <div className="rounded-md p-4">
        <h1 className="mb-6 text-2xl font-bold">CSV Transaction Upload</h1>

        <div className="mb-2">
          {!hide && transactions.length === 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">
                Upload Transaction CSV
              </h2>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="max-w-md"
                />
                <Button onClick={handleUploadClick} variant="theme">
                  {isLoading ? 'Processing...' : 'Upload CSV'}
                </Button>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                Upload a CSV file with columns: Date, Description, Paid Out,
                Paid In
              </p>

              <a href="/demo.csv" download="sample.csv">
                <Button variant="theme" className="mt-4 ">
                  Download Sample CSV
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
      <div className="p-1">
        {transactions.length > 0 && (
          <TransactionTableForm
            categories={categories}
            methods={methods}
            storages={storages}
            transactions={transactions}
            onSubmit={handleSubmitTransactions}
            setTransactions={setTransactions}
            csvDocId={csvDocId}
            setCsvDocId={setCsvDocId}
            setHide={setHide}
          />
        )}
      </div>
    </div>
  );
}
