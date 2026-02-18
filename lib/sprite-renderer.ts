// ============================================================
// NORSE RPG SPRITE RENDERER v2 - 48x48 characters with shadows
// ============================================================

type Ctx = CanvasRenderingContext2D

function px(ctx: Ctx, x: number, y: number, color: string, s: number = 1) {
  ctx.fillStyle = color
  ctx.fillRect(x * s, y * s, s, s)
}

function rect(ctx: Ctx, x: number, y: number, w: number, h: number, color: string, s: number = 1) {
  ctx.fillStyle = color
  ctx.fillRect(x * s, y * s, w * s, h * s)
}

// Outline helper: draws an outline around a rect
function outline(ctx: Ctx, x: number, y: number, w: number, h: number, color: string, s: number) {
  rect(ctx, x, y, w, 1, color, s) // top
  rect(ctx, x, y + h - 1, w, 1, color, s) // bottom
  rect(ctx, x, y, 1, h, color, s) // left
  rect(ctx, x + w - 1, y, 1, h, color, s) // right
}

// Shadow under a rect
function shadow(ctx: Ctx, x: number, y: number, w: number, _h: number, s: number) {
  ctx.fillStyle = "rgba(0,0,0,0.25)"
  ctx.fillRect(x * s, (y) * s, w * s, 2 * s)
}

// Ellipse shadow on ground
function groundShadow(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, s: number) {
  ctx.fillStyle = "rgba(0,0,0,0.3)"
  ctx.beginPath()
  ctx.ellipse(cx * s, cy * s, rx * s, ry * s, 0, 0, Math.PI * 2)
  ctx.fill()
}

function darken(hex: string, amount: number = 30): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (num >> 16) - amount)
  const g = Math.max(0, ((num >> 8) & 0xff) - amount)
  const b = Math.max(0, (num & 0xff) - amount)
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

function lighten(hex: string, amount: number = 30): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + amount)
  const b = Math.min(255, (num & 0xff) + amount)
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

// ============================================================
// CHARACTER CONFIG
// ============================================================

export interface CharacterConfig {
  bodyType: "warrior" | "scout"
  headStyle: string
  chestStyle: string
  legStyle: string
  hairStyle: string
  hairColor: string
  skinBase: string
  skinShadow: string
  skinHighlight: string
  beardStyle?: string
  eyeColor?: string
  scarStyle?: string
  facePaint?: string
}

export interface EquippedItems {
  helmet?: string
  chest?: string
  gloves?: string
  pants?: string
  boots?: string
  weapon?: string
}

// ============================================================
// DRAW CHARACTER (48x48)
// ============================================================

export function drawCharacter(
  ctx: Ctx,
  config: CharacterConfig,
  equipped: EquippedItems,
  scale: number = 4,
  offsetX: number = 0,
  offsetY: number = 0
) {
  ctx.save()
  ctx.translate(offsetX, offsetY)

  const { bodyType, headStyle, skinBase, skinShadow, skinHighlight, hairStyle, hairColor, chestStyle, legStyle, beardStyle, eyeColor, scarStyle, facePaint } = config
  const isWide = bodyType === "warrior" || chestStyle === "broad"

  // Ground shadow
  groundShadow(ctx, 24, 47, 10, 2, scale)

  // ---- BOOTS / FEET ----
  if (equipped.boots) {
    drawBootsEquip(ctx, equipped.boots, scale)
  } else {
    // bare feet
    rect(ctx, 14, 42, 6, 3, skinShadow, scale)
    rect(ctx, 28, 42, 6, 3, skinShadow, scale)
    rect(ctx, 15, 42, 4, 2, skinBase, scale)
    rect(ctx, 29, 42, 4, 2, skinBase, scale)
  }

  // ---- LEGS ----
  if (equipped.pants) {
    drawPantsEquip(ctx, equipped.pants, legStyle, scale)
  } else {
    drawLegs(ctx, legStyle, skinBase, skinShadow, skinHighlight, scale)
  }

  // ---- CHEST / TORSO ----
  if (equipped.chest) {
    drawChestEquip(ctx, equipped.chest, bodyType, chestStyle, skinBase, skinShadow, skinHighlight, scale)
  } else {
    drawTorso(ctx, bodyType, chestStyle, skinBase, skinShadow, skinHighlight, scale)
  }

  // ---- ARMS ----
  // Always draw arms: either skin or with gloves overlay
  drawArms(ctx, bodyType, skinBase, skinShadow, skinHighlight, scale)
  if (equipped.gloves) {
    drawGlovesEquip(ctx, equipped.gloves, bodyType, scale)
  }

  // ---- HEAD ----
  drawHead(ctx, headStyle, skinBase, skinShadow, skinHighlight, scale)

  // ---- FACE DETAILS ----
  drawEyes(ctx, eyeColor || "#1A1A2E", scale)
  drawMouth(ctx, skinShadow, scale)
  if (beardStyle && beardStyle !== "none") drawBeard(ctx, beardStyle, hairColor, scale)
  if (scarStyle && scarStyle !== "none") drawScar(ctx, scarStyle, scale)
  if (facePaint && facePaint !== "none") drawFacePaint(ctx, facePaint, scale)

  // ---- HAIR / HELMET ----
  if (equipped.helmet) {
    drawHelmetEquip(ctx, equipped.helmet, scale)
  } else if (hairStyle !== "bald") {
    drawHair(ctx, hairStyle, hairColor, scale)
  }

  // ---- WEAPON ----
  if (equipped.weapon) {
    drawWeaponEquip(ctx, equipped.weapon, bodyType, scale)
  }

  // Dark outline on entire character edges for pixel art look
  ctx.globalCompositeOperation = "source-over"
  ctx.restore()
}

// ============================================================
// BASE BODY PARTS (48x48 scale)
// ============================================================

function drawHead(ctx: Ctx, style: string, base: string, shad: string, hi: string, s: number) {
  const ol = darken(shad, 30)
  switch (style) {
    case "square":
      rect(ctx, 14, 5, 20, 16, base, s)
      outline(ctx, 14, 5, 20, 16, ol, s)
      rect(ctx, 14, 5, 20, 3, hi, s)
      rect(ctx, 14, 18, 20, 3, shad, s)
      rect(ctx, 14, 5, 3, 16, hi, s)
      rect(ctx, 31, 5, 3, 16, shad, s)
      break
    case "angular":
      rect(ctx, 15, 5, 18, 16, base, s)
      outline(ctx, 15, 5, 18, 16, ol, s)
      rect(ctx, 14, 8, 1, 10, base, s)
      rect(ctx, 33, 8, 1, 10, base, s)
      rect(ctx, 15, 5, 18, 3, hi, s)
      rect(ctx, 18, 18, 12, 3, shad, s)
      // strong jawline
      rect(ctx, 15, 16, 3, 4, shad, s)
      rect(ctx, 30, 16, 3, 4, shad, s)
      break
    default: // round
      rect(ctx, 15, 6, 18, 14, base, s)
      rect(ctx, 16, 5, 16, 1, base, s)
      rect(ctx, 16, 20, 16, 1, base, s)
      rect(ctx, 14, 9, 1, 8, base, s)
      rect(ctx, 33, 9, 1, 8, base, s)
      outline(ctx, 15, 6, 18, 14, ol, s)
      rect(ctx, 16, 5, 16, 3, hi, s)
      rect(ctx, 16, 18, 16, 3, shad, s)
      break
  }
}

function drawEyes(ctx: Ctx, eyeColor: string, s: number) {
  // Eye whites
  rect(ctx, 19, 12, 4, 3, "#EEEEF0", s)
  rect(ctx, 27, 12, 4, 3, "#EEEEF0", s)
  // Iris
  rect(ctx, 20, 12, 3, 3, eyeColor, s)
  rect(ctx, 28, 12, 3, 3, eyeColor, s)
  // Pupil
  rect(ctx, 21, 13, 1, 1, "#0A0A0A", s)
  rect(ctx, 29, 13, 1, 1, "#0A0A0A", s)
  // Highlight
  px(ctx, 20, 12, "#FFFFFF", s)
  px(ctx, 28, 12, "#FFFFFF", s)
  // Eyebrow shadow
  rect(ctx, 19, 11, 4, 1, "rgba(0,0,0,0.3)", s)
  rect(ctx, 27, 11, 4, 1, "rgba(0,0,0,0.3)", s)
}

function drawMouth(ctx: Ctx, shad: string, s: number) {
  rect(ctx, 22, 17, 5, 1, shad, s)
  px(ctx, 22, 17, darken(shad, 20), s)
  px(ctx, 26, 17, darken(shad, 20), s)
}

function drawBeard(ctx: Ctx, style: string, color: string, s: number) {
  const dark = darken(color, 25)
  switch (style) {
    case "stubble":
      for (let x = 18; x < 30; x += 2) {
        for (let y = 16; y < 21; y += 2) {
          px(ctx, x, y, dark + "60", s)
        }
      }
      break
    case "short":
      rect(ctx, 18, 17, 12, 4, color, s)
      rect(ctx, 18, 20, 12, 1, dark, s)
      rect(ctx, 19, 17, 10, 1, lighten(color, 15), s)
      break
    case "long":
      rect(ctx, 18, 17, 12, 4, color, s)
      rect(ctx, 19, 21, 10, 4, color, s)
      rect(ctx, 20, 25, 8, 2, color, s)
      rect(ctx, 18, 20, 12, 1, dark, s)
      rect(ctx, 20, 24, 8, 1, dark, s)
      rect(ctx, 19, 17, 10, 1, lighten(color, 15), s)
      break
    case "braided-beard":
      rect(ctx, 18, 17, 12, 4, color, s)
      rect(ctx, 21, 21, 3, 6, color, s)
      rect(ctx, 24, 21, 3, 6, color, s)
      // braid ties
      rect(ctx, 21, 24, 3, 1, "#8B7355", s)
      rect(ctx, 24, 24, 3, 1, "#8B7355", s)
      rect(ctx, 19, 17, 10, 1, lighten(color, 15), s)
      break
  }
}

function drawScar(ctx: Ctx, style: string, s: number) {
  switch (style) {
    case "left-eye":
      px(ctx, 18, 11, "#CC8888", s)
      px(ctx, 19, 12, "#CC8888", s)
      px(ctx, 19, 13, "#CC8888", s)
      px(ctx, 18, 14, "#CC8888", s)
      break
    case "right-cheek":
      px(ctx, 31, 13, "#CC8888", s)
      px(ctx, 32, 14, "#CC8888", s)
      px(ctx, 31, 15, "#CC8888", s)
      break
    case "cross-face":
      for (let i = 0; i < 6; i++) {
        px(ctx, 18 + i, 11 + i, "#CC8888", s)
        px(ctx, 30 - i, 11 + i, "#CC8888", s)
      }
      break
  }
}

function drawFacePaint(ctx: Ctx, style: string, s: number) {
  switch (style) {
    case "war-stripes":
      rect(ctx, 18, 11, 5, 1, "#CC3333", s)
      rect(ctx, 27, 11, 5, 1, "#CC3333", s)
      rect(ctx, 18, 13, 5, 1, "#1A1A2E", s)
      rect(ctx, 27, 13, 5, 1, "#1A1A2E", s)
      break
    case "skull-paint":
      rect(ctx, 18, 10, 12, 1, "#DDDDDD", s)
      rect(ctx, 22, 16, 4, 2, "#1A1A1A", s)
      px(ctx, 23, 18, "#1A1A1A", s)
      px(ctx, 24, 18, "#1A1A1A", s)
      break
    case "rune-marks":
      px(ctx, 18, 10, "#4AF0FF", s)
      px(ctx, 17, 12, "#4AF0FF", s)
      px(ctx, 18, 14, "#4AF0FF", s)
      px(ctx, 32, 10, "#4AF0FF", s)
      px(ctx, 33, 12, "#4AF0FF", s)
      px(ctx, 32, 14, "#4AF0FF", s)
      break
    case "blood-smear":
      rect(ctx, 19, 12, 3, 1, "#8B0000", s)
      rect(ctx, 18, 13, 2, 3, "#8B0000", s)
      break
  }
}

function drawTorso(ctx: Ctx, bodyType: string, chestStyle: string, base: string, shad: string, hi: string, s: number) {
  const isWide = bodyType === "warrior" || chestStyle === "broad"
  const ol = darken(shad, 30)
  if (isWide) {
    rect(ctx, 11, 21, 26, 12, base, s)
    outline(ctx, 11, 21, 26, 12, ol, s)
    rect(ctx, 11, 21, 26, 3, hi, s)
    rect(ctx, 11, 30, 26, 3, shad, s)
    // Muscle definition
    rect(ctx, 20, 23, 1, 6, shad, s)
    rect(ctx, 27, 23, 1, 6, shad, s)
    // Pec shadows
    rect(ctx, 14, 22, 8, 1, shad + "80", s)
    rect(ctx, 26, 22, 8, 1, shad + "80", s)
    // Abs hint
    rect(ctx, 21, 27, 6, 1, shad + "60", s)
    rect(ctx, 21, 29, 6, 1, shad + "60", s)
    // Navel
    px(ctx, 24, 30, shad, s)
    // Loincloth
    rect(ctx, 16, 32, 16, 2, "#4A3A2A", s)
    rect(ctx, 16, 32, 16, 1, "#5A4A3A", s)
  } else {
    rect(ctx, 14, 21, 20, 12, base, s)
    outline(ctx, 14, 21, 20, 12, ol, s)
    rect(ctx, 14, 21, 20, 3, hi, s)
    rect(ctx, 14, 30, 20, 3, shad, s)
    // Lighter muscle definition for scout
    rect(ctx, 21, 23, 1, 5, shad + "50", s)
    rect(ctx, 26, 23, 1, 5, shad + "50", s)
    // Loincloth
    rect(ctx, 18, 32, 12, 2, "#4A3A2A", s)
    rect(ctx, 18, 32, 12, 1, "#5A4A3A", s)
  }
}

function drawArms(ctx: Ctx, bodyType: string, base: string, shad: string, hi: string, s: number) {
  const ol = darken(shad, 30)
  if (bodyType === "warrior") {
    // Left arm
    rect(ctx, 6, 21, 5, 14, base, s)
    rect(ctx, 6, 21, 5, 3, hi, s)
    rect(ctx, 6, 32, 5, 3, shad, s)
    outline(ctx, 6, 21, 5, 14, ol, s)
    // Bicep highlight
    rect(ctx, 7, 23, 3, 2, hi + "80", s)
    // Hand
    rect(ctx, 6, 35, 5, 3, base, s)
    rect(ctx, 6, 37, 5, 1, shad, s)
    // Right arm
    rect(ctx, 37, 21, 5, 14, base, s)
    rect(ctx, 37, 21, 5, 3, hi, s)
    rect(ctx, 37, 32, 5, 3, shad, s)
    outline(ctx, 37, 21, 5, 14, ol, s)
    rect(ctx, 38, 23, 3, 2, hi + "80", s)
    rect(ctx, 37, 35, 5, 3, base, s)
    rect(ctx, 37, 37, 5, 1, shad, s)
  } else {
    // Left arm
    rect(ctx, 10, 21, 4, 12, base, s)
    rect(ctx, 10, 21, 4, 2, hi, s)
    rect(ctx, 10, 31, 4, 2, shad, s)
    outline(ctx, 10, 21, 4, 12, ol, s)
    rect(ctx, 10, 33, 4, 3, base, s)
    rect(ctx, 10, 35, 4, 1, shad, s)
    // Right arm
    rect(ctx, 34, 21, 4, 12, base, s)
    rect(ctx, 34, 21, 4, 2, hi, s)
    rect(ctx, 34, 31, 4, 2, shad, s)
    outline(ctx, 34, 21, 4, 12, ol, s)
    rect(ctx, 34, 33, 4, 3, base, s)
    rect(ctx, 34, 35, 4, 1, shad, s)
  }
}

function drawLegs(ctx: Ctx, style: string, base: string, shad: string, hi: string, s: number) {
  const ol = darken(shad, 30)
  if (style === "muscular") {
    // Left leg
    rect(ctx, 14, 33, 8, 10, base, s)
    rect(ctx, 14, 33, 8, 2, hi, s)
    rect(ctx, 14, 41, 8, 2, shad, s)
    outline(ctx, 14, 33, 8, 10, ol, s)
    // Thigh highlight
    rect(ctx, 15, 34, 5, 2, hi + "60", s)
    // Right leg
    rect(ctx, 26, 33, 8, 10, base, s)
    rect(ctx, 26, 33, 8, 2, hi, s)
    rect(ctx, 26, 41, 8, 2, shad, s)
    outline(ctx, 26, 33, 8, 10, ol, s)
    rect(ctx, 27, 34, 5, 2, hi + "60", s)
  } else {
    rect(ctx, 16, 33, 6, 10, base, s)
    rect(ctx, 16, 33, 6, 2, hi, s)
    rect(ctx, 16, 41, 6, 2, shad, s)
    outline(ctx, 16, 33, 6, 10, ol, s)
    rect(ctx, 26, 33, 6, 10, base, s)
    rect(ctx, 26, 33, 6, 2, hi, s)
    rect(ctx, 26, 41, 6, 2, shad, s)
    outline(ctx, 26, 33, 6, 10, ol, s)
  }
}

