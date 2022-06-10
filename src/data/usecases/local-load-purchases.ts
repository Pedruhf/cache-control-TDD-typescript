import { CacheStore } from "@/data/protocols/cache"
import { LoadPurchases, SavePurchases } from "@/domain/usecases";

export class LocalLoadPurchases implements SavePurchases, LoadPurchases {
  private readonly key = "purchases";
  
  constructor (
    private readonly cacheStore: CacheStore,
    private readonly timestamp: Date,
  ) {}

  async save (purchases: SavePurchases.Params[]): Promise<void> {
    this.cacheStore.delete(this.key);
    this.cacheStore.insert(this.key, {
      timestamp: this.timestamp,
      value: purchases
    });
  }

  async loadAll (): Promise<LoadPurchases.Result[]> {
    try {
      const purchases = this.cacheStore.fetch(this.key);
      return [];
    } catch {
      this.cacheStore.delete(this.key);
      return [];
    }
  }
}
