import { assertEquals } from "@std/assert";
import { apply, type Command, type GameEvent, newGame } from "./rules.ts";
import runData from "./run.json" with { type: "json" };

Deno.test("replaying the recorded run finishes the game", () => {
  const state = newGame(runData.seed);
  const commands = runData.commands as Command[];

  for (const cmd of commands) {
    apply(state, cmd);
  }

  assertEquals(
    (state.inventory.thruster || 0) > 0,
    true,
    "Game did not finish, thruster not crafted",
  );
});

Deno.test("same events are replayed across multiple runs regardless of time", () => {
  const commands = runData.commands as Command[];

  const state1 = newGame(runData.seed);
  const events1: GameEvent[] = [];
  for (const cmd of commands) {
    events1.push(...apply(state1, cmd));
  }

  const start = Date.now();
  while (Date.now() - start < 20) {
    // wait
  }

  const state2 = newGame(runData.seed);
  const events2: GameEvent[] = [];
  for (const cmd of commands) {
    events2.push(...apply(state2, cmd));
  }

  assertEquals(state1, state2);
  assertEquals(events1, events2);
});
