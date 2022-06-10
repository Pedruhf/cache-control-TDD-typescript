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

  test('Should not insert new cache if delete fails', async () => {
    const { sut, cacheStoreSpy } = makeSut();
    jest.spyOn(cacheStoreSpy, "delete").mockImplementationOnce(() => {
      cacheStoreSpy.actions.push(CacheStoreSpy.Action.delete);
      throw new Error()
    });

    const savePromise = sut.save(mockPurchases());
    expect(cacheStoreSpy.actions).toEqual([CacheStoreSpy.Action.delete]);
    await expect(savePromise).rejects.toThrow();
  });

  test('Should insert new cache if delete succeeds', async () => {
    const timestamp = new Date();
    const { sut, cacheStoreSpy } = makeSut(timestamp);
    const purchases = mockPurchases();
    const savePromise = sut.save(purchases);
    expect(cacheStoreSpy.actions).toEqual([CacheStoreSpy.Action.delete, CacheStoreSpy.Action.insert]);
    expect(cacheStoreSpy.deleteKey).toBe("purchases");
    expect(cacheStoreSpy.insertKey).toBe("purchases");
    expect(cacheStoreSpy.insertValues).toEqual({
      timestamp,
      value: purchases
    });
    await expect(savePromise).resolves.toBeFalsy();
  });

  test('Should throw if insert throws', async () => {
    const { sut, cacheStoreSpy } = makeSut();
    jest.spyOn(cacheStoreSpy, "insert").mockImplementationOnce(() => {
      cacheStoreSpy.actions.push(CacheStoreSpy.Action.insert);
      throw new Error()
    });
    const savePromise = sut.save(mockPurchases());
    expect(cacheStoreSpy.actions).toEqual([CacheStoreSpy.Action.delete, CacheStoreSpy.Action.insert]);
    await expect(savePromise).rejects.toThrow();
  });
});
