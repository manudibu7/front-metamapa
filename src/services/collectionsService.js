import { mockCollections } from '../constants/mockCollections';

const deepClone = (payload) => JSON.parse(JSON.stringify(payload));

const simulateLatency = (payload) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(deepClone(payload)), 550);
  });

export const collectionsService = {
  async getCollections() {
    return simulateLatency(mockCollections);
  },
  async getCollectionById(idOrHandle) {
    const found = mockCollections.find(
      (collection) => collection.id === idOrHandle || collection.handle === idOrHandle
    );
    return simulateLatency(found ?? null);
  },
};
