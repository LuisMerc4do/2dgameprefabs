// ============================================================
// NORSE RPG SPRITE LIBRARY - DATA DEFINITIONS v2
// ============================================================

export type BodyType = "warrior" | "scout"

export interface SkinPalette {
  id: string; name: string; base: string; shadow: string; highlight: string
}

export interface HairStyle { id: string; name: string; defaultColor: string }
export interface HeadStyle { id: string; name: string }
export interface ChestStyle { id: string; name: string }
export interface LegStyle { id: string; name: string }
export interface BeardStyle { id: string; name: string }
export interface EyeColorOption { id: string; name: string; color: string }
export interface ScarOption { id: string; name: string }
export interface FacePaintOption { id: string; name: string }

export interface EquipmentItem {
  id: string
  name: string
  slot: "helmet" | "chest" | "gloves" | "pants" | "boots" | "weapon"
  description: string
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
}

export interface Monster {
  id: string; name: string; role: string
  difficulty: "Easy" | "Easy-Medium" | "Medium" | "Medium-High"
  description: string; inspiration: string
}

export interface SkillDef {
  id: string; name: string; category: string
  description: string; cooldown: string; damage: string
}

// ============================================================
// SKIN PALETTES
// ============================================================
export const SKIN_PALETTES: SkinPalette[] = [
  { id: "fair", name: "Fair", base: "#F5D0A9", shadow: "#D4A574", highlight: "#FFE4C4" },
  { id: "light", name: "Light", base: "#E8C298", shadow: "#C49A6C", highlight: "#F5DFC5" },
  { id: "medium", name: "Medium", base: "#C68642", shadow: "#8D5524", highlight: "#D4A06A" },
  { id: "tan", name: "Tan", base: "#A0724A", shadow: "#6B4226", highlight: "#B8885C" },
  { id: "brown", name: "Brown", base: "#8D5524", shadow: "#5C3310", highlight: "#A0724A" },
  { id: "dark", name: "Dark", base: "#6B4226", shadow: "#3B1F0B", highlight: "#8D5524" },
  { id: "pale", name: "Pale", base: "#FFE8D6", shadow: "#E8C8A8", highlight: "#FFF4EC" },
  { id: "olive", name: "Olive", base: "#B89A6A", shadow: "#8A6A3A", highlight: "#D0B080" },
]

// ============================================================
// HAIR COLORS
// ============================================================
export const HAIR_COLORS = [
  { id: "blonde", name: "Blonde", color: "#E8D44D" },
  { id: "brown", name: "Brown", color: "#6B3A2A" },
  { id: "black", name: "Black", color: "#2A1A0A" },
  { id: "red", name: "Red", color: "#B33A1A" },
  { id: "grey", name: "Grey", color: "#8A8A8A" },
  { id: "white", name: "White", color: "#D8D8D8" },
  { id: "auburn", name: "Auburn", color: "#8B4513" },
  { id: "copper", name: "Copper", color: "#B87333" },
]

// ============================================================
// HAIR STYLES
// ============================================================
export const HAIR_STYLES: HairStyle[] = [
  { id: "short", name: "Short Crop", defaultColor: "#6B3A2A" },
  { id: "long", name: "Long Warrior", defaultColor: "#E8D44D" },
  { id: "braided", name: "Braided", defaultColor: "#B33A1A" },
  { id: "mohawk", name: "Mohawk", defaultColor: "#2A1A0A" },
  { id: "topknot", name: "Top Knot", defaultColor: "#6B3A2A" },
  { id: "wild", name: "Wild Mane", defaultColor: "#B33A1A" },
  { id: "shaved-sides", name: "Shaved Sides", defaultColor: "#2A1A0A" },
  { id: "bald", name: "Bald", defaultColor: "transparent" },
]

// ============================================================
// HEAD, CHEST, LEG STYLES
// ============================================================
export const HEAD_STYLES: HeadStyle[] = [
  { id: "round", name: "Round" },
  { id: "square", name: "Square" },
  { id: "angular", name: "Angular" },
]

export const CHEST_STYLES: ChestStyle[] = [
  { id: "broad", name: "Broad" },
  { id: "slim", name: "Slim" },
]

