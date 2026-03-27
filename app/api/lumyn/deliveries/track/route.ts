import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const deliveryId = searchParams.get('id')

  if (!deliveryId) {
    return new Response('Missing delivery id', { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false

      const send = (data: object) => {
        if (!closed) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        }
      }

      const poll = async () => {
        if (closed) return
        try {
          const delivery = await prisma.lumynDelivery.findUnique({
            where: { id: deliveryId },
            select: {
              id: true, status: true, updatedAt: true,
              driver: {
                select: {
                  fullName: true, phoneNumber: true,
                  currentLocationLat: true, currentLocationLng: true,
                  lastLocationUpdate: true, rating: true,
                },
              },
            },
          })

          if (delivery) send({ type: 'update', delivery })
          else send({ type: 'error', message: 'Delivery not found' })

          if (delivery?.status === 'delivered' || delivery?.status === 'cancelled') {
            send({ type: 'done', status: delivery.status })
            closed = true
            controller.close()
            return
          }
        } catch (err) {
          send({ type: 'error', message: 'Poll error' })
        }
        setTimeout(poll, 8000)
      }

      send({ type: 'connected' })
      await poll()

      req.signal.addEventListener('abort', () => {
        closed = true
        try { controller.close() } catch {}
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
