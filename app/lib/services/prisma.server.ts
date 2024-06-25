import { PrismaClient } from "@prisma/client";

let DatabaseInstance: PrismaClient;

declare global {
  var prisma: PrismaClient;
}

if (process.env.NODE_ENV === "production") {
  DatabaseInstance = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  DatabaseInstance = global.prisma;
  DatabaseInstance.$connect();
}

export default DatabaseInstance;