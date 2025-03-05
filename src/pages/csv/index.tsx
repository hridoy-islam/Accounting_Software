import type React from "react";
import { format, parse } from "date-fns";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from '@/lib/axios';
import { useParams } from "react-router-dom";


import TransactionTableForm from "./components/TransactionTableForm";
import { toast } from "@/components/ui/use-toast";

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
  "Paid Out": string;
  "Paid In": string;
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

  const fetchData = async () => {
    try {
      const [categoriesRes, methodsRes, storagesRes] = await Promise.all([
        axiosInstance.get(`/categories/company/${id}?limit=all`),
        axiosInstance.get(`/methods/company/${id}?limit=all`),
        axiosInstance.get(`/storages/company/${id}?limit=all`),
      ]);
      setCategories(categoriesRes.data.data.result);
      setMethods(methodsRes.data.data.result);
      setStorages(storagesRes.data.data.result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactions");
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }

    fetchData();
  }, [id]);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Store the selected file in state
    }
  };

  // Handle CSV file parsing when the button is clicked

  const handleUploadClick = () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
  
    setIsLoading(true);
  
    // Clear existing transactions in the state and localStorage before uploading a new file
    setTransactions([]);
    localStorage.removeItem("transactions");
  
    Papa.parse<CSVRow>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedTransactions: Transaction[] = results.data
          .filter((row) => row.Date?.trim() && (row["Paid In"] || row["Paid Out"]))
          .map((row, index) => {
            let parsedDate: Date | null = null;
  
            try {
              parsedDate = parse(row.Date.trim(), "dd-MMM-yy", new Date());
            } catch (error) {
              console.error("Error parsing date:", row.Date, error);
            }
  
            const formattedDate = parsedDate ? format(parsedDate, "yyyy-MM-dd") : row.Date.trim();
            const paidIn = row["Paid In"] ? parseFloat(row["Paid In"].replace(/[^0-9.-]+/g, "")) : 0;
            const paidOut = row["Paid Out"] ? parseFloat(row["Paid Out"].replace(/[^0-9.-]+/g, "")) : 0;
            const amount = paidIn || paidOut;
  
            const transactionType = paidIn > 0 ? "inflow" : paidOut > 0 ? "outflow" : "";
  
            return {
              id: `temp-${index}`, // Temporary ID for rendering
              transactionDate: formattedDate,
              transactionAmount: amount,
              transactionType: transactionType,
              description: row.Description?.trim() || "",
              invoiceNumber: "",
              invoiceDate: "",
              details: "",
              transactionCategory: "",
              transactionMethod: "",
              storage: "",
            };
          });
  
        // Save new transactions to localStorage
        localStorage.setItem("transactions", JSON.stringify(parsedTransactions));
  
        setTransactions(parsedTransactions); // Update state with new transactions
        setIsLoading(false);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        setIsLoading(false);
      },
    });
  };
  
  
  // Handle transaction submission
  const handleSubmitTransactions = async (transactions) => {
    try {
      console.log("transactions:", transactions);  // Add this line to inspect the value of transactions

      const payload = {
        ...transactions,
        companyId: id,
      };

      const response = await axiosInstance.post("/transactions", payload );

      if (response.status === 200) {
        toast({
          title: 'Transaction Successfully Submitted',
          
        });
      } else {
        toast({
          title: 'Failed to submit transactions',
          
        });
      
      }
    } catch (error) {
      toast({
        title: 'Failed to submit transactions',
        
      });
    }
  };

  return (
    <div>

      <div className="  rounded-md bg-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold mb-6">CSV Transaction Upload</h1>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Upload Transaction CSV</h2>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange} 
              className="max-w-md"
            />
            <Button
              onClick={handleUploadClick} 
              disabled={isLoading || !selectedFile} 
              variant="theme"
            >
              {isLoading ? "Processing..." : "Upload CSV"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Upload a CSV file with columns: Date, Description, Paid Out, Paid In
          </p>
        </div>

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