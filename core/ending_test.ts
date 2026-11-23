import { assertEquals } from "@std/assert";
import { apply, newGame } from "./rules.ts";

Deno.test("crafting thruster ends the game", () => {
  const state = newGame(1);

  state.inventory = {
    silver_sheet: 8,
    goop: 1,
  };

  const events = apply(state, {
    type: "craft",
    recipe: "thruster",
  });

  assertEquals(events[0].type, "craft");
  assertEquals(events[1].type, "beat-game");
  assertEquals(state.winCond, true);
});

Deno.test("commands cannot change state after game ends", () => {
  const state = newGame(1);

  state.winCond = true;

  const commands = [
    { type: "move", direction: "north" },
    { type: "gather" },
    { type: "craft", recipe: "wooden_plank" },
  ] as const;

  for (const command of commands) {
    const before = JSON.stringify(state);

    const events = apply(state, command);

    assertEquals(events, []);
    assertEquals(JSON.stringify(state), before);
  }
});
