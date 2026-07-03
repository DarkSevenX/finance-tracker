export type BudgetBucket = "NEEDS" | "WANTS" | "SAVINGS";
export type CategoryKind = "INCOME" | "EXPENSE";
export type WalletKind = "CASH" | "BANK" | "CARD" | "OTHER";
export type IncomeAllocationMode = "SPLIT" | "ALL_NEEDS" | "ALL_WANTS" | "ALL_SAVINGS";
export type TransactionKind = "INCOME" | "EXPENSE" | "TRANSFER";
export type UserModel = typeof User.$inferSelect;
export type BudgetSettingsModel = typeof BudgetSettings.$inferSelect;
export type FinancialAccountModel = typeof FinancialAccount.$inferSelect;
export type CategoryModel = typeof Category.$inferSelect;
export type TransactionModel = typeof Transaction.$inferSelect;
export type BucketReallocationModel = typeof BucketReallocation.$inferSelect;
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";


export const User = sqliteTable("User", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: text("name"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch() * 1000)`),
});

export const BudgetSettings = sqliteTable("BudgetSettings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().unique().references(() => User.id, { onDelete: "cascade" }),
  needsPct: integer("needsPct").notNull().default(50),
  wantsPct: integer("wantsPct").notNull().default(30),
  savingsPct: integer("savingsPct").notNull().default(20),
});

export const FinancialAccount = sqliteTable("financial_accounts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => User.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  kind: text("kind").$type<WalletKind>().notNull().default("OTHER"), // 'CASH' | 'BANK' | 'CARD' | 'OTHER'
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch() * 1000)`),
});

export const Category = sqliteTable("Category", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => User.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  kind: text("kind").$type<CategoryKind>().notNull(), // 'INCOME' | 'EXPENSE'
  parentId: text("parentId"),
  bucket: text("bucket").$type<BudgetBucket>(), // 'NEEDS' | 'WANTS' | 'SAVINGS'
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [
  index("Category_userId_kind_idx").on(table.userId, table.kind),
]);

export const BucketReallocation = sqliteTable("BucketReallocation", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => User.id, { onDelete: "cascade" }),
  monthStart: integer("monthStart", { mode: "timestamp" }).notNull(),
  fromBucket: text("fromBucket").$type<BudgetBucket>().notNull(), // 'NEEDS' | 'WANTS' | 'SAVINGS'
  toBucket: text("toBucket").$type<BudgetBucket>().notNull(), // 'NEEDS' | 'WANTS' | 'SAVINGS'
  amount: integer("amount").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [
  index("BucketReallocation_userId_monthStart_idx").on(table.userId, table.monthStart),
]);

export const Transaction = sqliteTable("Transaction", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => User.id, { onDelete: "cascade" }),
  accountId: text("accountId").notNull().references(() => FinancialAccount.id, { onDelete: "cascade" }),
  toAccountId: text("toAccountId"),
  kind: text("kind").$type<TransactionKind>().notNull(), // 'INCOME' | 'EXPENSE' | 'TRANSFER'
  amount: integer("amount").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: text("categoryId").references(() => Category.id, { onDelete: "restrict" }),
  date: integer("date", { mode: "timestamp" }).notNull(),
  allocationMode: text("allocationMode").$type<IncomeAllocationMode>(),
  allocatedNeeds: integer("allocatedNeeds"),
  allocatedWants: integer("allocatedWants"),
  allocatedSavings: integer("allocatedSavings"),
  expenseBucket: text("expenseBucket").$type<BudgetBucket>(), // 'NEEDS' | 'WANTS' | 'SAVINGS'
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [
  index("Transaction_userId_date_idx").on(table.userId, table.date),
  index("Transaction_accountId_date_idx").on(table.accountId, table.date),
  index("Transaction_toAccountId_idx").on(table.toAccountId),
]);

// Relations

export const UserRelations = relations(User, ({ one, many }) => ({
  budgetSettings: one(BudgetSettings),
  financialAccounts: many(FinancialAccount),
  categories: many(Category),
  transactions: many(Transaction),
  bucketReallocations: many(BucketReallocation),
}));

export const budgetSettingsRelations = relations(BudgetSettings, ({ one }) => ({
  user: one(User, { fields: [BudgetSettings.userId], references: [User.id] }),
}));

export const financialAccountRelations = relations(FinancialAccount, ({ one, many }) => ({
  user: one(User, { fields: [FinancialAccount.userId], references: [User.id] }),
  transactions: many(Transaction),
  incomingTransfers: many(Transaction, { relationName: "TransferDestination" }),
}));

export const categoryRelations = relations(Category, ({ one, many }) => ({
  user: one(User, { fields: [Category.userId], references: [User.id] }),
  parent: one(Category, { fields: [Category.parentId], references: [Category.id], relationName: "CategoryTree" }),
  children: many(Category, { relationName: "CategoryTree" }),
  transactions: many(Transaction),
}));

export const bucketReallocationRelations = relations(BucketReallocation, ({ one }) => ({
  user: one(User, { fields: [BucketReallocation.userId], references: [User.id] }),
}));

export const transactionRelations = relations(Transaction, ({ one }) => ({
  user: one(User, { fields: [Transaction.userId], references: [User.id] }),
  account: one(FinancialAccount, { fields: [Transaction.accountId], references: [FinancialAccount.id] }),
  toAccount: one(FinancialAccount, { fields: [Transaction.toAccountId], references: [FinancialAccount.id], relationName: "TransferDestination" }),
  category: one(Category, { fields: [Transaction.categoryId], references: [Category.id] }),
}));

// Export Types similar to Prisma Enums


