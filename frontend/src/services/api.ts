import {
  Workspace,
  WorkspaceSummary,
  DocumentParsed,
  Requirement,
  ReadinessReport,
  AskPapertrailResponse,
  DocumentComparisonResult,
  TranslationResponse,
  TaskStatus,
  Priority
} from '../types';

const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return res.json();
  },

  async listWorkspaces(): Promise<WorkspaceSummary[]> {
    const res = await fetch(`${API_BASE}/workspaces`);
    if (!res.ok) throw new Error('Failed to load workspaces');
    return res.json();
  },

  async createWorkspace(name: string): Promise<Workspace> {
    const formData = new FormData();
    formData.append('name', name);
    const res = await fetch(`${API_BASE}/workspaces`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to create workspace');
    return res.json();
  },

  async getWorkspace(id: string): Promise<Workspace> {
    const res = await fetch(`${API_BASE}/workspaces/${id}`);
    if (!res.ok) throw new Error('Failed to fetch workspace');
    return res.json();
  },

  async deleteWorkspace(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/workspaces/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete workspace');
  },

  async loadDemoWorkspace(): Promise<Workspace> {
    const res = await fetch(`${API_BASE}/workspaces/demo/clarity-challenge`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to load demo challenge');
    return res.json();
  },

  async uploadDocument(workspaceId: string, file: File): Promise<DocumentParsed> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  async updateTask(
    workspaceId: string,
    taskId: string,
    updates: {
      status?: TaskStatus;
      personal_notes?: string;
      user_reminder?: string;
      priority?: Priority;
    }
  ): Promise<Requirement> {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  async askPapertrail(
    workspaceId: string,
    question: string,
    documentId?: string,
    targetLanguage: string = 'en'
  ): Promise<AskPapertrailResponse> {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspace_id: workspaceId,
        question,
        document_id: documentId,
        target_language: targetLanguage,
      }),
    });
    if (!res.ok) throw new Error('Failed to query document assistant');
    return res.json();
  },

  async getReadiness(workspaceId: string): Promise<ReadinessReport> {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/readiness`);
    if (!res.ok) throw new Error('Failed to fetch readiness review');
    return res.json();
  },

  async compareDocuments(
    workspaceId: string,
    docAId: string,
    docBId: string
  ): Promise<DocumentComparisonResult> {
    const res = await fetch(
      `${API_BASE}/workspaces/${workspaceId}/compare?doc_a_id=${encodeURIComponent(
        docAId
      )}&doc_b_id=${encodeURIComponent(docBId)}`
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Comparison failed' }));
      throw new Error(err.detail || 'Comparison failed');
    }
    return res.json();
  },

  async translateText(text: string, targetLanguage: string): Promise<TranslationResponse> {
    const res = await fetch(`${API_BASE}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target_language: targetLanguage }),
    });
    if (!res.ok) throw new Error('Translation failed');
    return res.json();
  },

  getDocumentFileUrl(workspaceId: string, docId: string): string {
    return `${API_BASE}/workspaces/${workspaceId}/documents/${docId}/file`;
  },

  getExportUrl(workspaceId: string, format: 'markdown' | 'csv' | 'json'): string {
    return `${API_BASE}/workspaces/${workspaceId}/export/${format}`;
  },
};
