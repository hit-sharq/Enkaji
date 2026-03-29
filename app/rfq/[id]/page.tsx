import { notFound } from 'next/navigation'
import { RFQDetail } from '@/components/rfq/rfq-detail'
import { getCurrentUser } from '@/lib/auth'

export default async function RFQDetailPage({ params }: { params: { id: string } }) {
  const session = await getCurrentUser()
  const rfqId = params.id

  // Fetch real RFQ data from DB via API
  const rfqResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:5000'}/api/rfq/${rfqId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!rfqResponse.ok) {
    notFound()
  }

  const rfqData = await rfqResponse.json()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <a href="/rfq" className="inline-flex items-center text-orange-600 hover:text-orange-700 text-sm font-medium">
            ← Back to RFQs
          </a>
        </div>
        <RFQDetail rfq={rfqData} session={session} />
      </div>
    </div>
  )
}

