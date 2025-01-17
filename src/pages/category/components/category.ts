export interface Category {
    _id: string
    name: string
    type: 'inflow' | 'outflow'
    parentId: string | null
    audit: 'In Active' | 'Inactive'
    status: 'Active' | 'Inactive'
    children?: Category[]
  }
  
  export const demoCategories: Category[] = [
    // Inflow Categories with nesting
    {
      id: "1",
      name: "Council Fund",
      type: "inflow",
      parentId: null,
      audit: "In Active",
      status: "Active"
    },
    {
      id: "2",
      name: "DBS",
      type: "inflow",
      parentId: null,
      audit: "In Active",
      status: "Active"
    },
    {
      id: "3",
      name: "Investment",
      type: "inflow",
      parentId: null,
      audit: "In Active",
      status: "Active"
    },
    {
      id: "4",
      name: "Returns",
      type: "inflow",
      parentId: null,
      audit: "In Active",
      status: "Active"
    },
    {
      id: "5",
      name: "Tax Returns",
      type: "inflow",
      parentId: "4",
      audit: "In Active",
      status: "Active"
    },
    {
      id: "6",
      name: "Fee Refund",
      type: "inflow",
      parentId: "4",
      audit: "In Active",
      status: "Active"
    },
    {
      id: "7",
      name: "Loan Returns",
      type: "inflow",
      parentId: "4",
      audit: "In Active",
      status: "Active"
    },
    
    // Outflow Categories
    {
      id: "8",
      name: "Expense",
      type: "outflow",
      parentId: null,
      audit: "In Active",
      status: "Active"
    },
    {
      id: "9",
      name: "Loan",
      type: "outflow",
      parentId: "8",
      audit: "In Active",
      status: "Active"
    },
    {
      id: "10",
      name: "Medicare",
      type: "outflow",
      parentId: "9",
      audit: "In Active",
      status: "Active"
    },
    {
      id: "11",
      name: "Water Bill",
      type: "outflow",
      parentId: "9",
      audit: "In Active",
      status: "Active"
    }
]
  
  