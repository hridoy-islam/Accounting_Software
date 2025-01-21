import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertToLowerCase = (value) => {
  return value.toLowerCase();
};


export function calculateTransactionTotals(transactions) {
  return transactions.reduce(
    (totals, transaction) => {
      const amount = transaction.transactionAmount;
      if (transaction.transactionType === 'inflow') {
        totals.totalInflow += amount;
      } else if (transaction.transactionType === 'outflow') {
        totals.totalOutflow += amount;
      }
      return totals;
    },
    { totalInflow: 0, totalOutflow: 0 }
  );
}