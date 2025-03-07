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
import { Cross, X } from 'lucide-react';

// Define types
interface Transaction {
  id: string;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State to store the selected file
  const [isUploading, setIsUploading] = useState(false);
  const [hide, setHide] = useState(false);
  const [companyThemeColor, setCompanyThemeColor] = useState<string>('');

  useEffect(() => {
      const fetchCompanyData = async () => {
  
        try {
          const response = await axiosInstance.get(`/users/${id}`);
          setCompanyThemeColor(response.data.data.themeColor); // Fetch and set the company theme color
          
        } catch (error) {
          console.error('Error fetching company data:', error);
        }
      };
      fetchCompanyData();
    }, [id]);
  
    useEffect(() => {
      const themeColor = companyThemeColor || '#a78bfa'; // Default color (adjust as needed)
      document.documentElement.style.setProperty('--theme', themeColor);
    }, [companyThemeColor]);
    
  
  const fetchData = async () => {
    try {
      const [categoriesRes, methodsRes, storagesRes] = await Promise.all([
        axiosInstance.get(`/categories/company/${id}?limit=all`),
        axiosInstance.get(`/methods/company/${id}?limit=all`),
        axiosInstance.get(`/storages/company/${id}?limit=all`)
      ]);
      setCategories(categoriesRes.data.data.result);
      setMethods(methodsRes.data.data.result);
      setStorages(storagesRes.data.data.result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    const storedTransactions = localStorage.getItem(`transactions-${id}`);
    if (storedTransactions) {
      const parsedTransactions = JSON.parse(storedTransactions);
      if (parsedTransactions.length > 0) {
        setTransactions(parsedTransactions);
      }
    }
  }, [id]);

  useEffect(() => {
    if (transactions.length === 0) {
      localStorage.removeItem(`transactions-${id}`);
    } else {
      localStorage.setItem(`transactions-${id}`, JSON.stringify(transactions));
    }
  }, [transactions, id]);


  useEffect(() => {
   

    fetchData();
  }, [id]);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Store the selected file in state
      localStorage.setItem(`uploadedFileName-${id}`, file.name);
    }
  };

  // Handle CSV file parsing when the button is clicked
  const handleUploadClick = () => {
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }
    setIsUploading(true);
    setIsLoading(true);

    // Clear existing transactions in the state and localStorage before uploading a new file
    setTransactions([]);
    localStorage.removeItem(`transactions-${id}`);

    Papa.parse<CSVRow>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedTransactions: Transaction[] = results.data
          .filter(
            (row) => row.Date?.trim() && (row['Paid In'] || row['Paid Out'])
          )
          .map((row, index) => {
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
            const amount = paidIn || paidOut;

            const transactionType =
              paidIn > 0 ? 'inflow' : paidOut > 0 ? 'outflow' : '';

            return {
              id: `${index}`, // Temporary ID for rendering
              transactionDate: formattedDate,
              transactionAmount: amount,
              transactionType: transactionType,
              description: row.Description?.trim() || '',
              invoiceNumber: '',
              invoiceDate: '',
              details: '',
              transactionCategory: '',
              transactionMethod: '',
              storage: ''
            };
          });

        setTransactions(parsedTransactions); // Update state with new transactions
        // Save new transactions to localStorage
        localStorage.setItem(
          `transactions-${id}`,
          JSON.stringify(parsedTransactions)
        );
        setHide(true);
        setIsLoading(false);
        setIsUploading(false);
        // Clear the file input value
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    const storedTransactions = localStorage.getItem(`transactions-${id}`);
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
    fetchData();
  }, [id]);

  // Handle transaction submission
  const handleSubmitTransactions = async (transaction) => {
    try {
      const payload = {
        ...transaction,
        companyId: id,
      };

      const response = await axiosInstance.post('/transactions', payload);

      if (response.status === 200) {
        toast({
          title: 'Transaction Successfully Submitted',
        });

        const updatedTransactions = transactions.filter(
          (t) => t.id !== transaction.id
        );
        setTransactions(updatedTransactions);

        localStorage.setItem(
          `transactions-${id}`,
          JSON.stringify(updatedTransactions)
        );
      } else {
        toast({
          title: 'Failed to submit transaction',
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to submit transaction',
      });
    }
  };

  
  

  const handleRemoveFile = () => {
    localStorage.removeItem(`uploadedFileName-${id}`);
    localStorage.removeItem(`transactions-${id}`);
    setSelectedFile(null);
    setTransactions([]);
  };

  return (
    <div className="bg-white shadow-lg">
      <div className="rounded-md p-4">
        <h1 className="mb-6 text-2xl font-bold">CSV Transaction Upload</h1>

        <div className="mb-2">
        {(!hide && transactions.length === 0) && (
          <div>
            <h2 className="mb-4 text-lg font-semibold">Upload Transaction CSV</h2>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="max-w-md"
              />
              <Button
                onClick={handleUploadClick}
                variant="theme"
              >
                {isLoading ? 'Processing...' : 'Upload CSV'}
              </Button>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Upload a CSV file with columns: Date, Description, Paid Out, Paid In
            </p>
          </div>
        )}
          
          {/* {!!localStorage.getItem(`uploadedFileName-${id}`) && (
            <div className="ga-2 flex flex-row items-center justify-start">
              <div>
                <p className="text-gray-800">
                  Uploaded file:{' '}
                  <span className="font-semibold">
                    {selectedFile?.name ||
                      localStorage.getItem(`uploadedFileName-${id}`)}
                  </span>
                </p>
              </div>

              <div onClick={handleRemoveFile} className='cursor-pointer'>
                <X className='w-4 h-4 text-red-800' strokeWidth={4}/>
              </div>
            </div>
          )} */}
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
          />
        )}
      </div>
    </div>
  );
}