// ============================================================
// HAIR RENDERING (48x48)
// ============================================================

function drawHair(ctx: Ctx, style: string, color: string, s: number) {
  const dark = darken(color, 30)
  const hi = lighten(color, 25)
  switch (style) {
    case "long":
      rect(ctx, 14, 2, 20, 6, color, s)
      rect(ctx, 15, 2, 18, 2, hi, s)
      rect(ctx, 12, 5, 3, 16, color, s)
      rect(ctx, 33, 5, 3, 16, color, s)
      // long strands
      rect(ctx, 11, 19, 3, 8, color, s)
      rect(ctx, 34, 19, 3, 8, color, s)
      rect(ctx, 11, 25, 3, 2, dark, s)
      rect(ctx, 34, 25, 3, 2, dark, s)
      // shading
      rect(ctx, 14, 7, 20, 1, dark, s)
      break
    case "braided":
      rect(ctx, 15, 2, 18, 6, color, s)
      rect(ctx, 16, 2, 16, 2, hi, s)
      rect(ctx, 14, 5, 3, 8, color, s)
      rect(ctx, 31, 5, 3, 8, color, s)
      // braids
      rect(ctx, 11, 10, 3, 18, color, s)
      rect(ctx, 34, 10, 3, 18, color, s)
      // braid ties
      rect(ctx, 11, 16, 3, 1, "#8B7355", s)
      rect(ctx, 34, 16, 3, 1, "#8B7355", s)
      rect(ctx, 11, 22, 3, 1, "#8B7355", s)
      rect(ctx, 34, 22, 3, 1, "#8B7355", s)
      rect(ctx, 11, 27, 3, 1, "#D4A44A", s)
      rect(ctx, 34, 27, 3, 1, "#D4A44A", s)
      rect(ctx, 15, 7, 18, 1, dark, s)
      break
    case "mohawk":
      rect(ctx, 21, -1, 6, 8, color, s)
      rect(ctx, 20, 0, 8, 6, color, s)
      rect(ctx, 22, -2, 4, 3, hi, s)
      rect(ctx, 21, 6, 6, 2, dark, s)
      break
    case "topknot":
      rect(ctx, 15, 3, 18, 4, color, s)
      rect(ctx, 16, 3, 16, 2, hi, s)
      rect(ctx, 20, -2, 8, 6, color, s)
      rect(ctx, 21, -3, 6, 3, hi, s)
      rect(ctx, 22, 0, 4, 1, "#8B7355", s) // tie
      rect(ctx, 15, 6, 18, 1, dark, s)
      break
    case "wild":
      rect(ctx, 13, 1, 22, 7, color, s)
      rect(ctx, 14, 1, 20, 2, hi, s)
      rect(ctx, 11, 4, 3, 14, color, s)
      rect(ctx, 34, 4, 3, 14, color, s)
      // wild strands
      rect(ctx, 10, 8, 2, 6, color, s)
      rect(ctx, 36, 8, 2, 6, color, s)
      px(ctx, 12, 3, hi, s)
      px(ctx, 35, 3, hi, s)
      rect(ctx, 13, 7, 22, 1, dark, s)
      break
    case "shaved-sides":
      rect(ctx, 18, 2, 12, 6, color, s)
      rect(ctx, 19, 2, 10, 2, hi, s)
      rect(ctx, 15, 5, 3, 3, dark + "60", s) // stubble left
      rect(ctx, 30, 5, 3, 3, dark + "60", s) // stubble right
      rect(ctx, 18, 7, 12, 1, dark, s)
      break
    default: // short
      rect(ctx, 15, 2, 18, 6, color, s)
      rect(ctx, 16, 2, 16, 2, hi, s)
      rect(ctx, 14, 5, 3, 6, color, s)
      rect(ctx, 31, 5, 3, 6, color, s)
      rect(ctx, 15, 7, 18, 1, dark, s)
      break
  }
}

// ============================================================
// HELMET RENDERING (48x48 with detail & shadows)
// ============================================================

function drawHelmetEquip(ctx: Ctx, helmetId: string, s: number) {
  switch (helmetId) {
    case "iron-nasal": {
      const base = "#7A7A7A", hi = "#9A9A9A", dk = "#5A5A5A"
      rect(ctx, 13, 1, 22, 10, base, s)
      rect(ctx, 13, 1, 22, 3, hi, s)
      rect(ctx, 13, 9, 22, 2, dk, s)
      outline(ctx, 13, 1, 22, 10, "#3A3A3A", s)
      // nose guard
      rect(ctx, 23, 1, 3, 18, dk, s)
      rect(ctx, 24, 1, 1, 18, base, s)
      // rivets
      px(ctx, 16, 5, "#AAAAAA", s); px(ctx, 20, 5, "#AAAAAA", s)
      px(ctx, 28, 5, "#AAAAAA", s); px(ctx, 32, 5, "#AAAAAA", s)
      shadow(ctx, 13, 11, 22, 1, s)
      break
    }
    case "bear-head": {
      const fur = "#6B3A1A", furH = "#8B5A3A", furD = "#4B1A0A"
      rect(ctx, 12, -1, 24, 12, fur, s)
      rect(ctx, 12, -1, 24, 3, furH, s)
      rect(ctx, 12, 9, 24, 2, furD, s)
      outline(ctx, 12, -1, 24, 12, "#2A0A00", s)
      // ears
      rect(ctx, 12, -2, 5, 5, furD, s)
      rect(ctx, 31, -2, 5, 5, furD, s)
      rect(ctx, 13, -1, 3, 3, furH, s)
      rect(ctx, 32, -1, 3, 3, furH, s)
      // snout detail
      rect(ctx, 19, 1, 10, 3, furH, s)
      px(ctx, 22, 2, "#1A0A00", s); px(ctx, 26, 2, "#1A0A00", s) // eyes
      // fur trim
      rect(ctx, 12, 9, 24, 3, "#8B6A4A", s)
      for (let x = 12; x < 36; x += 3) px(ctx, x, 10, "#9A7A5A", s)
      shadow(ctx, 12, 12, 24, 1, s)
      break
    }
    case "raven-skull": {
      const bone = "#3A3A4A", boneH = "#5A5A6A", boneD = "#1A1A2A"
      rect(ctx, 13, 0, 22, 11, bone, s)
      rect(ctx, 13, 0, 22, 3, boneH, s)
      rect(ctx, 13, 9, 22, 2, boneD, s)
      outline(ctx, 13, 0, 22, 11, "#0A0A1A", s)
      // beak
      rect(ctx, 20, -2, 8, 4, "#4A4A4A", s)
      rect(ctx, 22, -3, 4, 3, "#3A3A3A", s)
      px(ctx, 23, -3, "#5A5A5A", s)
      // bone accents
      px(ctx, 16, 4, "#D4D4D4", s); px(ctx, 32, 4, "#D4D4D4", s)
      px(ctx, 18, 6, "#D4D4D4", s); px(ctx, 30, 6, "#D4D4D4", s)
      px(ctx, 20, 8, "#B4B4B4", s); px(ctx, 28, 8, "#B4B4B4", s)
      // feathers hanging
      rect(ctx, 11, 6, 2, 8, "#2A2A3A", s)
      rect(ctx, 35, 6, 2, 8, "#2A2A3A", s)
      shadow(ctx, 13, 11, 22, 1, s)
      break
    }
    case "jarl-gilded": {
      const gold = "#C4A41A", goldH = "#E4C43A", goldD = "#A4841A"
      rect(ctx, 13, 0, 22, 10, gold, s)
      rect(ctx, 13, 0, 22, 3, goldH, s)
      rect(ctx, 13, 8, 22, 2, goldD, s)
      outline(ctx, 13, 0, 22, 10, "#7A5A00", s)
      // crown points
      rect(ctx, 16, -2, 3, 3, goldH, s)
      rect(ctx, 22, -3, 4, 4, goldH, s)
      rect(ctx, 29, -2, 3, 3, goldH, s)
      // gems
      px(ctx, 23, -1, "#FF3333", s); px(ctx, 24, -1, "#FF3333", s)
      px(ctx, 17, 0, "#3366FF", s)
      px(ctx, 30, 0, "#3366FF", s)
      // filigree
      for (let x = 15; x < 33; x += 4) {
        px(ctx, x, 5, goldH, s)
        px(ctx, x + 1, 6, goldD, s)
      }
      shadow(ctx, 13, 10, 22, 1, s)
      break
    }
    case "runic-war": {
      const iron = "#5A5A6A", ironH = "#7A7A8A", ironD = "#3A3A4A"
      rect(ctx, 13, 0, 22, 10, iron, s)
      rect(ctx, 13, 0, 22, 3, ironH, s)
      rect(ctx, 13, 8, 22, 2, ironD, s)
      outline(ctx, 13, 0, 22, 10, "#1A1A2A", s)
      // wing accents
      rect(ctx, 10, 2, 3, 6, iron, s)
      rect(ctx, 35, 2, 3, 6, iron, s)
      rect(ctx, 10, 2, 3, 2, ironH, s)
      rect(ctx, 35, 2, 3, 2, ironH, s)
      // rune glows animated feel
      const glow = "#4AF0FF"
      px(ctx, 16, 4, glow, s); px(ctx, 19, 3, glow, s)
      px(ctx, 22, 5, glow, s); px(ctx, 25, 3, glow, s)
      px(ctx, 28, 4, glow, s); px(ctx, 31, 5, glow, s)
      px(ctx, 17, 6, glow, s); px(ctx, 24, 7, glow, s); px(ctx, 31, 6, glow, s)
      // glow aura
      rect(ctx, 15, 3, 1, 5, glow + "30", s)
      rect(ctx, 32, 3, 1, 5, glow + "30", s)
      shadow(ctx, 13, 10, 22, 1, s)
      break
    }
    // NEW HELMETS
    case "wolf-skull": {
      rect(ctx, 12, -1, 24, 12, "#5A5A5A", s)
      rect(ctx, 12, -1, 24, 3, "#7A7A7A", s)
      outline(ctx, 12, -1, 24, 12, "#2A2A2A", s)
      // wolf snout
      rect(ctx, 19, -3, 10, 4, "#6A6A6A", s)
      rect(ctx, 21, -4, 6, 3, "#4A4A4A", s)
      // wolf teeth
      px(ctx, 20, 0, "#DDDDDD", s); px(ctx, 22, 0, "#DDDDDD", s)
      px(ctx, 26, 0, "#DDDDDD", s); px(ctx, 28, 0, "#DDDDDD", s)
      // wolf ears
      rect(ctx, 13, -3, 4, 4, "#5A5A5A", s)
      rect(ctx, 31, -3, 4, 4, "#5A5A5A", s)
      // glowing rune on forehead
      px(ctx, 23, 3, "#FF4444", s); px(ctx, 24, 4, "#FF4444", s); px(ctx, 25, 3, "#FF4444", s)
      shadow(ctx, 12, 11, 24, 1, s)
      break
    }
    case "valkyrie-wing": {
      rect(ctx, 13, 0, 22, 10, "#8A8AAA", s)
      rect(ctx, 13, 0, 22, 3, "#AAAACC", s)
      outline(ctx, 13, 0, 22, 10, "#4A4A6A", s)
      // metal wings
      rect(ctx, 8, -2, 5, 8, "#9A9ABB", s)
      rect(ctx, 35, -2, 5, 8, "#9A9ABB", s)
      rect(ctx, 6, -4, 3, 6, "#8A8AAA", s)
      rect(ctx, 39, -4, 3, 6, "#8A8AAA", s)
      // gem centerpiece
      px(ctx, 23, 4, "#4AF0FF", s); px(ctx, 24, 4, "#4AF0FF", s)
      px(ctx, 23, 5, "#3AD0DD", s); px(ctx, 24, 5, "#3AD0DD", s)
      shadow(ctx, 13, 10, 22, 1, s)
      break
    }
    case "dragonbone": {
      rect(ctx, 12, -1, 24, 12, "#D4C8A8", s)
      rect(ctx, 12, -1, 24, 3, "#E4D8B8", s)
      rect(ctx, 12, 9, 24, 2, "#B4A888", s)
      outline(ctx, 12, -1, 24, 12, "#8A7A5A", s)
      // horns
      rect(ctx, 10, -4, 3, 6, "#C4B898", s)
      rect(ctx, 35, -4, 3, 6, "#C4B898", s)
      rect(ctx, 8, -6, 3, 4, "#D4C8A8", s)
      rect(ctx, 37, -6, 3, 4, "#D4C8A8", s)
      // bone cracks
      px(ctx, 18, 3, "#A49878", s); px(ctx, 25, 5, "#A49878", s); px(ctx, 30, 3, "#A49878", s)
      shadow(ctx, 12, 11, 24, 1, s)
      break
    }
  }
}

// ============================================================
// CHEST ARMOR (48x48)
// ============================================================

