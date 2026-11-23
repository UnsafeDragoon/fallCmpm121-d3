import { assertEquals } from "@std/assert";
import { apply, newGame, type Terrain, terrainAt } from "./mod.ts";
import { GameEvent } from "./rules.ts";

const SEED = 121;

function cellOfTerrain(terrain: Terrain) {
  for (let x = 1; x < 10_000; x++) {
    if (terrainAt(SEED, x, 0) === terrain) {
      return { x, y: 0 };
    }
  }

  throw new Error(`found no cell with terrain: ${terrain}`);
}

Deno.test("gathering from forest adds wood to inventory", () => {
  const state = newGame(SEED);
  state.player = cellOfTerrain("forest");

  const events = apply(state, { type: "gather" });

  assertEquals(state.inventory.wood, 1);
  assertEquals(state.collectedTiles, {
    [`${state.player.x}.${state.player.y}`]: true,
  });

  assertEquals(events, [{
    type: "gather",
    resource: "wood",
    quantity: 1,
    at: state.player,
    inventory: { dirt: 0, wood: 1, water: 0, stone: 0 },
  }]);
});

Deno.test("gathering twice from the same cell only succeeds once", () => {
  const state = newGame(SEED);
  state.player = cellOfTerrain("forest");

  apply(state, { type: "gather" });
  const events = apply(state, { type: "gather" });

  assertEquals(state.inventory.wood, 1);

  assertEquals(events, [{
    type: "failed-gather",
    msg: "Already Collected This Tile's Resource!",
    at: state.player,
  }]);
});

Deno.test("a failed gather changes nothing", () => {
  const state = newGame(SEED);
  state.player = cellOfTerrain("forest");

  apply(state, { type: "gather" });

  const snapshot = JSON.parse(JSON.stringify(state));

  const events = apply(state, { type: "gather" });

  assertEquals(state, snapshot);
  assertEquals(events[0].type, "failed-gather");
});

Deno.test("event keeps its cells while state moves on", () => {
  const state = newGame(SEED);
  state.player = cellOfTerrain("forest");

  const events = apply(state, { type: "gather" });

  const keptEvent: GameEvent = events[0];
  if (keptEvent.type != "gather") {
    throw new Error(
      "Failure: Event snapshot failed to register correct event 'gather'.",
    );
  }

  assertEquals(state.inventory.wood, 1);

  state.player = cellOfTerrain("mountain");
  apply(state, { type: "gather" });

  assertEquals(state.inventory.stone, 1);

  assertEquals(keptEvent, {
    type: "gather",
    resource: "wood",
    quantity: 1,
    at: keptEvent.at,
    inventory: { dirt: 0, wood: 1, water: 0, stone: 0 },
  });
});
