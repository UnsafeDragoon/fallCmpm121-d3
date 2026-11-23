// The rules of the game. There is no clock here: a command updates the state at
// once, and the events it returns are a record of what happened. Whoever called
// apply() decides how, or whether, to show them over time.

import {
  isPassable,
  type Terrain,
  terrainAt,
  TerrainDrops,
} from "./terrain.ts";
import { CAPSTONE_RECIPE, type RecipeRow, RECIPES } from "./recipes.ts";

export type Cell = { x: number; y: number };

export type Direction = "north" | "south" | "east" | "west";

// Plain data that survives JSON. Terrain is absent because the seed can recompute
// it: besides the seed, only what the player has caused belongs here.
export type GameState = {
  seed: number;
  player: Cell;
  inventory: Record<string, number>;
  collectedTiles: Record<string, boolean>;
  winCond: boolean;
};

// Command: https://gameprogrammingpatterns.com/command.html
export type Command =
  | {
    type: "move";
    direction: Direction;
  }
  | {
    type: "gather";
  }
  | {
    type: "craft";
    recipe: string;
  };

// Domain Event: https://martinfowler.com/eaaDev/DomainEvent.html
export type GameEvent =
  | { type: "moved"; from: Cell; to: Cell }
  | { type: "blocked"; at: Cell; toward: Cell; terrain: Terrain }
  | {
    type: "gather";
    resource: string;
    quantity: number;
    at: Cell;
    inventory: Record<string, number>;
  }
  | {
    type: "failed-gather";
    msg:
      | "FAIL: Unknown Tile Resource!"
      | "Already Collected This Tile's Resource!";
    at: Cell;
  }
  | {
    type: "craft";
    recipe: string;
    outputs: Record<string, number>;
    inventory: Record<string, number>;
  }
  | {
    type: "failed-craft";
    recipe: string;
    missing: Record<string, number>;
  }
  | {
    type: "beat-game";
    msg:
      "You crafted the thrusters and repaired the rocketship. With the help of local goo, you have enough fuel to make the journey back home. You win!";
  };

const STEPS: Record<Direction, Cell> = {
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
};

// Singleton, avoided on purpose: tests make as many games as they need. https://gameprogrammingpatterns.com/singleton.html
export function newGame(seed: number): GameState {
  return {
    seed,
    player: { x: 0, y: 0 },
    inventory: { silver: 0, wood: 0, goop: 0, stone: 0 },
    collectedTiles: {},
    winCond: false,
  };
}

// The single way in. It updates the state it is given and returns the events.
export function apply(state: GameState, command: Command): GameEvent[] {
  if (state.winCond) {
    return [];
  }
  switch (command.type) {
    case "move":
      return move(state, command.direction);
    case "gather":
      return gather(state);
    case "craft":
      return craft(state, command.recipe);
  }
}

function move(state: GameState, direction: Direction): GameEvent[] {
  const step = STEPS[direction];
  // Events are retained and played back later, while state keeps changing. So an
  // event gets cells of its own, never an object that state still holds.
  // Aliasing Bug: https://martinfowler.com/bliki/AliasingBug.html
  // Cells in events act as a Value Object: https://martinfowler.com/bliki/ValueObject.html
  const from = { ...state.player };
  const to = { x: from.x + step.x, y: from.y + step.y };
  const terrain = terrainAt(state.seed, to.x, to.y);
  if (!isPassable(terrain, state.inventory)) {
    return [{ type: "blocked", at: from, toward: to, terrain }];
  }
  state.player.x = to.x;
  state.player.y = to.y;
  return [{ type: "moved", from, to }];
}

function gather(state: GameState): GameEvent[] {
  const player = { ...state.player };
  const tileKey = `${player.x}.${player.y}`;

  if (state.collectedTiles[tileKey]) {
    return [{
      type: "failed-gather",
      msg: "Already Collected This Tile's Resource!",
      at: player,
    }];
  }

  const terrain = terrainAt(state.seed, player.x, player.y);
  const possibleDrops = TerrainDrops[terrain];

  if (!possibleDrops || possibleDrops.length === 0) {
    return [{
      type: "failed-gather",
      msg: "FAIL: Unknown Tile Resource!",
      at: player,
    }];
  }

  const roll = tileRoll(state.seed, player.x, player.y);
  let cumulativeChance = 0;
  let gatheredResource = possibleDrops[0].resource;

  for (const drop of possibleDrops) {
    cumulativeChance += drop.chance;
    if (roll <= cumulativeChance) {
      gatheredResource = drop.resource;
      break;
    }
  }

  state.collectedTiles[tileKey] = true;

  state.inventory[gatheredResource] = (state.inventory[gatheredResource] || 0) +
    1;
  return [{
    type: "gather",
    resource: gatheredResource,
    quantity: 1,
    at: player,
    inventory: { ...state.inventory },
  }];
}

export function missingForRecipe(
  inventory: Record<string, number>,
  recipe: RecipeRow,
): Record<string, number> {
  const missing: Record<string, number> = {};
  for (const [item, amount] of Object.entries(recipe.inputs)) {
    const has = inventory[item] || 0;
    if (has < amount) {
      missing[item] = amount - has;
    }
  }
  return missing;
}

function craft(state: GameState, recipeName: string): GameEvent[] {
  const recipe = RECIPES[recipeName];
  if (!recipe) {
    return [{ type: "failed-craft", recipe: recipeName, missing: {} }];
  }

  const missing = missingForRecipe(state.inventory, recipe);
  if (Object.keys(missing).length > 0) {
    return [{ type: "failed-craft", recipe: recipeName, missing }];
  }

  for (const [item, amount] of Object.entries(recipe.inputs)) {
    state.inventory[item] -= amount;
  }
  for (const [item, amount] of Object.entries(recipe.outputs)) {
    state.inventory[item] = (state.inventory[item] || 0) + amount;
  }

  const events: GameEvent[] = [{
    type: "craft",
    recipe: recipeName,
    outputs: recipe.outputs,
    inventory: { ...state.inventory },
  }];

  if (recipeName === CAPSTONE_RECIPE) {
    state.winCond = true;

    events.push({
      type: "beat-game",
      msg:
        "You crafted the thrusters and repaired the rocketship. With the help of local goo, you have enough fuel to make the journey back home. You win!",
    });
  }

  return events;
}

function tileRoll(seed: number, x: number, y: number): number {
  let hash = Math.imul(seed + 999, 0x9e3779b1) ^ Math.imul(x, 0x85ebca6b) ^
    Math.imul(y, 0xc2b2ae35);
  hash = Math.imul(hash ^ (hash >>> 15), 0x2c1b3c6d);
  hash = Math.imul(hash ^ (hash >>> 12), 0x297a2d39);
  return ((hash ^ (hash >>> 15)) >>> 0) / 2 ** 32;
}
