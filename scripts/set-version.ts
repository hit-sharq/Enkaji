import { PrismaClient } from "@prisma/client"
const p = new PrismaClient()
async function main() {
  const c = await p.systemConfig.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", latestVersion: "1.0.3", forceUpdate: true, releaseNotes: "Fix: update banner now disappears after updating", downloadUrl: "https://expo.dev/artifacts/eas/D4RyguB5KGnMQFNGphUxcum8f7cSZiGm_LDuwBTs9RA.apk" },
    update: { latestVersion: "1.0.3", forceUpdate: true, releaseNotes: "Fix: update banner now disappears after updating", downloadUrl: "https://expo.dev/artifacts/eas/D4RyguB5KGnMQFNGphUxcum8f7cSZiGm_LDuwBTs9RA.apk" },
  })
  console.log("updated", c.latestVersion)
  await p.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
