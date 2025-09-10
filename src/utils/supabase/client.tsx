import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Supabase client (browser)
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

// Types used by the app
export interface Workspace {
  id: string;
  name: string;
  icon: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  org_id?: string | null;
}

export interface Conversation {
  id: string;
  title: string;
  workspace_id?: string | null;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  last_message_at?: string | null;
  created_by?: string | null;
  org_id?: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  mentioned_agents?: string[] | null;
  assignment_data?: any;
  created_by?: string | null;
  org_id?: string | null;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  status: string;
  due_date?: string | null;
  priority: string;
  progress: number;
  assignees?: Array<{ id: string; label: string }>;
  tags?: string[];
  est_hours?: number;
  actual_hours?: number;
  conversation_id?: string | null;
  context_mode?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  owner_id?: string | null;
  org_id?: string | null;
}

// Identity helper: pull auth uid/org or use dev fallbacks
const DEV_ORG_ID = '00000000-0000-0000-0000-000000000001';
function devUuid(key: string) {
  const k = `cortex_dev_${key}`;
  let v = localStorage.getItem(k);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(k, v);
  }
  return v;
}

async function getIdentity() {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id || devUuid('user');
  const orgId = localStorage.getItem('cortex_org_id') || DEV_ORG_ID;
  return { userId, orgId };
}

// db facade rewritten to target tables directly
export const db = {
  workspaces: {
    getAll: async (): Promise<Workspace[]> => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('id, name, icon, created_at, updated_at')
        .order('created_at', { ascending: false });
      if (error) return [];
      return data as Workspace[];
    },
    create: async (name: string, icon: string): Promise<Workspace | null> => {
      const { userId, orgId } = await getIdentity();
      const { data, error } = await supabase
        .from('workspaces')
        .insert({ name, icon, created_by: userId, org_id: orgId })
        .select('*')
        .single();
      return error ? null : (data as Workspace);
    },
    update: async (id: string, updates: Partial<Workspace>): Promise<Workspace | null> => {
      const { data, error } = await supabase
        .from('workspaces')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      return error ? null : (data as Workspace);
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('workspaces').delete().eq('id', id);
      return !error;
    },
  },

  conversations: {
    getAll: async (workspaceId?: string): Promise<Conversation[]> => {
      const query = supabase
        .from('conversations')
        .select('id, title, workspace_id, created_at, updated_at, is_archived, last_message_at')
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
      const { data, error } = workspaceId
        ? await query.eq('workspace_id', workspaceId)
        : await query.is('workspace_id', null);
      if (error) return [];
      return data as Conversation[];
    },
    getById: async (id: string): Promise<Conversation | null> => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single();
      return error ? null : (data as Conversation);
    },
    create: async (title: string, workspaceId?: string): Promise<Conversation | null> => {
      const { userId, orgId } = await getIdentity();
      const payload: any = { title, created_by: userId, org_id: orgId };
      if (workspaceId) payload.workspace_id = workspaceId;
      const { data, error } = await supabase
        .from('conversations')
        .insert(payload)
        .select('*')
        .single();
      return error ? null : (data as Conversation);
    },
    update: async (id: string, updates: Partial<Conversation>): Promise<Conversation | null> => {
      const { data, error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      return error ? null : (data as Conversation);
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('conversations').delete().eq('id', id);
      return !error;
    },
  },

  messages: {
    getAll: async (conversationId: string): Promise<Message[]> => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, conversation_id, content, sender, timestamp, mentioned_agents, assignment_data')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });
      if (error) return [];
      return data as Message[];
    },
    create: async (
      conversationId: string,
      content: string,
      sender: 'user' | 'assistant' | 'system',
      mentionedAgents?: string[],
      assignmentData?: any
    ): Promise<Message | null> => {
      const { userId, orgId } = await getIdentity();
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content,
          sender,
          mentioned_agents: mentionedAgents || [],
          assignment_data: assignmentData || null,
          created_by: userId,
          org_id: orgId,
        })
        .select('*')
        .single();
      return error ? null : (data as Message);
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      return !error;
    },
  },

  assignments: {
    getAll: async (): Promise<Assignment[]> => {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return [];
      return data as Assignment[];
    },
    getById: async (id: string): Promise<Assignment | null> => {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', id)
        .single();
      return error ? null : (data as Assignment);
    },
    create: async (assignmentData: Partial<Assignment>): Promise<Assignment | null> => {
      const { userId, orgId } = await getIdentity();
      const payload = {
        title: assignmentData.title || 'New Task',
        description: assignmentData.description || '',
        status: assignmentData.status || 'in_progress',
        priority: assignmentData.priority || 'high',
        progress: assignmentData.progress ?? 0,
        created_by: userId,
        owner_id: userId,
        org_id: orgId,
        due_date: assignmentData.due_date || null,
      } as any;
      const { data, error } = await supabase
        .from('assignments')
        .insert(payload)
        .select('*')
        .single();
      return error ? null : (data as Assignment);
    },
    update: async (id: string, updates: Partial<Assignment>): Promise<Assignment | null> => {
      const { data, error } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      return error ? null : (data as Assignment);
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('assignments').delete().eq('id', id);
      return !error;
    },
    onChanges: (callback: (payload: any) => void) => {
      // Placeholder polling; replace with supabase.realtime if enabled
      const handle = setInterval(() => {}, 5000);
      return { unsubscribe: () => clearInterval(handle) };
    },
  },
};
