import { CacheStoreSpy, mockPurchases } from "@/data/tests/cache";
import { LocalLoadPurchases } from "./index";

type SutTypes = {
  sut: LocalLoadPurchases;
  cacheStoreSpy: CacheStoreSpy;
};

const makeSut = (timestamp = new Date()): SutTypes => {
  const cacheStoreSpy = new CacheStoreSpy();
  const sut = new LocalLoadPurchases(cacheStoreSpy, timestamp);

  return {
    sut,
    cacheStoreSpy,
  };
};

describe('LocalLoadPurchases Usecase', () => {
  test('Should not delete or insert cache on init', () => {
    const { cacheStoreSpy } = makeSut();
    expect(cacheStoreSpy.actions).toEqual([]);
  });

  test('Should return empty list if load fails', async () => {
    const { sut, cacheStoreSpy } = makeSut();
    jest.spyOn(cacheStoreSpy, "fetch").mockImplementation(() => {
      cacheStoreSpy.actions.push(CacheStoreSpy.Action.fetch);
      throw new Error();
    });
    const purchases = await sut.loadAll();
    expect(cacheStoreSpy.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete]);
    expect(cacheStoreSpy.deleteKey).toBe("purchases");
    expect(purchases).toEqual([]);
  });

  test('Should return a list of purchases if cache is less than 3 days old', async () => {
    const timestamp = new Date();
    const { sut, cacheStoreSpy } = makeSut(timestamp);
    cacheStoreSpy.fetchResult = {
      timestamp,
      value: mockPurchases(),
    }
    const purchases = await sut.loadAll();
    expect(cacheStoreSpy.actions).toEqual([CacheStoreSpy.Action.fetch]);
    expect(cacheStoreSpy.fetchKey).toBe("purchases")
    expect(purchases).toEqual(cacheStoreSpy.fetchResult.value);
  });
});
