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
 

export const countries = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'American Samoa',
  'Andorra',
  'Angola',
  'Anguilla',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bermuda',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Cape Verde',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Comoros',
  'Congo - Brazzaville',
  'Congo - Kinshasa',
  'Costa Rica',
  'Côte d’Ivoire',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Eswatini',
  'Ethiopia',
  'Fiji',
  'Finland',
  'France',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Grenada',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'South Korea',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Micronesia',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Rwanda',
  'Samoa',
  'San Marino',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Timor-Leste',
  'Togo',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe'
];


export const currencies = [
  { country: 'Afghanistan', currency: 'Afghan Afghani', code: 'AFN', symbol: '؋' },
  { country: 'Albania', currency: 'Albanian Lek', code: 'ALL', symbol: 'Lek' },
  { country: 'Algeria', currency: 'Algerian Dinar', code: 'DZD', symbol: 'دج' },
  { country: 'American Samoa', currency: 'US Dollar', code: 'USD', symbol: '$' },
  { country: 'Andorra', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Angola', currency: 'Angolan Kwanza', code: 'AOA', symbol: 'Kz' },
  { country: 'Anguilla', currency: 'East Caribbean Dollar', code: 'XCD', symbol: '$' },
  { country: 'Antigua and Barbuda', currency: 'East Caribbean Dollar', code: 'XCD', symbol: '$' },
  { country: 'Argentina', currency: 'Argentine Peso', code: 'ARS', symbol: '$' },
  { country: 'Armenia', currency: 'Armenian Dram', code: 'AMD', symbol: '֏' },
  { country: 'Australia', currency: 'Australian Dollar', code: 'AUD', symbol: '$' },
  { country: 'Austria', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Azerbaijan', currency: 'Azerbaijani Manat', code: 'AZN', symbol: '₼' },
  { country: 'Bahamas', currency: 'Bahamian Dollar', code: 'BSD', symbol: '$' },
  { country: 'Bahrain', currency: 'Bahraini Dinar', code: 'BHD', symbol: '.د.ب' },
  { country: 'Bangladesh', currency: 'Bangladeshi Taka', code: 'BDT', symbol: '৳' },
  { country: 'Barbados', currency: 'Barbadian Dollar', code: 'BBD', symbol: '$' },
  { country: 'Belarus', currency: 'Belarusian Ruble', code: 'BYN', symbol: 'Br' },
  { country: 'Belgium', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Belize', currency: 'Belize Dollar', code: 'BZD', symbol: '$' },
  { country: 'Benin', currency: 'West African CFA Franc', code: 'XOF', symbol: 'CFA' },
  { country: 'Bermuda', currency: 'Bermudian Dollar', code: 'BMD', symbol: '$' },
  { country: 'Bhutan', currency: 'Bhutanese Ngultrum', code: 'BTN', symbol: 'Nu.' },
  { country: 'Bolivia', currency: 'Bolivian Boliviano', code: 'BOB', symbol: 'Bs.' },
  { country: 'Bosnia and Herzegovina', currency: 'Bosnia-Herzegovina Convertible Mark', code: 'BAM', symbol: 'KM' },
  { country: 'Botswana', currency: 'Botswana Pula', code: 'BWP', symbol: 'P' },
  { country: 'Brazil', currency: 'Brazilian Real', code: 'BRL', symbol: 'R$' },
  { country: 'Brunei', currency: 'Brunei Dollar', code: 'BND', symbol: '$' },
  { country: 'Bulgaria', currency: 'Bulgarian Lev', code: 'BGN', symbol: 'лв' },
  { country: 'Burkina Faso', currency: 'West African CFA Franc', code: 'XOF', symbol: 'CFA' },
  { country: 'Burundi', currency: 'Burundian Franc', code: 'BIF', symbol: 'FBu' },
  { country: 'Cambodia', currency: 'Cambodian Riel', code: 'KHR', symbol: '៛' },
  { country: 'Cameroon', currency: 'Central African CFA Franc', code: 'XAF', symbol: 'FCFA' },
  { country: 'Canada', currency: 'Canadian Dollar', code: 'CAD', symbol: '$' },
  { country: 'Cape Verde', currency: 'Cape Verdean Escudo', code: 'CVE', symbol: '$' },
  { country: 'Central African Republic', currency: 'Central African CFA Franc', code: 'XAF', symbol: 'FCFA' },
  { country: 'Chad', currency: 'Central African CFA Franc', code: 'XAF', symbol: 'FCFA' },
  { country: 'Chile', currency: 'Chilean Peso', code: 'CLP', symbol: '$' },
  { country: 'China', currency: 'Chinese Yuan', code: 'CNY', symbol: '¥' },
  { country: 'Colombia', currency: 'Colombian Peso', code: 'COP', symbol: '$' },
  { country: 'Comoros', currency: 'Comorian Franc', code: 'KMF', symbol: 'CF' },
  { country: 'Congo - Brazzaville', currency: 'Central African CFA Franc', code: 'XAF', symbol: 'FCFA' },
  { country: 'Congo - Kinshasa', currency: 'Congolese Franc', code: 'CDF', symbol: 'FC' },
  { country: 'Costa Rica', currency: 'Costa Rican Colón', code: 'CRC', symbol: '₡' },
  { country: 'Côte d’Ivoire', currency: 'West African CFA Franc', code: 'XOF', symbol: 'CFA' },
  { country: 'Croatia', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Cuba', currency: 'Cuban Peso', code: 'CUP', symbol: '$' },
  { country: 'Cyprus', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Czech Republic', currency: 'Czech Koruna', code: 'CZK', symbol: 'Kč' },
  { country: 'Denmark', currency: 'Danish Krone', code: 'DKK', symbol: 'kr' },
  { country: 'Djibouti', currency: 'Djiboutian Franc', code: 'DJF', symbol: 'Fdj' },
  { country: 'Dominica', currency: 'East Caribbean Dollar', code: 'XCD', symbol: '$' },
  { country: 'Dominican Republic', currency: 'Dominican Peso', code: 'DOP', symbol: 'RD$' },
  { country: 'Ecuador', currency: 'US Dollar', code: 'USD', symbol: '$' },
  { country: 'Egypt', currency: 'Egyptian Pound', code: 'EGP', symbol: '£' },
  { country: 'El Salvador', currency: 'US Dollar', code: 'USD', symbol: '$' },
  { country: 'Equatorial Guinea', currency: 'Central African CFA Franc', code: 'XAF', symbol: 'FCFA' },
  { country: 'Eritrea', currency: 'Eritrean Nakfa', code: 'ERN', symbol: 'Nfk' },
  { country: 'Estonia', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Eswatini', currency: 'Swazi Lilangeni', code: 'SZL', symbol: 'E' },
  { country: 'Ethiopia', currency: 'Ethiopian Birr', code: 'ETB', symbol: 'Br' },
  { country: 'Fiji', currency: 'Fijian Dollar', code: 'FJD', symbol: '$' },
  { country: 'Finland', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'France', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Gabon', currency: 'Central African CFA Franc', code: 'XAF', symbol: 'FCFA' },
  { country: 'Gambia', currency: 'Gambian Dalasi', code: 'GMD', symbol: 'D' },
  { country: 'Georgia', currency: 'Georgian Lari', code: 'GEL', symbol: '₾' },
  { country: 'Germany', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Ghana', currency: 'Ghanaian Cedi', code: 'GHS', symbol: '₵' },
  { country: 'Greece', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Grenada', currency: 'East Caribbean Dollar', code: 'XCD', symbol: '$' },
  { country: 'Guatemala', currency: 'Guatemalan Quetzal', code: 'GTQ', symbol: 'Q' },
  { country: 'Guinea', currency: 'Guinean Franc', code: 'GNF', symbol: 'FG' },
  { country: 'Guinea-Bissau', currency: 'West African CFA Franc', code: 'XOF', symbol: 'CFA' },
  { country: 'Guyana', currency: 'Guyanese Dollar', code: 'GYD', symbol: '$' },
  { country: 'Haiti', currency: 'Haitian Gourde', code: 'HTG', symbol: 'G' },
  { country: 'Honduras', currency: 'Honduran Lempira', code: 'HNL', symbol: 'L' },
  { country: 'Hungary', currency: 'Hungarian Forint', code: 'HUF', symbol: 'Ft' },
  { country: 'Iceland', currency: 'Icelandic Króna', code: 'ISK', symbol: 'kr' },
  { country: 'India', currency: 'Indian Rupee', code: 'INR', symbol: '₹' },
  { country: 'Indonesia', currency: 'Indonesian Rupiah', code: 'IDR', symbol: 'Rp' },
  { country: 'Iran', currency: 'Iranian Rial', code: 'IRR', symbol: '﷼' },
  { country: 'Iraq', currency: 'Iraqi Dinar', code: 'IQD', symbol: 'ع.د' },
  { country: 'Ireland', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Israel', currency: 'Israeli New Shekel', code: 'ILS', symbol: '₪' },
  { country: 'Italy', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Jamaica', currency: 'Jamaican Dollar', code: 'JMD', symbol: '$' },
  { country: 'Japan', currency: 'Japanese Yen', code: 'JPY', symbol: '¥' },
  { country: 'Jordan', currency: 'Jordanian Dinar', code: 'JOD', symbol: 'د.ا' },
  { country: 'Kazakhstan', currency: 'Kazakhstani Tenge', code: 'KZT', symbol: '₸' },
  { country: 'Kenya', currency: 'Kenyan Shilling', code: 'KES', symbol: 'KSh' },
  { country: 'Kiribati', currency: 'Australian Dollar', code: 'AUD', symbol: '$' },
  { country: 'South Korea', currency: 'South Korean Won', code: 'KRW', symbol: '₩' },
  { country: 'Kuwait', currency: 'Kuwaiti Dinar', code: 'KWD', symbol: 'د.ك' },
  { country: 'Kyrgyzstan', currency: 'Kyrgyzstani Som', code: 'KGS', symbol: 'с' },
  { country: 'Laos', currency: 'Lao Kip', code: 'LAK', symbol: '₭' },
  { country: 'Latvia', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Lebanon', currency: 'Lebanese Pound', code: 'LBP', symbol: 'ل.ل' },
  { country: 'Lesotho', currency: 'Lesotho Loti', code: 'LSL', symbol: 'L' },
  { country: 'Liberia', currency: 'Liberian Dollar', code: 'LRD', symbol: '$' },
  { country: 'Libya', currency: 'Libyan Dinar', code: 'LYD', symbol: 'ل.د' },
  { country: 'Liechtenstein', currency: 'Swiss Franc', code: 'CHF', symbol: 'CHF' },
  { country: 'Lithuania', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Luxembourg', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Madagascar', currency: 'Malagasy Ariary', code: 'MGA', symbol: 'Ar' },
  { country: 'Malawi', currency: 'Malawian Kwacha', code: 'MWK', symbol: 'MK' },
  { country: 'Malaysia', currency: 'Malaysian Ringgit', code: 'MYR', symbol: 'RM' },
  { country: 'Maldives', currency: 'Maldivian Rufiyaa', code: 'MVR', symbol: 'Rf' },
  { country: 'Mali', currency: 'West African CFA Franc', code: 'XOF', symbol: 'CFA' },
  { country: 'Malta', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Marshall Islands', currency: 'US Dollar', code: 'USD', symbol: '$' },
  { country: 'Mauritania', currency: 'Mauritanian Ouguiya', code: 'MRU', symbol: 'UM' },
  { country: 'Mauritius', currency: 'Mauritian Rupee', code: 'MUR', symbol: '₨' },
  { country: 'Mexico', currency: 'Mexican Peso', code: 'MXN', symbol: '$' },
  { country: 'Micronesia', currency: 'US Dollar', code: 'USD', symbol: '$' },
  { country: 'Moldova', currency: 'Moldovan Leu', code: 'MDL', symbol: 'L' },
  { country: 'Monaco', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Mongolia', currency: 'Mongolian Tögrög', code: 'MNT', symbol: '₮' },
  { country: 'Montenegro', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Morocco', currency: 'Moroccan Dirham', code: 'MAD', symbol: 'د.م.' },
  { country: 'Mozambique', currency: 'Mozambican Metical', code: 'MZN', symbol: 'MT' },
  { country: 'Myanmar', currency: 'Myanmar Kyat', code: 'MMK', symbol: 'K' },
  { country: 'Namibia', currency: 'Namibian Dollar', code: 'NAD', symbol: '$' },
  { country: 'Nauru', currency: 'Australian Dollar', code: 'AUD', symbol: '$' },
  { country: 'Nepal', currency: 'Nepalese Rupee', code: 'NPR', symbol: 'रू' },
  { country: 'Netherlands', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'New Zealand', currency: 'New Zealand Dollar', code: 'NZD', symbol: '$' },
  { country: 'Nicaragua', currency: 'Nicaraguan Córdoba', code: 'NIO', symbol: 'C$' },
  { country: 'Niger', currency: 'West African CFA Franc', code: 'XOF', symbol: 'CFA' },
  { country: 'Nigeria', currency: 'Nigerian Naira', code: 'NGN', symbol: '₦' },
  { country: 'Norway', currency: 'Norwegian Krone', code: 'NOK', symbol: 'kr' },
  { country: 'Oman', currency: 'Omani Rial', code: 'OMR', symbol: 'ر.ع.' },
  { country: 'Pakistan', currency: 'Pakistani Rupee', code: 'PKR', symbol: '₨' },
  { country: 'Palau', currency: 'US Dollar', code: 'USD', symbol: '$' },
  { country: 'Panama', currency: 'Panamanian Balboa', code: 'PAB', symbol: 'B/.' },
  { country: 'Papua New Guinea', currency: 'Papua New Guinean Kina', code: 'PGK', symbol: 'K' },
  { country: 'Paraguay', currency: 'Paraguayan Guaraní', code: 'PYG', symbol: '₲' },
  { country: 'Peru', currency: 'Peruvian Sol', code: 'PEN', symbol: 'S/' },
  { country: 'Philippines', currency: 'Philippine Peso', code: 'PHP', symbol: '₱' },
  { country: 'Poland', currency: 'Polish Złoty', code: 'PLN', symbol: 'zł' },
  { country: 'Portugal', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Qatar', currency: 'Qatari Riyal', code: 'QAR', symbol: 'ر.ق' },
  { country: 'Romania', currency: 'Romanian Leu', code: 'RON', symbol: 'lei' },
  { country: 'Russia', currency: 'Russian Ruble', code: 'RUB', symbol: '₽' },
  { country: 'Rwanda', currency: 'Rwandan Franc', code: 'RWF', symbol: 'FRw' },
  { country: 'Samoa', currency: 'Samoan Tālā', code: 'WST', symbol: 'T' },
  { country: 'San Marino', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Saudi Arabia', currency: 'Saudi Riyal', code: 'SAR', symbol: '﷼' },
  { country: 'Senegal', currency: 'West African CFA Franc', code: 'XOF', symbol: 'CFA' },
  { country: 'Serbia', currency: 'Serbian Dinar', code: 'RSD', symbol: 'дин.' },
  { country: 'Seychelles', currency: 'Seychellois Rupee', code: 'SCR', symbol: '₨' },
  { country: 'Sierra Leone', currency: 'Sierra Leonean Leone', code: 'SLE', symbol: 'Le' },
  { country: 'Singapore', currency: 'Singapore Dollar', code: 'SGD', symbol: '$' },
  { country: 'Slovakia', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Slovenia', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Solomon Islands', currency: 'Solomon Islands Dollar', code: 'SBD', symbol: '$' },
  { country: 'Somalia', currency: 'Somali Shilling', code: 'SOS', symbol: 'Sh' },
  { country: 'South Africa', currency: 'South African Rand', code: 'ZAR', symbol: 'R' },
  { country: 'Spain', currency: 'Euro', code: 'EUR', symbol: '€' },
  { country: 'Sri Lanka', currency: 'Sri Lankan Rupee', code: 'LKR', symbol: 'Rs' },
  { country: 'Sudan', currency: 'Sudanese Pound', code: 'SDG', symbol: 'ج.س.' },
  { country: 'Suriname', currency: 'Surinamese Dollar', code: 'SRD', symbol: '$' },
  { country: 'Sweden', currency: 'Swedish Krona', code: 'SEK', symbol: 'kr' },
  { country: 'Switzerland', currency: 'Swiss Franc', code: 'CHF', symbol: 'CHF' },
  { country: 'Syria', currency: 'Syrian Pound', code: 'SYP', symbol: '£' },
  { country: 'Taiwan', currency: 'New Taiwan Dollar', code: 'TWD', symbol: 'NT$' },
  { country: 'Tajikistan', currency: 'Tajikistani Somoni', code: 'TJS', symbol: 'ЅМ' },
  { country: 'Tanzania', currency: 'Tanzanian Shilling', code: 'TZS', symbol: 'TSh' },
  { country: 'Thailand', currency: 'Thai Baht', code: 'THB', symbol: '฿' },
  { country: 'Timor-Leste', currency: 'US Dollar', code: 'USD', symbol: '$' },
  { country: 'Togo', currency: 'West African CFA Franc', code: 'XOF', symbol: 'CFA' },
  { country: 'Tonga', currency: 'Tongan Paʻanga', code: 'TOP', symbol: 'T$' },
  { country: 'Trinidad and Tobago', currency: 'Trinidad and Tobago Dollar', code: 'TTD', symbol: '$' },
  { country: 'Tunisia', currency: 'Tunisian Dinar', code: 'TND', symbol: 'د.ت' },
  { country: 'Turkey', currency: 'Turkish Lira', code: 'TRY', symbol: '₺' },
  { country: 'Turkmenistan', currency: 'Turkmenistani Manat', code: 'TMT', symbol: 'm' },
  { country: 'Uganda', currency: 'Ugandan Shilling', code: 'UGX', symbol: 'USh' },
  { country: 'Ukraine', currency: 'Ukrainian Hryvnia', code: 'UAH', symbol: '₴' },
  { country: 'United Arab Emirates', currency: 'UAE Dirham', code: 'AED', symbol: 'د.إ' },
  { country: 'United Kingdom', currency: 'British Pound Sterling', code: 'GBP', symbol: '£' },
  { country: 'United States', currency: 'US Dollar', code: 'USD', symbol: '$' },
  { country: 'Uruguay', currency: 'Uruguayan Peso', code: 'UYU', symbol: '$U' },
  { country: 'Uzbekistan', currency: 'Uzbekistani Som', code: 'UZS', symbol: 'сўм' },
  { country: 'Vanuatu', currency: 'Vanuatu Vatu', code: 'VUV', symbol: 'VT' },
  { country: 'Venezuela', currency: 'Venezuelan Bolívar', code: 'VES', symbol: 'Bs.S' },
  { country: 'Vietnam', currency: 'Vietnamese Đồng', code: 'VND', symbol: '₫' },
  { country: 'Yemen', currency: 'Yemeni Rial', code: 'YER', symbol: '﷼' },
  { country: 'Zambia', currency: 'Zambian Kwacha', code: 'ZMW', symbol: 'ZK' },
  { country: 'Zimbabwe', currency: 'Zimbabwean Dollar', code: 'ZWL', symbol: '$' },
];

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




