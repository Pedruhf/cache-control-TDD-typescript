import { CacheStoreSpy } from "@/data/tests/cache";
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

  test('Should call correct key on load', async () => {
    const { sut, cacheStoreSpy } = makeSut();
    await sut.loadAll();
    expect(cacheStoreSpy.actions).toEqual([CacheStoreSpy.Action.fetch]);
    expect(cacheStoreSpy.fetchKey).toBe("purchases");
  });
});
