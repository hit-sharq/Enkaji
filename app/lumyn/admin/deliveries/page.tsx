import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/db';

const columns = [
  {
    accessorKey: 'deliveryNumber',
    header: 'Delivery #',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: any }) => (
      <Badge variant={row.original.status === 'delivered' ? 'default' : 'secondary'}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }: { row: any }) => row.original.customerId,
  },
  {
    accessorKey: 'driver',
    header: 'Driver',
    cell: ({ row }: { row: any }) => row.original.driverId || 'Unassigned',
  },
  {
    accessorKey: 'totalAmount',
    header: 'Amount',
    cell: ({ row }: { row: any }) => `KES ${row.original.totalAmount}`,
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }: { row: any }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
];

export default async function DeliveriesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/sign-in');
  }

  const deliveries = await prisma.lumynDelivery.findMany({
    select: {
      id: true,
      deliveryNumber: true,
      status: true,
      customerId: true,
      driverId: true,
      totalAmount: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Deliveries ({deliveries.length})</h1>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Assign Driver
          </button>
        </div>
      </div>
      <DataTable columns={columns as any} data={deliveries as any[]} />
    </div>
  );
}

