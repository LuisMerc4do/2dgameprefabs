"use client"

import { ALL_EQUIPMENT, RARITY_COLORS, RARITY_BG, type EquipmentItem } from "@/lib/sprite-data"
import { ItemSprite } from "@/components/item-sprite"
import type { EquippedItems } from "@/lib/sprite-renderer"
import { Shield, Swords, HardHat, Shirt, Hand, Footprints } from "lucide-react"

const SLOT_ICONS: Record<string, React.ReactNode> = {
  helmet: <HardHat className="w-4 h-4" />,
  chest: <Shirt className="w-4 h-4" />,
  gloves: <Hand className="w-4 h-4" />,
  pants: <Shield className="w-4 h-4" />,
  boots: <Footprints className="w-4 h-4" />,
  weapon: <Swords className="w-4 h-4" />,
}

const SLOT_LABELS: Record<string, string> = {
  helmet: "Helmets",
  chest: "Chest Armor",
  gloves: "Gloves",
  pants: "Pants",
  boots: "Boots",
  weapon: "Weapons",
}

interface EquipmentPanelProps {
  equipped: EquippedItems
  onEquip: (slot: string, itemId: string | undefined) => void
  activeSlot: string
  onSlotChange: (slot: string) => void
}

export function EquipmentPanel({
  equipped,
  onEquip,
  activeSlot,
  onSlotChange,
}: EquipmentPanelProps) {
  const items = ALL_EQUIPMENT[activeSlot as keyof typeof ALL_EQUIPMENT] || []
  const equippedId = equipped[activeSlot as keyof EquippedItems]

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold tracking-wider uppercase text-primary">
        Equipment
      </h3>

      {/* Slot Tabs */}
      <div className="flex gap-1 flex-wrap">
        {Object.keys(ALL_EQUIPMENT).map((slot) => {
          const isEquipped = equipped[slot as keyof EquippedItems]
          return (
            <button
              key={slot}
              onClick={() => onSlotChange(slot)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors relative ${
                activeSlot === slot
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {SLOT_ICONS[slot]}
              <span className="hidden sm:inline">{SLOT_LABELS[slot]}</span>
              {isEquipped && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-chart-2" />
              )}
            </button>
          )
        })}
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-1 gap-2">
        {/* Unequip button */}
        <button
          onClick={() => onEquip(activeSlot, undefined)}
          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
            !equippedId
              ? "border-primary bg-primary/10"
              : "border-border bg-card hover:bg-secondary"
          }`}
        >
          <div className="w-[72px] h-[72px] flex items-center justify-center bg-secondary rounded-md">
            <span className="text-muted-foreground text-xs">None</span>
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm font-medium text-foreground">Unequipped</span>
            <span className="text-xs text-muted-foreground">Remove item from this slot</span>
          </div>
        </button>

        {items.map((item: EquipmentItem) => (
          <button
            key={item.id}
            onClick={() => onEquip(activeSlot, item.id)}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              equippedId === item.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:bg-secondary"
            }`}
          >
            <div
              className="rounded-md flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: RARITY_BG[item.rarity] }}
            >
              <ItemSprite slot={item.slot} itemId={item.id} size={72} />
            </div>
            <div className="flex flex-col items-start gap-1 min-w-0">
              <span className="text-sm font-medium text-foreground text-left">
                {item.name}
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: RARITY_COLORS[item.rarity] }}
              >
                {item.rarity}
              </span>
              <span className="text-xs text-muted-foreground text-left leading-tight">
                {item.description}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
