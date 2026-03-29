import { notFound } from 'next/navigation'
import { RFQDetail } from '@/components/rfq/rfq-detail'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function RFQDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const rfqId = params.id

  // In real app, fetch RFQ + quotes from /api/rfq/[id]
  // For now, mock data - replace with real API call
  const rfqData = {
    id: rfqId,
    title: 'Custom Wooden Furniture Set',
    description: 'Need 50 chairs and 10 tables made from mahogany wood. Specific dimensions and finish required.',
    category: 'traditional-crafts',
    budget: '100k-500k',
    deadline: '2024-12-15',
    status: 'open' as const,
    items: [
      { productName: 'Mahogany Chairs', quantity: 50, specifications: 'Height 90cm, upholstery required' },
      { productName: 'Mahogany Tables', quantity: 10, specifications: '120x80cm, polished finish' }
    ],
    quotes: [
      {
        id: 'q1',
        sellerName: 'Nairobi Woodworks',
        businessName: 'Nairobi Woodworks Ltd',
        quoteAmount: 450000,
        deliveryDays: 14,
        notes: 'Premium mahogany, 2-year warranty included'
      },
      {
        id: 'q2',
        sellerName: 'Mombasa Crafts',
        businessName: 'Coast Artisan Collective',
        quoteAmount: 420000,
        deliveryDays: 21,
        notes: 'Sustainable sourced timber, bulk discount applied'
      }
    ]
  }

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

