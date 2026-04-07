import { z } from 'zod';

// --- Shared Types ---

const UuidSchema = z.string().uuid();
const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format");
const CurrencyAmount = z.number().min(0);

// --- Entities ---

export const CustomerSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  status: z.enum(['Active', 'Inactive']).optional().default('Active'),
}).strict();

export const ProductSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  price: CurrencyAmount,
  unit: z.string().max(20).optional().or(z.literal('')),
  category: z.string().max(50).optional().or(z.literal('')),
  quantity: z.number().min(0).default(0),
  active: z.boolean().optional().default(true),
}).strict();

export const ExpenseSchema = z.object({
  description: z.string().min(1).max(200).trim(),
  amount: CurrencyAmount,
  category: z.string().min(1).max(50),
  date: DateStringSchema.optional().or(z.literal('')),
}).strict();

export const RecurringExpenseSchema = z.object({
  description: z.string().min(1).max(200).trim(),
  amount: CurrencyAmount,
  category: z.string().min(1).max(50),
  frequency: z.enum(['Weekly', 'Monthly', 'Quarterly', 'Yearly']),
  startDate: DateStringSchema.optional().or(z.literal('')),
  next_date: DateStringSchema.optional().or(z.literal('')),
  active: z.boolean().default(true),
}).strict();

export const InvoiceItemSchema = z.object({
  description: z.string().min(1).max(255),
  quantity: z.number().min(0),
  price: CurrencyAmount,
}).strict();

export const InvoiceSchema = z.object({
  customer: z.string().min(1).max(100),
  dateCreated: DateStringSchema.optional().or(z.literal('')),
  dueDate: DateStringSchema.optional().or(z.literal('')),
  amount: CurrencyAmount.optional(), // Some routes use this for total
  status: z.string().optional().or(z.literal('')),
  items: z.array(InvoiceItemSchema).optional(),
}).strict();

export const PaymentSchema = z.object({
  customer: z.string().min(1).max(100),
  amount: CurrencyAmount,
  method: z.string().max(50),
  dateReceived: DateStringSchema.optional().or(z.literal('')), // Frontend might pass date
  date: DateStringSchema.optional().or(z.literal('')),
  note: z.string().max(500).optional().or(z.literal('')),
}).strict();

export const PaymentLinkSchema = z.object({
  customer: z.string().min(1).max(100),
  amount: CurrencyAmount,
  description: z.string().max(200).optional().or(z.literal('')),
  expiry: DateStringSchema.optional().or(z.literal('')),
}).strict();

export const QuoteSchema = z.object({
  customer: z.string().min(1).max(100),
  dateCreated: DateStringSchema.optional().or(z.literal('')),
  expiry_date: DateStringSchema.optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
  items: z.array(InvoiceItemSchema).optional(),
}).strict();

export const TimeEntrySchema = z.object({
  project: z.string().min(1).max(100),
  date: DateStringSchema.optional().or(z.literal('')),
  hours: z.number().min(0.25),
  billable: z.boolean().optional().default(true),
  invoice: z.string().optional().or(z.literal('')),
  invoice_id: z.string().optional().or(z.literal('')),
}).strict();

export const DeliveryChallanSchema = z.object({
  challanNo: z.string().min(1).max(50),
  customer: z.string().min(1).max(100),
  date: DateStringSchema.optional().or(z.literal('')),
  items: z.string().max(1000).optional().or(z.literal('')),
  status: z.string().optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
}).strict();

export const RetainerInvoiceSchema = z.object({
  customer: z.string().min(1).max(100),
  amount: CurrencyAmount,
  billingDay: z.number().min(1).max(31),
  startDate: DateStringSchema.optional().or(z.literal('')),
  status: z.string().optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
}).strict();

export const SubscriptionSchema = z.object({
  customer: z.string().min(1).max(100),
  planName: z.string().min(1).max(100),
  amount: CurrencyAmount,
  frequency: z.enum(['Weekly', 'Monthly', 'Quarterly', 'Yearly']),
  nextBillingDate: DateStringSchema.optional().or(z.literal('')),
  status: z.string().optional().or(z.literal('')),
}).strict();

export const SettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string(),
}).strict();

// --- Types for Use in the Application ---

export type CustomerInput = z.infer<typeof CustomerSchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
export type ExpenseInput = z.infer<typeof ExpenseSchema>;
export type RecurringExpenseInput = z.infer<typeof RecurringExpenseSchema>;
export type InvoiceInput = z.infer<typeof InvoiceSchema>;
export type PaymentInput = z.infer<typeof PaymentSchema>;
export type PaymentLinkInput = z.infer<typeof PaymentLinkSchema>;
export type QuoteInput = z.infer<typeof QuoteSchema>;
export type TimeEntryInput = z.infer<typeof TimeEntrySchema>;
export type DeliveryChallanInput = z.infer<typeof DeliveryChallanSchema>;
export type RetainerInvoiceInput = z.infer<typeof RetainerInvoiceSchema>;
export type SubscriptionInput = z.infer<typeof SubscriptionSchema>;
export type SettingInput = z.infer<typeof SettingSchema>;