function drawChestEquip(ctx: Ctx, id: string, bodyType: string, chestStyle: string, skinBase: string, skinShadow: string, skinHighlight: string, s: number) {
  const isWide = bodyType === "warrior" || chestStyle === "broad"
  const x = isWide ? 11 : 14
  const w = isWide ? 26 : 20

  // Draw bare torso underneath first for peek-through styles
  drawTorso(ctx, bodyType, chestStyle, skinBase, skinShadow, skinHighlight, s)

  switch (id) {
    case "leather-vest": {
      rect(ctx, x, 21, w, 12, "#8B6914", s)
      rect(ctx, x, 21, w, 3, "#9B7924", s)
      rect(ctx, x, 30, w, 3, "#7B5904", s)
      outline(ctx, x, 21, w, 12, "#4A3000", s)
      // stitching
      for (let i = 2; i < w - 2; i += 3) px(ctx, x + i, 27, "#6B4904", s)
      // buckle
      rect(ctx, 22, 25, 4, 2, "#C4A41A", s)
      shadow(ctx, x, 33, w, 1, s)
      break
    }
    case "chainmail": {
      rect(ctx, x, 21, w, 12, "#8A8A8A", s)
      rect(ctx, x, 21, w, 3, "#9A9A9A", s)
      rect(ctx, x, 30, w, 3, "#6A6A6A", s)
      outline(ctx, x, 21, w, 12, "#3A3A3A", s)
      // chain pattern
      for (let iy = 24; iy < 33; iy += 2)
        for (let ix = x + 1; ix < x + w - 1; ix += 2)
          px(ctx, ix, iy, "#5A5A5A", s)
      // collar
      rect(ctx, x + 2, 20, w - 4, 2, "#7A7A7A", s)
      shadow(ctx, x, 33, w, 1, s)
      break
    }
    case "fur-cloak": {
      rect(ctx, x, 21, w, 12, "#5A4A3A", s)
      rect(ctx, x, 21, w, 4, "#7A6A5A", s)
      outline(ctx, x, 21, w, 12, "#2A1A0A", s)
      // fur trim top (big collar)
      rect(ctx, x - 2, 19, w + 4, 4, "#8B7A5A", s)
      for (let ix = x - 2; ix < x + w + 2; ix += 2) {
        px(ctx, ix, 20, "#9A8A6A", s)
        px(ctx, ix + 1, 21, "#6A5A4A", s)
      }
      // fur texture
      for (let ix = x + 1; ix < x + w; ix += 4) {
        px(ctx, ix, 25, "#6A5A4A", s)
        px(ctx, ix + 1, 28, "#7A6A5A", s)
      }
      shadow(ctx, x, 33, w, 1, s)
      break
    }
    case "berserker-harness": {
      // Mostly bare - just straps + shoulder
      // Draw bare skin base
      const bx = isWide ? 11 : 14
      const bw = isWide ? 26 : 20
      rect(ctx, bx, 21, bw, 12, skinBase, s)
      rect(ctx, bx, 21, bw, 3, skinHighlight, s)
      rect(ctx, bx, 30, bw, 3, skinShadow, s)
      outline(ctx, bx, 21, bw, 12, darken(skinShadow, 30), s)
      // Muscle definition
      if (isWide) {
        rect(ctx, 20, 23, 1, 6, skinShadow, s)
        rect(ctx, 27, 23, 1, 6, skinShadow, s)
      }
      // Shoulder guards
      rect(ctx, x, 20, 6, 5, "#6A5A4A", s)
      rect(ctx, x + w - 6, 20, 6, 5, "#6A5A4A", s)
      outline(ctx, x, 20, 6, 5, "#3A2A1A", s)
      outline(ctx, x + w - 6, 20, 6, 5, "#3A2A1A", s)
      // X leather straps
      for (let i = 0; i < 10; i++) {
        const cx = x + 4 + i
        const cy = 22 + i
        if (cy < 33 && cx < x + w) px(ctx, cx, cy, "#8B6914", s)
        const cx2 = x + w - 5 - i
        if (cy < 33 && cx2 >= x) px(ctx, cx2, cy, "#8B6914", s)
      }
      // ritual marks on skin
      px(ctx, 22, 24, "#CC3333", s); px(ctx, 26, 24, "#CC3333", s)
      px(ctx, 24, 26, "#CC3333", s)
      px(ctx, 22, 28, "#CC3333", s); px(ctx, 26, 28, "#CC3333", s)
      break
    }
    case "runestone-plate": {
      rect(ctx, x, 21, w, 12, "#4A4A5A", s)
      rect(ctx, x, 21, w, 3, "#5A5A6A", s)
      rect(ctx, x, 30, w, 3, "#3A3A4A", s)
      outline(ctx, x, 21, w, 12, "#1A1A2A", s)
      // rune plate segments
      rect(ctx, x + 3, 24, w - 6, 6, "#5A5A6A", s)
      outline(ctx, x + 3, 24, w - 6, 6, "#3A3A4A", s)
      // glow runes
      const g = "#4AF0FF"
      px(ctx, x + 5, 25, g, s); px(ctx, x + 7, 26, g, s)
      px(ctx, x + w - 6, 25, g, s); px(ctx, x + w - 8, 26, g, s)
      px(ctx, x + (w >> 1), 27, g, s)
      // shoulder plates
      rect(ctx, x - 2, 19, 5, 4, "#5A5A6A", s)
      rect(ctx, x + w - 3, 19, 5, 4, "#5A5A6A", s)
      outline(ctx, x - 2, 19, 5, 4, "#2A2A3A", s)
      outline(ctx, x + w - 3, 19, 5, 4, "#2A2A3A", s)
      // glow on shoulders
      px(ctx, x - 1, 20, g, s); px(ctx, x + w - 2, 20, g, s)
      shadow(ctx, x, 33, w, 1, s)
      break
    }
    // NEW CHEST ARMOR
    case "bone-cuirass": {
      rect(ctx, x, 21, w, 12, "#C4B898", s)
      rect(ctx, x, 21, w, 3, "#D4C8A8", s)
      rect(ctx, x, 30, w, 3, "#A49878", s)
      outline(ctx, x, 21, w, 12, "#7A6A4A", s)
      // bone rib pattern
      for (let i = 2; i < w - 2; i += 4) {
        rect(ctx, x + i, 23, 2, 8, "#B4A888", s)
      }
      // skull centerpiece
      rect(ctx, 21, 23, 6, 5, "#E4D8B8", s)
      px(ctx, 22, 24, "#1A1A1A", s); px(ctx, 25, 24, "#1A1A1A", s)
      px(ctx, 23, 26, "#3A3A3A", s); px(ctx, 24, 26, "#3A3A3A", s)
      shadow(ctx, x, 33, w, 1, s)
      break
    }
    case "stormweave": {
      rect(ctx, x, 21, w, 12, "#2A3A5A", s)
      rect(ctx, x, 21, w, 3, "#3A4A6A", s)
      rect(ctx, x, 30, w, 3, "#1A2A4A", s)
      outline(ctx, x, 21, w, 12, "#0A1A3A", s)
      // lightning patterns
      const lt = "#88CCFF"
      for (let i = 0; i < 3; i++) {
        const sx = x + 4 + i * 8
        px(ctx, sx, 23, lt, s); px(ctx, sx + 1, 24, lt, s)
        px(ctx, sx, 25, lt, s); px(ctx, sx + 1, 26, lt, s)
        px(ctx, sx, 27, lt, s)
      }
      shadow(ctx, x, 33, w, 1, s)
      break
    }
    case "bloodforge-mail": {
      rect(ctx, x, 21, w, 12, "#4A1A1A", s)
      rect(ctx, x, 21, w, 3, "#6A2A2A", s)
      rect(ctx, x, 30, w, 3, "#3A0A0A", s)
      outline(ctx, x, 21, w, 12, "#1A0000", s)
      // chain pattern in blood red
      for (let iy = 24; iy < 33; iy += 2)
        for (let ix = x + 1; ix < x + w - 1; ix += 2)
          px(ctx, ix, iy, "#2A0A0A", s)
      // glowing blood runes
      px(ctx, x + 4, 25, "#FF4444", s); px(ctx, x + w - 5, 25, "#FF4444", s)
      px(ctx, x + (w >> 1), 24, "#FF4444", s)
      shadow(ctx, x, 33, w, 1, s)
      break
    }
  }
}

// ============================================================
// GLOVES (48x48) - Draw OVER arms
// ============================================================

function drawGlovesEquip(ctx: Ctx, glovesId: string, bodyType: string, s: number) {
  const lx = bodyType === "warrior" ? 6 : 10
  const rx = bodyType === "warrior" ? 37 : 34
  const w = bodyType === "warrior" ? 5 : 4
  const armLen = bodyType === "warrior" ? 14 : 12

  switch (glovesId) {
    case "leather-wraps": {
      // Cover lower arms + hands
      const startY = 21 + armLen - 5
      rect(ctx, lx, startY, w, 5, "#8B6914", s)
      rect(ctx, rx, startY, w, 5, "#8B6914", s)
      rect(ctx, lx, startY, w, 2, "#9B7924", s)
      rect(ctx, rx, startY, w, 2, "#9B7924", s)
      // hands
      rect(ctx, lx, 35, w, 3, "#7B5904", s)
      rect(ctx, rx, 35, w, 3, "#7B5904", s)
      break
    }
    case "fur-gauntlets": {
      const startY = 21 + armLen - 8
      rect(ctx, lx, startY, w, 8, "#7A6A5A", s)
      rect(ctx, rx, startY, w, 8, "#7A6A5A", s)
      rect(ctx, lx, startY, w, 3, "#9A8A6A", s)
      rect(ctx, rx, startY, w, 3, "#9A8A6A", s)
      // fur cuff detail
      for (let i = 0; i < w; i++) {
        px(ctx, lx + i, startY + 1, "#AA9A7A", s)
        px(ctx, rx + i, startY + 1, "#AA9A7A", s)
      }
      rect(ctx, lx, 35, w, 3, "#6A5A4A", s)
      rect(ctx, rx, 35, w, 3, "#6A5A4A", s)
      break
    }
    case "iron-bracers": {
      const startY = 21 + armLen - 10
      rect(ctx, lx, startY, w, 10, "#7A7A7A", s)
      rect(ctx, rx, startY, w, 10, "#7A7A7A", s)
      rect(ctx, lx, startY, w, 3, "#9A9A9A", s)
      rect(ctx, rx, startY, w, 3, "#9A9A9A", s)
      outline(ctx, lx, startY, w, 10, "#4A4A4A", s)
      outline(ctx, rx, startY, w, 10, "#4A4A4A", s)
      // rivets
      px(ctx, lx + 1, startY + 2, "#AAAAAA", s)
      px(ctx, rx + 1, startY + 2, "#AAAAAA", s)
      px(ctx, lx + 1, startY + 6, "#AAAAAA", s)
      px(ctx, rx + 1, startY + 6, "#AAAAAA", s)
      rect(ctx, lx, 35, w, 3, "#6A6A6A", s)
      rect(ctx, rx, 35, w, 3, "#6A6A6A", s)
      break
    }
    case "berserker-wraps": {
      const startY = 21 + armLen - 6
      rect(ctx, lx, startY, w, 6, "#4A2A1A", s)
      rect(ctx, rx, startY, w, 6, "#4A2A1A", s)
      // blood rune marks
      px(ctx, lx + 1, startY + 2, "#CC3333", s)
      px(ctx, rx + 1, startY + 2, "#CC3333", s)
      px(ctx, lx + 2, startY + 4, "#CC3333", s)
      px(ctx, rx + 2, startY + 4, "#CC3333", s)
      rect(ctx, lx, 35, w, 3, "#3A1A0A", s)
      rect(ctx, rx, 35, w, 3, "#3A1A0A", s)
      break
    }
    case "runic-gauntlets": {
      const startY = 21 + armLen - 10
      rect(ctx, lx, startY, w, 10, "#4A4A5A", s)
      rect(ctx, rx, startY, w, 10, "#4A4A5A", s)
      rect(ctx, lx, startY, w, 3, "#5A5A6A", s)
      rect(ctx, rx, startY, w, 3, "#5A5A6A", s)
      outline(ctx, lx, startY, w, 10, "#2A2A3A", s)
      outline(ctx, rx, startY, w, 10, "#2A2A3A", s)
      // rune glow
      const g = "#4AF0FF"
      px(ctx, lx + 1, startY + 3, g, s); px(ctx, rx + 1, startY + 3, g, s)
      px(ctx, lx + 2, startY + 5, g, s); px(ctx, rx + 2, startY + 5, g, s)
      px(ctx, lx + 1, startY + 7, g, s); px(ctx, rx + 1, startY + 7, g, s)
      rect(ctx, lx, 35, w, 3, "#3A3A4A", s)
      rect(ctx, rx, 35, w, 3, "#3A3A4A", s)
      break
    }
    // NEW GLOVES
    case "spiked-fists": {
      const startY = 21 + armLen - 6
      rect(ctx, lx, startY, w, 6, "#5A5A5A", s)
      rect(ctx, rx, startY, w, 6, "#5A5A5A", s)
      outline(ctx, lx, startY, w, 6, "#3A3A3A", s)
      outline(ctx, rx, startY, w, 6, "#3A3A3A", s)
      // spikes
      px(ctx, lx - 1, startY + 1, "#8A8A8A", s)
      px(ctx, rx + w, startY + 1, "#8A8A8A", s)
      px(ctx, lx - 1, startY + 3, "#8A8A8A", s)
      px(ctx, rx + w, startY + 3, "#8A8A8A", s)
      rect(ctx, lx, 35, w, 3, "#4A4A4A", s)
      rect(ctx, rx, 35, w, 3, "#4A4A4A", s)
      break
    }
    case "dragonscale-grips": {
      const startY = 21 + armLen - 8
      rect(ctx, lx, startY, w, 8, "#2A5A3A", s)
      rect(ctx, rx, startY, w, 8, "#2A5A3A", s)
      rect(ctx, lx, startY, w, 2, "#3A6A4A", s)
      rect(ctx, rx, startY, w, 2, "#3A6A4A", s)
      // scale pattern
      for (let i = 0; i < 3; i++) {
        px(ctx, lx + 1, startY + 2 + i * 2, "#4A8A5A", s)
        px(ctx, rx + 1, startY + 2 + i * 2, "#4A8A5A", s)
      }
      rect(ctx, lx, 35, w, 3, "#1A4A2A", s)
      rect(ctx, rx, 35, w, 3, "#1A4A2A", s)
      break
    }
    case "ember-wraps": {
      const startY = 21 + armLen - 7
      rect(ctx, lx, startY, w, 7, "#4A2A0A", s)
      rect(ctx, rx, startY, w, 7, "#4A2A0A", s)
      // ember glow
      const eg = "#FF6600"
      px(ctx, lx + 1, startY + 2, eg, s); px(ctx, rx + 1, startY + 2, eg, s)
      px(ctx, lx + 2, startY + 4, eg, s); px(ctx, rx + 2, startY + 4, eg, s)
      px(ctx, lx + 1, startY + 6, "#FF4400", s); px(ctx, rx + 1, startY + 6, "#FF4400", s)
      rect(ctx, lx, 35, w, 3, "#3A1A00", s)
      rect(ctx, rx, 35, w, 3, "#3A1A00", s)
      break
    }
  }
}

// ============================================================
// PANTS (48x48)
// ============================================================

function drawPantsEquip(ctx: Ctx, pantsId: string, legStyle: string, s: number) {
  const thick = legStyle === "muscular"
  const lw = thick ? 8 : 6
  const rw = thick ? 8 : 6
  const lx = thick ? 14 : 16
  const rx = thick ? 26 : 26

  switch (pantsId) {
    case "wool-trousers":
      rect(ctx, lx, 33, lw, 10, "#6A5A3A", s)
      rect(ctx, rx, 33, rw, 10, "#6A5A3A", s)
      rect(ctx, lx, 33, lw, 2, "#7A6A4A", s)
      rect(ctx, rx, 33, rw, 2, "#7A6A4A", s)
      outline(ctx, lx, 33, lw, 10, "#3A2A1A", s)
      outline(ctx, rx, 33, rw, 10, "#3A2A1A", s)
      // belt
      rect(ctx, lx - 1, 32, lw + rw + rx - lx - rw + 3, 2, "#4A3A2A", s)
      px(ctx, 23, 32, "#C4A41A", s); px(ctx, 24, 32, "#C4A41A", s)
      break
    case "leather-leggings":
      rect(ctx, lx, 33, lw, 10, "#5A4A2A", s)
      rect(ctx, rx, 33, rw, 10, "#5A4A2A", s)
      rect(ctx, lx, 33, lw, 3, "#6A5A3A", s)
      rect(ctx, rx, 33, rw, 3, "#6A5A3A", s)
      outline(ctx, lx, 33, lw, 10, "#2A1A0A", s)
      outline(ctx, rx, 33, rw, 10, "#2A1A0A", s)
      // stitching
      for (let y = 35; y < 42; y += 2) { px(ctx, lx + 1, y, "#7A6A4A", s); px(ctx, rx + 1, y, "#7A6A4A", s) }
      break
    case "frost-greaves":
      rect(ctx, lx, 33, lw, 10, "#5A6A7A", s)
      rect(ctx, rx, 33, rw, 10, "#5A6A7A", s)
      outline(ctx, lx, 33, lw, 10, "#2A3A4A", s)
      outline(ctx, rx, 33, rw, 10, "#2A3A4A", s)
      // fur wraps
      rect(ctx, lx, 33, lw, 3, "#8A7A6A", s)
      rect(ctx, rx, 33, rw, 3, "#8A7A6A", s)
      for (let i = 0; i < lw; i += 2) { px(ctx, lx + i, 34, "#9A8A7A", s); px(ctx, rx + i, 34, "#9A8A7A", s) }
      // ice crystals
      px(ctx, lx + 2, 38, "#B0E0FF", s); px(ctx, rx + 2, 38, "#B0E0FF", s)
      break
    case "berserker-skirt": {
      const sw = rx + rw - lx + 2
      rect(ctx, lx - 1, 33, sw, 6, "#5A4A3A", s)
      rect(ctx, lx - 1, 33, sw, 2, "#7A6A4A", s)
      outline(ctx, lx - 1, 33, sw, 6, "#2A1A0A", s)
      // metal plates
      for (let i = 0; i < sw; i += 3) px(ctx, lx - 1 + i, 36, "#8A8A8A", s)
      rect(ctx, lx, 39, lw, 4, "#5A4A3A", s)
      rect(ctx, rx, 39, rw, 4, "#5A4A3A", s)
      break
    }
    case "runic-legguards":
      rect(ctx, lx, 33, lw, 10, "#4A4A5A", s)
      rect(ctx, rx, 33, rw, 10, "#4A4A5A", s)
      rect(ctx, lx, 33, lw, 2, "#5A5A6A", s)
      rect(ctx, rx, 33, rw, 2, "#5A5A6A", s)
      outline(ctx, lx, 33, lw, 10, "#2A2A3A", s)
      outline(ctx, rx, 33, rw, 10, "#2A2A3A", s)
      // rune glow
      const g = "#4AF0FF"
      px(ctx, lx + 2, 36, g, s); px(ctx, rx + 2, 36, g, s)
      px(ctx, lx + 3, 38, g, s); px(ctx, rx + 3, 38, g, s)
      px(ctx, lx + 2, 40, g, s); px(ctx, rx + 2, 40, g, s)
      break
    // NEW
    case "iron-chain-skirt":
      rect(ctx, lx - 1, 33, rx + rw - lx + 2, 4, "#7A7A7A", s)
      rect(ctx, lx, 37, lw, 6, "#7A7A7A", s)
      rect(ctx, rx, 37, rw, 6, "#7A7A7A", s)
      for (let iy = 34; iy < 42; iy += 2) {
        for (let ix = lx; ix < rx + rw; ix += 2) px(ctx, ix, iy, "#5A5A5A", s)
      }
      outline(ctx, lx - 1, 33, rx + rw - lx + 2, 4, "#3A3A3A", s)
      break
    case "shadow-leggings":
      rect(ctx, lx, 33, lw, 10, "#1A1A2A", s)
      rect(ctx, rx, 33, rw, 10, "#1A1A2A", s)
      rect(ctx, lx, 33, lw, 2, "#2A2A3A", s)
      rect(ctx, rx, 33, rw, 2, "#2A2A3A", s)
      outline(ctx, lx, 33, lw, 10, "#0A0A1A", s)
      outline(ctx, rx, 33, rw, 10, "#0A0A1A", s)
      // shadow wisps
      px(ctx, lx + 1, 37, "#3A3A5A", s); px(ctx, rx + 1, 37, "#3A3A5A", s)
      px(ctx, lx + 3, 39, "#3A3A5A", s); px(ctx, rx + 3, 39, "#3A3A5A", s)
      break
    case "flame-guards":
      rect(ctx, lx, 33, lw, 10, "#3A1A0A", s)
      rect(ctx, rx, 33, rw, 10, "#3A1A0A", s)
      outline(ctx, lx, 33, lw, 10, "#1A0A00", s)
      outline(ctx, rx, 33, rw, 10, "#1A0A00", s)
      // fire glow
      px(ctx, lx + 2, 37, "#FF6600", s); px(ctx, rx + 2, 37, "#FF6600", s)
      px(ctx, lx + 1, 39, "#FF4400", s); px(ctx, rx + 1, 39, "#FF4400", s)
      px(ctx, lx + 3, 41, "#FF8800", s); px(ctx, rx + 3, 41, "#FF8800", s)
      break
  }
}

