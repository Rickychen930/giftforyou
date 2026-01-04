// src/services/collection.service.ts
// Re-export from repository for backward compatibility
// New code should use collectionRepository directly for better performance

export { getCollections } from "./collection-repository.service";
export { collectionRepository } from "./collection-repository.service";
