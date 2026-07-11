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
        selected ? 'border-enkaji-gold bg-enkaji-gold/10' : 'border-border hover:border-enkaji-gold/50'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
              selected ? 'border-enkaji-gold bg-enkaji-gold' : 'border-border'
            }`}
          >
            {selected && <div className="w-1.5 h-1.5 rounded-full bg-card" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">Lumyn Express Delivery</span>
              <Badge className="bg-enkaji-gold/10 text-enkaji-gold hover:bg-enkaji-gold/10 text-xs">Nairobi</Badge>
              {isPeak && (
                <Badge className="bg-enkaji-gold/10 text-enkaji-gold hover:bg-enkaji-gold/10 text-xs">Peak hours</Badge>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Same day, 2–4 hrs</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Insured delivery</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Zap className="h-3 w-3 text-enkaji-gold" />
                <span className="text-enkaji-gold font-medium">Express</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-bold text-enkaji-gold">
                 from KES {estimatedFee}
                {isPeak && <span className="text-xs font-normal text-muted-foreground ml-1">(peak surcharge applied)</span>}
              </span>
              <button
                type="button"
                className="text-xs text-muted-foreground flex items-center gap-0.5"
                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
              >
                Details {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>

            {expanded && (
              <div className="mt-3 pt-3 border-t border-border space-y-1.5 text-xs text-muted-foreground">
                <p>• Real-time driver tracking after pickup</p>
                <p>• KES 150 base fee + KES 20/km after first 2km</p>
                <p>• Available within Nairobi metropolitan area</p>
                <p>• Driver contacts you before pickup</p>
                <p>• Pay via M-Pesa, card, or cash on delivery</p>
                <p className="text-muted-foreground italic mt-2">Final price calculated at order confirmation based on your exact delivery address.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
