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

describe('LocalValidatePurchases Usecase', () => {
  test('Should not delete or insert cache on init', () => {
    const { cacheStoreSpy } = makeSut();
    expect(cacheStoreSpy.actions).toEqual([]);
  });

  test('Should delte cache if load fails', () => {
    const { sut, cacheStoreSpy } = makeSut();
    jest.spyOn(cacheStoreSpy, "fetch").mockImplementation(() => {
      cacheStoreSpy.actions.push(CacheStoreSpy.Action.fetch);
      throw new Error();
    });
    sut.validate();
    expect(cacheStoreSpy.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete]);
    expect(cacheStoreSpy.deleteKey).toBe("purchases");
  });
});
