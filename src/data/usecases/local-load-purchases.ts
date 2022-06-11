import { CachePolicy, CacheStore } from "@/data/protocols/cache"
import { LoadPurchases, SavePurchases } from "@/domain/usecases";

export class LocalLoadPurchases implements SavePurchases, LoadPurchases {
  private readonly key = "purchases";
  
  constructor (
    private readonly cacheStore: CacheStore,
    private readonly currentDate: Date,
  ) {}

  async save (purchases: SavePurchases.Params[]): Promise<void> {
    this.cacheStore.delete(this.key);
    this.cacheStore.insert(this.key, {
      timestamp: this.currentDate,
      value: purchases
    });
  }

  async loadAll (): Promise<LoadPurchases.Result[]> {
    try {
      const cache = this.cacheStore.fetch(this.key);
      if (CachePolicy.validate(cache.timestamp, this.currentDate)) {
        return cache.value;
      }

      throw new Error();
    } catch {
      return [];
    }
  }

  validate (): void {
    try {
      const cache = this.cacheStore.fetch(this.key);
      if (!CachePolicy.validate(cache.timestamp, this.currentDate)) {
        throw new Error;
      }
    } catch {
      this.cacheStore.delete(this.key);
    }
  }
}
