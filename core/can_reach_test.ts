import { assertEquals } from "@std/assert";
import { unreachableRecipes } from "./can_reach.ts";
import { type RecipeRow, RECIPES } from "./recipes.ts";

Deno.test("fixpoint: all real recipes can be reached", () => {
  const unreachable = unreachableRecipes(RECIPES);
  assertEquals(unreachable, []);
});

Deno.test("fixpoint: catches recipes that require themselves", () => {
  const brokenTable: Record<string, RecipeRow> = {
    ...RECIPES,
    paradoxical_thing: {
      inputs: { paradoxical_thing: 1 },
      outputs: { paradoxical_thing: 1 },
    },
  };
  const unreachable = unreachableRecipes(brokenTable);
  assertEquals(unreachable, ["paradoxical_thing"]);
});
