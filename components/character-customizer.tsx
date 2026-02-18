"use client"

import {
  SKIN_PALETTES,
  HAIR_COLORS,
  HAIR_STYLES,
  HEAD_STYLES,
  CHEST_STYLES,
  LEG_STYLES,
} from "@/lib/sprite-data"
import type { CharacterConfig } from "@/lib/sprite-renderer"

interface CharacterCustomizerProps {
  config: CharacterConfig
  onChange: (config: CharacterConfig) => void
}

export function CharacterCustomizer({ config, onChange }: CharacterCustomizerProps) {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-sm font-semibold tracking-wider uppercase text-primary">
        Character Creation
      </h3>

      {/* Body Type */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">Body Type</label>
        <div className="flex gap-2">
          {(["warrior", "scout"] as const).map((bt) => (
            <button
              key={bt}
              onClick={() => onChange({ ...config, bodyType: bt })}
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium capitalize transition-colors ${
                config.bodyType === bt
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {bt}
            </button>
          ))}
        </div>
      </div>

      {/* Head Shape */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">Head Shape</label>
        <div className="flex gap-2">
          {HEAD_STYLES.map((h) => (
            <button
              key={h.id}
              onClick={() => onChange({ ...config, headStyle: h.id })}
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                config.headStyle === h.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chest */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">Chest Build</label>
        <div className="flex gap-2">
          {CHEST_STYLES.map((c) => (
            <button
              key={c.id}
              onClick={() => onChange({ ...config, chestStyle: c.id })}
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                config.chestStyle === c.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Legs */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">Leg Build</label>
        <div className="flex gap-2">
          {LEG_STYLES.map((l) => (
            <button
              key={l.id}
              onClick={() => onChange({ ...config, legStyle: l.id })}
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                config.legStyle === l.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Skin Color */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">Skin Tone</label>
        <div className="flex gap-2 flex-wrap">
          {SKIN_PALETTES.map((sp) => (
            <button
              key={sp.id}
              onClick={() =>
                onChange({
                  ...config,
                  skinBase: sp.base,
                  skinShadow: sp.shadow,
                  skinHighlight: sp.highlight,
                })
              }
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                config.skinBase === sp.base
                  ? "border-primary scale-110"
                  : "border-border hover:border-muted-foreground"
              }`}
              style={{ backgroundColor: sp.base }}
              title={sp.name}
            />
          ))}
        </div>
      </div>

      {/* Hair Style */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">Hair Style</label>
        <div className="flex gap-2 flex-wrap">
          {HAIR_STYLES.map((hs) => (
            <button
              key={hs.id}
              onClick={() => onChange({ ...config, hairStyle: hs.id })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                config.hairStyle === hs.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {hs.name}
            </button>
          ))}
        </div>
      </div>

      {/* Hair Color */}
      {config.hairStyle !== "bald" && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground">Hair Color</label>
          <div className="flex gap-2 flex-wrap">
            {HAIR_COLORS.map((hc) => (
              <button
                key={hc.id}
                onClick={() => onChange({ ...config, hairColor: hc.color })}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  config.hairColor === hc.color
                    ? "border-primary scale-110"
                    : "border-border hover:border-muted-foreground"
                }`}
                style={{ backgroundColor: hc.color }}
                title={hc.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
