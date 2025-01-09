import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import CompanyNav from '../components/CompanyNav';


type Checked = DropdownMenuCheckboxItemProps['checked'];

interface Transaction {
  inflow: string;
  outflow: string;
  date: Date;
}

const CompanyDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [startDate, setStartDate] = useState<Date>(() => new Date());
  const [endDate, setEndDate] = useState<Date>(() => new Date());
  const [showInflow, setShowInflow] = useState<Checked>(true);
  const [showOutflow, setShowOutflow] = useState<Checked>(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      const response = await fetch(`/api/companies/${id}/transactions`);
      const data = await response.json();
      setTransactions(data);
      setFilteredTransactions(data);
    };

    fetchTransactions();
  }, [id]);

  const handleInflowChange = (checked: Checked) => {
    setShowInflow(checked);
  };

  const handleOutflowChange = (checked: Checked) => {
    setShowOutflow(checked);
  };

  return (
    <div className="container mx-auto p-6">
      <CompanyNav />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Table Section */}
        <div className="relative rounded-lg bg-white p-6 shadow-md lg:col-span-2">
          {/* Header with flex container for alignment */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Company Dashboard</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Filter</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuCheckboxItem
                  checked={showInflow}
                  onCheckedChange={handleInflowChange}
                >
                  Inflow
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={showOutflow}
                  onCheckedChange={handleOutflowChange}
                >
                  Outflow
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {showInflow && (
                  <TableHead className="text-right">Inflow</TableHead>
                )}
                {showOutflow && (
                  <TableHead className="text-right">Outflow</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  {showInflow && (
                    <TableCell className="text-right">
                      {transaction.inflow}
                    </TableCell>
                  )}
                  {showOutflow && (
                    <TableCell className="text-right">
                      {transaction.outflow}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-xl font-semibold">Balance</h2>
            <p className="text-2xl font-bold">£40,108.60</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Storage</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 font-bold text-white">
                  H
                </div>
                <span className="font-medium">HSBC</span>
              </div>
              <span className="font-bold">£40,108.60</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;