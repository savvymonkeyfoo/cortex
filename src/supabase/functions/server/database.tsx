import * as kv from './kv_store.tsx';

// Database Schema Types
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

// KV Store Key Patterns
const WORKSPACE_PREFIX = 'workspace:';
const CONVERSATION_PREFIX = 'conversation:';
const MESSAGE_PREFIX = 'message:';
const ASSIGNMENT_PREFIX = 'assignment:';
const WORKSPACE_LIST_KEY = 'workspaces:list';
const CONVERSATION_LIST_KEY = 'conversations:list';
const ASSIGNMENT_LIST_KEY = 'assignments:list';
const CONVERSATION_MESSAGES_PREFIX = 'conversation_messages:';

// Helper function to generate UUIDs
function generateId(): string {
  return crypto.randomUUID();
}

// Initialize with default data
export async function initializeTables() {
  try {
    console.log('Initializing KV store with default data...');
    
    // Check if we already have data
    const existingWorkspaces = await getWorkspaces();
    if (existingWorkspaces.length > 0) {
      console.log('Data already exists, skipping initialization');
      return;
    }
    
    await seedDefaultData();
    console.log('KV store initialization complete');
  } catch (error) {
    console.error('Error initializing KV store:', error);
  }
}

// Workspace operations
export async function createWorkspace(name: string, icon: string): Promise<Workspace | null> {
  try {
    const id = generateId();
    const now = new Date().toISOString();
    
    const workspace: Workspace = {
      id,
      name,
      icon,
      created_at: now,
      updated_at: now
    };
    
    // Store workspace
    await kv.set(`${WORKSPACE_PREFIX}${id}`, workspace);
    
    // Update workspace list
    const workspaceList = await kv.get(WORKSPACE_LIST_KEY) || [];
    workspaceList.push(id);
    await kv.set(WORKSPACE_LIST_KEY, workspaceList);
    
    return workspace;
  } catch (error) {
    console.error('Error creating workspace:', error);
    return null;
  }
}

export async function getWorkspaces(): Promise<Workspace[]> {
  try {
    const workspaceList = await kv.get(WORKSPACE_LIST_KEY) || [];
    const workspaces: Workspace[] = [];
    
    for (const id of workspaceList) {
      const workspace = await kv.get(`${WORKSPACE_PREFIX}${id}`);
      if (workspace) {
        workspaces.push(workspace);
      }
    }
    
    // Sort by created_at
    return workspaces.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return [];
  }
}

export async function updateWorkspace(workspaceId: string, updates: Partial<Workspace>): Promise<Workspace | null> {
  try {
    const existingWorkspace = await kv.get(`${WORKSPACE_PREFIX}${workspaceId}`);
    if (!existingWorkspace) {
      return null;
    }
    
    const updatedWorkspace = {
      ...existingWorkspace,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`${WORKSPACE_PREFIX}${workspaceId}`, updatedWorkspace);
    return updatedWorkspace;
  } catch (error) {
    console.error('Error updating workspace:', error);
    return null;
  }
}

export async function deleteWorkspace(workspaceId: string): Promise<boolean> {
  try {
    // Delete workspace
    await kv.del(`${WORKSPACE_PREFIX}${workspaceId}`);
    
    // Update workspace list
    const workspaceList = await kv.get(WORKSPACE_LIST_KEY) || [];
    const updatedList = workspaceList.filter((id: string) => id !== workspaceId);
    await kv.set(WORKSPACE_LIST_KEY, updatedList);
    
    return true;
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return false;
  }
}

