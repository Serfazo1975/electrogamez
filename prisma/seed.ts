import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin por defecto
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@electrogamez.cl' },
    update: {},
    create: {
      name: 'Sergio Fazzini',
      email: 'admin@electrogamez.cl',
      password: adminPassword,
      role: 'admin',
    },
  })

  // Clientes de ejemplo
  const client1 = await prisma.client.upsert({
    where: { phone: '+56912345678' },
    update: {},
    create: {
      name: 'Juan Pérez',
      email: 'juan.perez@gmail.com',
      phone: '+56912345678',
      address: 'Av. Providencia 123, Santiago',
    },
  })

  const client2 = await prisma.client.upsert({
    where: { phone: '+56987654321' },
    update: {},
    create: {
      name: 'María González',
      email: 'maria.gonzalez@hotmail.com',
      phone: '+56987654321',
    },
  })

  // Repuestos de ejemplo
  const part1 = await prisma.part.upsert({
    where: { sku: 'FAN-LAP-001' },
    update: {},
    create: {
      name: 'Ventilador laptop genérico',
      sku: 'FAN-LAP-001',
      brand: 'Genérico',
      stock: 8,
      minStock: 3,
      costPrice: 4500,
      salePrice: 8000,
    },
  })

  const part2 = await prisma.part.upsert({
    where: { sku: 'PS5-HDMI-001' },
    update: {},
    create: {
      name: 'Chip HDMI PS5',
      sku: 'PS5-HDMI-001',
      brand: 'Sony',
      stock: 2,
      minStock: 3,
      costPrice: 18000,
      salePrice: 35000,
    },
  })

  await prisma.part.upsert({
    where: { sku: 'RAM-DDR4-8G' },
    update: {},
    create: {
      name: 'Memoria RAM DDR4 8GB',
      sku: 'RAM-DDR4-8G',
      brand: 'Kingston',
      stock: 5,
      minStock: 2,
      costPrice: 22000,
      salePrice: 38000,
    },
  })

  // Reparaciones de ejemplo
  const repair1 = await prisma.repair.create({
    data: {
      trackingCode: 'EG-2025-0001',
      clientId: client1.id,
      technicianId: admin.id,
      deviceType: 'laptop',
      deviceBrand: 'HP',
      deviceModel: 'Pavilion 15',
      issueDescription: 'Laptop se apaga sola después de 10 minutos de uso',
      diagnosis: 'Acumulación de polvo en ventilador y pasta térmica seca',
      status: 'in_progress',
      priority: 'high',
      estimatedCost: 25000,
      partsUsed: {
        create: [{ partId: part1.id, quantity: 1, unitCost: part1.costPrice ?? 0 }],
      },
      statusHistory: {
        create: [
          { status: 'received', note: 'Equipo recibido en taller' },
          { status: 'diagnosing', note: 'Diagnóstico iniciado' },
          { status: 'in_progress', note: 'Limpieza y cambio de pasta térmica en proceso' },
        ],
      },
    },
  })

  await prisma.repair.create({
    data: {
      trackingCode: 'EG-2025-0002',
      clientId: client2.id,
      technicianId: admin.id,
      deviceType: 'playstation',
      deviceBrand: 'Sony',
      deviceModel: 'PlayStation 5',
      issueDescription: 'No da imagen por HDMI, pantalla negra',
      status: 'waiting_parts',
      priority: 'medium',
      estimatedCost: 45000,
      partsUsed: {
        create: [{ partId: part2.id, quantity: 1, unitCost: part2.costPrice ?? 0 }],
      },
      statusHistory: {
        create: [
          { status: 'received', note: 'Equipo recibido' },
          { status: 'diagnosing', note: 'Chip HDMI dañado confirmado' },
          { status: 'waiting_parts', note: 'Esperando chip HDMI de proveedor (3-5 días)' },
        ],
      },
    },
  })

  console.log('✅ Seed completado')
  console.log(`   Admin: admin@electrogamez.cl / admin123`)
  console.log(`   Reparación 1: EG-2025-0001`)
  console.log(`   Reparación 2: EG-2025-0002`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
