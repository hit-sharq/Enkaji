import { getCurrentUser } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { prisma } from '@/lib/db';
import { pesapalService } from '@/lib/pesapal';

interface PayoutRequestDetail {
  id: string;
  seller: {
    firstName: string;
    lastName: string;
    email: string;
    businessName: string;
  };
  amount: number;
  method: string;
  recipientDetails: any;
  status: string;
  adminNotes?: string;
  createdAt: Date;
  processedAt?: Date;
}

export default async function PayoutRequestDetail({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/sign-in');
  }

  const payoutRequestId = params.id;
  const payoutRequest = await prisma.payoutRequest.findUnique({
    where: { id: payoutRequestId },
    include: {
      seller: {
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true }
          }
        }
      }
    }
  });

  if (!payoutRequest) {
    notFound();
  }

  const detail: PayoutRequestDetail = {
    id: payoutRequest.id,
    seller: {
      firstName: payoutRequest.seller.user.firstName,
      lastName: payoutRequest.seller.user.lastName,
      email: payoutRequest.seller.user.email,
      businessName: payoutRequest.seller.businessName,
    },
    amount: Number(payoutRequest.amount),
    method: payoutRequest.method,
    recipientDetails: payoutRequest.recipientDetails,
    status: payoutRequest.status,
    adminNotes: payoutRequest.adminNotes,
    createdAt: payoutRequest.createdAt,
    processedAt: payoutRequest.processedAt,
  };

  if (detail.status !== 'PENDING') {
    // Still show for review
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <Button variant="outline" onClick={() => history.back()}>← Back to List</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Payout Request #{detail.id.slice(-6)}</CardTitle>
              <Badge variant="outline">{detail.status}</Badge>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">KES {detail.amount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{detail.method}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Seller Info */}
          <div>
            <h3 className="font-semibold mb-2">Seller Information</h3>
            <div className="space-y-1">
              <p><strong>{detail.seller.businessName}</strong></p>
              <p>{detail.seller.firstName} {detail.seller.lastName}</p>
              <p className="text-muted-foreground">{detail.seller.email}</p>
            </div>
          </div>

          {/* Recipient Details */}
          <div>
            <h3 className="font-semibold mb-2">Payout Details</h3>
            <pre className="bg-muted p-4 rounded-md text-sm max-h-40 overflow-auto">
              {JSON.stringify(detail.recipientDetails, null, 2)}
            </pre>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label>Requested</Label>
              <p>{detail.createdAt.toLocaleDateString()}</p>
            </div>
            {detail.processedAt && (
              <div>
                <Label>Processed</Label>
                <p>{detail.processedAt.toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {detail.status === 'PENDING' && (
            <div className="flex gap-3 pt-4 border-t">
              <form action={`/api/admin/payouts/${detail.id}/approve`} className="flex-1">
                <input type="hidden" name="approved" value="true" />
                <Textarea 
                  name="notes" 
                  placeholder="Approval notes (optional)"
                  className="mb-3"
                  rows={3}
                />
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  Approve & Process Payout
                </Button>
              </form>

              <form action={`/api/admin/payouts/${detail.id}/approve`} className="flex-1">
                <input type="hidden" name="approved" value="false" />
                <Textarea 
                  name="notes" 
                  placeholder="Rejection reason (required)"
                  className="mb-3"
                  rows={3}
                />
                <Button type="submit" variant="destructive" className="w-full">
                  Reject Request
                </Button>
              </form>
            </div>
          )}

          {detail.adminNotes && (
            <div>
              <Label>Admin Notes</Label>
              <p className="mt-1 p-3 bg-muted rounded-md text-sm">{detail.adminNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

