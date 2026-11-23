import { type GameEvent, type GameState, terrainAt } from "../core/mod.ts";

function element(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function describe(event: GameEvent): string {
  switch (event.type) {
    case "moved":
      return `Moved to {${event.to.x}, ${event.to.y}}`;
    case "blocked":
      return `Blocked by ${event.terrain} at {${event.toward.x}, ${event.toward.y}}`;
    case "gather":
      return `Gathered ${event.quantity} ${event.resource} at {${event.at.x}, ${event.at.y}}`;
    case "failed-gather":
      return `Did not gather from {${event.at.x}, ${event.at.y}}. ${event.msg}`;
    case "craft":
      return `Crafted ${event.outputs}`;
    case "failed-craft":
      return `Missing ${event.missing} to craft ${event.recipe}`;
  }
}

// The readout, as ordinary page elements that CSS can style and that assistive
// tools can read. It changes only as events play.
export class Hud {
  private readonly seed: number;

  constructor(state: GameState) {
    this.seed = state.seed;
    this.showPosition(state.player.x, state.player.y);
  }

  show(event: GameEvent) {
    element("live").textContent = describe(event);
    if (event.type === "moved") this.showPosition(event.to.x, event.to.y);
    if (event.type === "gather") {
      this.updateInventory(event.resource, event.inventory);
    }
  }

  private showPosition(x: number, y: number) {
    element("position").textContent = `${x}, ${y}`;
    element("terrain").textContent = terrainAt(this.seed, x, y);
  }

  private updateInventory(resource: string, inv: Record<string, number>) {
    const invUI = element("inventory");
    if (!invUI) {
      throw new Error("Error: Unable to retrive inventory HTML element.");
    }

    const itemList = Array.from(invUI.querySelectorAll<HTMLLIElement>("li"));

    const filtered = itemList.filter((li) => li.dataset.resource === resource);
    const foundItem = filtered[0];

    if (!foundItem) {
      const newItem = document.createElement("li");
      newItem.dataset.resource = resource;
      newItem.innerText = `${resource}: ${inv[resource]}`;
      invUI.append(newItem);
      return;
    }

    foundItem.innerText = `${resource}: ${inv[resource]}`;
  }
}
