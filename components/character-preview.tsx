"use client"

import { useRef, useEffect } from "react"
import { drawCharacter, type CharacterConfig, type EquippedItems } from "@/lib/sprite-renderer"

interface CharacterPreviewProps {
  config: CharacterConfig
  equipped: EquippedItems
  size?: number
}

export function CharacterPreview({ config, equipped, size = 256 }: CharacterPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scale = Math.floor(size / 48)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawCharacter(ctx, config, equipped, scale)
  }, [config, equipped, scale])

  return (
    <canvas
      ref={canvasRef}
      width={48 * scale}
      height={48 * scale}
      className="block"
      style={{ imageRendering: "pixelated" }}
    />
  )
}
