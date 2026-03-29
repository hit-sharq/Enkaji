import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// This page is for admins to view and manage a specific delivery

interface Params {
  params: { id: string }
}

export default async function DeliveryPage({ params }: Params) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/sign-in');
  }

  const delivery = await prisma.lumynDelivery.findUnique({
    where: { id: params.id },
    include: {
      customer: { select: { firstName: true, lastName: true, email: true } },
      driver: true,
    }
  });

  if (!delivery) {
    redirect('/lumyn/admin/deliveries');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">Delivery #{delivery.deliveryNumber}</h1>
          <Badge variant="default">{delivery.status}</Badge>
        </div>
        <Button>Update Status</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Pickup</h3>
          <p>{delivery.pickupAddress}</p>
          <p className="text-sm text-muted-foreground">
            Lat: {delivery.pickupLat}, Lng: {delivery.pickupLng}
          </p>

          <h3 className="font-semibold text-lg">Dropoff</h3>
          <p>{delivery.dropoffAddress}</p>
          <p className="text-sm text-muted-foreground">
            Lat: {delivery.dropoffLat}, Lng: {delivery.dropoffLng}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Customer</h3>
          <p>{delivery.customer.firstName} {delivery.customer.lastName}</p>
          <p>{delivery.customer.email}</p>

          <h3 className="font-semibold text-lg">Driver</h3>
          <p>{delivery.driver?.fullName || 'Unassigned'}</p>
          {delivery.driver && <p>{delivery.driver.phoneNumber}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Item Details</h3>
        <p>{delivery.itemDescription}</p>
        {delivery.specialHandling && <p className="text-sm text-muted-foreground">Special: {delivery.specialHandling}</p>}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div><strong>Distance:</strong> {delivery.distanceKm}km</div>
          <div><strong>Total:</strong> KES {delivery.totalAmount}</div>
          <div><strong>Status:</strong> {delivery.status}</div>
          <div><strong>Created:</strong> {new Date(delivery.createdAt).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

