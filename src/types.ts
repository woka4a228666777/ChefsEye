export interface Product {
  id: string;
  name: string;
  category: string;
  status: 'full' | 'low' | 'empty';
}

export interface Receipt {
  products: Product[];
  store?: string;
  date: Date;
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
  usedIngredients: string[];
  missedIngredients: string[];
  readyInMinutes: number;
  servings: number;
  sourceUrl?: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  completed: boolean;
}

export interface RecipeSearchFilters {
  maxTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  dishType?: string;
  cuisine?: string;
}

export interface AnnotatedProduct {
  id: string;
  name: string;
  category: string;
  coordinates: { x: number; y: number; width: number; height: number };
}