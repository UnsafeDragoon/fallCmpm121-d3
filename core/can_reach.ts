import { type RecipeRow } from "./recipes.ts";
import { isPassable, type Terrain, TerrainDrops } from "./terrain.ts";

export function unreachableRecipes(
  recipes: Record<string, RecipeRow>,
): string[] {
  const reached = new Set<string>();
  const made = new Set<string>();

  function updateReachableTerrain() {
    const mockInventory: Record<string, number> = {};
    for (const item of reached) mockInventory[item] = 1;

    for (const terrain of Object.keys(TerrainDrops) as Terrain[]) {
      if (isPassable(terrain, mockInventory)) {
        for (const drop of TerrainDrops[terrain]) {
          reached.add(drop.resource);
        }
      }
    }
  }

  updateReachableTerrain();

  let changed = true;
  while (changed) {
    changed = false;

    for (const [recipeName, recipe] of Object.entries(recipes)) {
      if (made.has(recipeName)) continue;

      const canMake = Object.keys(recipe.inputs).every((input) =>
        reached.has(input)
      );
      if (canMake) {
        made.add(recipeName);
        changed = true;

        for (const output of Object.keys(recipe.outputs)) {
          reached.add(output);
        }

        updateReachableTerrain();
      }
    }
  }

  return Object.keys(recipes).filter((name) => !made.has(name));
}
