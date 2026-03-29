import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { prisma } from '@/lib/db';
import { Suspense } from 'react';

async function StatsGrid() {
  const stats = await prisma.$transaction([
    prisma.lumynDriver.count({ where: { status: 'active' } }),
    prisma.lumynDriver.count({ where: { kycVerified: true } }),
    prisma.lumynDelivery.count({ where: { status: 'delivered', deliveredAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.lumynDriverEarning.aggregate({ _sum: { netAmount: true } }),
  ]);

  const [
    activeDrivers,
    verifiedDrivers,
    deliveriesThisWeek,
    totalEarnings = { _sum: { netAmount: 0 } }
  ] = stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
          <Badge variant="default">{activeDrivers}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeDrivers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verified Drivers</CardTitle>
          <Badge variant="secondary">{verifiedDrivers}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{verifiedDrivers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Deliveries (Week)</CardTitle>
          <Badge variant="outline">+12.5%</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{deliveriesThisWeek}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
          <Badge>KES</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Number(totalEarnings._sum.netAmount || 0).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function LumynAdminPage() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'ADMIN') {
    redirect('/admin');
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Lumyn Admin Dashboard</h1>
      
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <StatsGrid />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <a href="/lumyn/admin/drivers" className="block p-4 border rounded-lg hover:bg-muted">
              Manage Drivers
            </a>
            <a href="/lumyn/admin/deliveries" className="block p-4 mt-2 border rounded-lg hover:bg-muted">
              View Deliveries
            </a>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Database migration completed. Ready for driver onboarding.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

