import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Params {
  params: { id: string }
}

export default async function DriverPage({ params }: Params) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/sign-in');
  }

  const driver = await prisma.lumynDriver.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true }
      }
    }
  });

  if (!driver) {
    redirect('/lumyn/admin/drivers');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{driver?.fullName}</h1>
          <p className="text-xl text-muted-foreground">Driver ID: {driver?.id?.slice(-8)}</p>
        </div>
        <div className="space-y-2">
          <Button 
            variant={driver?.kycVerified ? 'outline' : 'default'}
            onClick={async () => {
              'use server'
              await prisma.lumynDriver.update({
                where: { id: params.id },
                data: { kycVerified: true }
              });
            }}
          >
            {driver?.kycVerified ? 'Verified' : 'Approve KYC'}
          </Button>
          <Button variant="destructive">Suspend</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Contact</h3>
          <p>{driver?.phoneNumber}</p>
          <p>{driver?.user?.email}</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Vehicle</h3>
          <p>{driver?.vehicleType}</p>
          {driver?.vehicleRegistration && <p>Reg: {driver.vehicleRegistration}</p>}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Stats</h3>
          <p>Rating: {driver?.rating}/5</p>
          <p>Earnings: KES {driver?.totalEarnings?.toLocaleString()}</p>
          <p>Deliveries: {driver?.totalDeliveries}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-4">KYC Documents</h3>
          <div className="space-y-2">
            {driver?.idDocumentUrl && <a href={driver.idDocumentUrl} target="_blank">ID Document</a>}
            {driver?.licenseDocumentUrl && <a href={driver.licenseDocumentUrl} target="_blank">License</a>}
          </div>
        </div>
      </div>
    </div>
  );
}