export const LEG_STYLES: LegStyle[] = [
  { id: "normal", name: "Normal" },
  { id: "muscular", name: "Muscular" },
]

// ============================================================
// BEARD STYLES
// ============================================================
export const BEARD_STYLES: BeardStyle[] = [
  { id: "none", name: "None" },
  { id: "stubble", name: "Stubble" },
  { id: "short", name: "Short Beard" },
  { id: "long", name: "Long Beard" },
  { id: "braided-beard", name: "Braided Beard" },
]

// ============================================================
// EYE COLORS
// ============================================================
export const EYE_COLORS: EyeColorOption[] = [
  { id: "brown", name: "Brown", color: "#4A2A1A" },
  { id: "blue", name: "Blue", color: "#3366AA" },
  { id: "green", name: "Green", color: "#2A6A3A" },
  { id: "grey", name: "Grey", color: "#6A6A7A" },
  { id: "amber", name: "Amber", color: "#AA7722" },
  { id: "ice", name: "Ice Blue", color: "#4AF0FF" },
]

// ============================================================
// SCARS
// ============================================================
export const SCAR_OPTIONS: ScarOption[] = [
  { id: "none", name: "None" },
  { id: "left-eye", name: "Left Eye Scar" },
  { id: "right-cheek", name: "Right Cheek" },
  { id: "cross-face", name: "Cross Face" },
]

// ============================================================
// FACE PAINT
// ============================================================
export const FACE_PAINT_OPTIONS: FacePaintOption[] = [
  { id: "none", name: "None" },
  { id: "war-stripes", name: "War Stripes" },
  { id: "skull-paint", name: "Skull Paint" },
  { id: "rune-marks", name: "Rune Marks" },
  { id: "blood-smear", name: "Blood Smear" },
]

// ============================================================
// EQUIPMENT
// ============================================================
export const HELMETS: EquipmentItem[] = [
  { id: "iron-nasal", name: "Iron Nasal Helm", slot: "helmet", description: "Simple Viking iron helmet with nose guard", rarity: "common" },
  { id: "bear-head", name: "Bear-Head Helm", slot: "helmet", description: "Fur-lined helm made from a bear pelt", rarity: "uncommon" },
  { id: "raven-skull", name: "Raven Skull Helm", slot: "helmet", description: "Ritualistic helm adorned with raven bones", rarity: "rare" },
  { id: "jarl-gilded", name: "Jarl's Gilded Helmet", slot: "helmet", description: "Decorated bronze/gold elite helmet with gems", rarity: "epic" },
  { id: "runic-war", name: "Runic War Helm", slot: "helmet", description: "Iron helmet carved with glowing Norse runes", rarity: "legendary" },
  { id: "wolf-skull", name: "Wolf Skull Helm", slot: "helmet", description: "Fearsome wolf skull mounted on iron", rarity: "epic" },
  { id: "valkyrie-wing", name: "Valkyrie Wing Helm", slot: "helmet", description: "Winged helm blessed by the Valkyries", rarity: "legendary" },
  { id: "dragonbone", name: "Dragonbone Crown", slot: "helmet", description: "Ancient crown carved from dragon bone with horns", rarity: "legendary" },
]

export const CHEST_ARMOR: EquipmentItem[] = [
  { id: "leather-vest", name: "Leather Raider Vest", slot: "chest", description: "Light armor, mobility focused", rarity: "common" },
  { id: "chainmail", name: "Chainmail Byrnie", slot: "chest", description: "Classic Viking mail shirt", rarity: "uncommon" },
  { id: "fur-cloak", name: "Fur-Lined War Cloak", slot: "chest", description: "Defensive + cold resistance style", rarity: "rare" },
  { id: "berserker-harness", name: "Berserker Harness", slot: "chest", description: "Bare chest with ritual markings + shoulder guard", rarity: "epic" },
  { id: "runestone-plate", name: "Runestone Plate Cuirass", slot: "chest", description: "Heavy enchanted armor with rune plates", rarity: "legendary" },
  { id: "bone-cuirass", name: "Bone Cuirass", slot: "chest", description: "Armor crafted from ancient beast bones", rarity: "epic" },
  { id: "stormweave", name: "Stormweave Hauberk", slot: "chest", description: "Woven with lightning magic for shock damage", rarity: "legendary" },
  { id: "bloodforge-mail", name: "Bloodforge Mail", slot: "chest", description: "Blood-tempered iron with dark rune engravings", rarity: "legendary" },
]