// ============================================================
// BOOTS (48x48)
// ============================================================

function drawBootsEquip(ctx: Ctx, bootsId: string, s: number) {
  switch (bootsId) {
    case "leather-boots":
      rect(ctx, 14, 41, 7, 4, "#6B4226", s)
      rect(ctx, 27, 41, 7, 4, "#6B4226", s)
      rect(ctx, 13, 44, 8, 2, "#5B3216", s)
      rect(ctx, 27, 44, 8, 2, "#5B3216", s)
      outline(ctx, 14, 41, 7, 4, "#3B1206", s)
      outline(ctx, 27, 41, 7, 4, "#3B1206", s)
      break
    case "fur-boots":
      rect(ctx, 14, 39, 7, 6, "#7A6A5A", s)
      rect(ctx, 27, 39, 7, 6, "#7A6A5A", s)
      rect(ctx, 14, 39, 7, 3, "#9A8A6A", s)
      rect(ctx, 27, 39, 7, 3, "#9A8A6A", s)
      rect(ctx, 13, 44, 8, 2, "#6A5A4A", s)
      rect(ctx, 27, 44, 8, 2, "#6A5A4A", s)
      // fur texture
      for (let i = 0; i < 7; i += 2) {
        px(ctx, 14 + i, 40, "#AA9A7A", s)
        px(ctx, 27 + i, 40, "#AA9A7A", s)
      }
      break
    case "iron-toe":
      rect(ctx, 14, 41, 7, 4, "#6B4226", s)
      rect(ctx, 27, 41, 7, 4, "#6B4226", s)
      rect(ctx, 13, 43, 4, 3, "#8A8A8A", s)
      rect(ctx, 27, 43, 4, 3, "#8A8A8A", s)
      outline(ctx, 13, 43, 4, 3, "#5A5A5A", s)
      outline(ctx, 27, 43, 4, 3, "#5A5A5A", s)
      // rivets
      px(ctx, 14, 44, "#AAAAAA", s)
      px(ctx, 28, 44, "#AAAAAA", s)
      break
    case "silent-hunter":
      rect(ctx, 14, 42, 7, 3, "#3A3A3A", s)
      rect(ctx, 27, 42, 7, 3, "#3A3A3A", s)
      rect(ctx, 14, 42, 7, 1, "#4A4A4A", s)
      rect(ctx, 27, 42, 7, 1, "#4A4A4A", s)
      outline(ctx, 14, 42, 7, 3, "#1A1A1A", s)
      outline(ctx, 27, 42, 7, 3, "#1A1A1A", s)
      break
    case "stormforged":
      rect(ctx, 13, 39, 8, 7, "#4A4A5A", s)
      rect(ctx, 27, 39, 8, 7, "#4A4A5A", s)
      rect(ctx, 13, 39, 8, 2, "#5A5A6A", s)
      rect(ctx, 27, 39, 8, 2, "#5A5A6A", s)
      outline(ctx, 13, 39, 8, 7, "#2A2A3A", s)
      outline(ctx, 27, 39, 8, 7, "#2A2A3A", s)
      px(ctx, 16, 42, "#4AF0FF", s); px(ctx, 30, 42, "#4AF0FF", s)
      px(ctx, 17, 44, "#4AF0FF", s); px(ctx, 31, 44, "#4AF0FF", s)
      break
    // NEW
    case "bone-treads":
      rect(ctx, 14, 40, 7, 5, "#C4B898", s)
      rect(ctx, 27, 40, 7, 5, "#C4B898", s)
      rect(ctx, 14, 40, 7, 2, "#D4C8A8", s)
      rect(ctx, 27, 40, 7, 2, "#D4C8A8", s)
      outline(ctx, 14, 40, 7, 5, "#8A7A5A", s)
      outline(ctx, 27, 40, 7, 5, "#8A7A5A", s)
      // bone spikes
      px(ctx, 13, 42, "#B4A888", s); px(ctx, 34, 42, "#B4A888", s)
      break
    case "flamestep":
      rect(ctx, 14, 40, 7, 5, "#3A1A0A", s)
      rect(ctx, 27, 40, 7, 5, "#3A1A0A", s)
      outline(ctx, 14, 40, 7, 5, "#1A0A00", s)
      outline(ctx, 27, 40, 7, 5, "#1A0A00", s)
      // flame glow at sole
      px(ctx, 15, 44, "#FF6600", s); px(ctx, 17, 44, "#FF8800", s); px(ctx, 19, 44, "#FF4400", s)
      px(ctx, 28, 44, "#FF6600", s); px(ctx, 30, 44, "#FF8800", s); px(ctx, 32, 44, "#FF4400", s)
      break
    case "shadow-step":
      rect(ctx, 14, 41, 7, 4, "#1A1A2A", s)
      rect(ctx, 27, 41, 7, 4, "#1A1A2A", s)
      rect(ctx, 14, 41, 7, 1, "#2A2A3A", s)
      rect(ctx, 27, 41, 7, 1, "#2A2A3A", s)
      outline(ctx, 14, 41, 7, 4, "#0A0A1A", s)
      outline(ctx, 27, 41, 7, 4, "#0A0A1A", s)
      // shadow wisp
      px(ctx, 13, 44, "#2A2A4A", s); px(ctx, 35, 44, "#2A2A4A", s)
      break
  }
}

// ============================================================
// WEAPON RENDERING (48x48)
// ============================================================

function drawWeaponEquip(ctx: Ctx, weaponId: string, bodyType: string, s: number) {
  const handX = bodyType === "warrior" ? 42 : 38

  switch (weaponId) {
    case "bearded-axe": {
      // handle
      rect(ctx, handX, 16, 2, 24, "#6B4226", s)
      rect(ctx, handX, 16, 1, 24, "#7B5236", s)
      // axe head
      rect(ctx, handX + 2, 16, 5, 3, "#8A8A8A", s)
      rect(ctx, handX + 2, 19, 6, 5, "#7A7A7A", s)
      rect(ctx, handX + 3, 24, 5, 3, "#8A8A8A", s)
      // edge highlight
      rect(ctx, handX + 7, 18, 1, 8, "#CCCCCC", s)
      // shadow on blade
      rect(ctx, handX + 2, 22, 3, 2, "#6A6A6A", s)
      break
    }
    case "longsword": {
      // blade
      rect(ctx, handX + 1, 6, 3, 22, "#AAAAAA", s)
      rect(ctx, handX + 1, 6, 1, 22, "#CCCCCC", s) // edge highlight
      rect(ctx, handX + 3, 6, 1, 22, "#888888", s) // shadow
      rect(ctx, handX + 1, 6, 3, 3, "#DDDDDD", s) // tip
      // guard
      rect(ctx, handX - 2, 28, 8, 2, "#C4A41A", s)
      rect(ctx, handX - 2, 28, 8, 1, "#E4C43A", s)
      // handle
      rect(ctx, handX + 1, 30, 3, 6, "#6B4226", s)
      rect(ctx, handX + 2, 30, 1, 6, "#7B5236", s)
      // pommel
      rect(ctx, handX, 36, 5, 2, "#C4A41A", s)
      break
    }
    case "war-spear": {
      rect(ctx, handX + 1, 4, 2, 36, "#6B4226", s)
      rect(ctx, handX + 2, 4, 1, 36, "#7B5236", s)
      // spearhead
      rect(ctx, handX, 0, 4, 6, "#8A8A8A", s)
      rect(ctx, handX + 1, -2, 2, 3, "#CCCCCC", s)
      rect(ctx, handX, 0, 1, 6, "#AAAAAA", s)
      break
    }
    case "twin-seax": {
      // left dagger (behind character)
      rect(ctx, 3, 24, 2, 12, "#6B4226", s)
      rect(ctx, 2, 18, 4, 6, "#AAAAAA", s)
      rect(ctx, 2, 18, 1, 6, "#CCCCCC", s)
      rect(ctx, 3, 16, 2, 3, "#DDDDDD", s)
      // right dagger
      rect(ctx, handX + 1, 24, 2, 12, "#6B4226", s)
      rect(ctx, handX, 18, 4, 6, "#AAAAAA", s)
      rect(ctx, handX, 18, 1, 6, "#CCCCCC", s)
      rect(ctx, handX + 1, 16, 2, 3, "#DDDDDD", s)
      break
    }
    case "runic-hammer": {
      // handle
      rect(ctx, handX + 1, 12, 3, 28, "#6B4226", s)
      rect(ctx, handX + 2, 12, 1, 28, "#7B5236", s)
      // hammer head
      rect(ctx, handX - 4, 4, 12, 9, "#5A5A6A", s)
      rect(ctx, handX - 4, 4, 12, 3, "#6A6A7A", s)
      outline(ctx, handX - 4, 4, 12, 9, "#2A2A3A", s)
      // rune glow
      const g = "#4AF0FF"
      px(ctx, handX - 2, 7, g, s); px(ctx, handX, 8, g, s)
      px(ctx, handX + 3, 7, g, s); px(ctx, handX + 5, 8, g, s)
      px(ctx, handX + 1, 10, g, s)
      break
    }
    // NEW WEAPONS
    case "frost-cleaver": {
      rect(ctx, handX, 14, 2, 26, "#4A6A7A", s)
      rect(ctx, handX + 2, 10, 6, 4, "#8AB4D0", s)
      rect(ctx, handX + 2, 14, 7, 8, "#6A9AB0", s)
      rect(ctx, handX + 8, 13, 1, 10, "#B0E0FF", s) // ice edge
      outline(ctx, handX + 2, 10, 7, 12, "#3A5A6A", s)
      // ice crystals
      px(ctx, handX + 4, 12, "#E0F4FF", s)
      px(ctx, handX + 6, 16, "#B0E0FF", s)
      break
    }
    case "bloodthirst-blade": {
      rect(ctx, handX + 1, 4, 3, 26, "#8A3A3A", s)
      rect(ctx, handX + 1, 4, 1, 26, "#AA5A5A", s)
      rect(ctx, handX + 3, 4, 1, 26, "#6A1A1A", s)
      rect(ctx, handX + 1, 4, 3, 3, "#CC6666", s)
      rect(ctx, handX - 2, 30, 8, 2, "#4A1A1A", s)
      rect(ctx, handX + 1, 32, 3, 5, "#3A0A0A", s)
      // blood drip
      px(ctx, handX + 2, 2, "#FF0000", s)
      px(ctx, handX + 1, 1, "#CC0000", s)
      break
    }
    case "thunder-mace": {
      rect(ctx, handX + 1, 14, 2, 26, "#6B4226", s)
      // mace head
      rect(ctx, handX - 2, 6, 8, 8, "#7A7A7A", s)
      outline(ctx, handX - 2, 6, 8, 8, "#3A3A3A", s)
      // flanges
      px(ctx, handX - 3, 8, "#8A8A8A", s); px(ctx, handX - 3, 10, "#8A8A8A", s)
      px(ctx, handX + 6, 8, "#8A8A8A", s); px(ctx, handX + 6, 10, "#8A8A8A", s)
      // lightning
      px(ctx, handX, 8, "#FFFF44", s); px(ctx, handX + 3, 10, "#FFFF44", s)
      break
    }
    case "shield-of-odin": {
      // Round shield on left arm
      rect(ctx, 0, 20, 12, 14, "#5A4A3A", s)
      rect(ctx, 1, 19, 10, 1, "#5A4A3A", s)
      rect(ctx, 1, 34, 10, 1, "#5A4A3A", s)
      outline(ctx, 0, 20, 12, 14, "#2A1A0A", s)
      // rim
      rect(ctx, 0, 20, 12, 2, "#7A6A4A", s)
      rect(ctx, 0, 32, 12, 2, "#7A6A4A", s)
      // boss (center)
      rect(ctx, 4, 25, 4, 4, "#C4A41A", s)
      px(ctx, 5, 26, "#E4C43A", s)
      // rune
      px(ctx, 2, 23, "#4AF0FF", s); px(ctx, 9, 23, "#4AF0FF", s)
      px(ctx, 2, 30, "#4AF0FF", s); px(ctx, 9, 30, "#4AF0FF", s)
      break
    }
    case "ragnarok-greatsword": {
      // massive blade
      rect(ctx, handX, 0, 4, 30, "#8A8AAA", s)
      rect(ctx, handX, 0, 1, 30, "#AAAACC", s) // highlight
      rect(ctx, handX + 3, 0, 1, 30, "#6A6A8A", s) // shadow
      rect(ctx, handX, 0, 4, 3, "#CCCCEE", s) // tip glow
      // runes along blade
      for (let y = 4; y < 28; y += 5) {
        px(ctx, handX + 1, y, "#D4A44A", s)
        px(ctx, handX + 2, y + 1, "#D4A44A", s)
      }
      // massive guard
      rect(ctx, handX - 4, 30, 12, 3, "#C4A41A", s)
      rect(ctx, handX - 4, 30, 12, 1, "#E4C43A", s)
      // handle
      rect(ctx, handX, 33, 4, 8, "#4A2A1A", s)
      rect(ctx, handX + 1, 33, 2, 8, "#5A3A2A", s)
      // pommel
      rect(ctx, handX - 1, 41, 6, 3, "#C4A41A", s)
      px(ctx, handX + 1, 42, "#FF3333", s) // gem
      break
    }
  }
}

// ============================================================
// STANDALONE ITEM RENDERING (for item grid display)
// ============================================================

export function drawItemSprite(ctx: Ctx, slot: string, itemId: string, scale: number = 3) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  switch (slot) {
    case "helmet": drawHelmetItem(ctx, itemId, scale); break
    case "chest": drawChestItem(ctx, itemId, scale); break
    case "gloves": drawGlovesItem(ctx, itemId, scale); break
    case "pants": drawPantsItem(ctx, itemId, scale); break
    case "boots": drawBootsItem(ctx, itemId, scale); break
    case "weapon": drawWeaponItem(ctx, itemId, scale); break
  }
}

