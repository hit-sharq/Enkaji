import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const driver = await prisma.lumynDriver.findUnique({
      where: { id: params.id },
      include: { 
        user: true,
        earnings: true,
        ratings: true,
      },
    })
    if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    return NextResponse.json(driver)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const body = await request.json()
    const driver = await prisma.lumynDriver.update({
      where: { id: params.id },
      data: body,
      include: { user: true },
    })
    return NextResponse.json(driver)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update driver' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    await prisma.lumynDriver.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete driver' }, { status: 500 })
  }
}

