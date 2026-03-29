"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Clock, MapPin, Phone, MessageSquare, Award } from 'lucide-react'
import { RFQItem, Quote } from '@/types'

interface RFQ {
  id: string
  title: string
  description: string
  category: string
  budget: string
  deadline: string
  status: 'open' | 'closed' | 'expired'
  items: RFQItem[]
  quotes: Quote[]
}

interface Props {
  rfq: RFQ
  session: any
}

export function RFQDetail({ rfq, session }: Props) {
  return (
    <div className="space-y-6">
      {/* RFQ Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge variant={rfq.status === 'open' ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
              {rfq.status.toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-500">Created 2 days ago</span>
          </div>
          <CardTitle className="text-2xl">{rfq.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{rfq.description}</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span>Category: <strong>{rfq.category}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span>Budget: <strong>{rfq.budget}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Deadline: <strong>{rfq.deadline}</strong></span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Requirements ({rfq.items.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rfq.items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-1">{item.productName}</h4>
                <p className="text-sm text-gray-600 mb-2">Qty: <strong>{item.quantity}</strong></p>
                <p className="text-sm">{item.specifications}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quotes */}
      {rfq.quotes.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Quotes ({rfq.quotes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rfq.quotes.map((quote) => (
                <Card key={quote.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-lg">KSh {quote.quoteAmount.toLocaleString()}</span>
                          <Badge>{quote.deliveryDays} days</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{quote.businessName}</p>
                        <p className="text-sm">{quote.notes}</p>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                            Accept Quote
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900">No quotes yet</h3>
            <p className="text-gray-600 mb-6">Artisans will start responding soon. Check back in 24-48 hours.</p>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Refresh Quotes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1">
          Edit RFQ
        </Button>
        <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
          Close RFQ
        </Button>
      </div>
    </div>
  )
}

