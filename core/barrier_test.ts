import { assertEquals } from "@std/assert";
import { apply, type Cell, newGame } from "./rules.ts";
import { terrainAt } from "./terrain.ts";

function findTerrain(seed: number, targetTerrain: string): Cell {
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      if (terrainAt(seed, x, y) === targetTerrain) {
        return { x, y };
      }
    }
  }
  throw new Error(`Found no suitable ${targetTerrain} cell in search radius`);
}

Deno.test("barriers block empty hands but open with correct tool", () => {
  const state = newGame(123);
  const mountainCell = findTerrain(state.seed, "mountain");

  state.player = { x: mountainCell.x - 1, y: mountainCell.y };

  const blockedEvents = apply(state, { type: "move", direction: "east" });
  assertEquals(blockedEvents[0].type, "blocked");
  assertEquals(state.player.x, mountainCell.x - 1);

  state.inventory.wooden_pickaxe = 1;
  const moveEvents = apply(state, { type: "move", direction: "east" });
  assertEquals(moveEvents[0].type, "moved");
  assertEquals(state.player.x, mountainCell.x);

  const gatherEvents = apply(state, { type: "gather" });
  assertEquals(gatherEvents[0].type, "gather");
});
