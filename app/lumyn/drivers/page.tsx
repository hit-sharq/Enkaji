import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/db';

interface AvailableJob {
  id: string;
  deliveryNumber: string;
  pickupAddress: string;
  dropoffAddress: string;
  distanceKm: number | null;
  totalAmount: number;
  status: string;
  createdAt: Date;
}

async function getAvailableJobs(): Promise<AvailableJob[]> {
  'use server'
  return await prisma.lumynDelivery.findMany({
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
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}

export default async function DriverJobsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Check if user has Lumyn driver profile
  const driver = await prisma.lumynDriver.findUnique({
    where: { userId: user.id },
    select: { id: true, isAvailable: true, status: true }
  });

  if (!driver) {
    redirect('/lumyn/drivers/register'); // Driver registration page
  }

  const jobs = await getAvailableJobs();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Available Jobs ({jobs.length})</h1>
          <p className="text-muted-foreground">Newest deliveries waiting for drivers</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={driver.isAvailable ? "default" : "secondary"}>
            {driver.isAvailable ? "Available" : "Busy"}
          </Badge>
          <Button size="sm" variant={driver.isAvailable ? "outline" : "default"}>
            {driver.isAvailable ? "Go Offline" : "Go Online"}
          </Button>
        </div>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-xl text-muted-foreground mb-4">No jobs available right now</p>
            <p className="text-sm text-muted-foreground">Check back soon or ensure you're online</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <Badge className="w-fit mb-2">KES {job.totalAmount.toLocaleString()}</Badge>
                <h3 className="font-semibold text-lg">#{job.deliveryNumber}</h3>
              </CardHeader>
              <CardContent className="space-y-3 pb-6">
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>{job.pickupAddress.split(',')[0]}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-5">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>{job.dropoffAddress.split(',')[0]}</span>
                  </div>
                  {job.distanceKm && (
                    <div className="text-xs text-muted-foreground">
                      ~{job.distanceKm.toFixed(1)}km
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button size="sm" className="flex-1" asChild>
                    <a href={`/lumyn/drivers/${job.id}`}>View Details</a>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Accept
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

