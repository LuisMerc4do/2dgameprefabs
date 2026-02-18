"use client"

import { useRef, useEffect } from "react"
import { drawMonster } from "@/lib/sprite-renderer"

interface MonsterSpriteProps {
  monsterId: string
  size?: number
}

export function MonsterSprite({ monsterId, size = 128 }: MonsterSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scale = Math.floor(size / 48)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawMonster(ctx, monsterId, scale)
  }, [monsterId, scale])

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