function drawHelmetItem(ctx: Ctx, id: string, s: number) {
  // Center display in 24x24 grid
  switch (id) {
    case "iron-nasal":
      rect(ctx, 4, 4, 16, 10, "#7A7A7A", s)
      rect(ctx, 4, 4, 16, 3, "#9A9A9A", s)
      rect(ctx, 4, 12, 16, 2, "#5A5A5A", s)
      outline(ctx, 4, 4, 16, 10, "#3A3A3A", s)
      rect(ctx, 11, 4, 2, 14, "#6A6A6A", s)
      px(ctx, 7, 7, "#AAAAAA", s); px(ctx, 15, 7, "#AAAAAA", s)
      break
    case "bear-head":
      rect(ctx, 3, 2, 18, 12, "#6B3A1A", s)
      rect(ctx, 3, 2, 18, 3, "#8B5A3A", s)
      outline(ctx, 3, 2, 18, 12, "#2A0A00", s)
      rect(ctx, 3, 2, 4, 4, "#5B2A0A", s)
      rect(ctx, 17, 2, 4, 4, "#5B2A0A", s)
      px(ctx, 5, 3, "#8B5A3A", s); px(ctx, 18, 3, "#8B5A3A", s)
      rect(ctx, 3, 12, 18, 2, "#8B6A4A", s)
      break
    case "raven-skull":
      rect(ctx, 4, 3, 16, 11, "#2A2A3A", s)
      rect(ctx, 4, 3, 16, 3, "#3A3A4A", s)
      outline(ctx, 4, 3, 16, 11, "#0A0A1A", s)
      rect(ctx, 9, 1, 6, 3, "#4A4A4A", s)
      rect(ctx, 10, 0, 4, 2, "#3A3A3A", s)
      px(ctx, 6, 7, "#D4D4D4", s); px(ctx, 17, 7, "#D4D4D4", s)
      px(ctx, 8, 9, "#D4D4D4", s); px(ctx, 15, 9, "#D4D4D4", s)
      break
    case "jarl-gilded":
      rect(ctx, 4, 3, 16, 11, "#C4A41A", s)
      rect(ctx, 4, 3, 16, 3, "#E4C43A", s)
      rect(ctx, 4, 12, 16, 2, "#A4841A", s)
      outline(ctx, 4, 3, 16, 11, "#7A5A00", s)
      rect(ctx, 6, 1, 3, 3, "#E4C43A", s)
      rect(ctx, 10, 0, 4, 3, "#E4C43A", s)
      rect(ctx, 15, 1, 3, 3, "#E4C43A", s)
      px(ctx, 11, 7, "#FF3333", s); px(ctx, 12, 7, "#FF3333", s)
      break
    case "runic-war":
      rect(ctx, 4, 3, 16, 11, "#5A5A6A", s)
      rect(ctx, 4, 3, 16, 3, "#7A7A8A", s)
      outline(ctx, 4, 3, 16, 11, "#1A1A2A", s)
      rect(ctx, 2, 5, 3, 6, "#5A5A6A", s)
      rect(ctx, 19, 5, 3, 6, "#5A5A6A", s)
      px(ctx, 7, 7, "#4AF0FF", s); px(ctx, 9, 8, "#4AF0FF", s)
      px(ctx, 11, 7, "#4AF0FF", s); px(ctx, 13, 9, "#4AF0FF", s)
      px(ctx, 15, 7, "#4AF0FF", s); px(ctx, 17, 8, "#4AF0FF", s)
      break
    case "wolf-skull":
      rect(ctx, 3, 3, 18, 11, "#5A5A5A", s)
      rect(ctx, 3, 3, 18, 3, "#7A7A7A", s)
      outline(ctx, 3, 3, 18, 11, "#2A2A2A", s)
      rect(ctx, 8, 0, 8, 4, "#6A6A6A", s)
      px(ctx, 9, 1, "#DDDDDD", s); px(ctx, 14, 1, "#DDDDDD", s)
      px(ctx, 11, 7, "#FF4444", s); px(ctx, 12, 7, "#FF4444", s)
      break
    case "valkyrie-wing":
      rect(ctx, 4, 3, 16, 11, "#8A8AAA", s)
      rect(ctx, 4, 3, 16, 3, "#AAAACC", s)
      outline(ctx, 4, 3, 16, 11, "#4A4A6A", s)
      rect(ctx, 1, 1, 4, 7, "#9A9ABB", s)
      rect(ctx, 19, 1, 4, 7, "#9A9ABB", s)
      px(ctx, 11, 7, "#4AF0FF", s); px(ctx, 12, 7, "#4AF0FF", s)
      break
    case "dragonbone":
      rect(ctx, 3, 3, 18, 11, "#D4C8A8", s)
      rect(ctx, 3, 3, 18, 3, "#E4D8B8", s)
      outline(ctx, 3, 3, 18, 11, "#8A7A5A", s)
      rect(ctx, 2, 0, 3, 5, "#C4B898", s)
      rect(ctx, 19, 0, 3, 5, "#C4B898", s)
      px(ctx, 8, 7, "#A49878", s); px(ctx, 15, 7, "#A49878", s)
      break
  }
}

function drawChestItem(ctx: Ctx, id: string, s: number) {
  switch (id) {
    case "leather-vest":
      rect(ctx, 3, 3, 18, 14, "#8B6914", s)
      rect(ctx, 3, 3, 18, 3, "#9B7924", s)
      rect(ctx, 3, 15, 18, 2, "#7B5904", s)
      outline(ctx, 3, 3, 18, 14, "#4A3000", s)
      for (let i = 0; i < 18; i += 3) px(ctx, 3 + i, 10, "#6B4904", s)
      rect(ctx, 10, 8, 4, 2, "#C4A41A", s)
      break
    case "chainmail":
      rect(ctx, 3, 3, 18, 14, "#8A8A8A", s)
      rect(ctx, 3, 3, 18, 3, "#9A9A9A", s)
      outline(ctx, 3, 3, 18, 14, "#3A3A3A", s)
      for (let iy = 7; iy < 17; iy += 2)
        for (let ix = 3; ix < 21; ix += 2) px(ctx, ix, iy, "#5A5A5A", s)
      break
    case "fur-cloak":
      rect(ctx, 3, 4, 18, 13, "#5A4A3A", s)
      rect(ctx, 2, 2, 20, 4, "#8B7A5A", s)
      outline(ctx, 3, 4, 18, 13, "#2A1A0A", s)
      for (let ix = 3; ix < 21; ix += 2) px(ctx, ix, 3, "#9A8A6A", s)
      break
    case "berserker-harness":
      rect(ctx, 3, 3, 18, 14, "#4A3A2A", s)
      rect(ctx, 3, 3, 5, 6, "#6A5A4A", s)
      rect(ctx, 16, 3, 5, 6, "#6A5A4A", s)
      outline(ctx, 3, 3, 18, 14, "#1A0A00", s)
      for (let i = 0; i < 10; i++) { px(ctx, 5 + i, 5 + i, "#8B6914", s); px(ctx, 18 - i, 5 + i, "#8B6914", s) }
      px(ctx, 12, 9, "#CC3333", s); px(ctx, 12, 12, "#CC3333", s)
      break
    case "runestone-plate":
      rect(ctx, 3, 3, 18, 14, "#4A4A5A", s)
      rect(ctx, 3, 3, 18, 3, "#5A5A6A", s)
      rect(ctx, 3, 15, 18, 2, "#3A3A4A", s)
      outline(ctx, 3, 3, 18, 14, "#1A1A2A", s)
      px(ctx, 7, 9, "#4AF0FF", s); px(ctx, 10, 10, "#4AF0FF", s)
      px(ctx, 14, 9, "#4AF0FF", s); px(ctx, 17, 10, "#4AF0FF", s)
      break
    case "bone-cuirass":
      rect(ctx, 3, 3, 18, 14, "#C4B898", s)
      rect(ctx, 3, 3, 18, 3, "#D4C8A8", s)
      outline(ctx, 3, 3, 18, 14, "#7A6A4A", s)
      rect(ctx, 10, 7, 4, 4, "#E4D8B8", s)
      px(ctx, 11, 8, "#1A1A1A", s); px(ctx, 12, 8, "#1A1A1A", s)
      break
    case "stormweave":
      rect(ctx, 3, 3, 18, 14, "#2A3A5A", s)
      rect(ctx, 3, 3, 18, 3, "#3A4A6A", s)
      outline(ctx, 3, 3, 18, 14, "#0A1A3A", s)
      px(ctx, 7, 8, "#88CCFF", s); px(ctx, 9, 10, "#88CCFF", s)
      px(ctx, 14, 8, "#88CCFF", s); px(ctx, 16, 10, "#88CCFF", s)
      break
    case "bloodforge-mail":
      rect(ctx, 3, 3, 18, 14, "#4A1A1A", s)
      rect(ctx, 3, 3, 18, 3, "#6A2A2A", s)
      outline(ctx, 3, 3, 18, 14, "#1A0000", s)
      for (let iy = 7; iy < 17; iy += 2)
        for (let ix = 3; ix < 21; ix += 2) px(ctx, ix, iy, "#2A0A0A", s)
      px(ctx, 12, 8, "#FF4444", s)
      break
  }
}

function drawGlovesItem(ctx: Ctx, id: string, s: number) {
  const pairs: Record<string, [string, string, string?]> = {
    "leather-wraps": ["#8B6914", "#9B7924", "#7B5904"],
    "fur-gauntlets": ["#7A6A5A", "#9A8A6A", "#5A4A3A"],
    "iron-bracers": ["#7A7A7A", "#9A9A9A", "#5A5A5A"],
    "berserker-wraps": ["#4A2A1A", "#5A3A2A", "#3A1A0A"],
    "runic-gauntlets": ["#4A4A5A", "#5A5A6A", "#3A3A4A"],
    "spiked-fists": ["#5A5A5A", "#7A7A7A", "#3A3A3A"],
    "dragonscale-grips": ["#2A5A3A", "#3A6A4A", "#1A4A2A"],
    "ember-wraps": ["#4A2A0A", "#5A3A1A", "#3A1A00"],
  }
  const [base, hi, dk] = pairs[id] || ["#8B6914", "#9B7924", "#7B5904"]
  rect(ctx, 3, 5, 8, 12, base, s)
  rect(ctx, 13, 5, 8, 12, base, s)
  rect(ctx, 3, 5, 8, 3, hi, s)
  rect(ctx, 13, 5, 8, 3, hi, s)
  outline(ctx, 3, 5, 8, 12, dk || darken(base, 30), s)
  outline(ctx, 13, 5, 8, 12, dk || darken(base, 30), s)
  // special marks
  if (id === "runic-gauntlets") { px(ctx, 6, 10, "#4AF0FF", s); px(ctx, 16, 10, "#4AF0FF", s) }
  if (id === "berserker-wraps") { px(ctx, 7, 10, "#CC3333", s); px(ctx, 17, 10, "#CC3333", s) }
  if (id === "spiked-fists") { px(ctx, 2, 8, "#AAAAAA", s); px(ctx, 21, 8, "#AAAAAA", s) }
  if (id === "ember-wraps") { px(ctx, 6, 10, "#FF6600", s); px(ctx, 16, 10, "#FF6600", s) }
  if (id === "dragonscale-grips") { px(ctx, 6, 10, "#4A8A5A", s); px(ctx, 16, 10, "#4A8A5A", s) }
}

function drawPantsItem(ctx: Ctx, id: string, s: number) {
  const colors: Record<string, [string, string, string?]> = {
    "wool-trousers": ["#6A5A3A", "#7A6A4A", "#3A2A1A"],
    "leather-leggings": ["#5A4A2A", "#6A5A3A", "#2A1A0A"],
    "frost-greaves": ["#5A6A7A", "#8A7A6A", "#2A3A4A"],
    "berserker-skirt": ["#5A4A3A", "#7A6A4A", "#2A1A0A"],
    "runic-legguards": ["#4A4A5A", "#5A5A6A", "#2A2A3A"],
    "iron-chain-skirt": ["#7A7A7A", "#9A9A9A", "#3A3A3A"],
    "shadow-leggings": ["#1A1A2A", "#2A2A3A", "#0A0A1A"],
    "flame-guards": ["#3A1A0A", "#5A2A1A", "#1A0A00"],
  }
  const [base, hi, dk] = colors[id] || ["#6A5A3A", "#7A6A4A", "#3A2A1A"]
  // waist
  rect(ctx, 3, 2, 18, 6, base, s)
  rect(ctx, 3, 2, 18, 2, hi, s)
  // legs
  rect(ctx, 3, 8, 8, 10, base, s)
  rect(ctx, 13, 8, 8, 10, base, s)
  outline(ctx, 3, 2, 18, 6, dk || "#2A1A0A", s)
  outline(ctx, 3, 8, 8, 10, dk || "#2A1A0A", s)
  outline(ctx, 13, 8, 8, 10, dk || "#2A1A0A", s)
  if (id === "runic-legguards") { px(ctx, 6, 12, "#4AF0FF", s); px(ctx, 16, 12, "#4AF0FF", s) }
  if (id === "flame-guards") { px(ctx, 6, 14, "#FF6600", s); px(ctx, 16, 14, "#FF6600", s) }
  if (id === "shadow-leggings") { px(ctx, 6, 13, "#3A3A5A", s); px(ctx, 16, 13, "#3A3A5A", s) }
}

function drawBootsItem(ctx: Ctx, id: string, s: number) {
  const colors: Record<string, [string, string, string?]> = {
    "leather-boots": ["#6B4226", "#7B5236", "#3B1206"],
    "fur-boots": ["#7A6A5A", "#9A8A6A", "#4A3A2A"],
    "iron-toe": ["#6B4226", "#7B5236", "#3B1206"],
    "silent-hunter": ["#3A3A3A", "#4A4A4A", "#1A1A1A"],
    "stormforged": ["#4A4A5A", "#5A5A6A", "#2A2A3A"],
    "bone-treads": ["#C4B898", "#D4C8A8", "#8A7A5A"],
    "flamestep": ["#3A1A0A", "#5A2A1A", "#1A0A00"],
    "shadow-step": ["#1A1A2A", "#2A2A3A", "#0A0A1A"],
  }
  const [base, hi, dk] = colors[id] || ["#6B4226", "#7B5236", "#3B1206"]
  rect(ctx, 3, 6, 8, 8, base, s)
  rect(ctx, 13, 6, 8, 8, base, s)
  rect(ctx, 3, 6, 8, 3, hi, s)
  rect(ctx, 13, 6, 8, 3, hi, s)
  rect(ctx, 2, 12, 10, 3, dk || "#5B3216", s)
  rect(ctx, 12, 12, 10, 3, dk || "#5B3216", s)
  outline(ctx, 3, 6, 8, 8, dk || "#3A1A0A", s)
  outline(ctx, 13, 6, 8, 8, dk || "#3A1A0A", s)
  if (id === "stormforged") { px(ctx, 6, 10, "#4AF0FF", s); px(ctx, 16, 10, "#4AF0FF", s) }
  if (id === "iron-toe") { rect(ctx, 2, 11, 3, 3, "#8A8A8A", s); rect(ctx, 12, 11, 3, 3, "#8A8A8A", s) }
  if (id === "flamestep") { px(ctx, 5, 13, "#FF6600", s); px(ctx, 7, 13, "#FF8800", s); px(ctx, 15, 13, "#FF6600", s); px(ctx, 17, 13, "#FF8800", s) }
  if (id === "bone-treads") { px(ctx, 2, 10, "#B4A888", s); px(ctx, 21, 10, "#B4A888", s) }
  if (id === "shadow-step") { px(ctx, 2, 13, "#2A2A4A", s); px(ctx, 21, 13, "#2A2A4A", s) }
}

