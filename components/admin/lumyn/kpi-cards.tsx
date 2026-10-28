import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/db';
import { Suspense } from 'react';

interface KPIProps {
  title: string;
  value: string | number;
  change?: string;
  badge?: string;
}

function KPICard({ title, value, change, badge }: KPIProps) {
  return (
    <Card className="h-[120px] rounded-2xl border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        <div className="flex items-baseline space-x-2">
          <span className="font-display text-3xl font-bold tabular-nums text-enkaji-orange">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {badge && (
            <Badge className="rounded-full border border-enkaji-orange/20 bg-enkaji-orange/10 text-enkaji-orange">{badge}</Badge>
          )}
        </div>
        {change && (
          <p className="text-xs text-muted-foreground mt-1">
            {change} from last week
          </p>
        )}
      </CardContent>
    </Card>
  );
}

async function RevenueCard() {
  const count = await prisma.order.count();
  return <KPICard title="Total Orders" value={count} badge="orders" />;
}

async function DriversCard() {
  const count = await prisma.sellerProfile.count();
  return <KPICard title="Active Sellers" value={count} />;
}

async function DeliveriesCard() {
  const count = await prisma.product.count();
  return <KPICard title="Listed Products" value={count} />;
}

async function PendingKYCCard() {
  const count = await prisma.user.count({ where: { role: 'SELLER' } });
  return <KPICard title="Seller Accounts" value={count} change="+2" />;
}

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Suspense fallback={<div className="h-[120px] animate-pulse rounded-2xl bg-muted" />}>
        <RevenueCard />
      </Suspense>
      <Suspense fallback={<div className="h-[120px] animate-pulse rounded-2xl bg-muted" />}>
        <DriversCard />
      </Suspense>
      <Suspense fallback={<div className="h-[120px] animate-pulse rounded-2xl bg-muted" />}>
        <DeliveriesCard />
      </Suspense>
      <Suspense fallback={<div className="h-[120px] animate-pulse rounded-2xl bg-muted" />}>
        <PendingKYCCard />
      </Suspense>
    </div>
  );
}

