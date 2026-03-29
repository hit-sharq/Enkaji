import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/db';

interface Params {
  params: { id: string };
}


export default async function DriverJobDetail({ params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Get driver profile
  const driver = await prisma.lumynDriver.findUnique({
    where: { userId: user.id },
    select: { id: true }
  });

  if (!driver) {
    redirect('/lumyn/drivers/register');
  }

  const deliveryId = params.id;
  const delivery = await prisma.lumynDelivery.findUnique({
    where: { id: deliveryId },
    include: {
      customer: {
        select: { firstName: true, lastName: true, email: true }
      }
    }
  });

  if (!delivery || delivery.status !== 'requested' || delivery.driverId) {
    redirect('/lumyn/drivers');
  }

  const acceptJob = async () => {
    'use server'
    await prisma.$transaction(async (tx) => {
      await tx.lumynDelivery.update({
        where: { id: deliveryId },
        data: { 
          driverId: driver!.id,
          status: 'accepted',
          acceptedAt: new Date()
        }
      });
      
      // Update driver availability
      await tx.lumynDriver.update({
        where: { id: driver!.id },
        data: { isAvailable: false }
      });
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">Job #{delivery?.deliveryNumber}</h1>
          <p className="text-muted-foreground">Review details before accepting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/lumyn/drivers">← Back to Jobs</a>
          </Button>
          <form action={acceptJob}>
            <Button type="submit" size="lg">
              Accept Job - KES {delivery?.totalAmount.toLocaleString()}
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge>Requested {delivery?.createdAt.toLocaleDateString()}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Pickup</h3>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="font-medium">{delivery?.pickupAddress}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {delivery?.pickupLat?.toFixed(4)}, {delivery?.pickupLng?.toFixed(4)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Drop-off</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-medium">{delivery?.dropoffAddress}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {delivery?.dropoffLat?.toFixed(4)}, {delivery?.dropoffLng?.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Distance</span>
                <p className="font-semibold">
                  {delivery?.distanceKm ? delivery.distanceKm.toFixed(1) + ' km' : 'TBD'}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Item</span>
                <p className="font-semibold">{delivery?.itemDescription}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Weight</span>
                <p>{delivery?.itemWeightKg ? delivery.itemWeightKg + ' kg' : 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Special</span>
                <p className="text-xs">{delivery?.specialHandling || 'None'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold">{delivery?.customer?.firstName} {delivery?.customer?.lastName}</p>
              <p className="text-sm text-muted-foreground">{delivery?.customer?.email}</p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Payment</p>
              <div className="flex gap-2">
                <Badge variant="outline">{delivery?.paymentMethod}</Badge>
                <Badge variant="outline">{delivery?.paymentStatus}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

