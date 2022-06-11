import { CacheStore } from "@/data/protocols/cache";
import { SavePurchases } from "@/domain/usecases";
import { faker } from "@faker-js/faker";

export const getCacheExpirationDate = (timestamp: Date): Date => {
  const cacheExpirationTime = 3;
  const maxCacheAge = new Date(timestamp);
  maxCacheAge.setDate(maxCacheAge.getDate() - cacheExpirationTime);
  return maxCacheAge;
}

export class CacheStoreSpy implements CacheStore {
  actions: CacheStoreSpy.Action[] = [];
  deleteCallsCount = 0;
  insertCallsCount = 0;
  deleteKey?: string;
  insertKey?: string;
  fetchKey?: string;
  insertValues: SavePurchases.Params[] = [];
  fetchResult: any;

  delete (key: string): void {
    this.actions.push(CacheStoreSpy.Action.delete);
    this.deleteCallsCount++;
    this.deleteKey = key;
  }

  insert (key: string, value: any): void {
    this.actions.push(CacheStoreSpy.Action.insert);
    this.insertCallsCount++;
    this.insertKey = key;
    this.insertValues = value;
  }

  fetch (key: string): any {
    this.actions.push(CacheStoreSpy.Action.fetch);
    this.fetchKey = key;

    return this.fetchResult;
  }

}

export namespace CacheStoreSpy {
  export enum Action {
    delete,
    insert,
    fetch,
  }
}

export const mockPurchases = (): SavePurchases.Params[] => [
  {
    id: faker.datatype.uuid(),
    date: faker.date.recent(),
    value: faker.datatype.number(),
  },
  {
    id: faker.datatype.uuid(),
    date: faker.date.recent(),
    value: faker.datatype.number(),
  },
];