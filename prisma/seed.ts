import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "sergio@electrogamez.cl" },
    update: {},
    create: {
      name: "Sergio Fazzini",
      email: "sergio@electrogamez.cl",
      password: adminPassword,
      role: "admin",
    },
  });

  const client1 = await prisma.client.upsert({
    where: { phone: "+56912345678" },
    update: {},
    create: {
      name: "Juan Pérez",
      email: "juan@email.com",
      phone: "+56912345678",
      address: "Santiago Centro",
    },
  });

  const client2 = await prisma.client.upsert({
    where: { phone: "+56987654321" },
    update: {},
    create: {
      name: "María González",
      email: "maria@email.com",
      phone: "+56987654321",
    },
  });

  await prisma.repair.createMany({
    skipDuplicates: true,
    data: [
      {
        ticketNumber: "REP-001",
        deviceType: "PC",
        deviceBrand: "Lenovo",
        deviceModel: "ThinkPad",
        issue: "No enciende",
        status: "in_progress",
        priority: "high",
        estimatedCost: 45000,
        clientId: client1.id,
        technicianId: admin.id,
      },
      {
        ticketNumber: "REP-002",
        deviceType: "PlayStation",
        deviceBrand: "Sony",
        deviceModel: "PS4 Pro",
        issue: "No lee discos",
        status: "waiting_parts",
        priority: "medium",
        estimatedCost: 30000,
        clientId: client2.id,
        technicianId: admin.id,
      },
    ],
  });

  console.log("Seed completado:", { admin: admin.email });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
