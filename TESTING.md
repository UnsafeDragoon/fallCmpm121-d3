# Manual test script

For a person, or an agent driving a browser. Run `deno task dev` and open the local URL with `?seed=121`. Before each section, reload. To read logical state, use `game.state` in the console. To read what has played, use the panel beside the grid, including the `#live` text, or look at the marker.

**Promotion rule:** a bug found by hand or by an agent becomes a permanent test in `core/` before it is fixed, unless it truly lives in `game/`, in which case add a step here.

| #  | Action                                                    | Expected observation                                                                                                                                        |
| -- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | Load the page                                             | One canvas. A pale marker at the center of a green map. No console errors.                                                                                  |
| 2  | Tap the right arrow                                       | The marker slides one cell east. `#live` says `moved to 1, 0`. `player` is `{ x: 1, y: 0 }`.                                                                |
| 3  | Walk until water or rock is ahead, then press toward it   | The marker lurches and flashes red, then returns to its cell. `#live` says `blocked by water at ...` or `blocked by rock at ...`. `player` has not changed. |
| 4  | Tap an arrow during a walk                                | The tap waits. The marker finishes the walk, then takes that step. It never skips a cell.                                                                   |
| 5  | Mash arrows quickly, then stop                            | The marker settles on the cell `player` reports.                                                                                                            |
| 6  | Hold an arrow down                                        | The marker keeps walking. Holding into a wall repeats the bump.                                                                                             |
| 7  | Load `?seed=7`                                            | A different map.                                                                                                                                            |
| 8  | Run `game.state` in the console                           | Plain data: `seed` and `player`. No terrain list.                                                                                                           |
| 9  | Press an arrow several times                              | Position and Terrain in the panel change as each step plays, and never ahead of the marker.                                                                 |
| 10 | Make the window short, then press the down arrow          | The page does not scroll. The marker moves.                                                                                                                 |
| 11 | Click the sound button, then press an arrow               | The button reads `Sound: off`, and the arrow still moves the marker.                                                                                        |
| 12 | Click the sound button again                              | The button reads `Sound: on`, and you hear a two-note chime.                                                                                                |
| 13 | Tab to the sound button and press Space                   | It toggles. Arrow keys still move the marker.                                                                                                               |
| 14 | Listen while walking and bumping (headphones or speakers) | A soft tick on each step, and a low buzz on each bump. **This is the only check that a person can hear them.**                                              |
| 15 | On a high-resolution display, or at browser zoom 200%     | Grid edges stay sharp. The marker stays centered. Run `document.querySelector("canvas").width`: it is the canvas `clientWidth` times `devicePixelRatio`.    |

| 16 | Gathering (visual and audio) | Plays a beep-like chime after you press 'e' over a non-grayed resource tile. Newly aquired resources pop up on the right hand side while known resources increment.
| 17 | Gather items and look at the recipe list | The recipe buttons update to show missing requirements. When you have enough materials, the button changes to "Craft [item]". |
| 18 | Click a craftable recipe button | The marker bumps, a buzzsaw sound plays, the item appears in the inventory, and inputs are deducted. #live reports success. |
| 19 | Click a recipe with missing items | The marker flashes red, a bump sound plays, and #live reports the missing items. |
| 20 | Click a recipe button, then use arrows | The marker moves. The button successfully yielded keyboard focus back to the page. |
| 21 | Walk into a mountain without a pickaxe | The marker flashes red and bumps. #live says you are blocked and need a pickaxe. |
| 22 | Gather wood, craft a wooden pickaxe, and walk into a mountain | The marker successfully moves onto the mountain cell. #live reports the movement. |
| 23 | Walk into a swamp without a silver bucket | The marker flashes red and bumps. #live says you are blocked and need a silver bucket. |
| 24 | Gather silver from mountains, craft a silver bucket, and walk into a swamp | The marker successfully moves onto the swamp cell. #live reports the movement. |
| 25 | Gather required materials and craft a thruster | The ending screen is displayed, indicating the game has been won. |
