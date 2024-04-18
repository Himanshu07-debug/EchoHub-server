import { PrismaClient } from "@prisma/client";

export const prismaClient = new PrismaClient({ log : ["query"]});

// I want to log query i.e i want to see, what queries are running