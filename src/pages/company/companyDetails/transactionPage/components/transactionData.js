export const categories = {
  TransactionCategory: {
    inflow: {
      categories: [
        {
          name: "Revenue",
          categoryId: "1",
          children: [
            { name: "Sales", categoryId: "1" },
            { name: "Services", categoryId: "1" },
            { name: "Interest", categoryId: "1" }
          ]
        },
        {
          name: "Loan",
          categoryId: "2",
          children: [
            { name: "Bank Loan", categoryId: "2" },
            { name: "Personal Loan", categoryId: "2" }
          ]
        }
      ]
    },
    outflow: {
      categories: [
        {
          name: "Advertise",
          categoryId: "3",
          children: [
            { name: "Online Ads", categoryId: "3" },
            { name: "Print Ads", categoryId: "3" }
          ]
        },
        {
          name: "Utility Bill",
          categoryId: "4",
          children: [
            { name: "Water Bill", categoryId: "4" },
            { name: "Electricity Bill", categoryId: "4" },
            { name: "Internet Bill", categoryId: "4" }
          ]
        }
      ]
    }
  }
};


  
  export const transactionMethods = [
    'Cash',
    'Cheque',
    'Direct Bank Debit/Credit (DD)',
    'Debit/Credit Card',
    'Post Dated Cheque',
    'Draft'
  ];
  
  export const storageOptions = [
    'Bank Account 1',
    'Bank Account 2',
    'Cash Box',
    'Petty Cash'
  ];
  
  