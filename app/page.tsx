"use client"

import { useState } from "react"
import { CharacterPreview } from "@/components/character-preview"
import { CharacterCustomizer } from "@/components/character-customizer"
import { EquipmentPanel } from "@/components/equipment-panel"
import { EquippedSlots } from "@/components/equipped-slots"
import { MonsterBestiary } from "@/components/monster-bestiary"
import { SkillsPanel } from "@/components/skills-panel"
import type { CharacterConfig, EquippedItems } from "@/lib/sprite-renderer"
import { SKIN_PALETTES } from "@/lib/sprite-data"
import { Scroll, Swords, User, Shield, Zap } from "lucide-react"

const defaultSkin = SKIN_PALETTES[0]

const DEFAULT_CONFIG: CharacterConfig = {
  bodyType: "warrior",
  headStyle: "round",
  chestStyle: "broad",
  legStyle: "normal",
  hairStyle: "short",
  hairColor: "#6B3A2A",
  skinBase: defaultSkin.base,
  skinShadow: defaultSkin.shadow,
  skinHighlight: defaultSkin.highlight,
}

type Tab = "character" | "equipment" | "monsters" | "skills"

export default function SpriteLibraryPage() {
  const [config, setConfig] = useState<CharacterConfig>(DEFAULT_CONFIG)
  const [equipped, setEquipped] = useState<EquippedItems>({})
  const [activeTab, setActiveTab] = useState<Tab>("character")
  const [activeEquipSlot, setActiveEquipSlot] = useState("helmet")

  const handleEquip = (slot: string, itemId: string | undefined) => {
    setEquipped((prev) => ({ ...prev, [slot]: itemId }))
  }

  const handleSlotClick = (slot: string) => {
    setActiveEquipSlot(slot)
    setActiveTab("equipment")
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "character", label: "Character", icon: <User className="w-4 h-4" /> },
    { id: "equipment", label: "Equipment", icon: <Shield className="w-4 h-4" /> },
    { id: "monsters", label: "Bestiary", icon: <Scroll className="w-4 h-4" /> },
    { id: "skills", label: "Skills", icon: <Zap className="w-4 h-4" /> },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Swords className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              Norse RPG Sprite Library
            </h1>
            <p className="text-xs text-muted-foreground">
              Modular pixel art sprites for 2D game development
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <nav className="flex gap-1 mb-6 border-b border-border pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === "monsters" ? (
          <MonsterBestiary />
        ) : activeTab === "skills" ? (
          <div className="p-4 rounded-xl border border-border bg-card">
            <SkillsPanel config={config} equipped={equipped} />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Character Preview */}
            <div className="flex flex-col items-center gap-4 lg:sticky lg:top-6 lg:self-start">
              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex flex-col items-center gap-3">
                  <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                    Preview
                  </span>
                  <div className="bg-secondary rounded-lg p-3 relative">
                    {/* Checkerboard background for transparency */}
                    <div
                      className="absolute inset-3 rounded"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.03) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.03) 75%)",
                        backgroundSize: "16px 16px",
                        backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                      }}
                    />
                    <div className="relative">
                      <CharacterPreview config={config} equipped={equipped} size={256} />
                    </div>
                  </div>

                  {/* Mini previews of both body types */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="bg-secondary rounded-md p-1">
                        <CharacterPreview
                          config={{ ...config, bodyType: "warrior" }}
                          equipped={equipped}
                          size={96}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">Warrior</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="bg-secondary rounded-md p-1">
                        <CharacterPreview
                          config={{ ...config, bodyType: "scout" }}
                          equipped={equipped}
                          size={96}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">Scout</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipped Slots */}
              <div className="w-full p-4 rounded-xl border border-border bg-card">
                <EquippedSlots equipped={equipped} onClickSlot={handleSlotClick} />
              </div>
            </div>

            {/* Right: Customization / Equipment */}
            <div className="flex-1 min-w-0">
              <div className="p-4 rounded-xl border border-border bg-card">
                {activeTab === "character" ? (
                  <CharacterCustomizer config={config} onChange={setConfig} />
                ) : (
                  <EquipmentPanel
                    equipped={equipped}
                    onEquip={handleEquip}
                    activeSlot={activeEquipSlot}
                    onSlotChange={setActiveEquipSlot}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
