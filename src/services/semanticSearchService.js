/**
 * Memora AI - Dedicated Semantic Search Service
 * 
 * DESIGN PATTERN: Service Interface Abstraction
 * This service powers the core semantic search, filtering, and ranking module.
 * In Phase 3, replace the internal algorithm inside `search()` with an async HTTP request:
 * 
 *   const response = await fetch('http://localhost:8000/api/v1/search', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ query, filters, sort })
 *   });
 *   return await response.json();
 */

import { MOCK_FILES } from './mockData';

const SEARCH_HISTORY_KEY = 'memora_search_history_v1';

class SemanticSearchService {
  constructor() {
    this.files = [...MOCK_FILES, ...this._getExtendedMockFiles()];
    this.history = this._loadHistory();
  }

  _getExtendedMockFiles() {
    return [
      {
        id: 'file-7',
        name: 'DeepLearning_Assignment2_Transformers.pdf',
        path: 'C:\\Users\\Alex\\College\\FinalYear\\DL\\DeepLearning_Assignment2_Transformers.pdf',
        folderPath: 'C:\\Users\\Alex\\College\\FinalYear\\DL',
        folderName: 'College',
        category: 'pdf',
        fileExtension: 'pdf',
        sizeBytes: 4200000,
        modifiedAt: '2026-08-06T11:20:00Z',
        createdAt: '2026-08-01T09:00:00Z',
        extractedSnippet: 'Assignment 2: Self-Attention Mechanisms, Multi-Head Attention, Vision Transformers (ViT), and Positional Encodings implementation in PyTorch.',
        ocrText: '',
        aiSummary: 'Practical course assignment on Transformer architectures, self-attention mechanisms, and vision transformers.',
        tags: ['College', 'Deep Learning', 'Transformers', 'PyTorch', 'Assignments'],
        relevanceScore: 96,
        explanation: 'Strong semantic match for deep learning and transformer assignment topics with recent submission date.'
      },
      {
        id: 'file-8',
        name: 'Financial_Budget_Analytics_2026.xlsx',
        path: 'C:\\Users\\Alex\\Documents\\Work\\Financial_Budget_Analytics_2026.xlsx',
        folderPath: 'C:\\Users\\Alex\\Documents\\Work',
        folderName: 'Work',
        category: 'spreadsheet',
        fileExtension: 'xlsx',
        sizeBytes: 1540000,
        modifiedAt: '2026-07-20T16:45:00Z',
        createdAt: '2026-07-01T10:00:00Z',
        extractedSnippet: 'Q1-Q4 Expenditure Projections, Revenue Breakdown, Project Subscriptions, and Cost Calculations.',
        ocrText: '',
        aiSummary: 'Excel spreadsheet tracking annual budget analytics, project costs, and expenditure breakdowns.',
        tags: ['Finance', 'Work', 'Spreadsheet', 'Budget'],
        relevanceScore: 90,
        explanation: 'Matches financial analytics and budget spreadsheet query concepts.'
      },
      {
        id: 'file-9',
        name: 'System_Architecture_Design_Deck.pptx',
        path: 'C:\\Users\\Alex\\Documents\\Work\\System_Architecture_Design_Deck.pptx',
        folderPath: 'C:\\Users\\Alex\\Documents\\Work',
        folderName: 'Work',
        category: 'presentation',
        fileExtension: 'pptx',
        sizeBytes: 9800000,
        modifiedAt: '2026-08-04T13:10:00Z',
        createdAt: '2026-07-25T14:00:00Z',
        extractedSnippet: 'Slide 1: High-Level Architecture. Slide 2: Microservices & Event Bus. Slide 3: FAISS Vector Indexing Pipeline.',
        ocrText: '',
        aiSummary: 'Presentation slide deck outlining scalable system architecture and vector indexing pipelines.',
        tags: ['Presentation', 'Architecture', 'Work', 'Slides'],
        relevanceScore: 95,
        explanation: 'Direct match for system architecture presentation slides updated this week.'
      }
    ];
  }

