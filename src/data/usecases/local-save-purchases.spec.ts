import { CacheStore } from "@/data/protocols/cache";
import { LocalSavePurchases } from "./index";

class CacheStoreSpy implements CacheStore {
  deleteCallsCount = 0;
  key?: string;

  delete (key: string): void {
    this.deleteCallsCount++;
    this.key = key;
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
    expect(cacheStoreSpy.key).toBe("purchases");
  });
});
