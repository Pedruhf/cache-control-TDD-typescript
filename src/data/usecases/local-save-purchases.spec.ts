import { CacheStore } from "@/data/protocols/cache";
import { SavePurchases } from "@/domain/usecases";
import { LocalSavePurchases } from "./index";

import { faker } from "@faker-js/faker";

const mockPurchases = (): SavePurchases.Params[] => [
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

class CacheStoreSpy implements CacheStore {
  messages: CacheStoreSpy.Messages[] = [];
  deleteCallsCount = 0;
  insertCallsCount = 0;
  deleteKey?: string;
  insertKey?: string;
  insertValues: SavePurchases.Params[] = [];

  delete (key: string): void {
    this.messages.push(CacheStoreSpy.Messages.delete);
    this.deleteCallsCount++;
    this.deleteKey = key;
  }

  insert (key: string, value: any): void {
    this.messages.push(CacheStoreSpy.Messages.insert);
    this.insertCallsCount++;
    this.insertKey = key;
    this.insertValues = value;
  }
}

namespace CacheStoreSpy {
  export enum Messages {
    delete,
    insert,
  }
}

type SutTypes = {
  sut: LocalSavePurchases;
  cacheStoreSpy: CacheStoreSpy;
};

const makeSut = (): SutTypes => {
  const cacheStoreSpy = new CacheStoreSpy();
  const sut = new LocalSavePurchases(cacheStoreSpy);

  return {
    sut,
    cacheStoreSpy,
  };
};

describe('LocalSavePurchases Usecase', () => {
  test('Should not delete or insert cache on init', () => {
    const { cacheStoreSpy } = makeSut();
    expect(cacheStoreSpy.messages).toEqual([]);
  });

  test('Should delete old cache on save', async () => {
    const { sut, cacheStoreSpy } = makeSut();
    await sut.save(mockPurchases());
    expect(cacheStoreSpy.messages).toEqual([CacheStoreSpy.Messages.delete, CacheStoreSpy.Messages.insert]);
  });

  test('Should not insert new cache if delete fails', () => {
    const { sut, cacheStoreSpy } = makeSut();
    jest.spyOn(cacheStoreSpy, "delete").mockImplementationOnce(() => {
      cacheStoreSpy.messages.push(CacheStoreSpy.Messages.delete);
      throw new Error()
    });

    const savePromise = sut.save(mockPurchases());
    expect(cacheStoreSpy.messages).toEqual([CacheStoreSpy.Messages.delete]);
    expect(savePromise).rejects.toThrow();
  });

  test('Should insert new cache if delete succeeds', async () => {
    const { sut, cacheStoreSpy } = makeSut();
    const purchases = mockPurchases();
    await sut.save(purchases);
    expect(cacheStoreSpy.messages).toEqual([CacheStoreSpy.Messages.delete, CacheStoreSpy.Messages.insert]);
    expect(cacheStoreSpy.insertKey).toBe("purchases");
    expect(cacheStoreSpy.insertValues).toEqual(purchases);
  });

  test('Should throw if insert throws', () => {
    const { sut, cacheStoreSpy } = makeSut();
    jest.spyOn(cacheStoreSpy, "insert").mockImplementationOnce(() => {
      cacheStoreSpy.messages.push(CacheStoreSpy.Messages.insert);
      throw new Error()
    });
    const savePromise = sut.save(mockPurchases());
    expect(cacheStoreSpy.messages).toEqual([CacheStoreSpy.Messages.delete, CacheStoreSpy.Messages.insert]);
    expect(savePromise).rejects.toThrow();
  });
});
