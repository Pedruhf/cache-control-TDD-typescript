import { CacheStoreSpy, mockPurchases, getCacheExpirationDate } from "@/data/tests/cache";
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
    expect(cacheStoreSpy.actions).toEqual([CacheStoreSpy.Action.fetch]);
    expect(purchases).toEqual([]);
  });

  test('Should return a list of purchases if cache is valid', async () => {
    const currentDate = new Date();
    const timestamp = getCacheExpirationDate(currentDate);
    timestamp.setSeconds(timestamp.getSeconds() + 1);

    const { sut, cacheStoreSpy } = makeSut(currentDate);
    cacheStoreSpy.fetchResult = {
      timestamp,
      value: mockPurchases(),
    }
    const purchases = await sut.loadAll();
    expect(cacheStoreSpy.actions).toEqual([CacheStoreSpy.Action.fetch]);
    expect(cacheStoreSpy.fetchKey).toBe("purchases")
    expect(purchases).toEqual(cacheStoreSpy.fetchResult.value);
  });

  test('Should return an empty list if cache is expired', async () => {
    const currentDate = new Date();
    const timestamp = getCacheExpirationDate(currentDate);
    timestamp.setSeconds(timestamp.getSeconds() - 1);

    const { sut, cacheStoreSpy } = makeSut(currentDate);
    cacheStoreSpy.fetchResult = {
      timestamp,
      value: mockPurchases(),
    }
    const purchases = await sut.loadAll();
    expect(cacheStoreSpy.actions).toEqual([CacheStoreSpy.Action.fetch]);
    expect(cacheStoreSpy.fetchKey).toBe("purchases");
    expect(purchases).toEqual([]);
  });

  test('Should return an empty list if cache is on expiration date', async () => {
    const currentDate = new Date();
    const timestamp = getCacheExpirationDate(currentDate);

    const { sut, cacheStoreSpy } = makeSut(currentDate);
    cacheStoreSpy.fetchResult = {
      timestamp,
      value: mockPurchases(),
    }
    const purchases = await sut.loadAll();
    expect(cacheStoreSpy.actions).toEqual([CacheStoreSpy.Action.fetch]);
    expect(cacheStoreSpy.fetchKey).toBe("purchases");
    expect(purchases).toEqual([]);
  });

  test('Should return an empty list if cache is empty', async () => {
    const currentDate = new Date();
    const cacheExpirationTime = 3;
    const timestamp = new Date(currentDate);
    timestamp.setDate(timestamp.getDate() - cacheExpirationTime);
    timestamp.setSeconds(timestamp.getSeconds() + 1);

    const { sut, cacheStoreSpy } = makeSut(currentDate);
    cacheStoreSpy.fetchResult = {
      timestamp,
      value: [],
    }
    const purchases = await sut.loadAll();
    expect(cacheStoreSpy.actions).toEqual([CacheStoreSpy.Action.fetch]);
    expect(cacheStoreSpy.fetchKey).toBe("purchases")
    expect(purchases).toEqual([]);
  });
});
