"use client"

import { ALL_EQUIPMENT, RARITY_COLORS, type EquipmentItem } from "@/lib/sprite-data"
import { ItemSprite } from "@/components/item-sprite"
import type { EquippedItems } from "@/lib/sprite-renderer"

const SLOT_NAMES: Record<string, string> = {
  helmet: "Head",
  chest: "Chest",
  gloves: "Hands",
  pants: "Legs",
  boots: "Feet",
  weapon: "Weapon",
}

interface EquippedSlotsProps {
  equipped: EquippedItems
  onClickSlot: (slot: string) => void
}

function findItem(slot: string, id: string): EquipmentItem | undefined {
  const items = ALL_EQUIPMENT[slot as keyof typeof ALL_EQUIPMENT]
  return items?.find((i: EquipmentItem) => i.id === id)
}

export function EquippedSlots({ equipped, onClickSlot }: EquippedSlotsProps) {
  const slots = ["helmet", "chest", "gloves", "pants", "boots", "weapon"]

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
        Equipped
      </h4>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot) => {
          const id = equipped[slot as keyof EquippedItems]
          const item = id ? findItem(slot, id) : null

          return (
            <button
              key={slot}
              onClick={() => onClickSlot(slot)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
            >
              {item ? (
                <>
                  <div className="bg-secondary rounded-md">
                    <ItemSprite slot={slot} itemId={item.id} size={48} />
                  </div>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: RARITY_COLORS[item.rarity] }}
                  >
                    {SLOT_NAMES[slot]}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-[48px] h-[48px] rounded-md bg-secondary flex items-center justify-center">
                    <span className="text-muted-foreground text-[10px]">Empty</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                    {SLOT_NAMES[slot]}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
