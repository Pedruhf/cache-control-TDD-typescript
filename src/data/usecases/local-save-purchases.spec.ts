import { CacheStore } from "@/data/protocols/cache";
import { SavePurchases } from "@/domain/usecases";
import { LocalSavePurchases } from "./index";

const mockPurchases = (): SavePurchases.Params[] => [
  {
    id: "1",
    date: new Date(),
    value: 10
  },
  {
    id: "2",
    date: new Date(),
    value: 20
  },
];

class CacheStoreSpy implements CacheStore {
  deleteCallsCount = 0;
  insertCallsCount = 0;
  deleteKey?: string;
  insertKey?: string;
  insertValues?: SavePurchases.Params[] = [];

  delete (key: string): void {
    this.deleteCallsCount++;
    this.deleteKey = key;
  }

  insert (key: string, value: any): void {
    this.insertCallsCount++;
    this.insertKey = key;
    this.insertValues = value;
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
    await sut.save(mockPurchases());
    expect(cacheStoreSpy.deleteCallsCount).toBe(1);
    expect(cacheStoreSpy.deleteKey).toBe("purchases");
  });

  test('Should not insert new cache if delete fails', () => {
    const { sut, cacheStoreSpy } = makeSut();
    jest.spyOn(cacheStoreSpy, "delete").mockImplementationOnce(() => { throw new Error() });

    const savePromise = sut.save(mockPurchases());
    expect(cacheStoreSpy.insertCallsCount).toBe(0);
    expect(savePromise).rejects.toThrow();
  });

  test('Should insert new cache if delete succeeds', async () => {
    const { sut, cacheStoreSpy } = makeSut();
    const purchases = mockPurchases();
    await sut.save(purchases);
    expect(cacheStoreSpy.deleteCallsCount).toBe(1);
    expect(cacheStoreSpy.insertCallsCount).toBe(1);
    expect(cacheStoreSpy.insertKey).toBe("purchases");
    expect(cacheStoreSpy.insertValues).toEqual(purchases);
  });

  test('Should throw if insert throws', () => {
    const { sut, cacheStoreSpy } = makeSut();
    jest.spyOn(cacheStoreSpy, "insert").mockImplementationOnce(() => { throw new Error() });
    const savePromise = sut.save(mockPurchases());
    expect(savePromise).rejects.toThrow();
  });
});
