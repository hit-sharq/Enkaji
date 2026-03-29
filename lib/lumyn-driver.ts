// Lumyn Driver Utilities
import { prisma } from './db';
import { getCurrentUser } from './auth';

export async function getDriverProfile(userId: string) {
  return prisma.lumynDriver.findUnique({
    where: { userId },
    include: {
      user: true,
      earnings: {
        take: 10,
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

export async function updateDriverLocation(driverId: string, lat: number, lng: number) {
  return prisma.lumynDriver.update({
    where: { id: driverId },
    data: {
      currentLocationLat: lat,
      currentLocationLng: lng,
      lastLocationUpdate: new Date()
    }
  });
}

export async function acceptDelivery(deliveryId: string, driverId: string) {
  return prisma.$transaction(async (tx) => {
    const delivery = await tx.lumynDelivery.update({
      where: { id: deliveryId },
      data: {
        driverId,
        status: 'accepted',
        acceptedAt: new Date()
      },
      include: {
        customer: true
      }
    });

    await tx.lumynDriver.update({
      where: { id: driverId },
      data: { isAvailable: false }
    });

    return delivery;
  });
}

export async function completeDelivery(deliveryId: string, pickupPhoto?: string, deliveryPhoto?: string) {
  return prisma.$transaction(async (tx) => {
    const delivery = await tx.lumynDelivery.update({
      where: { id: deliveryId },
      data: {
        pickupPhotoUrl: pickupPhoto,
        deliveryPhotoUrl: deliveryPhoto,
        status: 'delivered',
        deliveredAt: new Date()
      },
      include: {
        driver: true
      }
    });

    // Create earning record
    await tx.lumynDriverEarning.create({
      data: {
        driverId: delivery.driverId!,
        deliveryId,
        amount: delivery.totalAmount * 0.8, // Driver gets 80%
        netAmount: delivery.totalAmount * 0.8,
        status: 'completed'
      }
    });

    // Update driver stats
    await tx.lumynDriver.update({
      where: { id: delivery.driverId! },
      data: {
        totalDeliveries: { increment: 1 },
        totalEarnings: { increment: delivery.totalAmount * 0.8 },
        isAvailable: true
      }
    });

    return delivery;
  });
}

export async function getDriverEarnings(driverId: string) {
  return prisma.lumynDriverEarning.findMany({
    where: { driverId, status: 'completed' },
    orderBy: { payoutDate: 'desc' }
  });
}

