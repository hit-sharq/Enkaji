import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test admin if not exists
  const adminEmail = 'admin@enkaji.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await hash('admin123', 12);
    await prisma.user.create({
      data: {
        clerkId: 'admin_clerk',
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        password: hashedPassword, // Note: Use Clerk in prod
      }
    });
  }

  // Create 5 test drivers
  for (let i = 1; i <= 5; i++) {
    const driverEmail = `driver${i}@lumyn.com`;
    const existingDriver = await prisma.user.findUnique({
      where: { email: driverEmail }
    });

    if (!existingDriver) {
      const hashedPassword = await hash('driver123', 12);
      const user = await prisma.user.create({
        data: {
          clerkId: `driver${i}_clerk`,
          email: driverEmail,
          firstName: `Driver`,
          lastName: `Test${i}`,
          role: 'SELLER', // Drivers use seller role for now
        }
      });

      await prisma.lumynDriver.create({
        data: {
          userId: user.id,
          phoneNumber: `+254700${100 + i}000${i}`,
          fullName: `Driver Test ${i}`,
          vehicleType: i % 2 === 0 ? 'car' : 'motorcycle',
          status: i <= 3 ? 'active' : 'inactive',
          kycVerified: i <= 4,
          rating: 4.2 + (i * 0.1),
          totalDeliveries: 10 + i * 5,
          totalEarnings: 15000 + i * 2000,
          bankAccountName: `Driver Test ${i}`,
          bankAccountNumber: `123456789${i}`,
          bankCode: 'BARCLAYS',
          isAvailable: true,
        }
      });
    }
  }

  // Create 10 test deliveries
  for (let i = 1; i <= 10; i++) {
    await prisma.lumynDelivery.create({
      data: {
        deliveryNumber: `LUM${String(100 + i).padStart(3, '0')}`,
        customerId: 'buyer1@example.com', // Use existing buyer or create
        pickupAddress: 'Nairobi CBD, Moi Ave',
        pickupLat: -1.286389,
        pickupLng: 36.823278,
        dropoffAddress: 'Westlands, The Hub',
        dropoffLat: -1.267778,
        dropoffLng: 36.811667,
        distanceKm: 8.5,
        itemDescription: `Package ${i} - Documents`,
        itemWeightKg: 0.5 + i * 0.2,
        totalAmount: 250 + i * 10,
        status: ['requested', 'assigned', 'picked_up', 'delivered'][i % 4],
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      }
    });
  }

  console.log('✅ Lumyn seed data created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

