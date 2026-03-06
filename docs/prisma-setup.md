# Prisma
### Step 1: npm install prisma --save-dev
### Step 2: npm install prisma@5 @prisma/client@5

## For new prisma
### Step 3: Also install @prisma/client @prisma/adapter-mariadb dotenv

## Initialize Prisma:
### Step 4: npx prisma init

### Step 5: File: .env
### DATABASE_URL="mysql://root@localhost:3306/awt_db"

### Step 6: create prisma.ts file
import { PrismaClient } from "@prisma/client";
const globalForPrisma = global as unknown as {
prisma: PrismaClient;
};
export const prisma =
globalForPrisma.prisma || new PrismaClient();

### npx prisma db pull
### npx prisma generate