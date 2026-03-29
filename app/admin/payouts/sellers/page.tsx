import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { prisma } from '@/lib/db';

interface PayoutRequest {
  id: string;
  seller: {
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  method: string;
  status: string;
  processedAt: Date | null;
  createdAt: Date;
}

const columns = [
  {
    accessorKey: 'seller',
    header: 'Seller',
    cell: ({ row }: { row: any }) => (
      <div>
        <p className="font-medium">{row.original.seller.firstName} {row.original.seller.lastName}</p>
        <p className="text-xs text-muted-foreground">{row.original.seller.email}</p>
      </div>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }: { row: any }) => (
      <div className="font-mono font-semibold">
        KES {row.original.amount.toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: 'method',
    header: 'Method',
    cell: ({ row }: { row: any }) => (
      <Badge variant="outline">
        {row.original.method}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: any }) => (
      <Badge variant={row.original.status === 'APPROVED' ? 'default' : 'secondary'}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Requested',
    cell: ({ row }: { row: any }) => (
      <span className="text-xs">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </span>
    ),
  },
];

async function getPayoutRequests() {
  const requests = await prisma.payoutRequest.findMany({
    include: {
      seller: {
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return requests.map((req) => ({
    id: req.id,
    seller: req.seller.user,
    amount: Number(req.amount),
    method: req.method,
    status: req.status,
    processedAt: req.processedAt,
    createdAt: req.createdAt,
  })) as PayoutRequest[];
}

export default async function SellerPayoutsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/sign-in');
  }

  const payoutRequests = await getPayoutRequests();

  const pendingCount = payoutRequests.filter(r => r.status === 'PENDING').length;
  const totalPending = payoutRequests
    .filter(r => r.status === 'PENDING')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Seller Payout Requests ({payoutRequests.length})</h1>
        <div className="space-y-1 text-right">
          <p className="text-sm text-muted-foreground">Pending: {pendingCount}</p>
          <p className="text-xl font-semibold">KES {totalPending.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="text-center p-6 border rounded-lg">
          <div className="text-2xl font-bold text-blue-600 mb-1">{pendingCount}</div>
          <div className="text-sm text-muted-foreground">Pending Requests</div>
        </div>
        <div className="text-center p-6 border rounded-lg">
          <div className="text-2xl font-bold text-green-600 mb-1">KES {totalPending.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total Pending</div>
        </div>
        <div className="text-center p-6 border rounded-lg">
          <div className="text-2xl font-bold mb-1">{payoutRequests.filter(r => r.status === 'APPROVED').length}</div>
          <div className="text-sm text-muted-foreground">Approved</div>
        </div>
        <div className="text-center p-6 border rounded-lg">
          <div className="text-2xl font-bold text-red-600 mb-1">{payoutRequests.filter(r => r.status === 'REJECTED').length}</div>
          <div className="text-sm text-muted-foreground">Rejected</div>
        </div>
      </div>

      <DataTable columns={columns as any} data={payoutRequests} />
    </div>
  );
}

