import { Icons } from '@/components/ui/icons';
export type UserRole = 'admin' | 'director' | 'user' | 'creator' | 'company';
export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  roles: UserRole[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;


export interface StudentFormData {
  title: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  maritalStatus: string
  addressLine1: string
  addressLine2: string
  townCity: string
  state: string
  postCode: string
  country: string
  agent: string
}

export interface Transaction {
  id: string
  tcid: string
  transactionDate: string
  invoiceNumber?: string
  invoiceDate?: string
  details?: string
  description?: string
  transactionAmount: number
  transactionDoc?: File | null
  transactionCategory: string
  transactionMethod: string
  storage: string
  transactionType: 'inflow' | 'outflow'
}

export interface Category {
  id: string
  name: string
  parentId?: string
  type: 'inflow' | 'outflow'
}

export interface Storage {
  id: string
  name: string
  openingBalance: number
  openingDate: string
  logo: string
  status: 'active' | 'inactive'
  auditStatus: 'pending' | 'completed'
}

export interface Company {
  id: number
  name: string
  email: string
  phone: string
  logo: string
}
 

export const mockData = {
  titles: ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'],
  gender: ['Male', 'Female', 'Other'],
  maritalStatuses: ['Single', 'Married', 'Divorced', 'Widowed'],
  agents: ['Omniscient', 'Global Education', 'Study International', 'Education First'],
  ethnicities: [
    "White",
    "White - Scottish",
    "Gypsy or Traveller",
    "Other White background",
    "Black or Black British - Caribbean",
    "Black or Black British - African",
    "Other Black background",
    "Asian or Asian British - Indian",
    "Asian or Asian British - Pakistani",
    "Asian or Asian British - Bangladeshi",
    "Chinese",
    "Other Asian background",
    "Mixed - White and Black Caribbean",
    "Mixed - White and Black African",
    "Mixed - White and Asian",
    "Other mixed background",
    "Arab",
    "Other ethnic background",
    "Not known",
    "Information refused"
  ],
  religion: [
    "No religion",
    "Buddhist",
    "Christian",
    "Hindu",
    "Jewish",
    "Muslim",
    "Sikh",
    "Spiritual",
    "Any other religion or belief",
    "Information refused",
    "Christian - Church of Scotland",
    "Christian - Roman Catholic",
    "Christian - Other denomination",
    "Not known"
  ],
  sexualOrientation: [
    "Bisexual",
    "Gay man",
    "Gay woman/lesbian",
    "Heterosexual",
    "Other",
    "Information refused"
  ],
  visaTypes: [
    "Business Visa",
    "Study Visa",
    "Work Visa"
  ],
  refusalTypes: ["Visa", "Permission", "Asylum", "Deportation"],
  DocumentType : ['Passport', 'Bank_Statement', 'Qualification', 'Work_Experience', 'CV'],
};

export interface Question {
  id: keyof StudentFormData;
  question: string;
  type: 'text' | 'select' | 'date' | 'email' | 'tel';
  options?: string[];
  required: boolean;
}

export const questions: Question[] = [

  { id: 'firstName', question: "What's your first name?", type: 'text', required: true },
  { id: 'lastName', question: "What's your last name?", type: 'text', required: true },
  { id: 'email', question: "What's your email address?", type: 'email', required: true },
  { id: 'phone', question: "What's your phone number?", type: 'tel', required: true },
  { id: 'dateOfBirth', question: "What's your date of birth?", type: 'date', required: true },

  { id: 'addressLine1', question: "What's your address (line 1)?", type: 'text', required: true },
  { id: 'addressLine2', question: "What's your address (line 2)?", type: 'text', required: false },
  { id: 'townCity', question: "What's your town/city?", type: 'text', required: true },
  { id: 'state', question: "What's your state/province?", type: 'text', required: false },
  { id: 'postCode', question: "What's your post code?", type: 'text', required: true },

  { id: 'agent', question: "Who's your agent?", type: 'select', options: mockData.agents, required: true },
];



export interface Category {
  _id: string
  name: string
  type: 'inflow' | 'outflow'
  parentId: string | null
  audit: string
  status: 'Active' | 'Inactive'
  children?: Category[]
}

export const demoCategories: Category[] = [
  {
    _id: "1",
    name: "Income",
    type: "inflow",

    audit: "Active",
    status: "Active"
  },
  {
    _id: "2",
    name: "Salary",
    type: "inflow",
    parentId: "1",
    audit: "Active",
    status: "Active"
  },
  {
    _id: "3",
    name: "Sales",
    type: "inflow",
    parentId: "1",
    audit: "Active",
    status: "Active"
  },
  {
    _id: "4",
    name: "Investments",
    type: "inflow",
    parentId: null,
    audit: "Active",
    status: "Active"
  },
  {
    _id: "5",
    name: "Expenses",
    type: "outflow",
    parentId: null,
    audit: "Active",
    status: "Active"
  },
  {
    _id: "6",
    name: "Rent",
    type: "outflow",
    parentId: "5",
    audit: "Active",
    status: "Active"
  },
  {
    _id: "7",
    name: "Utilities",
    type: "outflow",
    parentId: "5",
    audit: "Active",
    status: "Active"
  },
  {
    _id: "8",
    name: "Office Expenses",
    type: "outflow",
    parentId: "5",
    audit: "Active",
    status: "Active"
  }
]



export interface TransactionFilters {
  search: string
  type: 'inflow' | 'outflow'
  category: string
  method: string
  storage: string
  dateRange?: {
    from: Date
    to: Date
  }
}

export const methods = [
  "Cash",
  "Bank Transfer",
  "Credit Card",
  "Debit Card",
  "Check"
]

export const storages = [
  "Dutch Bangla Bank",
  "City Bank",
  "Cash Register",
  "Petty Cash"
]

export const demoTransactions: Transaction[] = [
  {
    tcid: "TC868533",
    date: "2024-01-14",
    transactionDate: "2024-01-14",
    invoiceNumber: "INV-001",
    invoiceDate: "2024-01-14",
    details: "Monthly Salary",
    description: "January 2024 Salary",
    type: "inflow",
    amount: 5000,
    category: "Salary",
    method: "Bank Transfer",
    storage: "Dutch Bangla Bank",
  },
  {
    tcid: "TC868534",
    date: "2024-01-15",
    transactionDate: "2024-01-15",
    invoiceNumber: "INV-002",
    invoiceDate: "2024-01-15",
    details: "Office Rent",
    description: "January 2024 Office Rent",
    type: "outflow",
    amount: 2000,
    category: "Rent",
    method: "Bank Transfer",
    storage: "City Bank",
  },
  {
    tcid: "TC868535",
    date: "2024-01-16",
    transactionDate: "2024-01-16",
    invoiceNumber: "INV-003",
    invoiceDate: "2024-01-16",
    details: "Client Payment",
    description: "Project completion payment",
    type: "inflow",
    amount: 10000,
    category: "Sales",
    method: "Bank Transfer",
    storage: "Dutch Bangla Bank",
  },
  {
    tcid: "TC868536",
    date: "2024-01-17",
    transactionDate: "2024-01-17",
    invoiceNumber: "INV-004",
    invoiceDate: "2024-01-17",
    details: "Office Supplies",
    description: "Stationery and printer ink",
    type: "outflow",
    amount: 500,
    category: "Office Expenses",
    method: "Credit Card",
    storage: "City Bank",
  },
  {
    tcid: "TC868537",
    date: "2024-01-18",
    transactionDate: "2024-01-18",
    invoiceNumber: "INV-005",
    invoiceDate: "2024-01-18",
    details: "Utility Bill",
    description: "Electricity and water bill",
    type: "outflow",
    amount: 300,
    category: "Utilities",
    method: "Bank Transfer",
    storage: "Dutch Bangla Bank",
  }
]

