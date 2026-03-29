import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import type { LumynDriver } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/db';

const columns = [
  {
    accessorKey: 'fullName',
    header: 'Name',
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: any }) => (
      <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'kycVerified',
    header: 'KYC',
    cell: ({ row }: { row: any }) => (
      <Badge variant={row.original.kycVerified ? 'default' : 'outline'}>
        {row.original.kycVerified ? 'Verified' : 'Pending'}
      </Badge>
    ),
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
  },
  {
    accessorKey: 'totalEarnings',
    header: 'Earnings',
    cell: ({ row }: { row: any }) => `KES ${row.original.totalEarnings?.toLocaleString() || 0}`,
  },
];

export default async function DriversPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/sign-in');
  }

  const drivers: any[] = await prisma.lumynDriver.findMany({
    select: {
      id: true,
      fullName: true,
      phoneNumber: true,
      status: true,
      kycVerified: true,
      rating: true,
      totalEarnings: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Drivers ({drivers.length})</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Driver
        </button>
      </div>
      <DataTable columns={columns as any} data={drivers} />
    </div>
  );
}

