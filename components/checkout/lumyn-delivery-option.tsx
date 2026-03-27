'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Clock, Shield, ChevronDown, ChevronUp } from 'lucide-react'

interface LumynDeliveryOptionProps {
  selected: boolean
  onSelect: () => void
  cartTotal: number
}

const BASE_FEE = 150

export function LumynDeliveryOption({ selected, onSelect, cartTotal }: LumynDeliveryOptionProps) {
  const [expanded, setExpanded] = useState(false)
  const hour = new Date().getHours()
  const isPeak = [12, 13, 17, 18, 19].includes(hour)
  const estimatedFee = isPeak ? Math.round(BASE_FEE * 1.5) : BASE_FEE

  return (
    <Card
      className={`cursor-pointer border-2 transition-all ${
        selected ? 'border-red-700 bg-red-50/30' : 'border-gray-200 hover:border-red-200'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
              selected ? 'border-red-700 bg-red-700' : 'border-gray-300'
            }`}
          >
            {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">Lumyn Express Delivery</span>
              <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">Nairobi</Badge>
              {isPeak && (
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">Peak hours</Badge>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>Same day, 2–4 hrs</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Shield className="h-3 w-3" />
                <span>Insured delivery</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Zap className="h-3 w-3 text-amber-500" />
                <span className="text-amber-600 font-medium">Express</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-bold text-red-700">
                from KES {estimatedFee}
                {isPeak && <span className="text-xs font-normal text-gray-500 ml-1">(peak surcharge applied)</span>}
              </span>
              <button
                type="button"
                className="text-xs text-gray-400 flex items-center gap-0.5"
                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
              >
                Details {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>

            {expanded && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                <p>• Real-time driver tracking after pickup</p>
                <p>• KES 150 base fee + KES 20/km after first 2km</p>
                <p>• Available within Nairobi metropolitan area</p>
                <p>• Driver contacts you before pickup</p>
                <p>• Pay via M-Pesa, card, or cash on delivery</p>
                <p className="text-gray-400 italic mt-2">Final price calculated at order confirmation based on your exact delivery address.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