function drawWeaponItem(ctx: Ctx, id: string, s: number) {
  switch (id) {
    case "bearded-axe":
      rect(ctx, 11, 2, 2, 18, "#6B4226", s)
      rect(ctx, 13, 3, 5, 3, "#8A8A8A", s)
      rect(ctx, 13, 6, 6, 4, "#7A7A7A", s)
      rect(ctx, 14, 10, 5, 3, "#8A8A8A", s)
      rect(ctx, 18, 5, 2, 7, "#CCCCCC", s)
      outline(ctx, 13, 3, 7, 10, "#4A4A4A", s)
      break
    case "longsword":
      rect(ctx, 11, 1, 2, 16, "#AAAAAA", s)
      rect(ctx, 11, 1, 1, 16, "#CCCCCC", s)
      rect(ctx, 11, 1, 2, 3, "#DDDDDD", s)
      rect(ctx, 8, 17, 8, 1, "#C4A41A", s)
      rect(ctx, 11, 18, 2, 4, "#6B4226", s)
      rect(ctx, 10, 22, 4, 2, "#C4A41A", s)
      break
    case "war-spear":
      rect(ctx, 11, 4, 2, 18, "#6B4226", s)
      rect(ctx, 10, 1, 4, 5, "#8A8A8A", s)
      rect(ctx, 11, 0, 2, 2, "#CCCCCC", s)
      outline(ctx, 10, 1, 4, 5, "#5A5A5A", s)
      break
    case "twin-seax":
      rect(ctx, 6, 4, 1, 10, "#6B4226", s)
      rect(ctx, 5, 1, 3, 5, "#AAAAAA", s)
      rect(ctx, 6, 0, 1, 2, "#CCCCCC", s)
      rect(ctx, 17, 4, 1, 10, "#6B4226", s)
      rect(ctx, 16, 1, 3, 5, "#AAAAAA", s)
      rect(ctx, 17, 0, 1, 2, "#CCCCCC", s)
      break
    case "runic-hammer":
      rect(ctx, 11, 8, 2, 14, "#6B4226", s)
      rect(ctx, 6, 2, 12, 7, "#5A5A6A", s)
      rect(ctx, 6, 2, 12, 3, "#6A6A7A", s)
      outline(ctx, 6, 2, 12, 7, "#2A2A3A", s)
      px(ctx, 8, 5, "#4AF0FF", s); px(ctx, 11, 4, "#4AF0FF", s)
      px(ctx, 14, 5, "#4AF0FF", s); px(ctx, 10, 6, "#4AF0FF", s)
      break
    case "frost-cleaver":
      rect(ctx, 11, 4, 2, 16, "#4A6A7A", s)
      rect(ctx, 13, 2, 6, 4, "#8AB4D0", s)
      rect(ctx, 13, 6, 7, 6, "#6A9AB0", s)
      rect(ctx, 19, 5, 1, 8, "#B0E0FF", s)
      outline(ctx, 13, 2, 7, 10, "#3A5A6A", s)
      break
    case "bloodthirst-blade":
      rect(ctx, 11, 1, 2, 18, "#8A3A3A", s)
      rect(ctx, 11, 1, 1, 18, "#AA5A5A", s)
      rect(ctx, 11, 1, 2, 3, "#CC6666", s)
      rect(ctx, 8, 19, 8, 1, "#4A1A1A", s)
      rect(ctx, 11, 20, 2, 3, "#3A0A0A", s)
      px(ctx, 12, 0, "#FF0000", s)
      break
    case "thunder-mace":
      rect(ctx, 11, 10, 2, 12, "#6B4226", s)
      rect(ctx, 7, 2, 10, 8, "#7A7A7A", s)
      outline(ctx, 7, 2, 10, 8, "#3A3A3A", s)
      px(ctx, 6, 4, "#8A8A8A", s); px(ctx, 6, 7, "#8A8A8A", s)
      px(ctx, 17, 4, "#8A8A8A", s); px(ctx, 17, 7, "#8A8A8A", s)
      px(ctx, 10, 5, "#FFFF44", s); px(ctx, 13, 6, "#FFFF44", s)
      break
    case "shield-of-odin":
      rect(ctx, 4, 3, 16, 16, "#5A4A3A", s)
      rect(ctx, 5, 2, 14, 1, "#5A4A3A", s)
      rect(ctx, 5, 19, 14, 1, "#5A4A3A", s)
      outline(ctx, 4, 3, 16, 16, "#2A1A0A", s)
      rect(ctx, 4, 3, 16, 2, "#7A6A4A", s)
      rect(ctx, 4, 17, 16, 2, "#7A6A4A", s)
      rect(ctx, 10, 9, 4, 4, "#C4A41A", s)
      px(ctx, 11, 10, "#E4C43A", s)
      break
    case "ragnarok-greatsword":
      rect(ctx, 11, 0, 3, 18, "#8A8AAA", s)
      rect(ctx, 11, 0, 1, 18, "#AAAACC", s)
      rect(ctx, 11, 0, 3, 2, "#CCCCEE", s)
      for (let y = 3; y < 16; y += 4) px(ctx, 12, y, "#D4A44A", s)
      rect(ctx, 8, 18, 8, 2, "#C4A41A", s)
      rect(ctx, 11, 20, 3, 4, "#4A2A1A", s)
      break
  }
}

// ============================================================
// MONSTER RENDERING (48x48 with shadows and detail)
// ============================================================

export function drawMonster(ctx: Ctx, monsterId: string, scale: number = 4) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  switch (monsterId) {
    case "draugr-warrior": drawDraugr(ctx, scale); break
    case "frost-wisp": drawFrostWisp(ctx, scale); break
    case "viking-raider": drawVikingRaider(ctx, scale); break
    case "ice-golem": drawIceGolem(ctx, scale); break
    case "fenrir-wolf": drawFenrirWolf(ctx, scale); break
    case "seidr-witch": drawSeidrWitch(ctx, scale); break
    case "jotunn-brute": drawJotunnBrute(ctx, scale); break
    case "valkyrie-shade": drawValkyrieShade(ctx, scale); break
    case "nidhoggr-spawn": drawNidhoggrSpawn(ctx, scale); break
    case "cultist-loki": drawCultistLoki(ctx, scale); break
  }
}

function drawDraugr(ctx: Ctx, s: number) {
  const skin = "#4A5A3A", skinD = "#2A3A1A", skinH = "#5A6A4A"
  groundShadow(ctx, 24, 47, 10, 2, s)
  // Head
  rect(ctx, 15, 5, 18, 14, skin, s)
  rect(ctx, 16, 4, 16, 1, skin, s)
  rect(ctx, 15, 5, 18, 3, skinH, s)
  rect(ctx, 15, 16, 18, 3, skinD, s)
  outline(ctx, 15, 5, 18, 14, "#1A2A0A", s)
  // Glowing eyes
  rect(ctx, 19, 10, 3, 3, "#88FF22", s)
  rect(ctx, 27, 10, 3, 3, "#88FF22", s)
  px(ctx, 20, 11, "#CCFF88", s); px(ctx, 28, 11, "#CCFF88", s)
  // Eye glow aura
  rect(ctx, 18, 9, 5, 5, "#88FF2220", s)
  rect(ctx, 26, 9, 5, 5, "#88FF2220", s)
  // Decayed mouth
  rect(ctx, 22, 15, 5, 2, skinD, s)
  px(ctx, 23, 15, "#2A2A1A", s); px(ctx, 25, 15, "#2A2A1A", s)
  px(ctx, 24, 16, "#DDDDCC", s) // tooth
  // Rusted helm
  rect(ctx, 14, 1, 20, 7, "#5A3A1A", s)
  rect(ctx, 14, 1, 20, 2, "#6A4A2A", s)
  rect(ctx, 14, 6, 20, 2, "#3A1A0A", s)
  outline(ctx, 14, 1, 20, 7, "#1A0A00", s)
  // rust spots
  px(ctx, 18, 3, "#7A5A2A", s); px(ctx, 28, 4, "#7A5A2A", s)
  // Body - tattered armor
  rect(ctx, 12, 20, 24, 12, "#3A3A2A", s)
  rect(ctx, 12, 20, 24, 3, "#4A4A3A", s)
  rect(ctx, 12, 29, 24, 3, "#2A2A1A", s)
  outline(ctx, 12, 20, 24, 12, "#1A1A0A", s)
  // Rust and holes
  px(ctx, 16, 24, "#5A3A1A", s); px(ctx, 22, 26, "#5A3A1A", s)
  px(ctx, 30, 23, "#5A3A1A", s); px(ctx, 26, 28, skinD, s)
  // exposed bone at hole
  px(ctx, 20, 25, "#CCCCAA", s)
  // Arms
  rect(ctx, 7, 20, 5, 14, skin, s)
  rect(ctx, 7, 20, 5, 3, skinH, s)
  rect(ctx, 7, 31, 5, 3, skinD, s)
  outline(ctx, 7, 20, 5, 14, "#1A2A0A", s)
  rect(ctx, 36, 20, 5, 14, skin, s)
  rect(ctx, 36, 20, 5, 3, skinH, s)
  rect(ctx, 36, 31, 5, 3, skinD, s)
  outline(ctx, 36, 20, 5, 14, "#1A2A0A", s)
  // Legs
  rect(ctx, 16, 32, 6, 10, skinD, s)
  rect(ctx, 26, 32, 6, 10, skinD, s)
  outline(ctx, 16, 32, 6, 10, "#1A2A0A", s)
  outline(ctx, 26, 32, 6, 10, "#1A2A0A", s)
  // Rusted sword
  rect(ctx, 41, 16, 2, 20, "#6A5A4A", s)
  rect(ctx, 41, 10, 2, 7, "#7A6A5A", s)
  rect(ctx, 40, 8, 4, 3, "#8A7A6A", s)
  rect(ctx, 40, 16, 4, 1, "#5A4A3A", s)
  // rust on sword
  px(ctx, 41, 12, "#6A4A2A", s); px(ctx, 42, 14, "#6A4A2A", s)
}

