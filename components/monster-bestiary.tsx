"use client"

import { useState } from "react"
import { MONSTERS } from "@/lib/sprite-data"
import { MonsterSprite } from "@/components/monster-sprite"

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "#34D399",
  "Easy-Medium": "#A3E635",
  Medium: "#FBBF24",
  "Medium-High": "#F87171",
}

export function MonsterBestiary() {
  const [selected, setSelected] = useState(MONSTERS[0].id)
  const selectedMonster = MONSTERS.find((m) => m.id === selected)!

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold tracking-wider uppercase text-primary">
        Monster Bestiary
      </h3>

      {/* Selected monster detail */}
      <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border bg-card">
        <div className="bg-secondary rounded-lg p-2">
          <MonsterSprite monsterId={selected} size={160} />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <h4 className="text-base font-bold text-foreground">{selectedMonster.name}</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{selectedMonster.role}</span>
            <span className="text-muted-foreground">|</span>
            <span
              className="text-xs font-semibold"
              style={{ color: DIFFICULTY_COLORS[selectedMonster.difficulty] }}
            >
              {selectedMonster.difficulty}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1 max-w-[280px]">
            {selectedMonster.description}
          </p>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
            Inspired by: {selectedMonster.inspiration}
          </span>
        </div>
      </div>

      {/* Monster grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {MONSTERS.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
              selected === m.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:bg-secondary"
            }`}
          >
            <div className="bg-secondary rounded-md p-1">
              <MonsterSprite monsterId={m.id} size={64} />
            </div>
            <span className="text-[10px] font-medium text-foreground text-center leading-tight">
              {m.name}
            </span>
            <span
              className="text-[9px] font-bold"
              style={{ color: DIFFICULTY_COLORS[m.difficulty] }}
            >
              {m.difficulty}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
