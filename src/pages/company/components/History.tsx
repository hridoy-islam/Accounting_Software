import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios'
import { Item } from '@radix-ui/react-dropdown-menu';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import placeholder from "@/assets/imges/home/logos/placeholder.jpg"

export default function History({ companyData }) {
    const { id } = useParams();
    const [storages, setStorages] = useState<any>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [showInflow, setShowInflow] = useState(true);
    const [showOutflow, setShowOutflow] = useState(true);
    const [transactions, setTransactions] = useState<any>([])

    const fetchData = async () => {
        try {
            if (initialLoading) setInitialLoading(true);
            const response = await axiosInstance.get(`/storages?companyId=${id}`);
            setStorages(response.data.data.result);
             // Fetch transactions with dynamic companyID
             const transactionsResponse = await axiosInstance.get(`/transactions?companyId=${id}`);
             
            setTransactions(transactionsResponse.data.data.result)
            
        } catch (error) {
            console.error('Error fetching institutions:', error);
        } finally {
            setInitialLoading(false); // Disable initial loading after the first fetch
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    const totalOpeningBalance = storages.reduce((sum, Item) => sum + Number(Item.openingBalance), 0);


    function handleInflowChange(checked: boolean): void {
        setShowInflow(checked);
    }

    function handleOutflowChange(checked: boolean): void {
        setShowOutflow(checked);
    }

    return (
        <div className=" py-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Table Section */}
                <div className="relative rounded-lg bg-white p-6 shadow-md lg:col-span-2">
                    {/* Header with flex container for alignment */}
                    <div className="mb-8 flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">{companyData?.companyName} <br /> <span className='text-lg font-semibold'>Recent Transactions</span></h1>

                    </div>

                    <Table>

                        <TableHeader>
                            <TableRow>
                                <TableHead className=' font-bold'>Date</TableHead>
                                {showInflow && (
                                    <TableHead className=' font-bold'>Inflow</TableHead>
                                )}
                                {showOutflow && (
                                    <TableHead className=' font-bold' >Outflow</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((transaction, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        {new Date(transaction.transactionDate).toLocaleDateString()}
                                    </TableCell>
                                    {showInflow && (
                                        <TableCell >
                                            {transaction.transactionType ==='inflow'?(transaction.transactionAmount):'0'}
                                        </TableCell>
                                    )}
                                    {showOutflow && (
                                        <TableCell >
                                            {transaction.transactionType ==='outflow'?(transaction.transactionAmount):'0'}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>


                <div className="space-y-6">
                    <div className="flex justify-between rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-2 text-xl font-semibold">Balance</h2>
                        <p className="text-2xl font-bold">£{totalOpeningBalance.toLocaleString('en-UK', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-4 text-xl font-semibold">Storage</h2>
                        {storages.map((Item, index) => (
                            <div key={index} className="flex items-center justify-between py-2">
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 font-bold text-white">
                                        <img src={Item.logo || placeholder} alt="Storage Logo" className="h-10 w-10 rounded-full" />
                                    </div>
                                    <span className="font-medium">{Item.storageName}</span>
                                </div>
                                <span className="font-bold">£{Item.openingBalance}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}