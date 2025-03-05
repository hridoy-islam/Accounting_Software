import type React from "react";
import { format, parse } from "date-fns";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from '@/lib/axios';
import { useParams } from "react-router-dom";
import { Navigation } from "@/components/shared/companyNav";
import { useForm } from 'react-hook-form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TransactionTableForm from "./components/TransactionTableForm";

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

  useEffect(() => {
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

    fetchData();
  }, [id]);

  // Handle CSV file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    Papa.parse<CSVRow>(file, {
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

            return {
           
              transactionDate: formattedDate,
              transactionAmount: amount,
              transactionType: row.Type?.trim() || (amount > 0 ? "inflow" : "outflow"),
              description: row.Description?.trim() || "",
              invoiceNumber: "",
              invoiceDate: "",
              details: "",
              transactionCategory: "",
              transactionMethod: "",
              storage: "",
            };
          });

        setTransactions((prev) => [...prev, ...parsedTransactions]);
        setIsLoading(false);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        setIsLoading(false);
      },
    });

    event.target.value = "";
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
        console.log("Transactions submitted successfully");
      } else {
        console.error("Failed to submit transactions");
      }
    } catch (error) {
      console.error("Error submitting transactions:", error);
    }
  };

  return (
    <div>
      <Navigation />
      <div className="mt-4 space-y-6 rounded-md bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-6">CSV Transaction Upload</h1>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Upload Transaction CSV</h2>
          <div className="flex items-center gap-4">
            <Input type="file" accept=".csv" onChange={handleFileUpload} className="max-w-md" />
            <Button disabled={isLoading}>
              {isLoading ? "Processing..." : "Upload CSV"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Upload a CSV file with columns: Date, Type, Description, Paid Out, Paid In, Balance
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

