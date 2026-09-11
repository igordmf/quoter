-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "spread" DECIMAL NOT NULL
);

-- CreateTable
CREATE TABLE "currencies" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "currencyName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "users_exchanges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "destinationCurrencyCode" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "unitPriceBrl" DECIMAL NOT NULL,
    "totalPriceBrl" DECIMAL NOT NULL,
    "datetime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientQuoteId" TEXT NOT NULL,
    CONSTRAINT "users_exchanges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "users_exchanges_destinationCurrencyCode_fkey" FOREIGN KEY ("destinationCurrencyCode") REFERENCES "currencies" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_exchanges_clientQuoteId_key" ON "users_exchanges"("clientQuoteId");