export const GLOVES: EquipmentItem[] = [
  { id: "leather-wraps", name: "Leather Hand Wraps", slot: "gloves", description: "Simple leather hand protection", rarity: "common" },
  { id: "fur-gauntlets", name: "Fur Gauntlets", slot: "gloves", description: "Warm fur-lined gloves for cold battles", rarity: "uncommon" },
  { id: "iron-bracers", name: "Iron Bracers", slot: "gloves", description: "Reinforced iron arm and hand guards", rarity: "rare" },
  { id: "berserker-wraps", name: "Berserker Blood Wraps", slot: "gloves", description: "Ritual-stained hand wraps with runes", rarity: "epic" },
  { id: "runic-gauntlets", name: "Runic Gauntlets", slot: "gloves", description: "Enchanted gauntlets with glowing inscriptions", rarity: "legendary" },
  { id: "spiked-fists", name: "Spiked Iron Fists", slot: "gloves", description: "Iron gauntlets with protruding spikes", rarity: "epic" },
  { id: "dragonscale-grips", name: "Dragonscale Grips", slot: "gloves", description: "Gauntlets layered with dragon scales", rarity: "legendary" },
  { id: "ember-wraps", name: "Ember Wraps", slot: "gloves", description: "Fire-enchanted wraps that smolder with heat", rarity: "legendary" },
]

export const PANTS: EquipmentItem[] = [
  { id: "wool-trousers", name: "Wool Raider Trousers", slot: "pants", description: "Basic Viking cloth pants", rarity: "common" },
  { id: "leather-leggings", name: "Leather War Leggings", slot: "pants", description: "Reinforced combat pants", rarity: "uncommon" },
  { id: "frost-greaves", name: "Frostguard Greaves", slot: "pants", description: "Thick pants wrapped in fur with ice crystals", rarity: "rare" },
  { id: "berserker-skirt", name: "Berserker War Skirt", slot: "pants", description: "Battle kilt style with metal plates", rarity: "epic" },
  { id: "runic-legguards", name: "Runic Battle Legguards", slot: "pants", description: "Armored leggings with rune etchings", rarity: "legendary" },
  { id: "iron-chain-skirt", name: "Iron Chain Skirt", slot: "pants", description: "Chainmail lower armor for maximum protection", rarity: "epic" },
  { id: "shadow-leggings", name: "Shadow Leggings", slot: "pants", description: "Dark enchanted leggings that blend with darkness", rarity: "legendary" },
  { id: "flame-guards", name: "Flame Guard Greaves", slot: "pants", description: "Fire-enchanted leg armor with ember glow", rarity: "legendary" },
]

export const BOOTS: EquipmentItem[] = [
  { id: "leather-boots", name: "Leather Raider Boots", slot: "boots", description: "Standard Viking boots", rarity: "common" },
  { id: "fur-boots", name: "Fur Winter Boots", slot: "boots", description: "Snow-ready heavy boots with fur lining", rarity: "uncommon" },
  { id: "iron-toe", name: "Iron-Toe War Boots", slot: "boots", description: "Reinforced front for devastating kicks", rarity: "rare" },
  { id: "silent-hunter", name: "Silent Hunter Boots", slot: "boots", description: "Light stealth-style footwear", rarity: "epic" },
  { id: "stormforged", name: "Stormforged Greaves", slot: "boots", description: "Armored boots with rune glow", rarity: "legendary" },
  { id: "bone-treads", name: "Bone Tread Boots", slot: "boots", description: "Boots reinforced with ancient bone plates", rarity: "epic" },
  { id: "flamestep", name: "Flamestep Boots", slot: "boots", description: "Leaves fiery footprints in your wake", rarity: "legendary" },
  { id: "shadow-step", name: "Shadow Step Boots", slot: "boots", description: "Phase through shadows with each step", rarity: "legendary" },
]

