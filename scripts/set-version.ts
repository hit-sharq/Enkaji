import { PrismaClient } from "@prisma/client"
const p = new PrismaClient()
async function main() {
  const c = await p.systemConfig.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      latestVersion: "1.0.2",
      forceUpdate: true,
      releaseNotes: "Test update - orange theme, reviews fix, category browsing",
      downloadUrl: "https://expo.dev/artifacts/eas/FOG_Bev9ORK341JQoipD1Tw00_DgWiAqqufxSoT6CJ8.apk",
    },
    update: {
      latestVersion: "1.0.2",
      forceUpdate: true,
      releaseNotes: "Test update - orange theme, reviews fix, category browsing",
      downloadUrl: "https://expo.dev/artifacts/eas/FOG_Bev9ORK341JQoipD1Tw00_DgWiAqqufxSoT6CJ8.apk",
    },
  })
  console.log("config:", JSON.stringify(c))
  await p.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
