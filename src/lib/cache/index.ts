import { LRUCache } from "lru-cache";

// Singleton Cache Manager
class CacheManager {
  private static instance: CacheManager;
  
  // Cache for metadata lookups (e.g., parsing JSON files)
  public metadataCache: LRUCache<string, any>;
  
  // Cache for retrieval results (Pinecone + BM25)
  public retrievalCache: LRUCache<string, any>;
  
  // Cache for precomputed summaries
  public summaryCache: LRUCache<string, string>;

  // Cache for generated embeddings
  public embeddingCache: LRUCache<string, number[]>;

  private constructor() {
    this.metadataCache = new LRUCache({ max: 100, ttl: 1000 * 60 * 60 }); // 1 hour TTL
    this.retrievalCache = new LRUCache({ max: 500, ttl: 1000 * 60 * 15 }); // 15 mins TTL
    this.summaryCache = new LRUCache({ max: 50, ttl: 1000 * 60 * 60 * 24 }); // 24 hours TTL
    this.embeddingCache = new LRUCache({ max: 2000, ttl: 1000 * 60 * 60 * 24 }); // 24 hours TTL
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  public clearAll() {
    this.metadataCache.clear();
    this.retrievalCache.clear();
    this.summaryCache.clear();
    this.embeddingCache.clear();
  }
}

export const globalCache = CacheManager.getInstance();
