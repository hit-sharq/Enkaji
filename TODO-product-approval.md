<!-- # Product Approval Workflow TODO

**Current Issue:**
Currently products require admin `isActive=true` to show anywhere (including seller profiles).

**User Request:**
- Sellers post products → immediately visible on *their seller profile page*.
- Admin approves → visible on *main shop/public pages*.

**Plan:**
1. prisma/schema.prisma: Add to Product model:
   ```
   isAdminApproved Boolean @default(false)
   ```
2 -->
