export type RecipeRow = {
  inputs: Record<string, number>;
  outputs: Record<string, number>;
};

export const RECIPES: Record<string, RecipeRow> = {
  wooden_plank: {
    inputs: { wood: 1 },
    outputs: { wooden_plank: 4 },
  },
  stick: {
    inputs: { wooden_plank: 2 },
    outputs: { stick: 4 },
  },
  wooden_pickaxe: {
    inputs: { wooden_plank: 3, stick: 2 },
    outputs: { wooden_pickaxe: 1 },
  },
  stone_pickaxe: {
    inputs: { stone: 3, stick: 2 },
    outputs: { stone_pickaxe: 1 },
  },
  silver_bucket: {
    inputs: { silver: 3 },
    outputs: { silver_bucket: 1 },
  },
  silver_sheet: {
    inputs: { silver: 9 },
    outputs: { silver_sheet: 3 },
  },
  thruster: {
    inputs: { silver_sheet: 8, goop: 1 },
    outputs: { thruster: 1 },
  },
};