export const WEAPONS: EquipmentItem[] = [
  { id: "bearded-axe", name: "Bearded Axe", slot: "weapon", description: "Classic Viking axe with curved blade", rarity: "common" },
  { id: "longsword", name: "Longsword of the North", slot: "weapon", description: "Balanced melee weapon with gold guard", rarity: "uncommon" },
  { id: "war-spear", name: "War Spear", slot: "weapon", description: "Medium range thrust weapon", rarity: "rare" },
  { id: "twin-seax", name: "Twin Seax Daggers", slot: "weapon", description: "Fast dual wield daggers", rarity: "epic" },
  { id: "runic-hammer", name: "Runic Warhammer", slot: "weapon", description: "Heavy slow AoE weapon with rune glow", rarity: "legendary" },
  { id: "frost-cleaver", name: "Frost Cleaver", slot: "weapon", description: "Ice-enchanted cleaver that freezes on contact", rarity: "epic" },
  { id: "bloodthirst-blade", name: "Bloodthirst Blade", slot: "weapon", description: "Crimson sword that drains life force", rarity: "legendary" },
  { id: "thunder-mace", name: "Thunder Mace", slot: "weapon", description: "Lightning-infused flanged mace", rarity: "epic" },
  { id: "shield-of-odin", name: "Shield of Odin", slot: "weapon", description: "Ancient round shield with runic protection", rarity: "legendary" },
  { id: "ragnarok-greatsword", name: "Ragnarok Greatsword", slot: "weapon", description: "Massive rune-etched blade of world-ending power", rarity: "legendary" },
]

export const ALL_EQUIPMENT = {
  helmet: HELMETS,
  chest: CHEST_ARMOR,
  gloves: GLOVES,
  pants: PANTS,
  boots: BOOTS,
  weapon: WEAPONS,
}

// ============================================================
// MONSTERS
// ============================================================
export const MONSTERS: Monster[] = [
  { id: "draugr-warrior", name: "Draugr Warrior", role: "Basic melee enemy", difficulty: "Easy", description: "Undead Viking risen from a burial mound. Slow but relentless, wielding a rusted blade. Glowing eyes pierce the darkness.", inspiration: "Norse undead / Draugr" },
  { id: "frost-wisp", name: "Frost Wisp", role: "Ranged harasser", difficulty: "Easy", description: "A floating orb of frozen energy that launches icy projectiles. Ethereal tendrils trail behind its luminous core.", inspiration: "Nordic winter spirits" },
  { id: "viking-raider", name: "Viking Raider", role: "Fast melee rush", difficulty: "Easy-Medium", description: "An aggressive human raider who charges with twin axes, war paint across his face.", inspiration: "Viking berserkers" },
  { id: "ice-golem", name: "Ice Golem", role: "Slow tank", difficulty: "Easy", description: "A massive construct of packed ice and stone. Crystal formations jut from its shoulders. Extremely durable.", inspiration: "Nordic frost elementals" },
  { id: "fenrir-wolf", name: "Wolf of Fenrir", role: "Agile flanker", difficulty: "Medium", description: "A spectral wolf that phases in and out with ethereal blue energy, striking from unexpected angles.", inspiration: "Fenrir" },
  { id: "seidr-witch", name: "Seidr Witch", role: "Summoner", difficulty: "Medium", description: "A practitioner of Norse magic in flowing dark robes. Her staff crackles with arcane energy as spirits orbit her.", inspiration: "Seidr magic practice" },
  { id: "jotunn-brute", name: "Jotunn Brute", role: "Elite mini-boss", difficulty: "Medium-High", description: "A towering frost giant with an ice-crusted beard and massive club. The ground trembles with each step.", inspiration: "Jotunn / Frost Giants" },
  { id: "valkyrie-shade", name: "Valkyrie Shade", role: "Aerial fighter", difficulty: "Medium", description: "A ghostly warrior-maiden who swoops from above with spectral wings and gleaming spear.", inspiration: "Valkyrie" },
  { id: "nidhoggr-spawn", name: "Nidhoggr Spawn", role: "Poison enemy", difficulty: "Medium", description: "A serpentine wyrmling with venomous fangs and horned crest. Venom drips from its maw.", inspiration: "Nidhoggr" },
  { id: "cultist-loki", name: "Cultist of Loki", role: "Trick enemy", difficulty: "Medium", description: "A deceptive foe in a dark green cloak bearing Loki's trickster symbol. Creates illusions and fights with hidden daggers.", inspiration: "Loki" },
]

