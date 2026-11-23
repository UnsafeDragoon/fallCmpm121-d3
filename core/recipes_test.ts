import { assertEquals } from "@std/assert";
import { RECIPES } from "./recipes.ts";
import { apply, newGame } from "./rules.ts";
import { TerrainDrops } from "./terrain.ts";

Deno.test("crafting succeeds with correct inputs and outputs", () => {
  const state = newGame(123);
  const recipe = RECIPES.wooden_pickaxe;

  state.inventory.wooden_plank = recipe.inputs.wooden_plank;
  state.inventory.stick = recipe.inputs.stick;

  const events = apply(state, { type: "craft", recipe: "wooden_pickaxe" });

  assertEquals(events[0].type, "craft");
  assertEquals(state.inventory.wooden_plank, 0);
  assertEquals(state.inventory.stick, 0);
  assertEquals(state.inventory.wooden_pickaxe, 1);
});

Deno.test("crafting fails with insufficient inputs", () => {
  const state = newGame(123);
  state.inventory.wooden_plank = 1;
  state.inventory.stick = 1;

  const events = apply(state, { type: "craft", recipe: "wooden_pickaxe" });

  assertEquals(events[0].type, "failed-craft");
  if (events[0].type === "failed-craft") {
    assertEquals(events[0].missing, {
      wooden_plank: RECIPES.wooden_pickaxe.inputs.wooden_plank - 1,
      stick: RECIPES.wooden_pickaxe.inputs.stick - 1,
    });
  }
});

Deno.test("all recipe inputs can be gathered/crafted", () => {
  const gatherableSources = new Set<string>(
    Object.values(TerrainDrops).flat().map((drop) => drop.resource),
  );
  const craftableSources = new Set(
    Object.values(RECIPES).flatMap((r) => Object.keys(r.outputs)),
  );

  for (const [name, recipe] of Object.entries(RECIPES)) {
    for (const inputs of Object.keys(recipe.inputs)) {
      const hasSource = gatherableSources.has(inputs) ||
        craftableSources.has(inputs);
      assertEquals(
        hasSource,
        true,
        `Recipe '${name}' requires '${inputs}', which cannot be gathered or crafted.`,
      );
    }
  }
});
