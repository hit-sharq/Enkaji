import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function uploadToCloudinary(dataUrl: string, folder: string): Promise<string> {
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: `lumyn/kyc/${folder}`,
    resource_type: 'image',
    quality: 'auto',
  })
  return result.secure_url
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const driver = await prisma.lumynDriver.findUnique({ where: { userId: user.id } })
    if (!driver) return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })

    const body = await req.json()
    const { idDocumentBase64, licenseDocumentBase64, idNumber, licenseNumber } = body

    const updates: Record<string, string | Date> = {}

    if (idDocumentBase64) {
      updates.idDocumentUrl = await uploadToCloudinary(idDocumentBase64, driver.id + '/id')
    }
    if (licenseDocumentBase64) {
      updates.licenseDocumentUrl = await uploadToCloudinary(licenseDocumentBase64, driver.id + '/license')
    }
    if (idNumber) updates.idNumber = idNumber
    if (licenseNumber) updates.licenseNumber = licenseNumber

    updates.kycSubmittedAt = new Date()

    const updated = await prisma.lumynDriver.update({
      where: { id: driver.id },
      data: updates,
    })

    return NextResponse.json({ success: true, driver: updated })
  } catch (err) {
    console.error('KYC upload error:', err)
    return NextResponse.json({ error: 'Failed to upload KYC documents' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const driver = await prisma.lumynDriver.findUnique({
      where: { userId: user.id },
      select: {
        id: true, kycVerified: true, kycSubmittedAt: true,
        idNumber: true, licenseNumber: true,
        idDocumentUrl: true, licenseDocumentUrl: true, status: true,
      },
    })

    return NextResponse.json({ driver })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch KYC status' }, { status: 500 })
  }
}