  _loadHistory() {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [
        { id: 'h-1', query: 'Show my latest internship resume', timestamp: '2026-08-07T10:00:00Z' },
        { id: 'h-2', query: 'Find my machine learning notes', timestamp: '2026-08-06T15:30:00Z' },
        { id: 'h-3', query: 'Show college farewell photos', timestamp: '2026-08-05T12:15:00Z' },
        { id: 'h-4', query: 'Find my Amazon invoices', timestamp: '2026-08-04T09:40:00Z' }
      ];
    } catch (e) {
      return [];
    }
  }

  _saveHistory() {
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(this.history));
    } catch (e) {
      console.error('Failed to save search history', e);
    }
  }

  getSearchHistory() {
    return [...this.history];
  }

  addSearchHistory(query) {
    if (!query || !query.trim()) return;
    const cleanQuery = query.trim();
    this.history = this.history.filter(h => h.query.toLowerCase() !== cleanQuery.toLowerCase());
    this.history.unshift({
      id: `h-${Date.now()}`,
      query: cleanQuery,
      timestamp: new Date().toISOString()
    });
    this.history = this.history.slice(0, 10); // Keep last 10
    this._saveHistory();
  }

  removeSearchHistory(id) {
    this.history = this.history.filter(h => h.id !== id);
    this._saveHistory();
  }

  clearSearchHistory() {
    this.history = [];
    this._saveHistory();
  }

  /**
   * Main Search Endpoint
   * @param {string} query 
   * @param {Object} filters { fileType, dateRange, folder }
   * @param {string} sortBy 'relevant' | 'newest' | 'oldest' | 'largest'
   */
  async search(query = '', filters = {}, sortBy = 'relevant') {
    // Simulate natural AI latency (300ms)
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!query || !query.trim()) {
      return {
        results: [],
        total: 0,
        query: '',
        executionTimeMs: 0
      };
    }

    const startTime = performance.now();
    const cleanQuery = query.toLowerCase().trim();

    // Track search history
    this.addSearchHistory(query);

    // Filter candidate files
    let candidateMatches = this.files.map(file => {
      let score = 0;
      let reasons = [];

      const nameMatch = file.name.toLowerCase().includes(cleanQuery);
      const snippetMatch = file.extractedSnippet?.toLowerCase().includes(cleanQuery);
      const ocrMatch = file.ocrText?.toLowerCase().includes(cleanQuery);
      const summaryMatch = file.aiSummary?.toLowerCase().includes(cleanQuery);
      const tagMatch = file.tags?.some(t => t.toLowerCase().includes(cleanQuery));

      if (nameMatch) {
        score += 45;
        reasons.push('Title contains query terms');
      }
      if (snippetMatch) {
        score += 35;
        reasons.push('Text snippet content match');
      }
      if (ocrMatch) {
        score += 30;
        reasons.push('EasyOCR image text match');
      }
      if (summaryMatch) {
        score += 25;
        reasons.push('AI summary semantic match');
      }
      if (tagMatch) {
        score += 20;
        reasons.push('Category tag association');
      }

      // Natural language concept mappings
      if (cleanQuery.includes('resume') || cleanQuery.includes('cv') || cleanQuery.includes('internship')) {
        if (file.name.toLowerCase().includes('resume') || file.tags.includes('Resume')) {
          score += 40;
          reasons.push('Contains internship and resume-related content and is one of the most recently modified resume documents');
        }
      }
      if (cleanQuery.includes('notes') || cleanQuery.includes('machine learning') || cleanQuery.includes('ml')) {
        if (file.tags.includes('Machine Learning') || file.name.toLowerCase().includes('learning')) {
          score += 40;
          reasons.push('Semantically aligned with Machine Learning lecture notes and coursework');
        }
      }
      if (cleanQuery.includes('photo') || cleanQuery.includes('picture') || cleanQuery.includes('farewell') || cleanQuery.includes('college')) {
        if (file.category === 'image' || file.tags.includes('Photos') || file.tags.includes('College')) {
          score += 40;
          reasons.push('CLIP visual embedding match for college farewell party memories');
        }
      }
      if (cleanQuery.includes('invoice') || cleanQuery.includes('receipt') || cleanQuery.includes('amazon')) {
        if (file.tags.includes('Invoice') || file.tags.includes('Receipt')) {
          score += 40;
          reasons.push('EasyOCR detected cloud service invoice header and financial total');
        }
      }
      if (cleanQuery.includes('certificate') || cleanQuery.includes('google cloud')) {
        if (file.tags.includes('Certificates')) {
          score += 45;
          reasons.push('Official certification document credential match');
        }
      }
      if (cleanQuery.includes('presentation') || cleanQuery.includes('project') || cleanQuery.includes('slide')) {
        if (file.category === 'presentation' || file.name.toLowerCase().includes('presentation') || file.tags.includes('Project')) {
          score += 40;
          reasons.push('Matches project presentation slide deck topics');
        }
      }

      // Calculate final relevance percentage (bounded 70-98%)
      const finalScore = score > 0 ? Math.min(98, Math.max(72, score + Math.floor(Math.random() * 8))) : 0;
      
      const explanationText = reasons.length > 0 
        ? reasons.join('. ') + '.' 
        : `Semantic match found in ${file.category.toUpperCase()} file content.`;

      return {
        file,
        score: finalScore,
        matchedSnippet: file.extractedSnippet || file.ocrText || file.aiSummary,
        aiExplanation: explanationText,
        matchHighlights: [cleanQuery]
      };
    }).filter(item => item.score > 0);

    // Apply File Type Filter
    if (filters.fileType && filters.fileType !== 'all') {
      candidateMatches = candidateMatches.filter(item => {
        const cat = item.file.category;
        const ext = item.file.fileExtension;
        if (filters.fileType === 'pdf') return ext === 'pdf';
        if (filters.fileType === 'doc') return cat === 'docx' || cat === 'doc' || cat === 'note';
        if (filters.fileType === 'image') return cat === 'image';
        if (filters.fileType === 'presentation') return cat === 'presentation' || ext === 'pptx';
        if (filters.fileType === 'spreadsheet') return cat === 'spreadsheet' || ext === 'xlsx';
        return true;
      });
    }

    // Apply Date Range Filter
    if (filters.dateRange && filters.dateRange !== 'any') {
      const now = new Date().getTime();
      candidateMatches = candidateMatches.filter(item => {
        const fileTime = new Date(item.file.modifiedAt).getTime();
        const diffDays = (now - fileTime) / (1000 * 3600 * 24);
        if (filters.dateRange === 'today') return diffDays <= 1;
        if (filters.dateRange === 'week') return diffDays <= 7;
        if (filters.dateRange === 'month') return diffDays <= 30;
        if (filters.dateRange === 'year') return diffDays <= 365;
        return true;
      });
    }

    // Apply Folder Filter
    if (filters.folder && filters.folder !== 'all') {
      candidateMatches = candidateMatches.filter(item => {
        const pathLower = item.file.path.toLowerCase();
        return pathLower.includes(filters.folder.toLowerCase());
      });
    }

    // Apply Sorting
    candidateMatches.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.file.modifiedAt) - new Date(a.file.modifiedAt);
      }
      if (sortBy === 'oldest') {
        return new Date(a.file.modifiedAt) - new Date(b.file.modifiedAt);
      }
      if (sortBy === 'largest') {
        return b.file.sizeBytes - a.file.sizeBytes;
      }
      // Default: Most Relevant
      return b.score - a.score;
    });

    const executionTimeMs = Math.round(performance.now() - startTime + 120);

    return {
      results: candidateMatches,
      total: candidateMatches.length,
      query: cleanQuery,
      executionTimeMs
    };
  }

  getSimilarFiles(targetFileId) {
    const current = this.files.find(f => f.id === targetFileId);
    if (!current) return [];
    
    return this.files
      .filter(f => f.id !== targetFileId && (f.category === current.category || f.tags.some(t => current.tags.includes(t))))
      .slice(0, 3);
  }
}

export const semanticSearchService = new SemanticSearchService();
