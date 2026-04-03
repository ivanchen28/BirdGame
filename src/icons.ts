export function iconUrl(name: string): string {
  return new URL(`../assets/icons/${name}.png`, import.meta.url).href;
}
export function foodUrl(name: string): string {
  return new URL(`../assets/icons/food/${name}.png`, import.meta.url).href;
}
export function habitatUrl(name: string): string {
  return new URL(`../assets/icons/habitats/${name}.png`, import.meta.url).href;
}
export function hummingbirdTypeUrl(name: string): string {
  return new URL(`../assets/icons/hummingbirds/${name}.png`, import.meta.url).href;
}
export function nestUrl(name: string): string {
  return new URL(`../assets/icons/nests/${name}.png`, import.meta.url).href;
}
export function birdImageUrl(id: number): string {
  return new URL(`../assets/cards/birds/${id}.png`, import.meta.url).href;
}
export function powerBgUrl(color: string): string {
  return new URL(`../assets/powers/${color}.png`, import.meta.url).href;
}

const FoodIcons = new Set([
  "fish",
  "fruit",
  "invertebrate",
  "nectar",
  "no-food",
  "rodent",
  "seed",
  "seed-dark",
  "wild",
]);
const HabitatIcons = new Set(["forest", "grassland", "wetland"]);
const HummingbirdIcons = new Set(["hummingbird", "bee", "brilliant", "emerald", "mango", "topaz"]);
const NestIcons = new Set(["bowl", "cavity", "platform", "ground", "star"]);

/** Resolve an icon name to the correct subfolder URL */
export function resolveIconUrl(name: string): string {
  if (FoodIcons.has(name)) return foodUrl(name);
  if (HabitatIcons.has(name)) return habitatUrl(name);
  if (NestIcons.has(name)) return nestUrl(name);
  if (HummingbirdIcons.has(name)) return hummingbirdTypeUrl(name);
  return iconUrl(name);
}
