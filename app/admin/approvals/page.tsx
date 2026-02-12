export const dynamic = 'force-dynamic'

import { requireMinimumRole } from "@/lib/auth"
import { ApprovalDashboard } from "@/components/admin/approval-dashboard"
import { RoleGuard } from "@/components/auth/role-guard"

export default async function ApprovalsPage() {
  // Server-side role check
  await requireMinimumRole("MODERATOR")

  return (
    <RoleGuard minimumRole="MODERATOR">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Approval Dashboard</h1>
          <p className="text-muted-foreground">
            Review and approve pending products, artisans, sellers, payouts, and resolve disputes.
          </p>
        </div>
        <ApprovalDashboard />
      </div>
    </RoleGuard>
  )
}
