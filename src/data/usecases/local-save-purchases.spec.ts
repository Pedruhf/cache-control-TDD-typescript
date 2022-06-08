interface CacheStore {
  delete: (key: string) => void;
}

class CacheStoreSpy implements CacheStore {
  deleteCallsCount = 0;
  key?: string;

  delete (key: string): void {
    this.deleteCallsCount++;
    this.key = key;
  }
}

class LocalSavePurchases {
  constructor (private readonly cacheStore: CacheStore) {}

  save (): Promise<void> {
    this.cacheStore.delete("purchases")
    return Promise.resolve();
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