// ============================================================
// SKILLS (7 categories x 5 skills each)
// ============================================================
export const SKILL_CATEGORIES = [
  { id: "aoe", name: "AoE (Around Caster)", color: "#D4A44A", description: "Area damage centered on the caster" },
  { id: "dash", name: "Dash / Blink", color: "#88CCFF", description: "Rapid movement and repositioning" },
  { id: "melee", name: "Melee Combo", color: "#FF8844", description: "Close-range multi-hit attacks" },
  { id: "ground-slam", name: "Ground Slam", color: "#AA7744", description: "Powerful ground-targeted impacts" },
  { id: "beam", name: "Beam / Channel", color: "#4AF0FF", description: "Sustained directional energy attacks" },
  { id: "summon", name: "Summon / Deployable", color: "#AA44FF", description: "Conjure allies and objects" },
  { id: "buff", name: "Buff / Self", color: "#44DD88", description: "Enhance your own abilities" },
]

export const SKILLS: SkillDef[] = [
  // AOE
  { id: "runic-burst", name: "Runic Burst", category: "aoe", description: "Release a shockwave of Norse rune energy around you", cooldown: "8s", damage: "Medium" },
  { id: "thunder-nova", name: "Thunder Nova", category: "aoe", description: "Call down Thor's lightning in a wide area", cooldown: "12s", damage: "High" },
  { id: "frost-pulse", name: "Frost Pulse", category: "aoe", description: "Emit a freezing blast that slows enemies", cooldown: "6s", damage: "Low" },
  { id: "war-cry", name: "Viking War Cry", category: "aoe", description: "A terrifying shout that damages and fears nearby foes", cooldown: "15s", damage: "Medium" },
  { id: "flame-circle", name: "Flame of Muspelheim", category: "aoe", description: "Ignite the ground in a ring of fire", cooldown: "10s", damage: "High" },
  // DASH
  { id: "shadow-step", name: "Shadow Step", category: "dash", description: "Vanish and reappear behind your target", cooldown: "4s", damage: "Low" },
  { id: "valkyrie-rush", name: "Valkyrie Rush", category: "dash", description: "Dash forward with spectral wings", cooldown: "6s", damage: "Medium" },
  { id: "frost-blink", name: "Frost Blink", category: "dash", description: "Teleport through a rift of ice", cooldown: "5s", damage: "None" },
  { id: "berserker-charge", name: "Berserker Charge", category: "dash", description: "Charge forward in blind rage, damaging all in path", cooldown: "8s", damage: "High" },
  { id: "raven-flight", name: "Raven Flight", category: "dash", description: "Transform into ravens and reform at target location", cooldown: "10s", damage: "None" },
  // MELEE
  { id: "axe-flurry", name: "Axe Flurry", category: "melee", description: "Three rapid axe swings in succession", cooldown: "3s", damage: "Medium" },
  { id: "skull-splitter", name: "Skull Splitter", category: "melee", description: "Overhead two-handed strike with massive damage", cooldown: "6s", damage: "Very High" },
  { id: "blade-dance", name: "Blade Dance", category: "melee", description: "Spin attack hitting all adjacent enemies", cooldown: "5s", damage: "Medium" },
  { id: "shield-bash", name: "Shield Bash Combo", category: "melee", description: "Bash then follow with a quick slash", cooldown: "4s", damage: "Medium" },
  { id: "executioner", name: "Executioner's Verdict", category: "melee", description: "Devastating finisher on weakened enemies", cooldown: "8s", damage: "Extreme" },
  // GROUND SLAM
  { id: "earth-shatter", name: "Earth Shatter", category: "ground-slam", description: "Leap into the air and slam the ground, creating fissures", cooldown: "10s", damage: "High" },
  { id: "mjolnir-strike", name: "Mjolnir Strike", category: "ground-slam", description: "Channel Thor's hammer into a devastating ground pound", cooldown: "14s", damage: "Very High" },
  { id: "frost-quake", name: "Frost Quake", category: "ground-slam", description: "Frozen impact that creates ice spikes from the ground", cooldown: "8s", damage: "Medium" },
  { id: "seismic-roar", name: "Seismic Roar", category: "ground-slam", description: "Stomp with such force the earth ripples outward", cooldown: "12s", damage: "High" },
  { id: "meteor-drop", name: "Ragnarok Drop", category: "ground-slam", description: "Fall from great height with world-ending force", cooldown: "18s", damage: "Extreme" },
  // BEAM
  { id: "ice-beam", name: "Niflheim Beam", category: "beam", description: "Channel a continuous beam of freezing energy", cooldown: "8s", damage: "Medium/s" },
  { id: "lightning-arc", name: "Lightning Arc", category: "beam", description: "Sustained lightning bolt that chains between enemies", cooldown: "10s", damage: "High/s" },
  { id: "soul-drain", name: "Soul Drain", category: "beam", description: "Channel dark energy to siphon life from enemies", cooldown: "12s", damage: "Low/s + Heal" },
  { id: "runic-ray", name: "Runic Ray", category: "beam", description: "Fire a concentrated beam of runic symbols", cooldown: "6s", damage: "Medium/s" },
  { id: "bifrost-blast", name: "Bifrost Blast", category: "beam", description: "Channel the rainbow bridge's energy in a devastating beam", cooldown: "16s", damage: "Very High/s" },
  // SUMMON
  { id: "wolf-pack", name: "Call Wolf Pack", category: "summon", description: "Summon spectral wolves of Fenrir to fight beside you", cooldown: "20s", damage: "Medium" },
  { id: "rune-totem", name: "Rune Totem", category: "summon", description: "Place a totem that pulses with damaging rune energy", cooldown: "14s", damage: "Low/s" },
  { id: "valkyrie-ally", name: "Summon Einherjar", category: "summon", description: "Call a fallen warrior from Valhalla to aid you", cooldown: "25s", damage: "High" },
  { id: "ice-wall", name: "Wall of Niflheim", category: "summon", description: "Raise an ice wall that blocks and damages", cooldown: "10s", damage: "Low" },
  { id: "raven-scouts", name: "Huginn & Muninn", category: "summon", description: "Send Odin's ravens to scout and harass enemies", cooldown: "12s", damage: "Low" },
  // BUFF
  { id: "berserker-rage", name: "Berserker Rage", category: "buff", description: "Enter a fury state: +50% damage, +30% speed", cooldown: "30s", damage: "+50% DMG" },
  { id: "iron-skin", name: "Iron Skin", category: "buff", description: "Harden your body like Viking iron: -40% damage taken", cooldown: "20s", damage: "-40% DMG Taken" },
  { id: "odin-wisdom", name: "Odin's Wisdom", category: "buff", description: "Gain clarity: cooldowns refresh 25% faster", cooldown: "25s", damage: "CDR 25%" },
  { id: "freya-blessing", name: "Freya's Blessing", category: "buff", description: "Heal over time and cleanse negative effects", cooldown: "18s", damage: "HoT" },
  { id: "ragnarok-form", name: "Ragnarok Form", category: "buff", description: "Transcend mortal limits: all stats doubled briefly", cooldown: "60s", damage: "x2 All Stats" },
]

// ============================================================
// RARITY COLORS
// ============================================================
export const RARITY_COLORS: Record<string, string> = {
  common: "#9CA3AF",
  uncommon: "#34D399",
  rare: "#60A5FA",
  epic: "#A78BFA",
  legendary: "#F59E0B",
}

export const RARITY_BG: Record<string, string> = {
  common: "rgba(156,163,175,0.12)",
  uncommon: "rgba(52,211,153,0.12)",
  rare: "rgba(96,165,250,0.12)",
  epic: "rgba(167,139,250,0.12)",
  legendary: "rgba(245,158,11,0.12)",
}
