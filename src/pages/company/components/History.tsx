import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios'
import { Item } from '@radix-ui/react-dropdown-menu';

export default function History({ companyData }) {
    const { id } = useParams();
    const [storages, setStorages] = useState<any>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const fetchData = async () => {
        try {
            if (initialLoading) setInitialLoading(true);
            const response = await axiosInstance.get(`/storages?companyId=${id}`);
            setStorages(response.data.data.result);
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

    return (
        <div className=" py-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Table Section */}
                <div className="relative rounded-lg bg-white p-6 shadow-md lg:col-span-2">
                    {/* Header with flex container for alignment */}
                    <div className="mb-8 flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">{companyData?.companyName} <br /> <span className='text-lg font-semibold'>Recent Transactions</span></h1>

                        {/* <DropdownMenu>
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
                        </DropdownMenu> */}
                    </div>

                    <Table>

                        <TableHeader>
                            <TableRow>
                                <TableHead className=' font-bold'>Date</TableHead>
                                {/* {showInflow && (
                                    <TableHead className=' font-bold'>Inflow</TableHead>
                                )}
                                {showOutflow && (
                                    <TableHead className=' font-bold' >Outflow</TableHead>
                                )} */}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* {filteredTransactions.map((transaction, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        {new Date(transaction.date).toLocaleDateString()}
                                    </TableCell>
                                    {showInflow && (
                                        <TableCell >
                                            {transaction.inflow}
                                        </TableCell>
                                    )}
                                    {showOutflow && (
                                        <TableCell >
                                            {transaction.outflow}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))} */}
                        </TableBody>
                    </Table>
                </div>


                <div className="space-y-6">
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-2 text-xl font-semibold">Balance</h2>
                        <p className="text-2xl font-bold">£{totalOpeningBalance.toLocaleString('en-UK', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-4 text-xl font-semibold">Storage</h2>
                        {storages.map((Item, index) => (
                            <div key={index} className="flex items-center justify-between py-2">
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 font-bold text-white">
                                        H
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