function drawFrostWisp(ctx: Ctx, s: number) {
  // Glow aura
  ctx.fillStyle = "rgba(176,224,255,0.15)"
  ctx.beginPath()
  ctx.ellipse(24 * s, 20 * s, 14 * s, 14 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  // Outer ring
  ctx.fillStyle = "rgba(176,224,255,0.25)"
  ctx.beginPath()
  ctx.ellipse(24 * s, 20 * s, 10 * s, 10 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  // Core
  rect(ctx, 18, 14, 12, 12, "#B0E0FF", s)
  rect(ctx, 17, 17, 1, 6, "#B0E0FF", s)
  rect(ctx, 30, 17, 1, 6, "#B0E0FF", s)
  rect(ctx, 20, 13, 8, 1, "#B0E0FF", s)
  rect(ctx, 20, 26, 8, 1, "#B0E0FF", s)
  // Highlight
  rect(ctx, 20, 15, 4, 4, "#E0F4FF", s)
  px(ctx, 21, 16, "#FFFFFF", s)
  // Dark center
  rect(ctx, 22, 18, 4, 4, "#6AB0D0", s)
  // Eyes
  rect(ctx, 21, 18, 2, 2, "#FFFFFF", s)
  rect(ctx, 25, 18, 2, 2, "#FFFFFF", s)
  px(ctx, 21, 18, "#E0F4FF", s); px(ctx, 25, 18, "#E0F4FF", s)
  // Ice tendrils
  rect(ctx, 14, 27, 2, 6, "rgba(176,224,255,0.6)", s)
  rect(ctx, 20, 28, 1, 7, "rgba(176,224,255,0.4)", s)
  rect(ctx, 27, 28, 1, 7, "rgba(176,224,255,0.4)", s)
  rect(ctx, 32, 27, 2, 6, "rgba(176,224,255,0.6)", s)
  // Trailing particles
  rect(ctx, 16, 35, 1, 3, "rgba(176,224,255,0.3)", s)
  rect(ctx, 31, 36, 1, 2, "rgba(176,224,255,0.3)", s)
  // Sparkles
  px(ctx, 12, 12, "#E0F4FF", s); px(ctx, 34, 14, "#E0F4FF", s)
  px(ctx, 14, 28, "#E0F4FF", s); px(ctx, 33, 26, "#E0F4FF", s)
  px(ctx, 10, 20, "#B0E0FF", s); px(ctx, 36, 18, "#B0E0FF", s)
}

function drawVikingRaider(ctx: Ctx, s: number) {
  const skin = "#D4A574", skinS = "#B8885C", skinH = "#E8C298"
  groundShadow(ctx, 24, 47, 10, 2, s)
  // Head
  rect(ctx, 15, 5, 18, 14, skin, s)
  rect(ctx, 16, 4, 16, 1, skin, s)
  rect(ctx, 15, 5, 18, 3, skinH, s)
  rect(ctx, 15, 16, 18, 3, skinS, s)
  outline(ctx, 15, 5, 18, 14, darken(skinS, 30), s)
  // Eyes
  rect(ctx, 19, 10, 3, 3, "#1A1A2E", s); rect(ctx, 27, 10, 3, 3, "#1A1A2E", s)
  px(ctx, 19, 10, "#FFFFFF", s); px(ctx, 27, 10, "#FFFFFF", s)
  // War paint
  rect(ctx, 17, 9, 6, 1, "#CC3333", s); rect(ctx, 26, 9, 6, 1, "#CC3333", s)
  rect(ctx, 18, 10, 4, 1, "#AA2222", s); rect(ctx, 27, 10, 4, 1, "#AA2222", s)
  // Wild red hair
  rect(ctx, 14, 1, 20, 6, "#B33A1A", s)
  rect(ctx, 15, 1, 18, 2, "#CC4A2A", s)
  rect(ctx, 12, 4, 3, 12, "#B33A1A", s)
  rect(ctx, 33, 4, 3, 12, "#B33A1A", s)
  rect(ctx, 14, 6, 20, 1, "#8A2A0A", s)
  // Body
  rect(ctx, 13, 20, 22, 12, "#7A5A2A", s)
  rect(ctx, 13, 20, 22, 3, "#8A6A3A", s)
  rect(ctx, 13, 29, 22, 3, "#5A3A1A", s)
  outline(ctx, 13, 20, 22, 12, "#2A1A0A", s)
  // Belt with skull buckle
  rect(ctx, 13, 28, 22, 2, "#4A3A2A", s)
  rect(ctx, 22, 27, 4, 4, "#C4A41A", s)
  // Arms
  rect(ctx, 8, 20, 5, 14, skin, s)
  rect(ctx, 35, 20, 5, 14, skin, s)
  rect(ctx, 8, 20, 5, 3, skinH, s); rect(ctx, 35, 20, 5, 3, skinH, s)
  rect(ctx, 8, 31, 5, 3, skinS, s); rect(ctx, 35, 31, 5, 3, skinS, s)
  outline(ctx, 8, 20, 5, 14, darken(skinS, 30), s)
  outline(ctx, 35, 20, 5, 14, darken(skinS, 30), s)
  // Legs
  rect(ctx, 16, 32, 6, 10, "#5A4A2A", s); rect(ctx, 26, 32, 6, 10, "#5A4A2A", s)
  outline(ctx, 16, 32, 6, 10, "#2A1A0A", s); outline(ctx, 26, 32, 6, 10, "#2A1A0A", s)
  // Boots
  rect(ctx, 15, 40, 7, 4, "#4A3A1A", s); rect(ctx, 26, 40, 7, 4, "#4A3A1A", s)
  // Twin axes
  rect(ctx, 4, 18, 2, 16, "#6B4226", s)
  rect(ctx, 2, 14, 5, 4, "#8A8A8A", s)
  rect(ctx, 1, 15, 7, 2, "#7A7A7A", s)
  rect(ctx, 42, 18, 2, 16, "#6B4226", s)
  rect(ctx, 41, 14, 5, 4, "#8A8A8A", s)
  rect(ctx, 40, 15, 7, 2, "#7A7A7A", s)
}

function drawIceGolem(ctx: Ctx, s: number) {
  const ice = "#8AB4D0", iceH = "#B0D4E8", iceD = "#5A8AA0"
  groundShadow(ctx, 24, 47, 14, 3, s)
  // Head (smaller)
  rect(ctx, 15, 1, 18, 12, ice, s)
  rect(ctx, 15, 1, 18, 3, iceH, s)
  rect(ctx, 15, 10, 18, 3, iceD, s)
  outline(ctx, 15, 1, 18, 12, "#3A6A80", s)
  // Glowing eyes
  rect(ctx, 18, 5, 4, 4, "#4AF0FF", s)
  rect(ctx, 26, 5, 4, 4, "#4AF0FF", s)
  px(ctx, 19, 6, "#FFFFFF", s); px(ctx, 27, 6, "#FFFFFF", s)
  // glow aura
  rect(ctx, 17, 4, 6, 6, "#4AF0FF20", s)
  rect(ctx, 25, 4, 6, 6, "#4AF0FF20", s)
  // Massive body
  rect(ctx, 8, 13, 32, 18, ice, s)
  rect(ctx, 8, 13, 32, 5, iceH, s)
  rect(ctx, 8, 26, 32, 5, iceD, s)
  outline(ctx, 8, 13, 32, 18, "#3A6A80", s)
  // Crystal cracks
  px(ctx, 12, 18, iceH, s); px(ctx, 14, 20, iceD, s)
  px(ctx, 20, 16, "#E0F4FF", s); px(ctx, 28, 19, iceD, s)
  px(ctx, 34, 17, iceH, s); px(ctx, 30, 24, "#E0F4FF", s)
  // Ice crystal formations on shoulders
  rect(ctx, 6, 11, 3, 6, iceH, s)
  rect(ctx, 5, 13, 2, 3, "#E0F4FF", s)
  rect(ctx, 39, 11, 3, 6, iceH, s)
  rect(ctx, 41, 13, 2, 3, "#E0F4FF", s)
  // Arms (massive)
  rect(ctx, 2, 15, 6, 16, ice, s)
  rect(ctx, 40, 15, 6, 16, ice, s)
  rect(ctx, 2, 15, 6, 4, iceH, s); rect(ctx, 40, 15, 6, 4, iceH, s)
  rect(ctx, 2, 27, 6, 4, iceD, s); rect(ctx, 40, 27, 6, 4, iceD, s)
  outline(ctx, 2, 15, 6, 16, "#3A6A80", s)
  outline(ctx, 40, 15, 6, 16, "#3A6A80", s)
  // fists
  rect(ctx, 1, 31, 8, 4, iceD, s); rect(ctx, 39, 31, 8, 4, iceD, s)
  // Legs (thick)
  rect(ctx, 11, 31, 9, 10, iceD, s); rect(ctx, 28, 31, 9, 10, iceD, s)
  outline(ctx, 11, 31, 9, 10, "#3A6A80", s); outline(ctx, 28, 31, 9, 10, "#3A6A80", s)
  // ice detail on legs
  px(ctx, 14, 35, iceH, s); px(ctx, 31, 37, iceH, s)
}

function drawFenrirWolf(ctx: Ctx, s: number) {
  const fur = "#3A4A6A", furH = "#5A6A8A", furD = "#1A2A4A"
  // Spectral glow ground
  ctx.fillStyle = "rgba(80,120,180,0.15)"
  ctx.beginPath()
  ctx.ellipse(24 * s, 42 * s, 16 * s, 4 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  // Body (horizontal, massive)
  rect(ctx, 8, 18, 26, 12, fur, s)
  rect(ctx, 8, 18, 26, 4, furH, s)
  rect(ctx, 8, 26, 26, 4, furD, s)
  outline(ctx, 8, 18, 26, 12, "#0A1A3A", s)
  // Fur texture
  px(ctx, 12, 20, furD, s); px(ctx, 18, 19, furH, s)
  px(ctx, 24, 21, furD, s); px(ctx, 28, 20, furH, s)
  // Head
  rect(ctx, 32, 12, 12, 12, fur, s)
  rect(ctx, 32, 12, 12, 4, furH, s)
  outline(ctx, 32, 12, 12, 12, "#0A1A3A", s)
  // Snout
  rect(ctx, 42, 16, 6, 5, furH, s)
  rect(ctx, 42, 20, 6, 2, furD, s)
  outline(ctx, 42, 16, 6, 5, "#0A1A3A", s)
  // Fangs
  px(ctx, 44, 21, "#FFFFFF", s); px(ctx, 46, 21, "#FFFFFF", s)
  // Glowing eyes
  rect(ctx, 36, 14, 3, 3, "#4AF0FF", s)
  px(ctx, 37, 15, "#FFFFFF", s)
  rect(ctx, 35, 13, 5, 5, "#4AF0FF15", s)
  // Ears
  rect(ctx, 34, 8, 3, 5, fur, s); rect(ctx, 40, 8, 3, 5, fur, s)
  rect(ctx, 34, 8, 3, 2, furH, s); rect(ctx, 40, 8, 3, 2, furH, s)
  // Tail - spectral
  rect(ctx, 2, 16, 7, 4, furD, s)
  rect(ctx, 0, 13, 4, 4, "rgba(80,120,180,0.5)", s)
  px(ctx, 0, 12, "rgba(80,120,180,0.3)", s)
  // Legs
  rect(ctx, 11, 30, 4, 10, furD, s); rect(ctx, 19, 30, 4, 10, furD, s)
  rect(ctx, 28, 28, 4, 10, furD, s); rect(ctx, 37, 24, 4, 10, furD, s)
  outline(ctx, 11, 30, 4, 10, "#0A1A3A", s); outline(ctx, 19, 30, 4, 10, "#0A1A3A", s)
  // Spirit particles
  px(ctx, 6, 12, "#4AF0FF", s); px(ctx, 16, 10, "#4AF0FF", s)
  px(ctx, 26, 14, "#4AF0FF", s); px(ctx, 42, 8, "#4AF0FF", s)
  px(ctx, 10, 28, "#4AF0FF60", s); px(ctx, 30, 10, "#4AF0FF60", s)
}

function drawSeidrWitch(ctx: Ctx, s: number) {
  const robe = "#2A0A3A", robeH = "#4A2A5A", robeD = "#1A0020"
  const skin = "#C8A888"
  groundShadow(ctx, 24, 47, 10, 2, s)
  // Magic aura
  ctx.fillStyle = "rgba(170,68,255,0.1)"
  ctx.beginPath()
  ctx.ellipse(24 * s, 30 * s, 16 * s, 16 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  // Robe body (flows to ground)
  rect(ctx, 13, 18, 22, 26, robe, s)
  rect(ctx, 12, 22, 1, 20, robe, s)
  rect(ctx, 35, 22, 1, 20, robe, s)
  rect(ctx, 13, 18, 22, 4, robeH, s)
  rect(ctx, 13, 40, 22, 4, robeD, s)
  outline(ctx, 13, 18, 22, 26, "#0A0010", s)
  // Robe decoration - center stripe
  rect(ctx, 23, 18, 2, 26, robeH, s)
  // Magic runes on robe
  px(ctx, 17, 24, "#AA44FF", s); px(ctx, 19, 28, "#AA44FF", s)
  px(ctx, 29, 24, "#AA44FF", s); px(ctx, 31, 28, "#AA44FF", s)
  px(ctx, 20, 36, "#AA44FF", s); px(ctx, 27, 34, "#AA44FF", s)
  // Head
  rect(ctx, 17, 6, 14, 14, skin, s)
  rect(ctx, 17, 6, 14, 3, lighten(skin, 15), s)
  rect(ctx, 17, 17, 14, 3, darken(skin, 20), s)
  // Hood
  rect(ctx, 14, 2, 20, 12, robe, s)
  rect(ctx, 15, 2, 18, 3, robeH, s)
  outline(ctx, 14, 2, 20, 12, "#0A0010", s)
  // Face opening
  rect(ctx, 18, 8, 12, 8, skin, s)
  // Magic eyes
  rect(ctx, 20, 10, 3, 3, "#AA44FF", s)
  rect(ctx, 26, 10, 3, 3, "#AA44FF", s)
  px(ctx, 21, 11, "#DD88FF", s); px(ctx, 27, 11, "#DD88FF", s)
  // Glow around eyes
  rect(ctx, 19, 9, 5, 5, "#AA44FF15", s)
  rect(ctx, 25, 9, 5, 5, "#AA44FF15", s)
  // Staff
  rect(ctx, 7, 6, 2, 38, "#6B4226", s)
  rect(ctx, 8, 6, 1, 38, "#7B5236", s)
  // Staff crystal
  rect(ctx, 5, 1, 6, 6, "#AA44FF", s)
  rect(ctx, 6, 2, 4, 4, "#DD88FF", s)
  px(ctx, 7, 3, "#FFAAFF", s)
  outline(ctx, 5, 1, 6, 6, "#6A2A8A", s)
  // glow
  ctx.fillStyle = "rgba(170,68,255,0.2)"
  ctx.beginPath()
  ctx.ellipse(8 * s, 4 * s, 5 * s, 5 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  // Arms in robe sleeves
  rect(ctx, 9, 22, 4, 8, robe, s)
  rect(ctx, 35, 22, 4, 8, robe, s)
  // Floating spirits
  px(ctx, 38, 8, "rgba(170,68,255,0.7)", s)
  px(ctx, 40, 14, "rgba(170,68,255,0.5)", s)
  px(ctx, 39, 20, "rgba(170,68,255,0.6)", s)
  px(ctx, 5, 18, "rgba(170,68,255,0.4)", s)
}

function drawJotunnBrute(ctx: Ctx, s: number) {
  const skin = "#5A7A8A", skinH = "#7A9AAA", skinD = "#3A5A6A"
  groundShadow(ctx, 24, 47, 16, 3, s)
  // Massive head
  rect(ctx, 12, 0, 24, 16, skin, s)
  rect(ctx, 12, 0, 24, 4, skinH, s)
  rect(ctx, 12, 12, 24, 4, skinD, s)
  outline(ctx, 12, 0, 24, 16, "#1A3A4A", s)
  // Eyes - icy
  rect(ctx, 16, 6, 5, 4, "#4AF0FF", s)
  rect(ctx, 27, 6, 5, 4, "#4AF0FF", s)
  px(ctx, 17, 7, "#FFFFFF", s); px(ctx, 28, 7, "#FFFFFF", s)
  // Brow ridge shadow
  rect(ctx, 15, 5, 18, 1, skinD, s)
  // Mouth with teeth
  rect(ctx, 18, 12, 12, 3, skinD, s)
  outline(ctx, 18, 12, 12, 3, "#1A3A4A", s)
  px(ctx, 19, 12, "#FFFFFF", s); px(ctx, 21, 12, "#FFFFFF", s)
  px(ctx, 25, 12, "#FFFFFF", s); px(ctx, 28, 12, "#FFFFFF", s)
  // Frost beard
  rect(ctx, 16, 14, 16, 5, "#B0D4E8", s)
  rect(ctx, 17, 14, 14, 2, "#D0E4F0", s)
  rect(ctx, 18, 18, 12, 2, "#8AB4D0", s)
  // icicles in beard
  px(ctx, 18, 19, "#E0F4FF", s); px(ctx, 22, 20, "#E0F4FF", s)
  px(ctx, 26, 19, "#E0F4FF", s); px(ctx, 30, 20, "#E0F4FF", s)
  // Massive body
  rect(ctx, 6, 20, 36, 14, skin, s)
  rect(ctx, 6, 20, 36, 4, skinH, s)
  rect(ctx, 6, 30, 36, 4, skinD, s)
  outline(ctx, 6, 20, 36, 14, "#1A3A4A", s)
  // Belt
  rect(ctx, 6, 30, 36, 3, "#3A2A1A", s)
  rect(ctx, 22, 29, 4, 5, "#C4A41A", s)
  px(ctx, 23, 30, "#E4C43A", s)
  // Arms (massive)
  rect(ctx, 0, 20, 6, 18, skin, s)
  rect(ctx, 42, 20, 6, 18, skin, s)
  rect(ctx, 0, 20, 6, 4, skinH, s); rect(ctx, 42, 20, 6, 4, skinH, s)
  rect(ctx, 0, 34, 6, 4, skinD, s); rect(ctx, 42, 34, 6, 4, skinD, s)
  outline(ctx, 0, 20, 6, 18, "#1A3A4A", s)
  outline(ctx, 42, 20, 6, 18, "#1A3A4A", s)
  // Ice on arms
  px(ctx, 2, 26, "#B0D4E8", s); px(ctx, 44, 28, "#B0D4E8", s)
  px(ctx, 3, 30, "#E0F4FF", s); px(ctx, 45, 24, "#E0F4FF", s)
  // Legs
  rect(ctx, 10, 34, 10, 10, skinD, s)
  rect(ctx, 28, 34, 10, 10, skinD, s)
  outline(ctx, 10, 34, 10, 10, "#1A3A4A", s)
  outline(ctx, 28, 34, 10, 10, "#1A3A4A", s)
  // Club
  rect(ctx, 44, 10, 3, 28, "#4A3A2A", s)
  rect(ctx, 44, 10, 2, 28, "#5A4A3A", s)
  rect(ctx, 42, 2, 6, 10, "#5A6A7A", s)
  rect(ctx, 42, 2, 6, 3, "#6A7A8A", s)
  outline(ctx, 42, 2, 6, 10, "#2A3A4A", s)
  // ice on club
  px(ctx, 43, 5, "#B0E0FF", s); px(ctx, 46, 8, "#B0E0FF", s)
}

function drawValkyrieShade(ctx: Ctx, s: number) {
  const ghost = "rgba(180,200,220,0.85)"
  const ghostH = "rgba(220,240,255,0.9)"
  const armor = "#6A7A9A"
  const armorH = "#8A9ABA"
  // Spectral glow
  ctx.fillStyle = "rgba(180,200,220,0.1)"
  ctx.beginPath()
  ctx.ellipse(24 * s, 24 * s, 18 * s, 20 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  // Wings (spectral)
  rect(ctx, 0, 8, 10, 20, ghostH, s)
  rect(ctx, 38, 8, 10, 20, ghostH, s)
  rect(ctx, 2, 4, 6, 6, "rgba(220,240,255,0.6)", s)
  rect(ctx, 40, 4, 6, 6, "rgba(220,240,255,0.6)", s)
  // Wing feather details
  for (let i = 0; i < 6; i++) {
    px(ctx, 2, 10 + i * 3, "rgba(200,220,240,0.5)", s)
    px(ctx, 4, 11 + i * 3, "rgba(240,250,255,0.4)", s)
    px(ctx, 45, 10 + i * 3, "rgba(200,220,240,0.5)", s)
    px(ctx, 43, 11 + i * 3, "rgba(240,250,255,0.4)", s)
  }
  // Head
  rect(ctx, 17, 5, 14, 14, ghost, s)
  // Winged helm
  rect(ctx, 15, 2, 18, 8, armor, s)
  rect(ctx, 15, 2, 18, 3, armorH, s)
  outline(ctx, 15, 2, 18, 8, "#3A4A6A", s)
  // Helm wings
  rect(ctx, 12, 0, 4, 6, armorH, s)
  rect(ctx, 32, 0, 4, 6, armorH, s)
  rect(ctx, 11, -2, 3, 4, armor, s)
  rect(ctx, 34, -2, 3, 4, armor, s)
  // Eyes
  rect(ctx, 19, 10, 3, 3, "#4AF0FF", s)
  rect(ctx, 26, 10, 3, 3, "#4AF0FF", s)
  px(ctx, 20, 11, "#FFFFFF", s); px(ctx, 27, 11, "#FFFFFF", s)
  // Armor body
  rect(ctx, 14, 18, 20, 14, armor, s)
  rect(ctx, 14, 18, 20, 3, armorH, s)
  rect(ctx, 14, 28, 20, 4, darken("#6A7A9A", 15), s)
  outline(ctx, 14, 18, 20, 14, "#3A4A6A", s)
  // Chest detail
  rect(ctx, 22, 20, 4, 4, armorH, s)
  px(ctx, 23, 21, "#FFFFFF", s)
  // Spectral legs fade
  rect(ctx, 17, 32, 6, 6, ghost, s)
  rect(ctx, 25, 32, 6, 6, ghost, s)
  rect(ctx, 18, 38, 5, 4, "rgba(180,200,220,0.5)", s)
  rect(ctx, 25, 38, 5, 4, "rgba(180,200,220,0.5)", s)
  rect(ctx, 19, 42, 4, 3, "rgba(180,200,220,0.2)", s)
  rect(ctx, 26, 42, 4, 3, "rgba(180,200,220,0.2)", s)
  // Spear
  rect(ctx, 10, 2, 2, 42, "#8A8A8A", s)
  rect(ctx, 9, -1, 4, 5, "#CCCCCC", s)
  rect(ctx, 10, -2, 2, 3, "#EEEEEE", s)
  outline(ctx, 9, -1, 4, 5, "#6A6A6A", s)
}

function drawNidhoggrSpawn(ctx: Ctx, s: number) {
  const sc = "#2A5A2A", scH = "#3A7A3A", scD = "#1A3A1A"
  groundShadow(ctx, 24, 43, 14, 3, s)
  // Coiled body
  rect(ctx, 10, 22, 24, 8, sc, s)
  rect(ctx, 10, 22, 24, 3, scH, s)
  rect(ctx, 10, 27, 24, 3, scD, s)
  rect(ctx, 8, 28, 28, 7, scD, s)
  rect(ctx, 6, 33, 32, 6, sc, s)
  outline(ctx, 6, 33, 32, 6, "#0A2A0A", s)
  // Belly lighter
  rect(ctx, 14, 30, 16, 3, scH, s)
  rect(ctx, 10, 35, 24, 2, "#4A9A4A", s)
  // Scale pattern
  for (let i = 0; i < 20; i += 3) {
    px(ctx, 12 + i, 24, scD, s)
    px(ctx, 13 + i, 26, scH, s)
    px(ctx, 8 + i, 34, scD, s)
  }
  // Neck (raised)
  rect(ctx, 24, 14, 6, 10, sc, s)
  rect(ctx, 24, 14, 3, 10, scH, s)
  outline(ctx, 24, 14, 6, 10, "#0A2A0A", s)
  // Head (raised)
  rect(ctx, 28, 6, 14, 12, sc, s)
  rect(ctx, 28, 6, 14, 4, scH, s)
  outline(ctx, 28, 6, 14, 12, "#0A2A0A", s)
  // Snout
  rect(ctx, 40, 10, 6, 6, scH, s)
  rect(ctx, 40, 14, 6, 2, scD, s)
  outline(ctx, 40, 10, 6, 6, "#0A2A0A", s)
  // Venomous eyes
  rect(ctx, 31, 8, 3, 3, "#88FF00", s)
  rect(ctx, 37, 8, 3, 3, "#88FF00", s)
  px(ctx, 32, 9, "#DDFF88", s); px(ctx, 38, 9, "#DDFF88", s)
  // Eye glow
  rect(ctx, 30, 7, 5, 5, "#88FF0020", s)
  rect(ctx, 36, 7, 5, 5, "#88FF0020", s)
  // Fangs
  px(ctx, 43, 16, "#FFFFFF", s); px(ctx, 44, 16, "#FFFFFF", s)
  px(ctx, 43, 17, "#EEEEDD", s)
  // Venom drip
  px(ctx, 43, 18, "#88FF00", s)
  px(ctx, 44, 19, "#66DD00", s)
  px(ctx, 43, 20, "#44BB0080", s)
  // Horn/crest
  rect(ctx, 30, 4, 2, 3, scD, s)
  rect(ctx, 36, 3, 2, 4, scD, s)
  rect(ctx, 33, 2, 2, 5, sc, s)
  // Tail
  rect(ctx, 2, 30, 6, 4, scD, s)
  rect(ctx, 0, 28, 4, 4, sc, s)
  px(ctx, 0, 27, scH, s)
  // Tail tip spikes
  px(ctx, 0, 26, scD, s)
}

function drawCultistLoki(ctx: Ctx, s: number) {
  const cloak = "#0A2A1A", cloakH = "#1A4A2A", cloakD = "#001A0A"
  const skin = "#C8A888"
  groundShadow(ctx, 24, 47, 10, 2, s)
  // Smoke at feet
  rect(ctx, 10, 42, 28, 3, "rgba(68,255,136,0.15)", s)
  rect(ctx, 14, 43, 20, 2, "rgba(68,255,136,0.1)", s)
  // Cloak body
  rect(ctx, 12, 18, 24, 26, cloak, s)
  rect(ctx, 11, 22, 1, 20, cloak, s)
  rect(ctx, 36, 22, 1, 20, cloak, s)
  rect(ctx, 12, 18, 24, 4, cloakH, s)
  rect(ctx, 12, 40, 24, 4, cloakD, s)
  outline(ctx, 12, 18, 24, 26, "#001000", s)
  // Cloak texture
  rect(ctx, 23, 18, 2, 26, cloakH, s)
  // Trickster symbol
  const ts = "#44FF88"
  px(ctx, 23, 24, ts, s); px(ctx, 22, 25, ts, s); px(ctx, 24, 25, ts, s)
  px(ctx, 23, 26, ts, s); px(ctx, 21, 27, ts, s); px(ctx, 25, 27, ts, s)
  px(ctx, 20, 28, ts, s); px(ctx, 26, 28, ts, s)
  // more rune marks
  px(ctx, 16, 30, ts + "80", s); px(ctx, 30, 32, ts + "80", s)
  // Head
  rect(ctx, 17, 6, 14, 14, skin, s)
  rect(ctx, 17, 6, 14, 3, lighten(skin, 15), s)
  rect(ctx, 17, 17, 14, 3, darken(skin, 20), s)
  // Hood
  rect(ctx, 14, 2, 20, 12, cloak, s)
  rect(ctx, 15, 2, 18, 3, cloakH, s)
  outline(ctx, 14, 2, 20, 12, "#001000", s)
  // Face opening
  rect(ctx, 18, 8, 12, 8, skin, s)
  // Mischievous green eyes
  rect(ctx, 20, 10, 3, 3, "#44FF88", s)
  rect(ctx, 26, 10, 3, 3, "#44FF88", s)
  px(ctx, 21, 11, "#88FFBB", s); px(ctx, 27, 11, "#88FFBB", s)
  // Eye glow
  rect(ctx, 19, 9, 5, 5, "#44FF8820", s)
  rect(ctx, 25, 9, 5, 5, "#44FF8820", s)
  // Smirk
  rect(ctx, 22, 14, 5, 1, darken(skin, 20), s)
  px(ctx, 26, 13, darken(skin, 20), s) // smirk corner
  // Hidden daggers
  rect(ctx, 7, 24, 2, 12, "#8A8A8A", s)
  rect(ctx, 7, 20, 2, 5, "#CCCCCC", s)
  px(ctx, 7, 19, "#EEEEEE", s)
  rect(ctx, 39, 24, 2, 12, "#8A8A8A", s)
  rect(ctx, 39, 20, 2, 5, "#CCCCCC", s)
  px(ctx, 39, 19, "#EEEEEE", s)
  // Illusion particles
  px(ctx, 4, 10, ts, s); px(ctx, 42, 8, ts, s)
  px(ctx, 3, 28, ts, s); px(ctx, 43, 26, ts, s)
  px(ctx, 6, 16, ts + "60", s); px(ctx, 40, 14, ts + "60", s)
}

// ============================================================
// SKILL VFX RENDERING
// ============================================================

export interface SkillVFX {
  id: string
  name: string
  category: string
  frame: number // 0-1 animation progress
}

export function drawSkillVFX(
  ctx: Ctx,
  skill: SkillVFX,
  config: CharacterConfig,
  equipped: EquippedItems,
  scale: number = 4,
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  const f = skill.frame
  const centerX = 24
  const centerY = 24

  // Draw character first (possibly with animation offset)
  switch (skill.category) {
    case "aoe": {
      drawCharacter(ctx, config, equipped, scale)
      // Expanding ring
      const radius = 4 + f * 18
      const alpha = 1 - f
      ctx.strokeStyle = `rgba(212,164,74,${alpha})`
      ctx.lineWidth = 2 * scale
      ctx.beginPath()
      ctx.ellipse(centerX * scale, (centerY + 2) * scale, radius * scale, (radius * 0.5) * scale, 0, 0, Math.PI * 2)
      ctx.stroke()
      // Inner ring
      const r2 = 2 + f * 14
      ctx.strokeStyle = `rgba(255,200,100,${alpha * 0.7})`
      ctx.lineWidth = 1 * scale
      ctx.beginPath()
      ctx.ellipse(centerX * scale, (centerY + 2) * scale, r2 * scale, (r2 * 0.5) * scale, 0, 0, Math.PI * 2)
      ctx.stroke()
      // Particles
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + f * 2
        const pr = (6 + f * 14)
        const px2 = centerX + Math.cos(angle) * pr
        const py = centerY + 2 + Math.sin(angle) * pr * 0.5
        ctx.fillStyle = `rgba(255,200,100,${alpha * 0.8})`
        ctx.fillRect(px2 * scale, py * scale, scale, scale)
      }
      // Norse rune flash
      if (f < 0.3) {
        const runeAlpha = 1 - f / 0.3
        ctx.fillStyle = `rgba(212,164,74,${runeAlpha * 0.5})`
        ctx.fillRect((centerX - 3) * scale, (centerY - 3) * scale, 6 * scale, 6 * scale)
      }
      break
    }
    case "dash": {
      // Motion blur / afterimage
      const dashOffset = f * 20
      // Afterimages
      for (let i = 3; i >= 0; i--) {
        const imgAlpha = (1 - i / 4) * (1 - f)
        ctx.globalAlpha = imgAlpha * 0.3
        drawCharacter(ctx, config, equipped, scale, -(dashOffset - i * 4) * scale, 0)
      }
      ctx.globalAlpha = 1
      drawCharacter(ctx, config, equipped, scale)
      // Speed lines
      for (let i = 0; i < 6; i++) {
        const ly = (10 + i * 6)
        const lx = 40 - f * 30
        const len = 4 + f * 8
        ctx.fillStyle = `rgba(200,220,255,${0.5 - f * 0.5})`
        ctx.fillRect(lx * scale, ly * scale, len * scale, scale)
      }
      // Dust poof at origin
      if (f < 0.4) {
        const dustAlpha = 1 - f / 0.4
        ctx.fillStyle = `rgba(180,160,140,${dustAlpha * 0.4})`
        ctx.beginPath()
        ctx.ellipse((centerX - dashOffset) * scale, 42 * scale, (3 + f * 6) * scale, (2 + f * 3) * scale, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      break
    }
    case "melee": {
      drawCharacter(ctx, config, equipped, scale)
      // Slash arcs
      const slashPhase = f * 3
      if (slashPhase < 1) {
        const sa = slashPhase
        drawSlash(ctx, centerX + 10, centerY - 4, 12, -0.5 + sa, scale, "#FFFFFF", 1 - sa)
      } else if (slashPhase < 2) {
        const sa = slashPhase - 1
        drawSlash(ctx, centerX + 8, centerY + 2, 14, 0.3 + sa, scale, "#D4A44A", 1 - sa)
      } else {
        const sa = slashPhase - 2
        drawSlash(ctx, centerX + 12, centerY - 2, 10, -0.2 + sa * 1.5, scale, "#FF8844", 1 - sa)
      }
      // Impact sparks
      if (f > 0.3 && f < 0.7) {
        const sparkAlpha = 1 - Math.abs(f - 0.5) / 0.2
        for (let i = 0; i < 5; i++) {
          const sx = centerX + 12 + Math.random() * 6
          const sy = centerY - 4 + Math.random() * 12
          ctx.fillStyle = `rgba(255,220,100,${sparkAlpha * 0.8})`
          ctx.fillRect(sx * scale, sy * scale, scale, scale)
        }
      }
      break
    }
    case "ground-slam": {
      const slamY = f < 0.3 ? -f * 10 : 0
      drawCharacter(ctx, config, equipped, scale, 0, slamY * scale)
      if (f > 0.3) {
        const impactF = (f - 0.3) / 0.7
        // Ground crack
        const crackW = impactF * 20
        ctx.fillStyle = `rgba(140,100,60,${1 - impactF})`
        ctx.fillRect((centerX - crackW) * scale, 44 * scale, crackW * 2 * scale, 2 * scale)
        // Rising debris
        for (let i = 0; i < 8; i++) {
          const dx = centerX - 12 + i * 3
          const dy = 42 - impactF * (6 + i * 2)
          const debrisA = Math.max(0, 1 - impactF * 1.5)
          ctx.fillStyle = `rgba(120,90,50,${debrisA})`
          ctx.fillRect(dx * scale, dy * scale, 2 * scale, 2 * scale)
        }
        // Shockwave ring
        const shockR = impactF * 22
        const shockA = 1 - impactF
        ctx.strokeStyle = `rgba(180,140,80,${shockA})`
        ctx.lineWidth = 2 * scale
        ctx.beginPath()
        ctx.ellipse(centerX * scale, 44 * scale, shockR * scale, (shockR * 0.3) * scale, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      break
    }
    case "beam": {
      drawCharacter(ctx, config, equipped, scale)
      const beamW = 3 + Math.sin(f * 10) * 1
      const beamAlpha = 0.6 + Math.sin(f * 8) * 0.3
      // Main beam
      ctx.fillStyle = `rgba(74,240,255,${beamAlpha})`
      ctx.fillRect(36 * scale, (centerY - beamW) * scale, 14 * scale, beamW * 2 * scale)
      // Core beam (brighter)
      ctx.fillStyle = `rgba(200,250,255,${beamAlpha * 0.8})`
      ctx.fillRect(36 * scale, (centerY - 1) * scale, 14 * scale, 2 * scale)
      // Glow
      ctx.fillStyle = `rgba(74,240,255,${beamAlpha * 0.2})`
      ctx.fillRect(36 * scale, (centerY - beamW - 2) * scale, 14 * scale, (beamW * 2 + 4) * scale)
      // Source glow at hands
      ctx.fillStyle = `rgba(74,240,255,${beamAlpha * 0.5})`
      ctx.beginPath()
      ctx.ellipse(38 * scale, centerY * scale, 4 * scale, 4 * scale, 0, 0, Math.PI * 2)
      ctx.fill()
      // Rune particles along beam
      for (let i = 0; i < 4; i++) {
        const bx = 38 + i * 3 + f * 6
        const by = centerY + Math.sin(f * 10 + i) * 2
        px(ctx, bx, by, `rgba(255,255,255,${0.5 + Math.sin(f * 8 + i) * 0.3})`, scale)
      }
      break
    }
    case "summon": {
      drawCharacter(ctx, config, equipped, scale)
      // Summoning circle
      const circleAlpha = 0.3 + Math.sin(f * 6) * 0.2
      ctx.strokeStyle = `rgba(212,164,74,${circleAlpha})`
      ctx.lineWidth = 1.5 * scale
      ctx.beginPath()
      ctx.ellipse(centerX * scale, 42 * scale, 14 * scale, 4 * scale, 0, 0, Math.PI * 2)
      ctx.stroke()
      // Rune symbols around circle
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + f * 2
        const rx = centerX + Math.cos(angle) * 12
        const ry = 42 + Math.sin(angle) * 3
        const runeA = 0.5 + Math.sin(f * 8 + i) * 0.3
        ctx.fillStyle = `rgba(212,164,74,${runeA})`
        ctx.fillRect(rx * scale, ry * scale, 2 * scale, 2 * scale)
      }
      // Rising spirit/summon entity
      if (f > 0.3) {
        const riseF = (f - 0.3) / 0.7
        const entityY = 40 - riseF * 18
        const entityA = Math.min(1, riseF * 2)
        // Wolf spirit form
        ctx.globalAlpha = entityA * 0.7
        rect(ctx, 14, entityY, 8, 5, "#4A5A7A", scale)
        rect(ctx, 22, entityY - 2, 5, 5, "#5A6A8A", scale)
        rect(ctx, 26, entityY - 1, 3, 3, "#6A7A9A", scale)
        px(ctx, 24, entityY - 1, "#4AF0FF", scale)
        ctx.globalAlpha = 1
      }
      // Rising particles
      for (let i = 0; i < 6; i++) {
        const pxX = centerX - 10 + i * 4
        const pyY = 44 - f * 20 - i * 2
        const pAlpha = Math.max(0, 1 - f - i * 0.1)
        ctx.fillStyle = `rgba(212,164,74,${pAlpha * 0.6})`
        ctx.fillRect(pxX * scale, pyY * scale, scale, scale)
      }
      break
    }
    case "buff": {
      drawCharacter(ctx, config, equipped, scale)
      // Ascending rune particles
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        const pr = 8 + Math.sin(f * 6 + i) * 3
        const pxX = centerX + Math.cos(angle + f * 3) * pr
        const pyY = centerY + Math.sin(angle + f * 3) * pr * 0.6 - f * 8
        const pAlpha = 0.5 + Math.sin(f * 8 + i * 2) * 0.3
        ctx.fillStyle = `rgba(212,164,74,${pAlpha})`
        ctx.fillRect(pxX * scale, pyY * scale, 2 * scale, 2 * scale)
      }
      // Aura glow
      const auraAlpha = 0.15 + Math.sin(f * 6) * 0.1
      ctx.fillStyle = `rgba(212,164,74,${auraAlpha})`
      ctx.beginPath()
      ctx.ellipse(centerX * scale, (centerY + 2) * scale, 14 * scale, 18 * scale, 0, 0, Math.PI * 2)
      ctx.fill()
      // Runic symbols floating
      const runeSymbols = ["F", "U", "R", "N"]
      ctx.font = `${3 * scale}px monospace`
      ctx.textAlign = "center"
      for (let i = 0; i < 4; i++) {
        const rAngle = (i / 4) * Math.PI * 2 + f * 2
        const rr = 10 + Math.sin(f * 4) * 2
        const rx = centerX + Math.cos(rAngle) * rr
        const ry = centerY + Math.sin(rAngle) * rr * 0.5 - 2
        const rA = 0.6 + Math.sin(f * 6 + i) * 0.3
        ctx.fillStyle = `rgba(212,164,74,${rA})`
        ctx.fillText(runeSymbols[i], rx * scale, ry * scale)
      }
      // Column of light
      if (f > 0.5) {
        const colA = (f - 0.5) / 0.5
        ctx.fillStyle = `rgba(255,220,150,${colA * 0.15})`
        ctx.fillRect((centerX - 6) * scale, 0, 12 * scale, 48 * scale)
      }
      break
    }
    default:
      drawCharacter(ctx, config, equipped, scale)
  }
}

function drawSlash(ctx: Ctx, cx: number, cy: number, radius: number, angle: number, s: number, color: string, alpha: number) {
  const len = 0.8
  ctx.strokeStyle = color.replace(")", `,${alpha})`.replace("rgb", "rgba"))
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`
  }
  ctx.lineWidth = 2 * s
  ctx.lineCap = "round"
  ctx.beginPath()
  ctx.arc(cx * s, cy * s, radius * s, angle, angle + len)
  ctx.stroke()
  // Glow
  ctx.lineWidth = 4 * s
  ctx.globalAlpha = alpha * 0.3
  ctx.beginPath()
  ctx.arc(cx * s, cy * s, radius * s, angle, angle + len)
  ctx.stroke()
  ctx.globalAlpha = 1
}