// Conversation operations
export async function createConversation(title: string, workspaceId?: string): Promise<Conversation | null> {
  try {
    const id = generateId();
    const now = new Date().toISOString();
    
    const conversation: Conversation = {
      id,
      title,
      workspace_id: workspaceId || undefined,
      created_at: now,
      updated_at: now,
      is_archived: false,
      last_message_at: undefined
    };
    
    // Store conversation
    await kv.set(`${CONVERSATION_PREFIX}${id}`, conversation);
    
    // Update conversation list
    const conversationList = await kv.get(CONVERSATION_LIST_KEY) || [];
    conversationList.push(id);
    await kv.set(CONVERSATION_LIST_KEY, conversationList);
    
    // Initialize empty message list for conversation
    await kv.set(`${CONVERSATION_MESSAGES_PREFIX}${id}`, []);
    
    return conversation;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
}

export async function getConversations(workspaceId?: string): Promise<Conversation[]> {
  try {
    const conversationList = await kv.get(CONVERSATION_LIST_KEY) || [];
    const conversations: Conversation[] = [];
    
    for (const id of conversationList) {
      const conversation = await kv.get(`${CONVERSATION_PREFIX}${id}`);
      if (conversation && !conversation.is_archived) {
        // Filter by workspace if specified
        if (workspaceId) {
          if (conversation.workspace_id === workspaceId) {
            conversations.push(conversation);
          }
        } else {
          // Only return conversations without workspace_id for standalone conversations
          if (!conversation.workspace_id) {
            conversations.push(conversation);
          }
        }
      }
    }
    
    // Sort by updated_at descending (most recently updated first)
    return conversations.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}

export async function getConversationById(conversationId: string): Promise<Conversation | null> {
  try {
    const conversation = await kv.get(`${CONVERSATION_PREFIX}${conversationId}`);
    return conversation || null;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }
}

export async function updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<Conversation | null> {
  try {
    const existingConversation = await kv.get(`${CONVERSATION_PREFIX}${conversationId}`);
    if (!existingConversation) {
      return null;
    }
    
    const updatedConversation = {
      ...existingConversation,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`${CONVERSATION_PREFIX}${conversationId}`, updatedConversation);
    return updatedConversation;
  } catch (error) {
    console.error('Error updating conversation:', error);
    return null;
  }
}

export async function deleteConversation(conversationId: string): Promise<boolean> {
  try {
    // Delete conversation
    await kv.del(`${CONVERSATION_PREFIX}${conversationId}`);
    
    // Delete messages
    await kv.del(`${CONVERSATION_MESSAGES_PREFIX}${conversationId}`);
    
    // Update conversation list
    const conversationList = await kv.get(CONVERSATION_LIST_KEY) || [];
    const updatedList = conversationList.filter((id: string) => id !== conversationId);
    await kv.set(CONVERSATION_LIST_KEY, updatedList);
    
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }
}

// Message operations
export async function createMessage(
  conversationId: string, 
  content: string, 
  sender: 'user' | 'assistant' | 'system',
  mentionedAgents?: string[],
  assignmentData?: any
): Promise<Message | null> {
  try {
    const id = generateId();
    const now = new Date().toISOString();
    
    const message: Message = {
      id,
      conversation_id: conversationId,
      content,
      sender,
      timestamp: now,
      mentioned_agents: mentionedAgents || [],
      assignment_data: assignmentData || undefined
    };
    
    // Get existing messages for conversation
    const messageList = await kv.get(`${CONVERSATION_MESSAGES_PREFIX}${conversationId}`) || [];
    messageList.push(id);
    
    // Store message and update message list
    await kv.set(`${MESSAGE_PREFIX}${id}`, message);
    await kv.set(`${CONVERSATION_MESSAGES_PREFIX}${conversationId}`, messageList);
    
    // Update conversation's last_message_at timestamp
    await updateConversation(conversationId, { 
      last_message_at: now 
    });
    
    return message;
  } catch (error) {
    console.error('Error creating message:', error);
    return null;
  }
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  try {
    const messageList = await kv.get(`${CONVERSATION_MESSAGES_PREFIX}${conversationId}`) || [];
    const messages: Message[] = [];
    
    for (const id of messageList) {
      const message = await kv.get(`${MESSAGE_PREFIX}${id}`);
      if (message) {
        messages.push(message);
      }
    }
    
    // Sort by timestamp ascending (oldest first)
    return messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export async function deleteMessage(messageId: string): Promise<boolean> {
  try {
    const message = await kv.get(`${MESSAGE_PREFIX}${messageId}`);
    if (!message) {
      return false;
    }
    
    const conversationId = message.conversation_id;
    
    // Delete message
    await kv.del(`${MESSAGE_PREFIX}${messageId}`);
    
    // Update message list for conversation
    const messageList = await kv.get(`${CONVERSATION_MESSAGES_PREFIX}${conversationId}`) || [];
    const updatedList = messageList.filter((id: string) => id !== messageId);
    await kv.set(`${CONVERSATION_MESSAGES_PREFIX}${conversationId}`, updatedList);
    
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
}

// Initialize with default data
export async function seedDefaultData() {
  try {
    console.log('Seeding default data...');
    
    // Create default workspaces
    const networkOpsWorkspace = await createWorkspace('Network Operations', 'Monitor');
    const serverMgmtWorkspace = await createWorkspace('Server Management', 'Folder');
    
    if (!networkOpsWorkspace || !serverMgmtWorkspace) {
      console.error('Failed to create default workspaces');
      return;
    }

    // Create default conversations for Network Operations
    const netConv1 = await createConversation('Network Performance Analysis', networkOpsWorkspace.id);
    const netConv2 = await createConversation('Bandwidth Optimization', networkOpsWorkspace.id);
    const netConv3 = await createConversation('Security Incident Response', networkOpsWorkspace.id);

    // Create default conversations for Server Management
    const srvConv1 = await createConversation('Performance Monitoring', serverMgmtWorkspace.id);
    const srvConv2 = await createConversation('Capacity Planning', serverMgmtWorkspace.id);

    // Create standalone chat conversation
    const teamStandupChat = await createConversation('Team Stand-up Discussion');

    // Add some sample messages to team standup chat with the comprehensive support ticket data
    if (teamStandupChat) {
      await createMessage(
        teamStandupChat.id,
        'Hi @DevOpsSupervisor, I need to put together some numbers for today\'s team stand-up. Can you help me get the support ticket statistics for the past five days? We need to show our progress to leadership.',
        'user',
        ['supervisor']
      );

      await createMessage(
        teamStandupChat.id,
        'Absolutely! I\'ll pull the support ticket data for you. Here\'s a comprehensive breakdown of our support ticket activity over the past seven days to give you better context:\n\n**Support Ticket Summary (Past 7 Days)**\n\n| Day | New Tickets | Resolved | In Progress | Total Active |\n|-----|-------------|----------|-------------|---------------|\n| Mon | 23 | 28 | 15 | 47 |\n| Tue | 19 | 25 | 12 | 41 |\n| Wed | 31 | 22 | 18 | 50 |\n| Thu | 27 | 35 | 10 | 42 |\n| Fri | 22 | 29 | 8 | 35 |\n| Sat | 14 | 18 | 6 | 21 |\n| Sun | 16 | 19 | 7 | 19 |\n\n**📊 Key Metrics:**\n- **Total Tickets (7 days):** 152 new tickets\n- **Total Resolved:** 176 tickets\n- **Average Resolution Time:** 4.2 hours\n- **Current Backlog:** 19 active tickets\n- **Team Performance:** 116% resolution rate (resolving more than incoming)\n\nYour team is performing exceptionally well! You\'re actually resolving tickets faster than they\'re coming in, which has reduced the overall backlog by 60% this week.',
        'assistant'
      );

      await createMessage(
        teamStandupChat.id,
        'This is fantastic! The leadership team will love seeing that 116% resolution rate. Can you break down what types of tickets we\'ve been handling most frequently? I want to highlight our team\'s expertise areas.',
        'user'
      );

      await createMessage(
        teamStandupChat.id,
        'Great question! Here\'s the breakdown by ticket category for the past 7 days:\n\n**🔧 Top Ticket Categories:**\n1. **Network Connectivity (34%)** - 52 tickets\n   - VPN connection issues, DNS resolution, firewall configs\n2. **Server Performance (28%)** - 43 tickets  \n   - Memory optimization, CPU throttling, disk space\n3. **Database Issues (18%)** - 27 tickets\n   - Query optimization, connection pooling, backup recovery\n4. **Security & Access (12%)** - 18 tickets\n   - Permission management, certificate renewals, 2FA setup\n5. **Application Deployment (8%)** - 12 tickets\n   - CI/CD pipeline issues, container orchestration\n\n**🏆 Team Highlights:**\n- Zero P1 incidents escalated beyond 2 hours\n- 94% first-contact resolution rate\n- Customer satisfaction score: 4.8/5.0\n- Weekend coverage maintained 100% SLA compliance\n\nYour team\'s deep expertise in network and infrastructure management really shows in these numbers!',
        'assistant'
      );
    }

    console.log('Default data seeded successfully');
  } catch (error) {
    console.error('Error seeding default data:', error);
  }
}

// Assignment operations
export async function createAssignment(assignmentData: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>): Promise<Assignment | null> {
  try {
    const id = generateId();
    const now = new Date().toISOString();
    
    const assignment: Assignment = {
      ...assignmentData,
      id,
      created_at: now,
      updated_at: now
    };
    
    // Store assignment
    await kv.set(`${ASSIGNMENT_PREFIX}${id}`, assignment);
    
    // Update assignment list
    const assignmentList = await kv.get(ASSIGNMENT_LIST_KEY) || [];
    assignmentList.push(id);
    await kv.set(ASSIGNMENT_LIST_KEY, assignmentList);
    
    return assignment;
  } catch (error) {
    console.error('Error creating assignment:', error);
    return null;
  }
}

export async function getAssignments(): Promise<Assignment[]> {
  try {
    const assignmentList = await kv.get(ASSIGNMENT_LIST_KEY) || [];
    const assignments: Assignment[] = [];
    
    for (const id of assignmentList) {
      const assignment = await kv.get(`${ASSIGNMENT_PREFIX}${id}`);
      if (assignment) {
        assignments.push(assignment);
      }
    }
    
    // Sort by created_at descending (newest first)
    return assignments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return [];
  }
}

export async function getAssignmentById(assignmentId: string): Promise<Assignment | null> {
  try {
    const assignment = await kv.get(`${ASSIGNMENT_PREFIX}${assignmentId}`);
    return assignment || null;
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return null;
  }
}

export async function updateAssignment(assignmentId: string, updates: Partial<Assignment>): Promise<Assignment | null> {
  try {
    const existingAssignment = await kv.get(`${ASSIGNMENT_PREFIX}${assignmentId}`);
    if (!existingAssignment) {
      return null;
    }
    
    const updatedAssignment = {
      ...existingAssignment,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`${ASSIGNMENT_PREFIX}${assignmentId}`, updatedAssignment);
    return updatedAssignment;
  } catch (error) {
    console.error('Error updating assignment:', error);
    return null;
  }
}

export async function deleteAssignment(assignmentId: string): Promise<boolean> {
  try {
    // Delete assignment
    await kv.del(`${ASSIGNMENT_PREFIX}${assignmentId}`);
    
    // Update assignment list
    const assignmentList = await kv.get(ASSIGNMENT_LIST_KEY) || [];
    const updatedList = assignmentList.filter((id: string) => id !== assignmentId);
    await kv.set(ASSIGNMENT_LIST_KEY, updatedList);
    
    return true;
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return false;
  }
}