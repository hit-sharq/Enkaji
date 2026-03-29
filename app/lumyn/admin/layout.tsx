import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function LumynAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'ADMIN') {
    redirect('/sign-in?redirect=/lumyn/admin');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lumyn Admin
            </h1>
          </div>
          <nav className="flex space-x-4">
            <Link href="/lumyn/admin">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/lumyn/admin/drivers">
              <Button variant="ghost">Drivers</Button>
            </Link>
            <Link href="/lumyn/admin/deliveries">
              <Button variant="ghost">Deliveries</Button>
            </Link>
            <Link href="/admin">
              <Button>Enkaji Admin</Button>
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto py-10 px-4">
        {children}
      </main>
    </div>
  );
}

