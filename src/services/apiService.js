/**
 * Memora AI - API Service Boundary
 * 
 * DESIGN PATTERN: Clean Service Abstraction
 * This service currently powers Phase 2 using simulated local mock state and Electron IPC.
 * When connecting the FastAPI Python backend, update the endpoint methods to hit localhost:8000.
 */

import { INITIAL_FOLDERS, MOCK_FILES, MOCK_SEARCH_SUGGESTIONS, MOCK_RECENT_SEARCHES } from './mockData';

// Local storage key for persistent folders in mock mode
const STORAGE_KEY_FOLDERS = 'memora_scanned_folders';
const STORAGE_KEY_RECENT_SEARCHES = 'memora_recent_searches';

class ApiService {
  constructor() {
    this.folders = this._loadFolders();
    this.recentSearches = this._loadRecentSearches();
    this.files = [...MOCK_FILES];
  }

  _loadFolders() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FOLDERS);
      return saved ? JSON.parse(saved) : [...INITIAL_FOLDERS];
    } catch (e) {
      return [...INITIAL_FOLDERS];
    }
  }

  _saveFolders() {
    try {
      localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(this.folders));
    } catch (e) {
      console.error('Failed to persist folders to localStorage', e);
    }
  }

  _loadRecentSearches() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECENT_SEARCHES);
      return saved ? JSON.parse(saved) : [...MOCK_RECENT_SEARCHES];
    } catch (e) {
      return [...MOCK_RECENT_SEARCHES];
    }
  }

  _saveRecentSearches() {
    try {
      localStorage.setItem(STORAGE_KEY_RECENT_SEARCHES, JSON.stringify(this.recentSearches));
    } catch (e) {
      console.error('Failed to save recent searches', e);
    }
  }

  // --------------------------------------------------------------------------
  // Folder Selection & Scanning API
  // --------------------------------------------------------------------------
  async getFolders() {
    // Simulated async API delay
    await new Promise(resolve => setTimeout(resolve, 150));
    return [...this.folders];
  }

  async addFolder(folderPath, folderName) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Check if already added
    const existing = this.folders.find(f => f.path.toLowerCase() === folderPath.toLowerCase());
    if (existing) {
      return existing;
    }

    const newFolder = {
      id: `f-${Date.now()}`,
      name: folderName || folderPath.split('\\').pop() || folderPath.split('/').pop() || 'Selected Folder',
      path: folderPath,
      fileCount: Math.floor(Math.random() * 300) + 50,
      scanStatus: 'ready',
      addedAt: new Date().toISOString(),
      icon: 'Folder'
    };

    this.folders.push(newFolder);
    this._saveFolders();
    return newFolder;
  }

  async removeFolder(folderId) {
    await new Promise(resolve => setTimeout(resolve, 150));
    this.folders = this.folders.filter(f => f.id !== folderId);
    this._saveFolders();
    return this.folders;
  }

  /**
   * Electron Native Dialog Wrapper
   * Uses window.electronAPI if running in Electron shell, or fallback simulation.
   */
  async selectFolderViaNativeDialog() {
    if (window.electronAPI && window.electronAPI.openDirectory) {
      try {
        const result = await window.electronAPI.openDirectory();
        if (!result.canceled && result.filePaths.length > 0) {
          const added = [];
          for (const path of result.filePaths) {
            const f = await this.addFolder(path);
            added.push(f);
          }
          return added;
        }
      } catch (err) {
        console.warn('Native Electron dialog error, using fallback:', err);
      }
    }
    
    // Simulated Folder Picker fallback for browser preview
    const samplePaths = [
      'C:\\Users\\Alex\\Projects\\AI_Assistant',
      'C:\\Users\\Alex\\Documents\\Certificates',
      'C:\\Users\\Alex\\Desktop\\StudyMaterial'
    ];
    const randomPath = samplePaths[Math.floor(Math.random() * samplePaths.length)];
    const newFolder = await this.addFolder(randomPath);
    return [newFolder];
  }

  // --------------------------------------------------------------------------
  // Scanning Service Simulation
  // --------------------------------------------------------------------------
  async startScanProgress(onProgressUpdate) {
    const totalFiles = 2450;
    let currentStep = 0;
    
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        currentStep += 15;
        const percent = Math.min(100, Math.round((currentStep / totalFiles) * 100));

        const sampleFiles = [
          'Resume_Alex_Chen_2025.pdf',
          'Machine_Learning_Notes_Ch3.docx',
          'Amazon_Cloud_Invoice_Dec.png',
          'Farewell_Photo_HD.jpg',
          'DeepLearning_Specialization.pdf'
        ];
        const currentFileName = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];

        onProgressUpdate({
          totalFiles,
          processedFiles: Math.min(currentStep, totalFiles),
          percent,
          currentFile: currentFileName,
          ocrProcessed: Math.floor(currentStep * 0.15),
          vectorsIndexed: Math.floor(currentStep * 1.4),
          status: percent >= 100 ? 'complete' : 'scanning'
        });

        if (percent >= 100) {
          clearInterval(interval);
          // Mark all folders as indexed
          this.folders = this.folders.map(f => ({ ...f, scanStatus: 'indexed' }));
          this._saveFolders();
          resolve(true);
        }
      }, 80);
    });
  }

  // --------------------------------------------------------------------------
  // Semantic Search & Reranking Service
  // --------------------------------------------------------------------------
  async searchSemantic(query, filters = {}) {
    // Simulated network/model latency (250ms)
    await new Promise(resolve => setTimeout(resolve, 250));

    if (!query || query.trim().length === 0) {
      return [];
    }

    const cleanQuery = query.toLowerCase().trim();

    // Add to recent searches
    if (!this.recentSearches.includes(query)) {
      this.recentSearches = [query, ...this.recentSearches.slice(0, 7)];
      this._saveRecentSearches();
    }

    // Perform mock semantic matching against mock dataset
    let results = this.files.filter(file => {
      const matchName = file.name.toLowerCase().includes(cleanQuery);
      const matchSnippet = file.extractedSnippet?.toLowerCase().includes(cleanQuery);
      const matchOcr = file.ocrText?.toLowerCase().includes(cleanQuery);
      const matchTags = file.tags?.some(t => t.toLowerCase().includes(cleanQuery));
      const matchSummary = file.aiSummary?.toLowerCase().includes(cleanQuery);

      // Natural language mapping rules for realistic demonstration
      let nlMatch = false;
      if (cleanQuery.includes('resume') || cleanQuery.includes('cv')) {
        nlMatch = file.name.toLowerCase().includes('resume');
      } else if (cleanQuery.includes('machine learning') || cleanQuery.includes('notes') || cleanQuery.includes('ml')) {
        nlMatch = file.name.toLowerCase().includes('machine_learning') || file.tags.includes('Machine Learning');
      } else if (cleanQuery.includes('invoice') || cleanQuery.includes('receipt') || cleanQuery.includes('amazon')) {
        nlMatch = file.tags.includes('Invoice') || file.tags.includes('Receipt');
      } else if (cleanQuery.includes('photo') || cleanQuery.includes('farewell') || cleanQuery.includes('picture')) {
        nlMatch = file.category === 'image';
      } else if (cleanQuery.includes('certificate')) {
        nlMatch = file.tags.includes('Certificates');
      } else if (cleanQuery.includes('presentation') || cleanQuery.includes('project')) {
        nlMatch = file.name.toLowerCase().includes('presentation') || file.tags.includes('Project');
      }

      return matchName || matchSnippet || matchOcr || matchTags || matchSummary || nlMatch;
    });

    // Apply category filter if specified
    if (filters.category && filters.category !== 'all') {
      results = results.filter(f => f.category === filters.category);
    }

    // Format as SearchResult payload
    return results.map(file => ({
      file,
      score: file.relevanceScore || Math.floor(Math.random() * 20) + 80,
      matchedSnippet: file.extractedSnippet || file.ocrText || file.aiSummary,
      aiExplanation: file.explanation || `Semantic match found in ${file.category.toUpperCase()} document content.`,
      matchHighlights: [cleanQuery]
    }));
  }

  async getSearchSuggestions() {
    return [...MOCK_SEARCH_SUGGESTIONS];
  }

  async getRecentSearches() {
    return [...this.recentSearches];
  }

  // --------------------------------------------------------------------------
  // Desktop Action Triggers (Locate, Open)
  // --------------------------------------------------------------------------
  async openFile(filePath) {
    if (window.electronAPI && window.electronAPI.openPath) {
      return await window.electronAPI.openPath(filePath);
    }
    console.log(`[Simulated Desktop Action] Opening file: ${filePath}`);
    alert(`[Simulated Action] Opening file:\n${filePath}`);
  }

  async locateFile(filePath) {
    if (window.electronAPI && window.electronAPI.showItemInFolder) {
      window.electronAPI.showItemInFolder(filePath);
      return;
    }
    console.log(`[Simulated Desktop Action] Locating file in File Explorer: ${filePath}`);
    alert(`[Simulated Action] Locating file in folder:\n${filePath}`);
  }
}

export const apiService = new ApiService();
