import { PrismaClient } from "@prisma/client"
const p = new PrismaClient()
async function main() {
  const c = await p.systemConfig.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", latestVersion: "1.0.2", forceUpdate: true, releaseNotes: "Test update - orange theme, reviews fix, category browsing", downloadUrl: "https://expo.dev/artifacts/eas/mMBs9HmfV2IF0Sj5LTJD72K0AWGQtTA4HbsHOyllNhk.apk" },
    update: { latestVersion: "1.0.2", forceUpdate: true, releaseNotes: "Test update - orange theme, reviews fix, category browsing", downloadUrl: "https://expo.dev/artifacts/eas/mMBs9HmfV2IF0Sj5LTJD72K0AWGQtTA4HbsHOyllNhk.apk" },
  })
  console.log("updated")
  await p.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
