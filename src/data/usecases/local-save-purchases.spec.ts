interface CacheStore {}

class CacheStoreSpy implements CacheStore {
  deleteCallsCount = 0;
}

class LocalSavePurchases {
  constructor (private readonly cacheStore: CacheStore) {}
}

describe('LocalSavePurchases Usecase', () => {
  test('Should not delete cache on sut.init', () => {
    const cacheStoreSpy = new CacheStoreSpy();
    const sut = new LocalSavePurchases(cacheStoreSpy);
    expect(cacheStoreSpy.deleteCallsCount).toBe(0);
  });
});
