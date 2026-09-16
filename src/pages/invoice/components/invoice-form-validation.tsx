import { z } from 'zod';

// Shared zod schemas + helpers for the invoice dialogs, so every dialog
// validates the same way and renders its errors under the field.

export type FieldErrors = Record<string, string>;

export const validateWithSchema = <T extends z.ZodTypeAny>(
  schema: T,
  values: unknown
): { success: boolean; data: z.infer<T> | null; errors: FieldErrors } => {
  const result = schema.safeParse(values);

  if (result.success) {
    return { success: true, data: result.data, errors: {} };
  }

  const errors: FieldErrors = {};
  result.error.errors.forEach((issue) => {
    const key = issue.path.join('.') || 'form';
    // Keep the first message per field - that is the one worth showing
    if (!errors[key]) errors[key] = issue.message;
  });

  return { success: false, data: null, errors };
};

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-500">{message}</p>;
}

const requiredText = (message: string) => z.string().trim().min(1, message);

const optionalEmail = z
  .string()
  .trim()
  .email('Enter a valid email address')
  .optional()
  .or(z.literal(''));

// Amounts live in the forms as strings, so they are validated as such
const amountText = (requiredMessage: string) =>
  requiredText(requiredMessage)
    .refine((value) => !isNaN(Number(value)), 'Amount must be a number')
    .refine((value) => Number(value) > 0, 'Amount must be greater than 0');

// --- Payment recorded against an invoice -----------------------------------
export const paymentFormSchema = z.object({
  transactionDate: requiredText('Transaction date is required'),
  transactionAmount: amountText('Amount is required'),
  transactionCategory: requiredText('Category is required'),
  transactionMethod: requiredText('Method is required'),
  storage: requiredText('Storage is required'),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().optional(),
  description: z.string().optional()
});

// --- New customer created from the invoice pages ---------------------------
export const customerFormSchema = z.object({
  name: requiredText('Customer name is required'),
  email: optionalEmail,
  phone: z.string().optional(),
  address: z.string().optional(),
  bankName: z.string().optional(),
  accountNo: z.string().optional(),
  sortCode: z.string().optional(),
  beneficiary: z.string().optional()
});

// --- Recurring schedule settings -------------------------------------------
export const scheduleFormSchema = z
  .object({
    frequency: z.enum(['monthly', 'yearly'], {
      errorMap: () => ({ message: 'Please select how often to schedule' })
    }),
    scheduledDay: z
      .number({ invalid_type_error: 'Please select a day' })
      .int()
      .min(1, 'Please select a day')
      .max(31, 'Please select a valid day'),
    scheduledMonth: z.number().int().min(1).max(12).optional(),
    dueDays: z
      .string()
      .optional()
      .refine(
        (value) => !value || (!isNaN(Number(value)) && Number(value) >= 0),
        'Due date duration must be 0 or more'
      )
  })
  .superRefine((values, ctx) => {
    if (values.frequency === 'yearly' && !values.scheduledMonth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['scheduledMonth'],
        message: 'Please select a month'
      });
    }
  });

// --- Quick invoice dialog on the invoice list page -------------------------
export const invoiceDialogSchema = z.object({
  customer: requiredText('Please select a customer'),
  transactionType: z.enum(['inflow', 'outflow'], {
    errorMap: () => ({ message: 'Please select a transaction type' })
  }),
  amount: z
    .union([z.number(), z.string()])
    .refine(
      (value) => value !== '' && value !== null && !isNaN(Number(value)),
      'Amount is required'
    )
    .refine((value) => Number(value) > 0, 'Amount must be greater than 0'),
  invoiceDate: z.string().optional(),
  invoiceNumber: z.string().optional(),
  details: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['due', 'paid', 'partial']).optional(),
  invDoc: z.string().optional()
});
