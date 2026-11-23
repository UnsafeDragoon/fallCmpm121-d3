import {
  type Command,
  type GameState,
  missingForRecipe,
  RECIPES,
} from "../core/mod.ts";

export class RecipeBook {
  private readonly state: GameState;
  private readonly buttons: { name: string; button: HTMLButtonElement }[] = [];

  constructor(
    list: HTMLUListElement,
    state: GameState,
    onCraft: (cmd: Command) => void,
  ) {
    this.state = state;

    for (const name of Object.keys(RECIPES)) {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";

      button.addEventListener("click", (event) => {
        onCraft({ type: "craft", recipe: name });
        if (event.detail > 0) button.blur();
      });

      li.appendChild(button);
      list.appendChild(li);
      this.buttons.push({ name, button });
    }
  }

  update() {
    for (const { name, button } of this.buttons) {
      const recipe = RECIPES[name];
      const missing = missingForRecipe(this.state.inventory, recipe);
      const missingKeys = Object.keys(missing);

      if (missingKeys.length === 0) {
        button.textContent = `Craft ${name}`;
        button.classList.add("craftable");
        button.classList.remove("uncraftable");
      } else {
        const reqs = missingKeys.map((k) => `${missing[k]} ${k}`).join(", ");
        button.textContent = `Craft ${name} (Needs: ${reqs})`;
        button.classList.add("uncraftable");
        button.classList.remove("craftable");
      }
    }
  }
}
