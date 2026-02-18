"use client"

import { useRef, useEffect } from "react"
import { drawItemSprite } from "@/lib/sprite-renderer"

interface ItemSpriteProps {
  slot: string
  itemId: string
  size?: number
}

export function ItemSprite({ slot, itemId, size = 72 }: ItemSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scale = Math.floor(size / 24)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawItemSprite(ctx, slot, itemId, scale)
  }, [slot, itemId, scale])

  return (
    <canvas
      ref={canvasRef}
      width={24 * scale}
      height={24 * scale}
      className="block"
      style={{ imageRendering: "pixelated" }}
    />
  )
}
