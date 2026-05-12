import MiniSearch from 'minisearch';
import fs from 'fs';
import path from 'path';

export interface SearchDocument {
  id: string;
  text: string;
  title: string;
  source: string;
  type?: string;
  section?: string;
  recruiter_keywords?: string[];
  semantic_tags?: string[];
}

const INDEX_PATH = path.join(process.cwd(), 'data', 'processed', 'minisearch-index.json');

class MiniSearchManager {
  private miniSearch: MiniSearch<SearchDocument>;

  constructor() {
    this.miniSearch = new MiniSearch<SearchDocument>({
      fields: ['text', 'title', 'source', 'recruiter_keywords', 'semantic_tags'],
      storeFields: ['text', 'title', 'source', 'type', 'section', 'recruiter_keywords', 'semantic_tags'],
      searchOptions: {
        boost: { recruiter_keywords: 2, title: 1.5, semantic_tags: 1.5, text: 1 },
        fuzzy: 0.2, // allow some fuzziness for typos
        prefix: true // allow prefix matching
      }
    });

    this.loadIndex();
  }

  /**
   * Adds an array of documents to the index.
   */
  public addDocuments(docs: SearchDocument[]) {
    this.miniSearch.addAll(docs);
  }

  /**
   * Searches the index.
   */
  public search(query: string, options?: any) {
    return this.miniSearch.search(query, options);
  }

  /**
   * Saves the index to disk.
   */
  public saveIndex() {
    const dir = path.dirname(INDEX_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const json = JSON.stringify(this.miniSearch);
    fs.writeFileSync(INDEX_PATH, json, 'utf-8');
  }

  /**
   * Loads the index from disk if it exists.
   */
  public loadIndex() {
    if (fs.existsSync(INDEX_PATH)) {
      try {
        const json = fs.readFileSync(INDEX_PATH, 'utf-8');
        this.miniSearch = MiniSearch.loadJSON(json, {
          fields: ['text', 'title', 'source', 'recruiter_keywords', 'semantic_tags'],
          storeFields: ['text', 'title', 'source', 'type', 'section', 'recruiter_keywords', 'semantic_tags'],
          searchOptions: {
            boost: { recruiter_keywords: 2, title: 1.5, semantic_tags: 1.5, text: 1 },
            fuzzy: 0.2,
            prefix: true
          }
        });
      } catch (error) {
        console.error("Failed to load MiniSearch index:", error);
      }
    }
  }

  /**
   * Clears the current index.
   */
  public clearIndex() {
    this.miniSearch.removeAll();
  }
}

export const minisearchManager = new MiniSearchManager();
