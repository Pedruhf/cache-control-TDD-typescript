import { CacheStore } from "@/data/protocols/cache"

export class LocalSavePurchases {
  constructor (private readonly cacheStore: CacheStore) {}

  save (): Promise<void> {
    this.cacheStore.delete("purchases")
    return Promise.resolve();
  }
}
