-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "date" DATETIME NOT NULL,
    "allocationMode" TEXT,
    "allocatedNeeds" INTEGER,
    "allocatedWants" INTEGER,
    "allocatedSavings" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "financial_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("accountId", "allocatedNeeds", "allocatedSavings", "allocatedWants", "allocationMode", "amount", "categoryId", "createdAt", "date", "description", "id", "kind", "title", "userId") SELECT "accountId", "allocatedNeeds", "allocatedSavings", "allocatedWants", "allocationMode", "amount", "categoryId", "createdAt", "date", "description", "id", "kind", "title", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE INDEX "Transaction_userId_date_idx" ON "Transaction"("userId", "date");
CREATE INDEX "Transaction_accountId_date_idx" ON "Transaction"("accountId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
