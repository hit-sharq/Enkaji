import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const driver = await prisma.lumynDriver.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!driver) {
      return NextResponse.json({ error: 'No driver profile' }, { status: 403 });
    }

    const jobs = await prisma.lumynDelivery.findMany({
      where: {
        status: 'requested',
        driverId: null,
      },
      select: {
        id: true,
        deliveryNumber: true,
        pickupAddress: true,
        dropoffAddress: true,
        distanceKm: true,
        totalAmount: true,
        itemDescription: true,
        itemWeightKg: true,
        customer: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { deliveryId, action } = await request.json();

  const driver = await prisma.lumynDriver.findUnique({
    where: { userId: user.id },
    select: { id: true, isAvailable: true }
  });

  if (!driver || !driver.isAvailable) {
    return NextResponse.json({ error: 'Not available' }, { status: 403 });
  }

  if (action === 'accept') {
    const delivery = await prisma.lumynDelivery.findFirst({
      where: { id: deliveryId, status: 'requested', driverId: null }
    });

    if (!delivery) {
      return NextResponse.json({ error: 'Job no longer available' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.lumynDelivery.update({
        where: { id: deliveryId },
        data: {
          driverId: driver.id,
          status: 'accepted',
          acceptedAt: new Date()
        }
      });

      await tx.lumynDriver.update({
        where: { id: driver.id },
        data: { isAvailable: false }
      });
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

