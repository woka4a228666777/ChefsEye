import { get, set } from 'idb-keyval';
import { Product, Receipt, Recipe, ShoppingListItem } from '../types';

const DB_KEYS = {
  PRODUCTS: 'products',
  RECEIPTS: 'receipts',
  RECIPES: 'recipes',
  SHOPPING_LIST: 'shopping-list',
  RECIPE_CACHE: 'recipe-cache'
};

export const storage = {
  // Products
  async getProducts(): Promise<Product[]> {
    return (await get(DB_KEYS.PRODUCTS)) || [];
  },

  async saveProducts(products: Product[]): Promise<void> {
    await set(DB_KEYS.PRODUCTS, products);
  },

  async addProduct(product: Product): Promise<void> {
    const products = await this.getProducts();
    products.push(product);
    await this.saveProducts(products);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updates };
      await this.saveProducts(products);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const products = await this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    await this.saveProducts(filtered);
  },

  // Receipts
  async getReceipts(): Promise<Receipt[]> {
    return (await get(DB_KEYS.RECEIPTS)) || [];
  },

  async saveReceipt(receipt: Receipt): Promise<void> {
    const receipts = await this.getReceipts();
    receipts.push(receipt);
    await set(DB_KEYS.RECEIPTS, receipts);
  },

  // Recipes
  async getCachedRecipes(): Promise<Recipe[]> {
    return (await get(DB_KEYS.RECIPES)) || [];
  },

  async cacheRecipes(recipes: Recipe[]): Promise<void> {
    await set(DB_KEYS.RECIPES, recipes);
  },

  // Shopping List
  async getShoppingList(): Promise<ShoppingListItem[]> {
    return (await get(DB_KEYS.SHOPPING_LIST)) || [];
  },

  async saveShoppingList(items: ShoppingListItem[]): Promise<void> {
    await set(DB_KEYS.SHOPPING_LIST, items);
  },

  async addToShoppingList(item: ShoppingListItem): Promise<void> {
    const list = await this.getShoppingList();
    list.push(item);
    await this.saveShoppingList(list);
  },

  async updateShoppingItem(id: string, updates: Partial<ShoppingListItem>): Promise<void> {
    const list = await this.getShoppingList();
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      await this.saveShoppingList(list);
    }
  },

  async clearCompletedItems(): Promise<void> {
    const list = await this.getShoppingList();
    const activeItems = list.filter(item => !item.completed);
    await this.saveShoppingList(activeItems);
  }
};