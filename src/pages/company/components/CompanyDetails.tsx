import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  logo: string;
}

interface Storage {
  id: number;
  name: string;
  openingBalance: number;
  openingDate: string;
  logo:string;
  status: 'active' | 'inactive';
  auditStatus: 'pending' | 'completed';
}

const transactions = [
  { month: "August", inflow: "£0.00", outflow: "£0.00" },
  { month: "September", inflow: "£0.00", outflow: "£0.00" },
  { month: "October", inflow: "£0.00", outflow: "£0.00" },
  { month: "November", inflow: "£0.00", outflow: "£0.00" },
  { month: "December", inflow: "£0.00", outflow: "£0.00" },
  { month: "January", inflow: "£0.00", outflow: "£0.00" },
];

function CompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company>({
    id: 0,
    name: "ABC Company",
    email: "",
    phone: "",
    logo: "/placeholder.svg?height=40&width=40",
  });
  const [storages, setStorages] = useState<Storage[]>([
    {
      id: 1,
      name: "HSBC",
      openingBalance: 0,
      logo:"",
      openingDate: "N/A",
      status: "inactive",
      auditStatus: "pending",
    },
  ]);

  // Fetch company details
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      // Simulating an API call to get company details
      const companyResponse = await fetch(`/api/companies/${id}`);
      const companyData = await companyResponse.json();
      setCompany(companyData);

      // Simulating an API call to get storage details
      const storagesResponse = await fetch(`/api/companies/${id}/storages`);
      const storagesData = await storagesResponse.json();
      setStorages(storagesData);
    };

    if (id) {
      fetchCompanyDetails();
    }
  }, [id]);

  if (!company) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Dynamically update the title based on the company name */}
      <h1 className="mb-8 text-2xl font-semibold">{company.name}</h1>
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        {/* Transaction History Card */}
        <Card>
          <CardHeader className="p-6">
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Inflow</TableHead>
                  <TableHead className="text-right">Outflow</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.month}>
                    <TableCell>{transaction.month}</TableCell>
                    <TableCell className="text-right">{transaction.inflow}</TableCell>
                    <TableCell className="text-right">{transaction.outflow}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Balance Card */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle>Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£40,108.60</div>
            </CardContent>
          </Card>

          {/* Storage Accounts Card */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle>Storage</CardTitle>
            </CardHeader>
            <CardContent>
              {storages.map((storage) => (
                <div key={storage.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <img
                        src={storage.logo || "/placeholder.svg?height=40&width=40"}
                        alt={`${storage.name} logo`}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    </div>
                    <div className="font-medium">{storage.name}</div>
                  </div>
                  <div className="font-bold">£{storage.openingBalance.toFixed(2)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetails;
