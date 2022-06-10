import { CacheStore } from "@/data/protocols/cache"
import { SavePurchases } from "@/domain/usecases";

export class LocalLoadPurchases implements SavePurchases {
  constructor (
    private readonly cacheStore: CacheStore,
    private readonly timestamp: Date,
  ) {}

  async save (purchases: SavePurchases.Params[]): Promise<void> {
    this.cacheStore.delete("purchases");
    this.cacheStore.insert("purchases", {
      timestamp: this.timestamp,
      value: purchases
    });
  }

  async loadAll (): Promise<void> {
    this.cacheStore.fetch("purchases");
  }
}
