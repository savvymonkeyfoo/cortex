import { projectId, publicAnonKey } from './info';

// Database types
export interface Workspace {
  id: string;
  name: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  workspace_id?: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  last_message_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  mentioned_agents?: string[];
  assignment_data?: any;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  status: string;
  due_date?: string | null;
  priority: string;
  progress: number;
  assignees: Array<{id: string; label: string}>;
  tags: string[];
  est_hours: number;
  actual_hours: number;
  conversation_id?: string | null;
  context_mode?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class SupabaseClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a7530657`;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    };
    
    // Silent initialization - no console logging for development
    // Backend features will gracefully fall back to empty arrays/mock data
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      // Silent API requests for clean development experience
      
      // Create timeout controller for better cross-browser support
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.headers,
          ...options?.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response');
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Silent error handling for clean development experience
      
      // Provide more specific error messages
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          errorMessage = 'Request timeout - backend may be slow or unavailable';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Network error - unable to connect to backend server';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Workspace methods
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await this.request<Workspace[]>('/workspaces');
    if (!response.success) {
      // Return empty array instead of failing completely - silent for development
      return [];
    }
    return response.data || [];
  }

  async createWorkspace(name: string, icon: string): Promise<Workspace | null> {
    const response = await this.request<Workspace>('/workspaces', {
      method: 'POST',
      body: JSON.stringify({ name, icon }),
    });
    return response.success ? (response.data || null) : null;
  }

  async updateWorkspace(workspaceId: string, updates: Partial<Workspace>): Promise<Workspace | null> {
    const response = await this.request<Workspace>(`/workspaces/${workspaceId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.success ? (response.data || null) : null;
  }

  async deleteWorkspace(workspaceId: string): Promise<boolean> {
    const response = await this.request<void>(`/workspaces/${workspaceId}`, {
      method: 'DELETE',
    });
    return response.success;
  }

  // Conversation methods
  async getConversations(workspaceId?: string): Promise<Conversation[]> {
    const queryParams = workspaceId ? `?workspace_id=${workspaceId}` : '';
    const response = await this.request<Conversation[]>(`/conversations${queryParams}`);
    if (!response.success) {
      // Return empty array instead of failing completely - silent for development
      return [];
    }
    return response.data || [];
  }

  async getConversationById(conversationId: string): Promise<Conversation | null> {
    const response = await this.request<Conversation>(`/conversations/${conversationId}`);
    return response.success ? (response.data || null) : null;
  }

  async createConversation(title: string, workspaceId?: string): Promise<Conversation | null> {
    const response = await this.request<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title, workspace_id: workspaceId }),
    });
    return response.success ? (response.data || null) : null;
  }

  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<Conversation | null> {
    const response = await this.request<Conversation>(`/conversations/${conversationId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.success ? (response.data || null) : null;
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    const response = await this.request<void>(`/conversations/${conversationId}`, {
      method: 'DELETE',
    });
    return response.success;
  }

  // Message methods
  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await this.request<Message[]>(`/conversations/${conversationId}/messages`);
    return response.success ? (response.data || []) : [];
  }

  async createMessage(
    conversationId: string,
    content: string,
    sender: 'user' | 'assistant' | 'system',
    mentionedAgents?: string[],
    assignmentData?: any
  ): Promise<Message | null> {
    const response = await this.request<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        sender,
        mentioned_agents: mentionedAgents,
        assignment_data: assignmentData,
      }),
    });
    return response.success ? (response.data || null) : null;
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    const response = await this.request<void>(`/messages/${messageId}`, {
      method: 'DELETE',
    });
    return response.success;
  }

  // Assignment operations
  async createAssignment(assignmentData: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>): Promise<Assignment | null> {
    const response = await this.request<Assignment>('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
    return response.success ? (response.data || null) : null;
  }

  async getAssignments(): Promise<Assignment[]> {
    const response = await this.request<Assignment[]>('/assignments');
    return response.success ? (response.data || []) : [];
  }

  async getAssignmentById(assignmentId: string): Promise<Assignment | null> {
    const response = await this.request<Assignment>(`/assignments/${assignmentId}`);
    return response.success ? (response.data || null) : null;
  }

  async updateAssignment(assignmentId: string, updates: Partial<Assignment>): Promise<Assignment | null> {
    const response = await this.request<Assignment>(`/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.success ? (response.data || null) : null;
  }

  async deleteAssignment(assignmentId: string): Promise<boolean> {
    const response = await this.request<void>(`/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
    return response.success;
  }
}

// Singleton instance
export const supabaseClient = new SupabaseClient();

// Utility functions for easier usage
export const db = {
  workspaces: {
    getAll: () => supabaseClient.getWorkspaces(),
    create: (name: string, icon: string) => supabaseClient.createWorkspace(name, icon),
    update: (id: string, updates: Partial<Workspace>) => supabaseClient.updateWorkspace(id, updates),
    delete: (id: string) => supabaseClient.deleteWorkspace(id),
  },
  conversations: {
    getAll: (workspaceId?: string) => supabaseClient.getConversations(workspaceId),
    getById: (id: string) => supabaseClient.getConversationById(id),
    create: (title: string, workspaceId?: string) => supabaseClient.createConversation(title, workspaceId),
    update: (id: string, updates: Partial<Conversation>) => supabaseClient.updateConversation(id, updates),
    delete: (id: string) => supabaseClient.deleteConversation(id),
  },
  messages: {
    getAll: (conversationId: string) => supabaseClient.getMessages(conversationId),
    create: (
      conversationId: string,
      content: string,
      sender: 'user' | 'assistant' | 'system',
      mentionedAgents?: string[],
      assignmentData?: any
    ) => supabaseClient.createMessage(conversationId, content, sender, mentionedAgents, assignmentData),
    delete: (id: string) => supabaseClient.deleteMessage(id),
  },
  assignments: {
    getAll: () => supabaseClient.getAssignments(),
    getById: (id: string) => supabaseClient.getAssignmentById(id),
    create: (assignmentData: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>) => supabaseClient.createAssignment(assignmentData),
    update: (id: string, updates: Partial<Assignment>) => supabaseClient.updateAssignment(id, updates),
    delete: (id: string) => supabaseClient.deleteAssignment(id),
    onChanges: (callback: (payload: any) => void) => {
      // Simple polling mechanism for now - can be enhanced with real-time subscriptions
      const interval = setInterval(async () => {
        // This is a placeholder for real-time functionality
        // In a production app, you'd use WebSockets or Server-Sent Events
      }, 5000);
      return { unsubscribe: () => clearInterval(interval) };
    }
  },
};