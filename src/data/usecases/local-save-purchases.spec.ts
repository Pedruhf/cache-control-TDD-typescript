import { CacheStore } from "@/data/protocols/cache";
import { LocalSavePurchases } from "./index";

class CacheStoreSpy implements CacheStore {
  deleteCallsCount = 0;
  insertCallsCount = 0;
  deleteKey?: string;
  insertKey?: string;

  delete (key: string): void {
    this.deleteCallsCount++;
    this.deleteKey = key;
  }

  insert (key: string): void {
    this.insertCallsCount++;
    this.insertKey = key;
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
  test('Should not delete cache on init', () => {
    const { cacheStoreSpy } = makeSut();
    expect(cacheStoreSpy.deleteCallsCount).toBe(0);
  });

  test('Should delete old cache on save', async () => {
    const { sut, cacheStoreSpy } = makeSut();
    await sut.save();
    expect(cacheStoreSpy.deleteCallsCount).toBe(1);
    expect(cacheStoreSpy.deleteKey).toBe("purchases");
  });

  test('Should not insert new cache if delete fails', () => {
    const { sut, cacheStoreSpy } = makeSut();
    jest.spyOn(cacheStoreSpy, "delete").mockImplementationOnce(() => { throw new Error() });

    const savePromise = sut.save();
    expect(cacheStoreSpy.insertCallsCount).toBe(0);
    expect(savePromise).rejects.toThrow();
  });

  test('Should insert new cache if delete succeeds', async () => {
    const { sut, cacheStoreSpy } = makeSut();
    await sut.save();
    expect(cacheStoreSpy.deleteCallsCount).toBe(1);
    expect(cacheStoreSpy.insertCallsCount).toBe(1);
    expect(cacheStoreSpy.insertKey).toBe("purchases");
  });
});
