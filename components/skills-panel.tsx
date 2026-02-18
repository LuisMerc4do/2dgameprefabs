"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { SKILLS, SKILL_CATEGORIES } from "@/lib/sprite-data"
import type { SkillDef } from "@/lib/sprite-data"
import { drawCharacter, type CharacterConfig, type EquippedItems } from "@/lib/sprite-renderer"

// ============================================================
// HELPERS
// ============================================================

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function easeOut(t: number) { return 1 - (1 - t) * (1 - t) }
function easeIn(t: number) { return t * t }

function darken(hex: string, amt = 30): string {
  const n = parseInt(hex.replace("#", ""), 16)
  const r = Math.max(0, (n >> 16) - amt)
  const g = Math.max(0, ((n >> 8) & 0xff) - amt)
  const b = Math.max(0, (n & 0xff) - amt)
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`
}

// Deterministic pseudo-random (no Math.random — uses seed + time for animation)
function prng(seed: number, t: number) {
  return Math.abs(Math.sin(seed * 127.1 + t * 43.7) * 43758.5453) % 1
}

// Draw a pixel-art warrior standing pose (simplified, scale=2 on 48x48 grid = 96px canvas)
// offsetX/offsetY shift the character within the 48px grid
function drawSkillCharacter(
  ctx: CanvasRenderingContext2D,
  config: CharacterConfig,
  s: number,
  equipped: EquippedItems,
  offsetX = 0,
  offsetY = 0
) {
  ctx.save()
  // clip to canvas
  ctx.beginPath()
  ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.clip()
  drawCharacter(ctx, config, equipped, s, offsetX * s, offsetY * s)
  ctx.restore()
}

// ============================================================
// PER-SKILL VFX DRAWING FUNCTIONS
// All draw on a 48-unit virtual grid scaled by s (=2 → 96px canvas)
// Character is drawn at its natural 48-unit position
// ============================================================

type SkillDrawFn = (
  ctx: CanvasRenderingContext2D,
  t: number,           // animation time 0..1
  config: CharacterConfig,
  equipped: EquippedItems,
  s: number            // pixel scale
) => void

// Helper: draw pixel rect on virtual grid
function r(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, s: number) {
  ctx.fillStyle = color
  ctx.fillRect(x * s, y * s, w * s, h * s)
}

function p(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, s: number) {
  r(ctx, x, y, 1, 1, color, s)
}

// ---- AOE ----

const drawRunicBurst: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const cx = 24, cy = 28
  // Character (slightly lifted during burst)
  const lift = Math.sin(t * Math.PI) * 2
  drawSkillCharacter(ctx, config, s, equipped, 0, -lift)
  // Expanding rune rings x3
  for (let ri = 0; ri < 3; ri++) {
    const phase = (t + ri / 3) % 1
    const rad = phase * 22
    const alpha = (1 - phase) * 0.95
    ctx.save()
    ctx.strokeStyle = `rgba(212,164,74,${alpha})`
    ctx.lineWidth = (2 - phase) * s
    ctx.shadowColor = "#D4A44A"
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.arc(cx * s, cy * s, rad * s, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
  // Radial gold sparks
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + t * Math.PI
    const phase = (t * 2 + i * 0.13) % 1
    const len = phase * 16
    const alpha = 1 - phase
    ctx.save()
    ctx.strokeStyle = `rgba(255,210,80,${alpha})`
    ctx.lineWidth = s
    ctx.beginPath()
    ctx.moveTo(cx * s, cy * s)
    ctx.lineTo((cx + Math.cos(angle) * len) * s, (cy + Math.sin(angle) * len) * s)
    ctx.stroke()
    ctx.restore()
  }
  // Ground rune glyph
  ctx.save()
  ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * Math.PI * 4)
  ctx.fillStyle = "#D4A44A"
  ctx.shadowColor = "#FFD800"
  ctx.shadowBlur = 10
  r(ctx, 20, 44, 8, 1, "#D4A44A", s)
  r(ctx, 22, 43, 4, 1, "#D4A44A", s)
  r(ctx, 24, 42, 1, 3, "#FFD800", s)
  ctx.restore()
}

const drawThunderNova: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const cx = 24, cy = 28
  drawSkillCharacter(ctx, config, s, equipped)
  // Lightning bolt from sky
  const boltPhase = (t * 2) % 1
  if (boltPhase < 0.4) {
    const alpha = boltPhase < 0.2 ? boltPhase * 5 : 1 - (boltPhase - 0.2) / 0.2
    ctx.save()
    ctx.strokeStyle = `rgba(255,240,100,${alpha})`
    ctx.lineWidth = 2 * s
    ctx.shadowColor = "#FFEE44"
    ctx.shadowBlur = 14
    ctx.beginPath()
    ctx.moveTo(cx * s, 0)
    ctx.lineTo((cx - 2) * s, 12 * s)
    ctx.lineTo((cx + 1) * s, 18 * s)
    ctx.lineTo((cx - 1) * s, 26 * s)
    ctx.lineTo(cx * s, cy * s)
    ctx.stroke()
    ctx.restore()
  }
  // Nova ring on impact
  const novaPhase = (t * 1.5 + 0.3) % 1
  const novaR = novaPhase * 20
  const novaAlpha = 1 - novaPhase
  ctx.save()
  ctx.strokeStyle = `rgba(255,240,100,${novaAlpha * 0.9})`
  ctx.lineWidth = (3 - novaPhase * 2) * s
  ctx.shadowColor = "#FFEE44"
  ctx.shadowBlur = 16
  ctx.beginPath()
  ctx.arc(cx * s, cy * s, novaR * s, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
  // Sparks
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + t * Math.PI * 3
    const d = 10 + prng(i, t) * 8
    const sx = cx + Math.cos(angle) * d
    const sy = cy + Math.sin(angle) * d * 0.6
    const sa = prng(i + 10, t) * 0.8 + 0.2
    ctx.save()
    ctx.fillStyle = `rgba(255,255,150,${sa})`
    ctx.shadowColor = "#FFFF88"
    ctx.shadowBlur = 6
    ctx.fillRect(sx * s, sy * s, s, s)
    ctx.restore()
  }
}

const drawFrostPulse: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const cx = 24, cy = 28
  drawSkillCharacter(ctx, config, s, equipped)
  // Frost rings — slower, icy blue
  for (let ri = 0; ri < 3; ri++) {
    const phase = (t * 0.8 + ri / 3) % 1
    const rad = phase * 20
    const alpha = (1 - phase) * 0.8
    ctx.save()
    ctx.strokeStyle = `rgba(136,220,255,${alpha})`
    ctx.lineWidth = (1.5 - phase) * s
    ctx.shadowColor = "#88DCFF"
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.arc(cx * s, cy * s, rad * s, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
  // Ice crystal shards
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + Math.PI / 6
    const phase = (t * 1.2 + i * 0.16) % 1
    const d = phase * 18
    const alpha = 1 - phase
    const ix = cx + Math.cos(angle) * d
    const iy = cy + Math.sin(angle) * d * 0.7
    ctx.save()
    ctx.fillStyle = `rgba(180,240,255,${alpha})`
    ctx.shadowColor = "#AAEEFF"
    ctx.shadowBlur = 4
    r(ctx, ix - 0.5, iy - 1, 1, 2, `rgba(180,240,255,${alpha})`, s)
    r(ctx, ix - 1, iy - 0.5, 2, 1, `rgba(180,240,255,${alpha * 0.7})`, s)
    ctx.restore()
  }
  // Frost aura on player
  ctx.save()
  ctx.globalAlpha = 0.3 + 0.2 * Math.sin(t * Math.PI * 4)
  ctx.strokeStyle = "#88DCFF"
  ctx.lineWidth = s
  ctx.shadowColor = "#88DCFF"
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.ellipse(cx * s, cy * s, 14 * s, 18 * s, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

const drawWarCry: SkillDrawFn = (ctx, t, config, equipped, s) => {
  drawSkillCharacter(ctx, config, s, equipped)
  const cx = 24, cy = 16 // head area
  // Sound wave rings emanating from head
  for (let ri = 0; ri < 4; ri++) {
    const phase = (t * 1.2 + ri / 4) % 1
    const rad = 4 + phase * 20
    const alpha = (1 - phase) * 0.85
    ctx.save()
    ctx.strokeStyle = `rgba(255,160,40,${alpha})`
    ctx.lineWidth = (1.5 - phase) * s
    ctx.shadowColor = "#FF8820"
    ctx.shadowBlur = 8
    // semi-circle arcs (emanating upward/sideways)
    ctx.beginPath()
    ctx.arc(cx * s, cy * s, rad * s, -Math.PI * 0.9, -Math.PI * 0.1)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx * s, cy * s, rad * s, Math.PI * 0.1, Math.PI * 0.9)
    ctx.stroke()
    ctx.restore()
  }
  // Rune text burst above head
  const pulse = 0.7 + 0.3 * Math.sin(t * Math.PI * 5)
  ctx.save()
  ctx.font = `${Math.floor(4 * s)}px monospace`
  ctx.fillStyle = `rgba(255,180,60,${pulse})`
  ctx.shadowColor = "#FF8800"
  ctx.shadowBlur = 8
  ctx.fillText("ᚠᚢᚦ", (cx - 5) * s, (cy - 8) * s)
  ctx.restore()
}

const drawFlameCircle: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const cx = 24, cy = 32
  // Ground flame ring (draw first so player is on top)
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + t * Math.PI * 0.5
    const baseR = 16
    const fx = cx + Math.cos(angle) * baseR
    const fy = cy + Math.sin(angle) * baseR * 0.35
    const flameH = 3 + prng(i, t) * 4
    const phase = (t * 3 + i * 0.08) % 1
    const alpha = 0.7 + 0.3 * Math.sin(phase * Math.PI)
    ctx.save()
    ctx.fillStyle = `rgba(255,${80 + Math.floor(prng(i+5, t) * 80)},10,${alpha})`
    ctx.shadowColor = "#FF6600"
    ctx.shadowBlur = 8
    r(ctx, fx - 1, fy - flameH, 2, flameH, `rgba(255,120,10,${alpha})`, s)
    p(ctx, fx, fy - flameH - 1, `rgba(255,220,60,${alpha * 0.8})`, s)
    ctx.restore()
  }
  drawSkillCharacter(ctx, config, s, equipped)
  // Center glow
  ctx.save()
  ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * Math.PI * 4)
  ctx.shadowColor = "#FF6600"
  ctx.shadowBlur = 20
  ctx.strokeStyle = "#FF8800"
  ctx.lineWidth = s
  ctx.beginPath()
  ctx.ellipse(cx * s, cy * s, 16 * s, 6 * s, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

// ---- DASH ----

const drawShadowStep: SkillDrawFn = (ctx, t, config, equipped, s) => {
  // Ghost trail behind, player teleports right
  const phase = t % 1
  // Ghost at original position fading out
  ctx.save()
  ctx.globalAlpha = Math.max(0, 1 - phase * 2)
  drawCharacter(ctx, { ...config, skinBase: "#4455AA", skinShadow: "#223388", skinHighlight: "#6677CC" }, equipped, s, -8 * s, 0)
  ctx.restore()
  // Shadow particles
  for (let i = 0; i < 6; i++) {
    const px2 = lerp(-8, 4, phase) + (prng(i, t) - 0.5) * 6
    const py = 20 + prng(i + 5, t) * 20
    const alpha = (1 - phase) * 0.7
    ctx.save()
    ctx.fillStyle = `rgba(68,100,220,${alpha})`
    ctx.shadowColor = "#4464DC"
    ctx.shadowBlur = 6
    r(ctx, px2, py, 2, 2, `rgba(68,100,220,${alpha})`, s)
    ctx.restore()
  }
  // Player arriving on the right
  const arriveAlpha = phase > 0.5 ? (phase - 0.5) * 2 : 0
  ctx.save()
  ctx.globalAlpha = arriveAlpha
  drawSkillCharacter(ctx, config, s, equipped, 4, 0)
  ctx.restore()
  // Arrival flash ring
  if (phase > 0.5) {
    const fp = (phase - 0.5) * 2
    ctx.save()
    ctx.strokeStyle = `rgba(136,180,255,${1 - fp})`
    ctx.lineWidth = (2 - fp) * s
    ctx.shadowColor = "#88AAFF"
    ctx.shadowBlur = 12
    ctx.beginPath()
    ctx.arc((24 + 4) * s, 28 * s, fp * 14 * s, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
}

const drawValkyrieRush: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const phase = t % 1
  const xOffset = lerp(-6, 8, easeOut(phase))
  // Spectral wings
  const wingSpread = 1 + Math.sin(t * Math.PI * 4) * 0.3
  ctx.save()
  ctx.globalAlpha = 0.6
  ctx.fillStyle = "#AAAACC"
  ctx.shadowColor = "#8888FF"
  ctx.shadowBlur = 10
  // Left wing
  ctx.beginPath()
  ctx.moveTo((24 + xOffset) * s, 22 * s)
  ctx.lineTo((24 + xOffset - 12 * wingSpread) * s, (14 - 4 * wingSpread) * s)
  ctx.lineTo((24 + xOffset - 8 * wingSpread) * s, 22 * s)
  ctx.closePath()
  ctx.fill()
  // Right wing
  ctx.beginPath()
  ctx.moveTo((24 + xOffset) * s, 22 * s)
  ctx.lineTo((24 + xOffset + 12 * wingSpread) * s, (14 - 4 * wingSpread) * s)
  ctx.lineTo((24 + xOffset + 8 * wingSpread) * s, 22 * s)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
  // Trail
  for (let i = 0; i < 5; i++) {
    const trailX = xOffset - i * 2.5
    const alpha = (1 - i / 5) * 0.3
    ctx.save()
    ctx.globalAlpha = alpha * phase
    drawCharacter(ctx, config, equipped, s, trailX * s, 0)
    ctx.restore()
  }
  drawSkillCharacter(ctx, config, s, equipped, xOffset, 0)
  // Speed lines
  for (let i = 0; i < 6; i++) {
    const ly = 14 + i * 4
    const alpha = (1 - phase) * 0.7
    ctx.save()
    ctx.strokeStyle = `rgba(180,180,255,${alpha})`
    ctx.lineWidth = s * 0.8
    ctx.beginPath()
    ctx.moveTo(0, ly * s)
    ctx.lineTo((16 + xOffset) * s, ly * s)
    ctx.stroke()
    ctx.restore()
  }
}

const drawFrostBlink: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const phase = t % 1
  // Freeze shatter at origin
  if (phase < 0.5) {
    const fp = phase * 2
    // Ice shell shattering
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const d = fp * 12
      const alpha = 1 - fp
      const ix = 24 + Math.cos(angle) * d
      const iy = 28 + Math.sin(angle) * d * 0.7
      ctx.save()
      ctx.fillStyle = `rgba(180,240,255,${alpha})`
      ctx.shadowColor = "#AAEEFF"
      ctx.shadowBlur = 6
      r(ctx, ix - 1, iy - 2, 2, 3, `rgba(160,220,255,${alpha})`, s)
      ctx.restore()
    }
    // Ghost player fading
    ctx.save()
    ctx.globalAlpha = 1 - fp
    drawSkillCharacter(ctx, config, s, equipped, 0, 0)
    ctx.restore()
  } else {
    // Materialize on right side in ice burst
    const ap = (phase - 0.5) * 2
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const d = (1 - ap) * 12
      const alpha = ap
      const ix = 30 + Math.cos(angle) * d
      const iy = 28 + Math.sin(angle) * d * 0.7
      ctx.save()
      ctx.fillStyle = `rgba(180,240,255,${alpha})`
      ctx.shadowColor = "#AAEEFF"
      ctx.shadowBlur = 8
      r(ctx, ix - 1, iy - 2, 2, 3, `rgba(160,220,255,${alpha})`, s)
      ctx.restore()
    }
    ctx.save()
    ctx.globalAlpha = ap
    drawSkillCharacter(ctx, config, s, equipped, 6, 0)
    ctx.restore()
  }
  // Ice rift portal line
  const riftAlpha = 0.5 + 0.3 * Math.sin(t * Math.PI * 6)
  ctx.save()
  ctx.strokeStyle = `rgba(136,220,255,${riftAlpha})`
  ctx.lineWidth = 2 * s
  ctx.shadowColor = "#88DCFF"
  ctx.shadowBlur = 14
  ctx.setLineDash([3 * s, 2 * s])
  ctx.beginPath()
  ctx.moveTo(24 * s, 12 * s)
  ctx.lineTo(30 * s, 44 * s)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
}

const drawBerserkerCharge: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const phase = t % 1
  const xOff = lerp(-10, 16, easeOut(phase))
  // Rage aura
  ctx.save()
  ctx.globalAlpha = 0.4
  ctx.fillStyle = "#FF3300"
  ctx.shadowColor = "#FF4400"
  ctx.shadowBlur = 16
  ctx.beginPath()
  ctx.ellipse((24 + xOff) * s, 26 * s, 12 * s, 18 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  // Impact trail enemies hit (target silhouettes)
  for (let i = 0; i < 3; i++) {
    const eTx = 28 + i * 5
    const alpha = Math.max(0, phase * 2 - i * 0.4)
    if (alpha > 0) {
      ctx.save()
      ctx.globalAlpha = alpha * 0.4
      ctx.fillStyle = "#884422"
      r(ctx, eTx, 14, 6, 20, "#884422", s)
      ctx.restore()
    }
  }
  drawSkillCharacter(ctx, config, s, equipped, xOff, 0)
  // Red speed streaks
  for (let i = 0; i < 6; i++) {
    const ly = 16 + i * 4
    const alpha = (1 - phase) * 0.9
    ctx.save()
    ctx.strokeStyle = `rgba(255,60,0,${alpha})`
    ctx.lineWidth = s
    ctx.beginPath()
    ctx.moveTo(0, ly * s)
    ctx.lineTo((14 + xOff) * s, ly * s)
    ctx.stroke()
    ctx.restore()
  }
}

const drawRavenFlight: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const phase = t % 1
  // Burst into ravens at start
  const numRavens = 8
  if (phase < 0.4) {
    // Dispersal
    const dp = phase / 0.4
    ctx.save()
    ctx.globalAlpha = 1 - dp
    drawSkillCharacter(ctx, config, s, equipped, 0, 0)
    ctx.restore()
    for (let i = 0; i < numRavens; i++) {
      const angle = (i / numRavens) * Math.PI * 2
      const d = dp * 20
      const rx = 24 + Math.cos(angle) * d
      const ry = 24 + Math.sin(angle) * d * 0.6
      ctx.save()
      ctx.fillStyle = `rgba(30,30,50,${1 - dp * 0.5})`
      ctx.shadowColor = "#6644AA"
      ctx.shadowBlur = 6
      // tiny raven body
      r(ctx, rx - 1, ry - 1, 3, 2, "#2A2A3A", s)
      p(ctx, rx - 2, ry, "#3A3A4A", s)
      p(ctx, rx + 2, ry, "#3A3A4A", s)
      ctx.restore()
    }
  } else if (phase > 0.7) {
    // Regroup
    const rp = (phase - 0.7) / 0.3
    for (let i = 0; i < numRavens; i++) {
      const angle = (i / numRavens) * Math.PI * 2
      const d = (1 - rp) * 20
      const rx = 28 + Math.cos(angle) * d
      const ry = 24 + Math.sin(angle) * d * 0.6
      ctx.save()
      ctx.fillStyle = `rgba(30,30,50,${1 - rp * 0.5})`
      ctx.shadowColor = "#6644AA"
      ctx.shadowBlur = 6
      r(ctx, rx - 1, ry - 1, 3, 2, "#2A2A3A", s)
      p(ctx, rx - 2, ry, "#3A3A4A", s)
      p(ctx, rx + 2, ry, "#3A3A4A", s)
      ctx.restore()
    }
    ctx.save()
    ctx.globalAlpha = rp
    drawSkillCharacter(ctx, config, s, equipped, 4, 0)
    ctx.restore()
  } else {
    // Fully dispersed — raven flock
    for (let i = 0; i < numRavens; i++) {
      const angle = (i / numRavens) * Math.PI * 2 + t * Math.PI * 2
      const rx = 24 + Math.cos(angle) * 18
      const ry = 24 + Math.sin(angle) * 10
      ctx.save()
      ctx.fillStyle = "#2A2A3A"
      ctx.shadowColor = "#6644AA"
      ctx.shadowBlur = 4
      r(ctx, rx - 1, ry - 1, 3, 2, "#2A2A3A", s)
      p(ctx, rx - 2, ry, "#3A3A4A", s)
      p(ctx, rx + 2, ry, "#3A3A4A", s)
      ctx.restore()
    }
  }
}

// ---- MELEE ----

const drawAxeFlurry: SkillDrawFn = (ctx, t, config, equipped, s) => {
  drawSkillCharacter(ctx, config, s, equipped)
  // 3 rapid axe swings cycling
  const swingIndex = Math.floor(t * 3) % 3
  const swingT = (t * 3) % 1
  const angles = [-0.8, 0, 0.8]
  const baseAngle = angles[swingIndex]
  const swingAngle = lerp(baseAngle - 0.6, baseAngle + 0.6, easeOut(swingT))
  // Axe arc trail
  for (let i = 0; i < 8; i++) {
    const tp2 = Math.max(0, swingT - i * 0.07)
    const ta = lerp(baseAngle - 0.6, baseAngle + 0.6, easeOut(tp2))
    const len = 16
    const ax = 24 + Math.cos(ta - Math.PI / 2) * len
    const ay = 28 + Math.sin(ta - Math.PI / 2) * len * 0.8
    const alpha = (1 - i / 8) * 0.7
    ctx.save()
    ctx.fillStyle = `rgba(220,180,80,${alpha})`
    ctx.shadowColor = "#DDB850"
    ctx.shadowBlur = 4
    r(ctx, ax - 0.5, ay - 0.5, 1, 1, `rgba(220,180,80,${alpha})`, s)
    ctx.restore()
  }
  // Axe head
  const len = 16
  const ax = 24 + Math.cos(swingAngle - Math.PI / 2) * len
  const ay = 28 + Math.sin(swingAngle - Math.PI / 2) * len * 0.8
  ctx.save()
  ctx.fillStyle = "#BBBBBB"
  ctx.shadowColor = "#FFFFFF"
  ctx.shadowBlur = 6
  ctx.save()
  ctx.translate(ax * s, ay * s)
  ctx.rotate(swingAngle)
  ctx.fillRect(-2 * s, -5 * s, 4 * s, 7 * s)
  ctx.fillStyle = "#999999"
  ctx.fillRect(-4 * s, -5 * s, 3 * s, 4 * s)
  ctx.fillRect(1 * s, -5 * s, 3 * s, 4 * s)
  ctx.restore()
  ctx.restore()
  // Impact flash on each new swing
  if (swingT < 0.15) {
    const fp = swingT / 0.15
    ctx.save()
    ctx.fillStyle = `rgba(255,240,100,${1 - fp})`
    ctx.shadowColor = "#FFEE44"
    ctx.shadowBlur = 12
    r(ctx, ax - 2, ay - 2, 4, 4, `rgba(255,240,100,${1 - fp})`, s)
    ctx.restore()
  }
}

const drawSkullSplitter: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const phase = t % 1
  // Overhead charge then slam
  if (phase < 0.4) {
    // Weapon raised overhead
    const cp = phase / 0.4
    const weaponY = lerp(20, 5, easeOut(cp))
    drawSkillCharacter(ctx, config, s, equipped)
    ctx.save()
    ctx.fillStyle = "#CCCCCC"
    ctx.shadowColor = "#FFFFFF"
    ctx.shadowBlur = 8
    // Big two-handed weapon overhead
    r(ctx, 21, weaponY - 8, 6, 14, "#888888", s) // shaft
    r(ctx, 17, weaponY - 10, 14, 5, "#BBBBBB", s) // head
    r(ctx, 16, weaponY - 12, 16, 3, "#CCCCCC", s)
    ctx.restore()
    // Charge glow
    ctx.save()
    ctx.globalAlpha = cp * 0.6
    ctx.fillStyle = "#FFDD44"
    ctx.shadowColor = "#FFCC00"
    ctx.shadowBlur = 16
    r(ctx, 16, weaponY - 13, 16, 14, `rgba(255,210,0,${cp * 0.3})`, s)
    ctx.restore()
  } else {
    // Strike — impact on ground
    const sp = (phase - 0.4) / 0.6
    drawSkillCharacter(ctx, config, s, equipped)
    // Weapon at final position
    r(ctx, 21, 20, 6, 20, "#888888", s)
    r(ctx, 15, 18, 18, 5, "#BBBBBB", s)
    // Impact shockwave on ground
    const ir = sp * 20
    const ia = 1 - sp
    ctx.save()
    ctx.strokeStyle = `rgba(255,200,50,${ia})`
    ctx.lineWidth = (3 - sp * 2) * s
    ctx.shadowColor = "#FFCC00"
    ctx.shadowBlur = 14
    ctx.beginPath()
    ctx.ellipse(24 * s, 43 * s, ir * s, ir * 0.3 * s, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
    // Cracks
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI + prng(i, t) * 0.4
      ctx.save()
      ctx.strokeStyle = `rgba(100,60,10,${ia})`
      ctx.lineWidth = s
      ctx.beginPath()
      ctx.moveTo(24 * s, 43 * s)
      ctx.lineTo((24 + Math.cos(angle) * sp * 15) * s, (43 + Math.sin(angle) * sp * 8) * s)
      ctx.stroke()
      ctx.restore()
    }
  }
}

const drawBladeDance: SkillDrawFn = (ctx, t, config, equipped, s) => {
  // Player spins, blades arc all around
  const spinAngle = t * Math.PI * 4
  drawSkillCharacter(ctx, config, s, equipped)
  const cx = 24, cy = 28
  // 4 blades orbiting
  for (let i = 0; i < 4; i++) {
    const angle = spinAngle + (i / 4) * Math.PI * 2
    const r2 = 14
    const bx = cx + Math.cos(angle) * r2
    const by = cy + Math.sin(angle) * r2 * 0.7
    ctx.save()
    ctx.fillStyle = "#CCCCCC"
    ctx.shadowColor = "#FFFFFF"
    ctx.shadowBlur = 6
    ctx.save()
    ctx.translate(bx * s, by * s)
    ctx.rotate(angle + Math.PI / 4)
    ctx.fillRect(-1 * s, -5 * s, 2 * s, 10 * s)
    ctx.restore()
    // Blade trail
    for (let j = 1; j < 5; j++) {
      const ta = angle - j * 0.2
      const tx = cx + Math.cos(ta) * r2
      const ty = cy + Math.sin(ta) * r2 * 0.7
      ctx.save()
      ctx.globalAlpha = (1 - j / 5) * 0.5
      ctx.fillStyle = "#FF8844"
      ctx.fillRect(tx * s - s, ty * s - s, 2 * s, 2 * s)
      ctx.restore()
    }
    ctx.restore()
  }
  // Damage aura
  ctx.save()
  ctx.globalAlpha = 0.3
  ctx.strokeStyle = "#FF8844"
  ctx.lineWidth = s
  ctx.shadowColor = "#FF8844"
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.ellipse(cx * s, cy * s, 14 * s, 10 * s, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

const drawShieldBash: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const phase = t % 1
  const cx = 24, cy = 28
  drawSkillCharacter(ctx, config, s, equipped)
  // Shield bash motion
  const bashX = phase < 0.3 ? lerp(0, 8, easeOut(phase / 0.3)) : lerp(8, 0, easeOut((phase - 0.3) / 0.3))
  // Shield
  ctx.save()
  ctx.fillStyle = "#8A8AAA"
  ctx.shadowColor = "#AAAACC"
  ctx.shadowBlur = 6
  r(ctx, cx - 2 + bashX, cy - 8, 8, 14, "#7A7A9A", s)
  r(ctx, cx - 1 + bashX, cy - 8, 8, 3, "#9A9ABB", s)
  outline2(ctx, cx - 2 + bashX, cy - 8, 8, 14, "#4A4A6A", s)
  // Shield rim shine
  ctx.fillStyle = "#CCCCEE"
  r(ctx, cx - 1 + bashX, cy - 7, 1, 10, "#CCCCEE", s)
  ctx.restore()
  // Bash impact (at peak)
  if (phase > 0.2 && phase < 0.5) {
    const ip = (phase - 0.2) / 0.3
    const ia = 1 - ip
    ctx.save()
    ctx.strokeStyle = `rgba(180,180,220,${ia})`
    ctx.lineWidth = (2 - ip) * s
    ctx.shadowColor = "#AAAAFF"
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.arc((cx + bashX + 4) * s, cy * s, ip * 10 * s, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
  // Slash follow-up
  if (phase > 0.5) {
    const sp = (phase - 0.5) / 0.5
    const sa = 1 - sp
    ctx.save()
    ctx.strokeStyle = `rgba(220,180,80,${sa})`
    ctx.lineWidth = (2 - sp) * s
    ctx.shadowColor = "#DDC050"
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.moveTo((cx + 6) * s, (cy - 8) * s)
    ctx.lineTo((cx + 6 + sp * 12) * s, (cy + 4 + sp * 4) * s)
    ctx.stroke()
    ctx.restore()
  }
}

function outline2(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, s: number) {
  r(ctx, x, y, w, 1, color, s)
  r(ctx, x, y + h - 1, w, 1, color, s)
  r(ctx, x, y, 1, h, color, s)
  r(ctx, x + w - 1, y, 1, h, color, s)
}

const drawExecutioner: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const phase = t % 1
  drawSkillCharacter(ctx, config, s, equipped)
  // Target silhouette (weakened enemy)
  const enemyAlpha = Math.max(0, 1 - phase * 1.5)
  ctx.save()
  ctx.globalAlpha = enemyAlpha * 0.5
  ctx.fillStyle = "#AA4422"
  r(ctx, 33, 14, 8, 18, "#882200", s)
  ctx.restore()
  // Execution slash — wide arc
  const slashT = (t * 1.5) % 1
  const slashA = lerp(-Math.PI * 0.3, Math.PI * 0.7, easeOut(slashT))
  for (let i = 0; i < 10; i++) {
    const tp2 = Math.max(0, slashT - i * 0.06)
    const ta = lerp(-Math.PI * 0.3, Math.PI * 0.7, easeOut(tp2))
    const len = 18
    const sx = 24 + Math.cos(ta - Math.PI / 2) * len
    const sy = 28 + Math.sin(ta - Math.PI / 2) * len * 0.8
    const alpha = (1 - i / 10) * 0.8
    ctx.save()
    ctx.fillStyle = `rgba(255,60,0,${alpha})`
    ctx.shadowColor = "#FF3300"
    ctx.shadowBlur = 8
    r(ctx, sx - 1, sy - 1, 2, 2, `rgba(255,60,0,${alpha})`, s)
    ctx.restore()
  }
  // Final slash glow
  const fx = 24 + Math.cos(slashA - Math.PI / 2) * 18
  const fy = 28 + Math.sin(slashA - Math.PI / 2) * 18 * 0.8
  ctx.save()
  ctx.fillStyle = "#FF4400"
  ctx.shadowColor = "#FF6600"
  ctx.shadowBlur = 14
  r(ctx, fx - 2, fy - 2, 4, 4, "#FF4400", s)
  ctx.restore()
}

// ---- GROUND SLAM ----

const drawEarthShatter: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const phase = t % 1
  if (phase < 0.35) {
    // Leap up
    const up = easeOut(phase / 0.35)
    const yOff = -16 * Math.sin(up * Math.PI)
    drawSkillCharacter(ctx, config, s, equipped, 0, yOff)
    // Air shimmer
    ctx.save()
    ctx.globalAlpha = up * 0.3
    ctx.fillStyle = "#AA7744"
    r(ctx, 18, 40, 12, 3, `rgba(170,119,68,${up * 0.3})`, s)
    ctx.restore()
  } else {
    // Impact
    const ip = (phase - 0.35) / 0.65
    drawSkillCharacter(ctx, config, s, equipped, 0, 0)
    // Fissure lines
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI + prng(i, 0) * 0.5
      const len = ip * 18
      const ia = 1 - ip * 0.7
      ctx.save()
      ctx.strokeStyle = `rgba(80,50,20,${ia})`
      ctx.lineWidth = (2 - ip) * s
      ctx.beginPath()
      ctx.moveTo(24 * s, 43 * s)
      ctx.lineTo((24 + Math.cos(angle) * len) * s, (43 + Math.sin(angle) * len * 0.5) * s)
      ctx.stroke()
      ctx.restore()
    }
    // Ground ring
    ctx.save()
    ctx.strokeStyle = `rgba(170,100,40,${1 - ip})`
    ctx.lineWidth = (3 - ip * 2) * s
    ctx.shadowColor = "#AA7744"
    ctx.shadowBlur = 12
    ctx.beginPath()
    ctx.ellipse(24 * s, 43 * s, ip * 20 * s, ip * 7 * s, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
    // Debris
    for (let i = 0; i < 8; i++) {
      const angle = prng(i + 20, 0) * Math.PI * 2
      const dx = 24 + Math.cos(angle) * ip * 14 * prng(i, 0)
      const dy = 40 - ip * 8 * prng(i + 3, 0) + ip * ip * 12
      const da = Math.max(0, 1 - ip * 1.2)
      ctx.save()
      ctx.fillStyle = `rgba(120,80,40,${da})`
      r(ctx, dx, dy, 2, 2, `rgba(120,80,40,${da})`, s)
      ctx.restore()
    }
  }
}

const drawMjolnirStrike: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const phase = t % 1
  drawSkillCharacter(ctx, config, s, equipped)
  // Mjolnir descending from sky
  const hammerY = lerp(-8, 20, easeIn(phase))
  const glow = "#FFEE44"
  // Lightning trail
  ctx.save()
  ctx.strokeStyle = `rgba(255,240,80,${(1 - phase) * 0.8})`
  ctx.lineWidth = 2 * s
  ctx.shadowColor = glow
  ctx.shadowBlur = 16
  ctx.beginPath()
  ctx.moveTo(24 * s, 0)
  ctx.lineTo((24 + Math.sin(t * 20) * 2) * s, hammerY * s)
  ctx.stroke()
  ctx.restore()
  // Mjolnir head
  ctx.save()
  ctx.fillStyle = "#AAAAAA"
  ctx.shadowColor = glow
  ctx.shadowBlur = 12 * (1 - phase)
  r(ctx, 20, hammerY - 4, 8, 6, "#AAAAAA", s)
  r(ctx, 21, hammerY - 6, 6, 3, "#CCCCCC", s)
  r(ctx, 23, hammerY, 2, 8, "#888888", s)
  ctx.restore()
  // Ground impact ring
  if (phase > 0.6) {
    const ip = (phase - 0.6) / 0.4
    ctx.save()
    ctx.strokeStyle = `rgba(255,220,50,${1 - ip})`
    ctx.lineWidth = (4 - ip * 3) * s
    ctx.shadowColor = glow
    ctx.shadowBlur = 18
    ctx.beginPath()
    ctx.ellipse(24 * s, 43 * s, ip * 20 * s, ip * 6 * s, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
}

const drawFrostQuake: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const cx = 24, cy = 43
  drawSkillCharacter(ctx, config, s, equipped)
  // Ice spike columns erupting in expanding rings
  for (let ring = 0; ring < 3; ring++) {
    const rPhase = (t * 1.5 + ring * 0.25) % 1
    const rad = (ring + 1) * 7 * rPhase
    const numSpikes = 4 + ring * 2
    for (let i = 0; i < numSpikes; i++) {
      const angle = (i / numSpikes) * Math.PI * 2
      const sx2 = cx + Math.cos(angle) * rad
      const sy2 = cy + Math.sin(angle) * rad * 0.4
      const spikeH = 5 * (1 - rPhase)
      const alpha = 1 - rPhase
      ctx.save()
      ctx.fillStyle = `rgba(160,220,255,${alpha})`
      ctx.shadowColor = "#88DCFF"
      ctx.shadowBlur = 6
      r(ctx, sx2 - 1, sy2 - spikeH, 2, spikeH, `rgba(160,220,255,${alpha})`, s)
      p(ctx, sx2, sy2 - spikeH - 1, `rgba(220,245,255,${alpha})`, s)
      ctx.restore()
    }
  }
}

const drawSeismicRoar: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const phase = t % 1
  drawSkillCharacter(ctx, config, s, equipped)
  // Ground ripple waves
  for (let i = 0; i < 4; i++) {
    const wavePh = (t * 1.2 + i * 0.25) % 1
    const waveR = wavePh * 22
    const alpha = (1 - wavePh) * 0.8
    ctx.save()
    ctx.strokeStyle = `rgba(160,120,60,${alpha})`
    ctx.lineWidth = (2 - wavePh) * s
    ctx.beginPath()
    ctx.ellipse(24 * s, 43 * s, waveR * s, waveR * 0.35 * s, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
  // Stomp dust
  for (let i = 0; i < 6; i++) {
    const dp = (t * 2 + i * 0.16) % 1
    const dx = 24 + (prng(i, 0) - 0.5) * 20
    const dy = 42 - dp * 6
    const da = (1 - dp) * 0.6
    ctx.save()
    ctx.fillStyle = `rgba(180,140,80,${da})`
    r(ctx, dx, dy, 3, 2, `rgba(180,140,80,${da})`, s)
    ctx.restore()
  }
  // Shockwave screen shake effect (subtle)
  const shake = Math.sin(t * Math.PI * 12) * (1 - phase) * 0.5
  ctx.save()
  ctx.strokeStyle = `rgba(200,160,80,${0.4 + shake * 0.3})`
  ctx.lineWidth = s
  ctx.setLineDash([2 * s, 3 * s])
  ctx.beginPath()
  ctx.moveTo(0, 42 * s)
  ctx.lineTo(48 * s, 42 * s)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
}

const drawRagnarokDrop: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const phase = t % 1
  const yOff = phase < 0.5
    ? lerp(0, -48, easeIn(phase / 0.5))
    : lerp(-48, 0, easeOut((phase - 0.5) / 0.5))
  if (phase > 0.5) {
    // Apocalyptic impact
    const ip = (phase - 0.5) / 0.5
    // Huge shockwave
    ctx.save()
    ctx.strokeStyle = `rgba(255,80,0,${1 - ip})`
    ctx.lineWidth = (6 - ip * 5) * s
    ctx.shadowColor = "#FF5500"
    ctx.shadowBlur = 24
    ctx.beginPath()
    ctx.ellipse(24 * s, 43 * s, ip * 22 * s, ip * 8 * s, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
    // Explosion sparks
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + prng(i, 0)
      const d = ip * 20
      const ex = 24 + Math.cos(angle) * d
      const ey = 40 + Math.sin(angle) * d * 0.4
      const ea = Math.max(0, 1 - ip * 1.3)
      ctx.save()
      ctx.fillStyle = `rgba(255,${100 + i * 10},0,${ea})`
      ctx.shadowColor = "#FF6600"
      ctx.shadowBlur = 8
      r(ctx, ex - 1, ey - 1, 2, 2, `rgba(255,${100 + i * 10},0,${ea})`, s)
      ctx.restore()
    }
  }
  drawSkillCharacter(ctx, config, s, equipped, 0, yOff)
  // Red aura while falling
  ctx.save()
  ctx.globalAlpha = 0.5
  ctx.fillStyle = "#FF4400"
  ctx.shadowColor = "#FF4400"
  ctx.shadowBlur = 20
  ctx.beginPath()
  ctx.ellipse(24 * s, (30 + yOff) * s, 10 * s, 14 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

// ---- BEAM ----

const drawNiflheimBeam: SkillDrawFn = (ctx, t, config, equipped, s) => {
  // Character in channeling pose with arms forward
  const recoil = Math.sin(t * Math.PI * 4) * 0.5
  drawSkillCharacter(ctx, config, s, equipped, -recoil, 0)
  const pulse = 0.7 + 0.3 * Math.sin(t * Math.PI * 8)
  const cx = 24, cy = 26
  // Charging orb at hands — pulsing with frost energy
  ctx.save()
  const orbR = 3 + pulse * 1.5
  const orbGrad = ctx.createRadialGradient(20 * s, cy * s, 0, 20 * s, cy * s, orbR * s)
  orbGrad.addColorStop(0, "rgba(255,255,255,1)")
  orbGrad.addColorStop(0.3, "rgba(200,240,255,0.95)")
  orbGrad.addColorStop(0.7, "rgba(140,210,255,0.7)")
  orbGrad.addColorStop(1, "rgba(100,180,240,0)")
  ctx.fillStyle = orbGrad
  ctx.shadowColor = "#88DCFF"
  ctx.shadowBlur = 24 * pulse
  ctx.beginPath()
  ctx.arc(20 * s, cy * s, orbR * s, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  // Main beam — triple layered with outer frost, mid beam, inner white core
  const beamStartX = 22
  const beamLen = 26
  // Outer frost haze
  ctx.save()
  const outerGrad = ctx.createLinearGradient(beamStartX * s, 0, 48 * s, 0)
  outerGrad.addColorStop(0, "rgba(100,180,240,0.6)")
  outerGrad.addColorStop(0.5, "rgba(140,210,255,0.4)")
  outerGrad.addColorStop(1, "rgba(100,180,240,0)")
  ctx.fillStyle = outerGrad
  ctx.shadowColor = "#60B0F0"
  ctx.shadowBlur = 20 * pulse
  ctx.fillRect(beamStartX * s, (cy - 4) * s, beamLen * s, 8 * s)
  ctx.restore()
  // Mid beam
  ctx.save()
  const midGrad = ctx.createLinearGradient(beamStartX * s, 0, 48 * s, 0)
  midGrad.addColorStop(0, "rgba(180,240,255,0.95)")
  midGrad.addColorStop(0.6, "rgba(220,255,255,0.8)")
  midGrad.addColorStop(1, "rgba(180,240,255,0.1)")
  ctx.fillStyle = midGrad
  ctx.shadowColor = "#88DCFF"
  ctx.shadowBlur = 14 * pulse
  ctx.fillRect(beamStartX * s, (cy - 2) * s, beamLen * s, 4 * s)
  ctx.restore()
  // Inner white core
  ctx.save()
  const coreGrad = ctx.createLinearGradient(beamStartX * s, 0, 44 * s, 0)
  coreGrad.addColorStop(0, "rgba(255,255,255,1)")
  coreGrad.addColorStop(0.4, "rgba(240,255,255,0.9)")
  coreGrad.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = coreGrad
  ctx.shadowColor = "#FFFFFF"
  ctx.shadowBlur = 10
  ctx.fillRect(beamStartX * s, (cy - 0.5) * s, (beamLen - 4) * s, 1 * s)
  ctx.restore()
  // Frost crystallization particles along beam path
  for (let i = 0; i < 12; i++) {
    const bx = beamStartX + prng(i, t * 5) * beamLen
    const by = cy + (prng(i + 5, t * 4) - 0.5) * 7
    const ba = prng(i + 8, t * 3) * 0.8 + 0.2
    const sz = prng(i + 15, 0) > 0.5 ? 2 : 1
    ctx.save()
    ctx.fillStyle = `rgba(200,240,255,${ba})`
    ctx.shadowColor = "#AAEEFF"
    ctx.shadowBlur = 6
    r(ctx, bx, by, sz, sz, `rgba(200,240,255,${ba})`, s)
    ctx.restore()
  }
  // Ice crystal shards forming at beam edges
  for (let i = 0; i < 5; i++) {
    const phase = (t * 3 + i * 0.2) % 1
    const shardX = beamStartX + 4 + phase * (beamLen - 6)
    const shardDir = i % 2 === 0 ? -1 : 1
    const shardY = cy + shardDir * (2 + phase * 3)
    const alpha = Math.sin(phase * Math.PI) * 0.7
    ctx.save()
    ctx.fillStyle = `rgba(180,230,255,${alpha})`
    ctx.shadowColor = "#88CCFF"
    ctx.shadowBlur = 4
    r(ctx, shardX, shardY, 1, 2, `rgba(180,230,255,${alpha})`, s)
    ctx.restore()
  }
  // Ground frost accumulation beneath beam
  ctx.save()
  ctx.globalAlpha = 0.3 * pulse
  for (let i = 0; i < 8; i++) {
    const gx = beamStartX + 2 + i * 3
    const gy = 44 + prng(i + 20, 0) * 2
    r(ctx, gx, gy, 2, 1, "#B0E0FF", s)
  }
  ctx.restore()
}

const drawLightningArc: SkillDrawFn = (ctx, t, config, equipped, s) => {
  // Character with electric aura — channeling lightning overhead
  const shake = Math.sin(t * Math.PI * 12) * 0.4
  drawSkillCharacter(ctx, config, s, equipped, shake, 0)
  const cx = 24, cy = 26
  // Electric aura around character
  ctx.save()
  const auraPulse = 0.4 + 0.3 * Math.sin(t * Math.PI * 6)
  ctx.globalAlpha = auraPulse
  ctx.strokeStyle = "#FFFF44"
  ctx.lineWidth = s
  ctx.shadowColor = "#FFFF00"
  ctx.shadowBlur = 18
  ctx.beginPath()
  ctx.ellipse(cx * s, cy * s, 12 * s, 16 * s, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
  // Main lightning bolt — thick, branching, to primary target
  const targets = [
    { x: 46, y: 16, color: "#FFFF80", width: 2.5, segments: 8 },
    { x: 44, y: 38, color: "#CCDDFF", width: 1.8, segments: 7 },
    { x: 40, y: 8, color: "#AAFFEE", width: 1.2, segments: 5 },
  ]
  targets.forEach((tgt, ti) => {
    const points: [number, number][] = [[cx + 4, cy]]
    for (let i = 1; i < tgt.segments; i++) {
      const fx = cx + 4 + (tgt.x - cx - 4) * (i / tgt.segments)
      const fy = cy + (tgt.y - cy) * (i / tgt.segments)
      const jitter = (prng(i + ti * 17, t * 8) - 0.5) * 8
      points.push([fx + jitter, fy + jitter * 0.4])
    }
    points.push([tgt.x, tgt.y])
    // Outer glow stroke
    ctx.save()
    ctx.strokeStyle = `rgba(255,255,100,0.3)`
    ctx.lineWidth = (tgt.width + 2) * s
    ctx.shadowColor = tgt.color
    ctx.shadowBlur = 20
    ctx.beginPath()
    ctx.moveTo(points[0][0] * s, points[0][1] * s)
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0] * s, points[i][1] * s)
    ctx.stroke()
    ctx.restore()
    // Inner bright bolt
    ctx.save()
    ctx.strokeStyle = tgt.color
    ctx.lineWidth = tgt.width * s
    ctx.shadowColor = "#FFFFFF"
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.moveTo(points[0][0] * s, points[0][1] * s)
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0] * s, points[i][1] * s)
    ctx.stroke()
    ctx.restore()
    // White core line
    ctx.save()
    ctx.strokeStyle = "#FFFFFF"
    ctx.lineWidth = 0.5 * s
    ctx.beginPath()
    ctx.moveTo(points[0][0] * s, points[0][1] * s)
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0] * s, points[i][1] * s)
    ctx.stroke()
    ctx.restore()
    // Branch from midpoint
    if (ti === 0) {
      const midIdx = Math.floor(points.length / 2)
      const mp = points[midIdx]
      const bx = mp[0] + (prng(50, t * 6) - 0.5) * 10
      const by = mp[1] + (prng(51, t * 6) - 0.5) * 10
      ctx.save()
      ctx.strokeStyle = "#FFFF80"
      ctx.lineWidth = s
      ctx.shadowColor = "#FFFF44"
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.moveTo(mp[0] * s, mp[1] * s)
      ctx.lineTo(bx * s, by * s)
      ctx.stroke()
      ctx.restore()
    }
    // Impact explosion at target
    const impactPulse = 0.6 + 0.4 * Math.sin(t * Math.PI * 10 + ti * 2)
    ctx.save()
    ctx.fillStyle = `rgba(255,255,150,${impactPulse})`
    ctx.shadowColor = tgt.color
    ctx.shadowBlur = 16 * impactPulse
    ctx.beginPath()
    ctx.arc(tgt.x * s, tgt.y * s, (3 + impactPulse) * s, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    // Impact sparks
    for (let sp = 0; sp < 4; sp++) {
      const angle = (sp / 4) * Math.PI * 2 + t * 6
      const dist = 2 + prng(sp + ti * 10, t * 3) * 4
      const spx = tgt.x + Math.cos(angle) * dist
      const spy = tgt.y + Math.sin(angle) * dist
      p(ctx, spx, spy, `rgba(255,255,200,${0.8 - sp * 0.15})`, s)
    }
  })
  // Small ambient sparks near character
  for (let i = 0; i < 6; i++) {
    const phase = (t * 4 + i / 6) % 1
    const sx = cx + (prng(i + 30, t * 2) - 0.5) * 16
    const sy = cy - 10 + prng(i + 35, t * 2) * 20
    const alpha = (1 - phase) * 0.8
    p(ctx, sx, sy, `rgba(255,255,100,${alpha})`, s)
  }
}

const drawSoulDrain: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const cx = 24, cy = 26
  const pulse = 0.6 + 0.4 * Math.sin(t * Math.PI * 6)
  // Dark channeling aura around character
  ctx.save()
  ctx.globalAlpha = 0.35 * pulse
  const darkAura = ctx.createRadialGradient(cx * s, cy * s, 2 * s, cx * s, cy * s, 16 * s)
  darkAura.addColorStop(0, "rgba(80,0,120,0.8)")
  darkAura.addColorStop(0.5, "rgba(60,0,100,0.4)")
  darkAura.addColorStop(1, "rgba(40,0,80,0)")
  ctx.fillStyle = darkAura
  ctx.beginPath()
  ctx.ellipse(cx * s, cy * s, 16 * s, 18 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  // Character with arm extended
  drawSkillCharacter(ctx, config, s, equipped)
  // Target victim — dark silhouette writhing
  const victimShake = Math.sin(t * Math.PI * 10) * 0.5
  ctx.save()
  ctx.globalAlpha = 0.7
  // Victim body
  r(ctx, 40 + victimShake, 20, 5, 12, "#442233", s)
  r(ctx, 41 + victimShake, 16, 3, 5, "#553344", s) // head
  r(ctx, 38 + victimShake, 22, 2, 8, "#332233", s) // left arm
  r(ctx, 45 + victimShake, 22, 2, 8, "#332233", s) // right arm
  r(ctx, 40 + victimShake, 32, 2, 8, "#332233", s) // legs
  r(ctx, 43 + victimShake, 32, 2, 8, "#332233", s)
  ctx.restore()
  // Victim's pain aura (red)
  ctx.save()
  ctx.globalAlpha = 0.3 * pulse
  ctx.fillStyle = "#FF2244"
  ctx.shadowColor = "#FF0033"
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.ellipse(42 * s, 26 * s, 5 * s, 8 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  // Dark energy tether — sinuous dark beam connecting player to target
  ctx.save()
  const tethGrad = ctx.createLinearGradient((cx + 4) * s, 0, 40 * s, 0)
  tethGrad.addColorStop(0, "rgba(120,30,180,0.9)")
  tethGrad.addColorStop(0.5, "rgba(80,10,140,0.7)")
  tethGrad.addColorStop(1, "rgba(100,20,160,0.9)")
  ctx.strokeStyle = tethGrad
  ctx.lineWidth = 3 * s * pulse
  ctx.shadowColor = "#8822CC"
  ctx.shadowBlur = 16
  ctx.beginPath()
  ctx.moveTo((cx + 4) * s, cy * s)
  const wave1 = Math.sin(t * Math.PI * 4) * 3
  const wave2 = Math.sin(t * Math.PI * 4 + 1) * 3
  ctx.bezierCurveTo(
    32 * s, (cy + wave1) * s,
    36 * s, (cy + wave2) * s,
    40 * s, 26 * s
  )
  ctx.stroke()
  ctx.restore()
  // Inner tether core
  ctx.save()
  ctx.strokeStyle = "rgba(200,100,255,0.8)"
  ctx.lineWidth = s
  ctx.shadowColor = "#CC88FF"
  ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.moveTo((cx + 4) * s, cy * s)
  ctx.bezierCurveTo(32 * s, (cy + wave1) * s, 36 * s, (cy + wave2) * s, 40 * s, 26 * s)
  ctx.stroke()
  ctx.restore()
  // Soul wisps flowing from victim back to player — green/purple
  for (let i = 0; i < 8; i++) {
    const phase = (t * 1.8 + i / 8) % 1
    const wpx = lerp(42, cx, easeOut(phase))
    const wpy = cy + (prng(i, 0) - 0.5) * 10 + Math.sin(phase * Math.PI * 3 + i) * 3
    const alpha = Math.sin(phase * Math.PI)
    const sz = 1 + prng(i + 20, 0)
    // Soul color transitions from red (victim pain) to green (heal)
    const rr = Math.floor(lerp(255, 60, phase))
    const gg = Math.floor(lerp(60, 255, phase))
    const bb = Math.floor(lerp(100, 120, phase))
    ctx.save()
    ctx.fillStyle = `rgba(${rr},${gg},${bb},${alpha})`
    ctx.shadowColor = `rgba(${rr},${gg},${bb},0.8)`
    ctx.shadowBlur = 8
    r(ctx, wpx - sz / 2, wpy - sz / 2, sz, sz, `rgba(${rr},${gg},${bb},${alpha})`, s)
    ctx.restore()
  }
  // Heal glow on player — green energy absorbing
  ctx.save()
  ctx.globalAlpha = 0.25 * pulse
  const healGrad = ctx.createRadialGradient(cx * s, cy * s, 0, cx * s, cy * s, 12 * s)
  healGrad.addColorStop(0, "rgba(68,255,136,0.6)")
  healGrad.addColorStop(0.5, "rgba(68,255,136,0.3)")
  healGrad.addColorStop(1, "rgba(68,255,136,0)")
  ctx.fillStyle = healGrad
  ctx.shadowColor = "#44FF88"
  ctx.shadowBlur = 20
  ctx.beginPath()
  ctx.ellipse(cx * s, cy * s, 12 * s, 14 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  // Rising + signs near player (health regeneration)
  for (let i = 0; i < 3; i++) {
    const phase = (t * 2 + i * 0.33) % 1
    const hx = cx - 4 + i * 4
    const hy = cy - 4 - phase * 10
    const alpha = (1 - phase) * 0.7
    ctx.save()
    ctx.fillStyle = `rgba(68,255,136,${alpha})`
    ctx.shadowColor = "#44FF88"
    ctx.shadowBlur = 4
    r(ctx, hx, hy, 3, 1, `rgba(68,255,136,${alpha})`, s)
    r(ctx, hx + 1, hy - 1, 1, 3, `rgba(68,255,136,${alpha})`, s)
    ctx.restore()
  }
}

const drawRunicRay: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const cx = 24, cy = 26
  const pulse = 0.8 + 0.2 * Math.sin(t * Math.PI * 10)
  // Character channeling with rune circles
  drawSkillCharacter(ctx, config, s, equipped)
  // Orbiting rune circle around character's hands
  ctx.save()
  ctx.strokeStyle = `rgba(74,240,255,${0.5 * pulse})`
  ctx.lineWidth = s
  ctx.shadowColor = "#4AF0FF"
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.arc(22 * s, cy * s, 5 * s, t * Math.PI * 4, t * Math.PI * 4 + Math.PI * 1.5)
  ctx.stroke()
  ctx.restore()
  // Concentrated runic beam — multi-layered
  // Outer glow
  ctx.save()
  const outerGrad = ctx.createLinearGradient(24 * s, 0, 48 * s, 0)
  outerGrad.addColorStop(0, "rgba(74,240,255,0.5)")
  outerGrad.addColorStop(0.5, "rgba(74,240,255,0.3)")
  outerGrad.addColorStop(1, "rgba(74,240,255,0)")
  ctx.fillStyle = outerGrad
  ctx.shadowColor = "#4AF0FF"
  ctx.shadowBlur = 24 * pulse
  ctx.fillRect(24 * s, (cy - 3) * s, 24 * s, 6 * s)
  ctx.restore()
  // Mid beam
  ctx.save()
  const midGrad = ctx.createLinearGradient(24 * s, 0, 48 * s, 0)
  midGrad.addColorStop(0, "rgba(100,255,255,0.95)")
  midGrad.addColorStop(0.6, "rgba(74,240,255,0.8)")
  midGrad.addColorStop(1, "rgba(74,240,255,0.2)")
  ctx.fillStyle = midGrad
  ctx.shadowColor = "#4AF0FF"
  ctx.shadowBlur = 16 * pulse
  ctx.fillRect(24 * s, (cy - 1.5) * s, 24 * s, 3 * s)
  ctx.restore()
  // Core
  ctx.save()
  ctx.fillStyle = `rgba(220,255,255,${pulse})`
  ctx.shadowColor = "#FFFFFF"
  ctx.shadowBlur = 8
  ctx.fillRect(24 * s, (cy - 0.3) * s, 20 * s, 0.6 * s)
  ctx.restore()
  // Floating Norse runes traveling along beam — multiple rune types
  const runeChars = ["\u16B1", "\u16A0", "\u16A6", "\u16B7", "\u16C1", "\u16C7"]
  for (let i = 0; i < 7; i++) {
    const phase = (t * 2.5 + i * 0.14) % 1
    const rx = 26 + phase * 20
    const ry = cy + (prng(i, 0) - 0.5) * 6
    const alpha = Math.sin(phase * Math.PI) * 0.9
    const rotation = t * 2 + i
    const runeChar = runeChars[i % runeChars.length]
    ctx.save()
    ctx.translate(rx * s, ry * s)
    ctx.rotate(rotation)
    ctx.font = `${Math.floor(3.5 * s)}px monospace`
    ctx.fillStyle = `rgba(220,255,255,${alpha})`
    ctx.shadowColor = "#4AF0FF"
    ctx.shadowBlur = 8
    ctx.textAlign = "center"
    ctx.fillText(runeChar, 0, 0)
    ctx.restore()
  }
  // Impact zone — runic explosion at beam end
  const impactPulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 6)
  ctx.save()
  ctx.fillStyle = `rgba(74,240,255,${impactPulse * 0.6})`
  ctx.shadowColor = "#4AF0FF"
  ctx.shadowBlur = 16
  ctx.beginPath()
  ctx.arc(47 * s, cy * s, (3 + impactPulse * 2) * s, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  // Small rune particles scattering at impact
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + t * 3
    const dist = 2 + impactPulse * 3
    const px2 = 47 + Math.cos(angle) * dist
    const py = cy + Math.sin(angle) * dist
    p(ctx, px2, py, `rgba(200,255,255,${0.7 - i * 0.1})`, s)
  }
}

const drawBifrostBlast: SkillDrawFn = (ctx, t, config, equipped, s) => {
  drawSkillCharacter(ctx, config, s, equipped)
  const cy = 26
  // Rainbow beam — multiple colored layers
  const colors = ["#FF4444", "#FF8844", "#FFEE44", "#44FF88", "#4488FF", "#AA44FF"]
  const pulse = 0.8 + 0.2 * Math.sin(t * Math.PI * 8)
  for (let i = 0; i < colors.length; i++) {
    const yOff = (i - colors.length / 2) * 1.2
    ctx.save()
    ctx.globalAlpha = 0.7 * pulse
    ctx.fillStyle = colors[i]
    ctx.shadowColor = colors[i]
    ctx.shadowBlur = 10
    ctx.fillRect(26 * s, (cy + yOff - 0.8) * s, 22 * s, 1.6 * s)
    ctx.restore()
  }
  // Bright white core
  ctx.save()
  ctx.globalAlpha = pulse
  ctx.fillStyle = "#FFFFFF"
  ctx.shadowColor = "#FFFFFF"
  ctx.shadowBlur = 20
  ctx.fillRect(26 * s, (cy - 0.5) * s, 22 * s, 1 * s)
  ctx.restore()
}

// ---- SUMMON ----

const drawWolfPack: SkillDrawFn = (ctx, t, config, equipped, s) => {
  drawSkillCharacter(ctx, config, s, equipped)
  // 3 spectral wolves emerging
  const wolves = [
    { x: -12, y: 2, delay: 0 },
    { x: 16, y: 4, delay: 0.33 },
    { x: 4, y: 8, delay: 0.66 },
  ]
  wolves.forEach((wolf, i) => {
    const phase = (t * 1.2 + wolf.delay) % 1
    const emerge = easeOut(Math.min(1, phase * 2))
    const alpha = emerge * 0.85
    const wx = 24 + wolf.x
    const wy = 28 + wolf.y
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = "#6677BB"
    ctx.shadowColor = "#4455AA"
    ctx.shadowBlur = 10
    // Wolf body
    r(ctx, wx - 5, wy - 2, 8, 4, "#5566AA", s)
    r(ctx, wx + 2, wy - 4, 3, 4, "#6677BB", s) // head
    p(ctx, wx + 4, wy - 4, "#AABBFF", s) // eye
    r(ctx, wx - 5, wy + 2, 2, 3, "#445599", s) // back legs
    r(ctx, wx - 3, wy + 2, 2, 3, "#445599", s)
    r(ctx, wx + 1, wy + 1, 2, 3, "#445599", s) // front legs
    r(ctx, wx - 7, wy, 3, 2, "#5566AA", s) // tail
    ctx.restore()
    // Phase particles
    for (let j = 0; j < 3; j++) {
      const pp = (phase * 2 + j * 0.3) % 1
      const px2 = wx + (prng(j + i * 3, t) - 0.5) * 12
      const py = wy + prng(j + i * 3 + 5, t) * 8
      ctx.save()
      ctx.fillStyle = `rgba(100,120,220,${(1 - pp) * 0.7})`
      r(ctx, px2, py, 1, 1, `rgba(100,120,220,${(1 - pp) * 0.7})`, s)
      ctx.restore()
    }
  })
}

const drawRuneTotem: SkillDrawFn = (ctx, t, config, equipped, s) => {
  drawSkillCharacter(ctx, config, s, equipped)
  // Totem being planted to the right
  const tx2 = 36, ty = 25
  const appear = Math.min(1, t * 3)
  ctx.save()
  ctx.globalAlpha = appear
  // Totem pole
  r(ctx, tx2 - 2, ty, 4, 18, "#8B6914", s)
  r(ctx, tx2 - 3, ty, 6, 4, "#6B4904", s) // base
  r(ctx, tx2 - 2, ty, 6, 3, "#9B7924", s) // top
  // Rune faces
  p(ctx, tx2 - 1, ty + 5, "#FF4444", s)
  p(ctx, tx2 + 1, ty + 5, "#FF4444", s)
  p(ctx, tx2, ty + 7, "#FF4444", s)
  p(ctx, tx2 - 1, ty + 10, "#4AF0FF", s)
  p(ctx, tx2 + 1, ty + 10, "#4AF0FF", s)
  ctx.restore()
  // Pulsing rune aura
  const auraPulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 4)
  ctx.save()
  ctx.globalAlpha = appear * auraPulse * 0.7
  ctx.strokeStyle = "#4AF0FF"
  ctx.lineWidth = s
  ctx.shadowColor = "#4AF0FF"
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.arc(tx2 * s, (ty + 9) * s, (4 + auraPulse * 3) * s, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

const drawSummonEinherjar: SkillDrawFn = (ctx, t, config, equipped, s) => {
  drawSkillCharacter(ctx, config, s, equipped)
  const phase = t % 1
  // Portal opening to the right
  const portalH = Math.min(20, phase * 60)
  const px2 = 34
  // Portal glow
  ctx.save()
  ctx.strokeStyle = "#FFEE88"
  ctx.lineWidth = 2 * s
  ctx.shadowColor = "#FFCC44"
  ctx.shadowBlur = 14
  ctx.beginPath()
  ctx.ellipse(px2 * s, 30 * s, 5 * s, portalH * 0.5 * s, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
  // Inner glow
  const gGrad = ctx.createRadialGradient(px2 * s, 30 * s, 0, px2 * s, 30 * s, 5 * s)
  gGrad.addColorStop(0, "rgba(255,255,200,0.8)")
  gGrad.addColorStop(1, "rgba(200,180,60,0)")
  ctx.save()
  ctx.fillStyle = gGrad
  ctx.beginPath()
  ctx.ellipse(px2 * s, 30 * s, 5 * s, portalH * 0.5 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  // Einherjar emerging
  if (phase > 0.4) {
    const ep = (phase - 0.4) / 0.6
    ctx.save()
    ctx.globalAlpha = ep * 0.9
    ctx.fillStyle = "#CCCCAA"
    ctx.shadowColor = "#FFEE88"
    ctx.shadowBlur = 10
    // Silhouette of warrior
    r(ctx, px2 - 2, 18, 4, 10, "#AAAA88", s) // torso
    r(ctx, px2 - 1, 14, 2, 5, "#BBBBAA", s) // head
    r(ctx, px2 - 4, 20, 2, 8, "#AAAA88", s) // left arm
    r(ctx, px2 + 2, 20, 2, 8, "#AAAA88", s) // right arm
    r(ctx, px2 - 3, 28, 2, 8, "#999988", s) // legs
    r(ctx, px2 + 1, 28, 2, 8, "#999988", s)
    ctx.restore()
  }
}

const drawIceWall: SkillDrawFn = (ctx, t, config, equipped, s) => {
  drawSkillCharacter(ctx, config, s, equipped)
  const rise = Math.min(1, t * 2.5)
  // Ice wall rising on right
  const wallX = 32, wallH = 24
  const visH = wallH * rise
  // Shadow
  ctx.save()
  ctx.fillStyle = "rgba(0,0,0,0.2)"
  r(ctx, wallX + 1, (46 - visH) + 2, 10, visH, "rgba(0,0,0,0.2)", s)
  ctx.restore()
  // Wall blocks
  for (let row = 0; row < 4; row++) {
    const blockY = 46 - (row + 1) * 6 * rise
    if (blockY > 46) continue
    const shade = row === 3 ? "#DDEEFF" : (row === 0 ? "#88BBDD" : "#AACCEE")
    r(ctx, wallX, blockY, 10, 5, shade, s)
    outline2(ctx, wallX, blockY, 10, 5, "#446688", s)
    // Ice texture
    p(ctx, wallX + 2, blockY + 1, "#CCEEFF", s)
    p(ctx, wallX + 6, blockY + 2, "#CCEEFF", s)
  }
  // Ice shimmer
  ctx.save()
  ctx.globalAlpha = 0.4 * (0.6 + 0.4 * Math.sin(t * Math.PI * 6))
  ctx.fillStyle = "#88CCFF"
  ctx.shadowColor = "#88CCFF"
  ctx.shadowBlur = 12
  r(ctx, wallX + 1, 46 - visH * 24, 8, 1, "#88CCFF", s)
  ctx.restore()
}

const drawRavenScouts: SkillDrawFn = (ctx, t, config, equipped, s) => {
  drawSkillCharacter(ctx, config, s, equipped)
  // Huginn and Muninn — two ravens flying in figure-8 paths
  const ravens = [
    { tOff: 0, col: "#3A2A5A" },
    { tOff: 0.5, col: "#2A1A4A" },
  ]
  ravens.forEach((raven, _i) => {
    const rt = (t + raven.tOff) % 1
    // Lissajous / figure-8 orbit
    const rx = 24 + Math.sin(rt * Math.PI * 2) * 16
    const ry = 18 + Math.sin(rt * Math.PI * 4) * 8
    const wingFlap = Math.sin(rt * Math.PI * 8) * 2
    ctx.save()
    ctx.fillStyle = raven.col
    ctx.shadowColor = "#6644AA"
    ctx.shadowBlur = 8
    r(ctx, rx - 2, ry - 1, 4, 2, raven.col, s)
    // Wings
    r(ctx, rx - 4, ry - 1 - wingFlap, 3, 2, darken(raven.col, 10), s)
    r(ctx, rx + 1, ry - 1 + wingFlap, 3, 2, darken(raven.col, 10), s)
    p(ctx, rx + 1, ry, "#AACCFF", s) // eye
    ctx.restore()
    // Trail
    for (let j = 1; j < 6; j++) {
      const trt = (rt - j * 0.04 + 1) % 1
      const trx = 24 + Math.sin(trt * Math.PI * 2) * 16
      const tryP = 18 + Math.sin(trt * Math.PI * 4) * 8
      ctx.save()
      ctx.globalAlpha = (1 - j / 6) * 0.3
      ctx.fillStyle = "#6644AA"
      r(ctx, trx - 1, tryP - 1, 2, 2, "#6644AA", s)
      ctx.restore()
    }
  })
}

// ---- BUFF ----

const drawBerserkerRage: SkillDrawFn = (ctx, t, config, equipped, s) => {
  // Red rage aura, arms spread, veins glowing
  const pulse = 0.7 + 0.3 * Math.sin(t * Math.PI * 6)
  // Outer rage corona
  ctx.save()
  ctx.globalAlpha = 0.4 * pulse
  ctx.fillStyle = "#FF2200"
  ctx.shadowColor = "#FF4400"
  ctx.shadowBlur = 24
  ctx.beginPath()
  ctx.ellipse(24 * s, 28 * s, 18 * s, 22 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  // Flame wisps rising
  for (let i = 0; i < 8; i++) {
    const phase = (t * 2 + i / 8) % 1
    const fx = 24 + (prng(i, 0) - 0.5) * 20
    const fy = 42 - phase * 24
    const fa = (1 - phase) * 0.8
    ctx.save()
    ctx.fillStyle = `rgba(255,${60 + Math.floor(prng(i + 5, 0) * 80)},0,${fa})`
    ctx.shadowColor = "#FF4400"
    ctx.shadowBlur = 6
    r(ctx, fx, fy, 2, 3, `rgba(255,80,0,${fa})`, s)
    p(ctx, fx + 1, fy - 1, `rgba(255,200,60,${fa * 0.7})`, s)
    ctx.restore()
  }
  drawSkillCharacter(ctx, config, s, equipped)
  // Glowing eyes
  ctx.save()
  ctx.fillStyle = `rgba(255,80,0,${pulse})`
  ctx.shadowColor = "#FF4400"
  ctx.shadowBlur = 10
  r(ctx, 20, 12, 3, 2, `rgba(255,80,0,${pulse})`, s)
  r(ctx, 27, 12, 3, 2, `rgba(255,80,0,${pulse})`, s)
  ctx.restore()
}

const drawIronSkin: SkillDrawFn = (ctx, t, config, equipped, s) => {
  drawSkillCharacter(ctx, config, s, equipped)
  const pulse = 0.6 + 0.4 * Math.sin(t * Math.PI * 3)
  // Iron shell overlay on player
  ctx.save()
  ctx.globalAlpha = 0.5 * pulse
  ctx.fillStyle = "#888888"
  ctx.shadowColor = "#AAAAAA"
  ctx.shadowBlur = 12
  // Cover torso
  r(ctx, 10, 20, 28, 15, `rgba(120,120,120,${pulse * 0.4})`, s)
  ctx.restore()
  // Metal shards materializing
  const shards = [
    [12, 22], [34, 24], [14, 32], [32, 30], [22, 18], [26, 36]
  ]
  shards.forEach(([sx2, sy], i) => {
    const phase = (t * 2 + i * 0.16) % 1
    const alpha = Math.sin(phase * Math.PI) * 0.8
    ctx.save()
    ctx.fillStyle = `rgba(160,160,160,${alpha})`
    ctx.shadowColor = "#CCCCCC"
    ctx.shadowBlur = 6
    r(ctx, sx2, sy, 2, 3, `rgba(160,160,160,${alpha})`, s)
    ctx.restore()
  })
  // Shield rings
  ctx.save()
  ctx.strokeStyle = `rgba(180,180,180,${pulse * 0.8})`
  ctx.lineWidth = s
  ctx.shadowColor = "#CCCCCC"
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.ellipse(24 * s, 28 * s, 14 * s, 18 * s, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

const drawOdinWisdom: SkillDrawFn = (ctx, t, config, equipped, s) => {
  drawSkillCharacter(ctx, config, s, equipped)
  const pulse = 0.7 + 0.3 * Math.sin(t * Math.PI * 4)
  // Golden wisdom aura
  ctx.save()
  ctx.globalAlpha = 0.35 * pulse
  ctx.fillStyle = "#FFDD44"
  ctx.shadowColor = "#FFCC00"
  ctx.shadowBlur = 18
  ctx.beginPath()
  ctx.ellipse(24 * s, 26 * s, 14 * s, 18 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  // Rune circle orbiting
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + t * Math.PI * 2
    const rx = 24 + Math.cos(angle) * 16
    const ry = 26 + Math.sin(angle) * 10
    const alpha = 0.6 + 0.4 * Math.sin(t * Math.PI * 4 + i)
    ctx.save()
    ctx.font = `${Math.floor(4 * s)}px monospace`
    ctx.fillStyle = `rgba(255,220,80,${alpha})`
    ctx.shadowColor = "#FFDD44"
    ctx.shadowBlur = 6
    ctx.fillText(["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ"][i], rx * s, ry * s)
    ctx.restore()
  }
  // Crown glow above head
  ctx.save()
  ctx.fillStyle = `rgba(255,220,60,${pulse})`
  ctx.shadowColor = "#FFCC00"
  ctx.shadowBlur = 14
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + t * Math.PI
    const cx2 = 24 + Math.cos(angle) * 8
    const cy2 = 5 + Math.sin(angle) * 3
    ctx.beginPath()
    ctx.arc(cx2 * s, cy2 * s, 1.5 * s, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

const drawFreyaBlessing: SkillDrawFn = (ctx, t, config, equipped, s) => {
  drawSkillCharacter(ctx, config, s, equipped)
  // Green healing petals / runes rising
  for (let i = 0; i < 10; i++) {
    const phase = (t * 1.5 + i / 10) % 1
    const px2 = 24 + Math.sin(phase * Math.PI * 4 + i) * 10
    const py = 42 - phase * 32
    const alpha = Math.sin(phase * Math.PI) * 0.9
    ctx.save()
    ctx.fillStyle = `rgba(68,255,136,${alpha})`
    ctx.shadowColor = "#44FF88"
    ctx.shadowBlur = 8
    // Petal shape
    r(ctx, px2 - 1, py - 2, 2, 4, `rgba(68,255,136,${alpha})`, s)
    r(ctx, px2 - 2, py - 1, 4, 2, `rgba(68,${Math.floor(200 + prng(i, 0) * 55)},136,${alpha * 0.6})`, s)
    ctx.restore()
  }
  // Healing aura glow
  const aura = 0.5 + 0.5 * Math.sin(t * Math.PI * 3)
  ctx.save()
  ctx.strokeStyle = `rgba(68,255,136,${aura * 0.8})`
  ctx.lineWidth = (1.5 + aura) * s
  ctx.shadowColor = "#44FF88"
  ctx.shadowBlur = 16 * aura
  ctx.beginPath()
  ctx.ellipse(24 * s, 26 * s, 14 * s, 18 * s, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
  // Cross cleanse flash
  const cleanseAlpha = 0.3 * Math.abs(Math.sin(t * Math.PI * 3))
  ctx.save()
  ctx.fillStyle = `rgba(200,255,220,${cleanseAlpha})`
  r(ctx, 22, 10, 4, 30, `rgba(200,255,220,${cleanseAlpha})`, s)
  r(ctx, 10, 22, 28, 4, `rgba(200,255,220,${cleanseAlpha})`, s)
  ctx.restore()
}

const drawRagnarokForm: SkillDrawFn = (ctx, t, config, equipped, s) => {
  const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 5)
  // Apocalyptic aura — mix of all elements
  // Outer corona
  ctx.save()
  ctx.globalAlpha = 0.5 * pulse
  const grad = ctx.createRadialGradient(24 * s, 26 * s, 4 * s, 24 * s, 26 * s, 22 * s)
  grad.addColorStop(0, "rgba(255,200,50,0.8)")
  grad.addColorStop(0.4, "rgba(255,60,0,0.6)")
  grad.addColorStop(0.7, "rgba(100,0,200,0.4)")
  grad.addColorStop(1, "rgba(0,50,255,0)")
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.ellipse(24 * s, 26 * s, 22 * s, 26 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  drawSkillCharacter(ctx, config, s, equipped)
  // Multi-element orbs orbiting
  const orbColors = ["#FF4400", "#4AF0FF", "#FFEE44", "#AA44FF", "#44FF88"]
  orbColors.forEach((col, i) => {
    const angle = (i / orbColors.length) * Math.PI * 2 + t * Math.PI * 2.5
    const ox = 24 + Math.cos(angle) * 16
    const oy = 26 + Math.sin(angle) * 10
    ctx.save()
    ctx.fillStyle = col
    ctx.shadowColor = col
    ctx.shadowBlur = 12
    ctx.beginPath()
    ctx.arc(ox * s, oy * s, (2 + pulse) * s, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
  // Eyes glowing white
  ctx.save()
  ctx.fillStyle = `rgba(255,255,255,${pulse})`
  ctx.shadowColor = "#FFFFFF"
  ctx.shadowBlur = 12
  r(ctx, 20, 12, 3, 2, `rgba(255,255,255,${pulse})`, s)
  r(ctx, 27, 12, 3, 2, `rgba(255,255,255,${pulse})`, s)
  ctx.restore()
}

// ============================================================
// SKILL ID → DRAW FUNCTION MAP
// ============================================================

const SKILL_VFX_MAP: Record<string, SkillDrawFn> = {
  "runic-burst": drawRunicBurst,
  "thunder-nova": drawThunderNova,
  "frost-pulse": drawFrostPulse,
  "war-cry": drawWarCry,
  "flame-circle": drawFlameCircle,
  "shadow-step": drawShadowStep,
  "valkyrie-rush": drawValkyrieRush,
  "frost-blink": drawFrostBlink,
  "berserker-charge": drawBerserkerCharge,
  "raven-flight": drawRavenFlight,
  "axe-flurry": drawAxeFlurry,
  "skull-splitter": drawSkullSplitter,
  "blade-dance": drawBladeDance,
  "shield-bash": drawShieldBash,
  "executioner": drawExecutioner,
  "earth-shatter": drawEarthShatter,
  "mjolnir-strike": drawMjolnirStrike,
  "frost-quake": drawFrostQuake,
  "seismic-roar": drawSeismicRoar,
  "meteor-drop": drawRagnarokDrop,
  "ice-beam": drawNiflheimBeam,
  "lightning-arc": drawLightningArc,
  "soul-drain": drawSoulDrain,
  "runic-ray": drawRunicRay,
  "bifrost-blast": drawBifrostBlast,
  "wolf-pack": drawWolfPack,
  "rune-totem": drawRuneTotem,
  "valkyrie-ally": drawSummonEinherjar,
  "ice-wall": drawIceWall,
  "raven-scouts": drawRavenScouts,
  "berserker-rage": drawBerserkerRage,
  "iron-skin": drawIronSkin,
  "odin-wisdom": drawOdinWisdom,
  "freya-blessing": drawFreyaBlessing,
  "ragnarok-form": drawRagnarokForm,
}

// ============================================================
// VFX CANVAS COMPONENT — 64x64 grid, 2x scale = 128px canvas
// ============================================================

const GRID = 64  // virtual grid size
const VFX_SCALE = 2  // pixels per grid unit → 128px canvas

function SkillVFXCanvas({
  skillId,
  config,
  equipped,
}: {
  skillId: string
  config: CharacterConfig
  equipped: EquippedItems
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const startRef = useRef<number>(0)

  const drawFn = SKILL_VFX_MAP[skillId]

  const animate = useCallback(
    (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = (ts - startRef.current) / 1000
      const t = (elapsed % 2) / 2  // 0..1 over 2-second loop

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (drawFn) {
        // Scale the 48-unit character grid to fit inside the 64-unit canvas with padding
        // Character grid is 48 units; canvas is 64 units; offset by 8 units to center
        ctx.save()
        ctx.translate(8 * VFX_SCALE, 8 * VFX_SCALE)
        drawFn(ctx, t, config, equipped, VFX_SCALE)
        ctx.restore()
      }

      animRef.current = requestAnimationFrame(animate)
    },
    [drawFn, config, equipped]
  )

  useEffect(() => {
    startRef.current = 0
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [animate])

  return (
    <canvas
      ref={canvasRef}
      width={GRID * VFX_SCALE}
      height={GRID * VFX_SCALE}
      className="block rounded-md"
      style={{ imageRendering: "pixelated" }}
    />
  )
}

// ============================================================
// SKILL CARD
// ============================================================

function SkillCard({
  skill,
  categoryColor,
  selected,
  onClick,
  config,
  equipped,
}: {
  skill: SkillDef
  categoryColor: string
  selected: boolean
  onClick: () => void
  config: CharacterConfig
  equipped: EquippedItems
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-2.5 rounded-lg border transition-all ${
        selected ? "border-current" : "border-border bg-card hover:bg-secondary/50"
      }`}
      style={{
        borderColor: selected ? categoryColor : undefined,
        backgroundColor: selected ? `${categoryColor}18` : undefined,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex-shrink-0 rounded-md overflow-hidden border"
          style={{ borderColor: `${categoryColor}55` }}
        >
          <SkillVFXCanvas skillId={skill.id} config={config} equipped={equipped} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm text-foreground truncate">{skill.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
            {skill.description}
          </div>
          <div className="flex gap-3 mt-1.5 flex-wrap">
            <span className="text-[10px] font-medium" style={{ color: categoryColor }}>
              ⏱ {skill.cooldown}
            </span>
            <span className="text-[10px] text-muted-foreground">⚔ {skill.damage}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

// ============================================================
// SKILL DETAIL PANEL
// ============================================================

function SkillDetail({
  skill,
  categoryColor,
  categoryName,
  config,
  equipped,
}: {
  skill: SkillDef
  categoryColor: string
  categoryName: string
  config: CharacterConfig
  equipped: EquippedItems
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-4 sticky top-4">
      <div className="flex flex-col gap-3">
        <div className="rounded-lg overflow-hidden border-2 self-center" style={{ borderColor: categoryColor }}>
          <SkillVFXCanvas skillId={skill.id} config={config} equipped={equipped} />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: categoryColor }}>
            {categoryName}
          </div>
          <div className="text-lg font-bold text-foreground leading-tight">{skill.name}</div>
          <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{skill.description}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md bg-secondary/60 p-2.5 text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Cooldown</div>
          <div className="font-bold text-sm text-foreground mt-0.5">{skill.cooldown}</div>
        </div>
        <div className="rounded-md bg-secondary/60 p-2.5 text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Effect</div>
          <div className="font-bold text-sm mt-0.5" style={{ color: categoryColor }}>{skill.damage}</div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN SKILLS PANEL
// ============================================================

interface SkillsPanelProps {
  config: CharacterConfig
  equipped: EquippedItems
}

export function SkillsPanel({ config, equipped }: SkillsPanelProps) {
  const [activeCategory, setActiveCategory] = useState(SKILL_CATEGORIES[0].id)
  const [selectedSkill, setSelectedSkill] = useState<SkillDef | null>(null)

  const currentCategory = SKILL_CATEGORIES.find((c) => c.id === activeCategory)!
  const categorySkills = SKILLS.filter((s) => s.category === activeCategory)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-bold text-foreground tracking-tight">Skills</h2>
        <p className="text-xs text-muted-foreground">
          Select a category — each skill shows your character performing it live
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5">
        {SKILL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setSelectedSkill(null) }}
            className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all border"
            style={{
              color: cat.color,
              backgroundColor: activeCategory === cat.id ? `${cat.color}22` : undefined,
              borderColor: activeCategory === cat.id ? cat.color : "transparent",
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground px-0.5">{currentCategory.description}</p>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Skill list */}
        <div className="flex-1 flex flex-col gap-2">
          {categorySkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              categoryColor={currentCategory.color}
              selected={selectedSkill?.id === skill.id}
              onClick={() => setSelectedSkill(skill)}
              config={config}
              equipped={equipped}
            />
          ))}
        </div>

        {/* Detail panel */}
        <div className="lg:w-56 flex-shrink-0">
          {selectedSkill ? (
            <SkillDetail
              skill={selectedSkill}
              categoryColor={currentCategory.color}
              categoryName={currentCategory.name}
              config={config}
              equipped={equipped}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 flex flex-col items-center justify-center gap-2 text-center min-h-[120px]">
              <div className="text-3xl opacity-20">⚔</div>
              <div className="text-xs text-muted-foreground">Select a skill to see its detail</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
