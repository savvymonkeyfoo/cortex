import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "./ui/dropdown-menu";
import { AgentMentionsInput } from "./AgentMentionsInput";
import { ChatMentionsEditor, type ChatMentionsEditorHandle } from "./ChatMentionsEditor";
import { AssignmentContextPrompt } from "./AssignmentContextPrompt";
import { AssignmentCardWidget } from "./AssignmentCardWidget";
import { 
  MessageCircle, 
  Search, 
  Crown, 
  Wrench, 
  Monitor,
  Settings,
  User,
  Bot,
  Clock,
  MoreHorizontal,
  Folder,
  Archive,
  Trash2,
  AlertTriangle,
  Send,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { db, type Message, type Conversation } from "../utils/supabase/client";
import { WorkspaceData } from "../types/theme";

// Legacy textarea autosize hook - removed since using TipTap now

// Extended message type for widgets
type ExtendedChatMessage = Message & {
  type?: 'widget';
  widget?: 'assignment-context-prompt' | 'assignment-card';
  payload?: any;
  mentionedAgents?: string[];
  assignment?: any;
};

interface ConversationsViewProps {
  autonomyMode: boolean;
  onAutonomyChange: (value: boolean) => void;
  newChat?: boolean;
  workspaceMode?: boolean;
  searchMode?: boolean;
  agent?: "supervisor" | "network-troubleshooting" | "network-monitoring";
  conversationId?: string | null;
  onAgentSelect?: (agent: string) => void;
  onConversationCreated?: (conversationId: string) => void;
  onConversationNotFound?: () => void;
  workspaces?: WorkspaceData[];
  taskSpaces?: any[];
}

export function ConversationsView({ 
  autonomyMode, 
  onAutonomyChange, 
  newChat, 
  workspaceMode,
  searchMode, 
  agent, 
  conversationId,
  onAgentSelect,
  onConversationCreated,
  onConversationNotFound,
  workspaces = [],
  taskSpaces = []
}: ConversationsViewProps) {
  // Editor refs for TipTap
  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorHandle = useRef<ChatMentionsEditorHandle>(null);

  // File "Add" menu helper
  function openAddMenu(anchorEl: HTMLElement) {
    // Option A: native file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = () => {
      const files = Array.from(input.files || []);
      // TODO: handle files (upload, show chips, etc.)
      console.log('Selected files', files);
    };
    input.click();

    // Option B: swap for your dropdown menu with items:
    // - Upload files
    // - Attach from Drive
    // - Paste image
    // - Record audio, etc.
  }
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("DevOps Supervisor");
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);

  // Local persistence for messages that failed to save to backend
  const getPendingKey = (convId: string) => `pending_messages_${convId}`;
  const addPendingMessage = (convId: string, msg: { content: string; sender: 'user'|'assistant'|'system'; timestamp: string; mentionedAgents?: string[] }) => {
    try {
      const key = getPendingKey(convId);
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.push(msg);
      localStorage.setItem(key, JSON.stringify(arr));
    } catch {}
  };
  const popAllPending = (convId: string) => {
    try {
      const key = getPendingKey(convId);
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.removeItem(key);
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  };

  // Update currentConversationId when conversationId prop changes
  useEffect(() => {
    setCurrentConversationId(conversationId || null);
  }, [conversationId]);

  // Load messages when currentConversationId changes
  useEffect(() => {
    console.log('ConversationsView: currentConversationId changed to:', currentConversationId);
    
    if (currentConversationId && currentConversationId !== 'null' && currentConversationId !== 'undefined' && currentConversationId.trim() !== '') {
      loadConversation();
    } else {
      setMessages([]);
      setConversation(null);
      setError(null);
    }
  }, [currentConversationId]);

  const loadConversation = async () => {
    if (!currentConversationId || currentConversationId === 'null' || currentConversationId === 'undefined' || currentConversationId.trim() === '') {
      console.warn('ConversationsView: Invalid conversation ID provided');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('ConversationsView: Loading conversation with ID:', currentConversationId);
      
      // Load conversation details
      const conversationData = await db.conversations.getById(currentConversationId);
      console.log('ConversationsView: Loaded conversation data:', conversationData);
      
      if (!conversationData) {
        console.warn('ConversationsView: Conversation not found, clearing conversation ID and showing new chat');
        // Clear the conversation ID to show new chat interface
        setCurrentConversationId(null);
        setConversation(null);
        setMessages([]);
        setError(null);
        
        // Notify parent component to handle the missing conversation
        if (onConversationNotFound) {
          onConversationNotFound();
        }
        return;
      }
      
      setConversation(conversationData);
      
      // Load messages
      const messagesData = await db.messages.getAll(currentConversationId);
      console.log('ConversationsView: Loaded messages:', messagesData.length);
      
      // Convert database messages to component format
      const formattedMessages = messagesData.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.timestamp),
        mentionedAgents: msg.mentioned_agents || [],
        assignment: msg.assignment_data || undefined
      }));
      
      setMessages(formattedMessages);

      // Reconcile any pending local-only messages (e.g., first user message not saved)
      const pending = popAllPending(currentConversationId);
      if (pending.length > 0) {
        for (const p of pending) {
          try {
            const saved = await db.messages.create(currentConversationId, p.content, p.sender as any, p.mentionedAgents);
            const formatted = saved ? {
              id: saved.id,
              content: saved.content,
              sender: saved.sender as 'user'|'assistant'|'system',
              timestamp: new Date(saved.timestamp),
              mentionedAgents: saved.mentioned_agents || [],
              assignment: saved.assignment_data || undefined
            } : {
              id: crypto.randomUUID(),
              content: p.content,
              sender: p.sender as any,
              timestamp: new Date(p.timestamp),
              mentionedAgents: p.mentionedAgents || []
            } as ExtendedChatMessage;
            setMessages(prev => [formatted, ...prev]);
          } catch (e) {
            // If still failing, push back to pending so it's not lost
            addPendingMessage(currentConversationId, p);
          }
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      // Check if it's a 404 error (conversation not found)
      if (error instanceof Error && error.message.includes('404')) {
        console.warn('ConversationsView: Conversation not found (404), clearing conversation ID and showing new chat');
        setCurrentConversationId(null);
        setConversation(null);
        setMessages([]);
        setError(null);
        
        // Notify parent component to handle the missing conversation
        if (onConversationNotFound) {
          onConversationNotFound();
        }
      } else {
        setError('Failed to load conversation. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const agentOptions = [
    {
      id: "DevOps Supervisor",
      name: "DevOps Supervisor",
      icon: Crown,
      color: "text-ai-energy"
    },
    {
      id: "Network Troubleshooting", 
      name: "Network Troubleshooting",
      icon: Wrench,
      color: "text-ai-secondary"
    },
    {
      id: "Network Cost Management",
      name: "Network Cost Management",
      icon: Monitor,
      color: "text-ai-accent"
    }
  ];

  // Generate a persona-tailored response based on the selected agent
  const generatePersonaResponse = (persona: string, userText: string) => {
    const lower = userText.toLowerCase();
    switch (persona) {
      case "DevOps Supervisor": {
        const hints = [
          "I can coordinate CI/CD and incident triage.",
          "I’ll suggest owners, create a task, and track status.",
          "I’ll link relevant runbooks and dashboards for you."
        ];
        // light heuristic prompts
        if (/(deploy|release|rollback)/.test(lower)) {
          return `Got it. I’ll review the latest pipeline runs, assess risk, and outline a rollback plan if needed. ${hints[1]}`;
        }
        if (/(incident|outage|sev|major)/.test(lower)) {
          return `Understood. I’ll start an incident timeline, propose stakeholders to page, and surface high-signal logs and alerts. ${hints[2]}`;
        }
        return `I understand. ${hints[0]} Tell me the goal or repo/service and any deadlines; I’ll propose next steps.`;
      }
      case "Network Troubleshooting": {
        if (/(latency|packet|loss|timeout|slow|jitter)/.test(lower)) {
          return "Let’s triage latency: 1) confirm scope and clients, 2) run ping/traceroute from affected subnets, 3) check interface errors and queue drops, 4) compare path in and out of the region, 5) review recent changes. Share any traces and I’ll summarize root-cause candidates.";
        }
        if (/(dns|resolve|name|lookup)/.test(lower)) {
          return "DNS issue suspected: verify authoritative records, TTLs, split-horizon settings, resolver health, and EDNS/DoH behavior. Provide a failing name + client IP; I’ll walk through checks.";
        }
        return "Give me symptoms (who/where/when), recent changes, and any probes (ping, mtr, traceroute). I’ll outline likely causes and a focused test plan.";
      }
      case "Network Cost Management": {
        if (/(egress|transfer|data out|cdn)/.test(lower)) {
          return "Egress optimization: identify top talkers, evaluate cacheability, enable compression, and consider regionalization/peering or a CDN tier. I can draft a savings estimate and rollout plan.";
        }
        if (/(nat|gateway|firewall|load balancer|lb)/.test(lower)) {
          return "Gateway/LB spend: check idle/overprovisioned tiers, consolidate listeners, right-size instances, and use savings plans/committed use. Share current SKUs; I’ll propose right-sizing.";
        }
        return "I can break down network spend by service, region, and tag, then suggest right‑sizing, reserved/committed use, and architecture tweaks to cut egress. Tell me your cloud/provider and target savings.";
      }
      default:
        return "Thanks for the message! I'm processing your request now.";
    }
  };

  const getAgentInfo = (agentType?: string) => {
    switch (agentType) {
      case "supervisor":
        return {
          name: "DevOps Supervisor Agent",
          icon: Crown,
          color: "text-ai-energy",
          description: "System oversight and escalation management"
        };
      case "network-troubleshooting":
        return {
          name: "Network Troubleshooting Agent",
          icon: Wrench,
          color: "text-ai-secondary",
          description: "Network diagnostics and issue resolution"
        };
      case "network-monitoring":
        return {
          name: "Network Cost Management Agent",
          icon: Monitor,
          color: "text-ai-accent",
          description: "Spend analysis, right-sizing, and egress optimization"
        };
      default:
        return {
          name: "AI Assistant",
          icon: Bot,
          color: "text-ai-primary",
          description: "Multi-agent workspace for system operations"
        };
    }
  };

  const agentInfo = getAgentInfo(agent);
  const AgentIcon = agentInfo.icon;

  const mockRecentChats = [
    { id: "1", title: "Database scaling discussion", timestamp: "2h ago", preview: "Let's review the auto-scaling parameters..." },
    { id: "2", title: "Security patch deployment", timestamp: "5h ago", preview: "Critical CVE requires immediate attention..." },
    { id: "3", title: "Network troubleshooting session", timestamp: "1d ago", preview: "Investigating latency issues in east region..." },
    { id: "4", title: "Performance optimization", timestamp: "2d ago", preview: "CPU utilization analysis complete..." },
    { id: "5", title: "Incident response coordination", timestamp: "3d ago", preview: "Multi-team coordination for service restoration..." }
  ];

  const getTitle = () => {
    if (currentConversationId && conversation) {
      // If conversation exists but has no meaningful title, show dynamic name
      if (!conversation.title || conversation.title === 'New Conversation') {
        return getDynamicChatName();
      }
      return conversation.title;
    }
    if (workspaceMode) return "Chat Workspace";
    if (newChat) return "New Chat";
    if (searchMode) return "Search Conversations";
    if (agent) return agentInfo.name;
    return "Conversations";
  };

  // Generate conversation title based on the context and message
  const generateConversationTitle = (messageContent: string, viewContext: string) => {
    // Extract first few words from message as title
    const words = messageContent.trim().split(' ').slice(0, 4);
    let title = words.join(' ');
    
    if (title.length > 40) {
      title = title.substring(0, 37) + '...';
    }
    
    // Add context suffix based on view
    if (agent) {
      title = `${title} - ${agentInfo.name}`;
    } else if (workspaceMode) {
      title = `${title} - Workspace`;
    } else if (newChat) {
      // Just use the title as is for new chat
    } else {
      title = `${title} - Chat`;
    }
    
    return title || 'New Conversation';
  };

  // Generate dynamic chat name for workspace assignment
  const getDynamicChatName = () => {
    // If we have a meaningful conversation title, use it
    if (conversation?.title && conversation.title !== 'New Conversation' && conversation.title.trim()) {
      return conversation.title;
    }
    
    // If we have messages, generate title from first user message
    if (messages.length > 0) {
      const firstMessage = messages.find(msg => msg.sender === 'user');
      if (firstMessage && firstMessage.content.trim()) {
        const words = firstMessage.content.trim().split(' ').slice(0, 3);
        let title = words.join(' ');
        if (title.length > 30) {
          title = title.substring(0, 27) + '...';
        }
        return title || 'New Chat';
      }
    }
    
    // Default to "New Chat" when no meaningful content exists
    return 'New Chat';
  };

  // Handle workspace selection
  const handleWorkspaceSelect = async (workspaceId: string) => {
    const chatName = getDynamicChatName();
    console.log(`Adding "${chatName}" to workspace: ${workspaceId}`);
    
    try {
      if (currentConversationId && conversation) {
        // Update existing conversation with workspace ID and title
        const updatedConversation = await db.conversations.update(currentConversationId, {
          title: chatName,
          workspace_id: workspaceId
        });
        
        // Update local conversation state
        setConversation(prev => prev ? {
          ...prev,
          title: chatName,
          workspace_id: workspaceId
        } : prev);
        
        console.log(`Successfully moved "${chatName}" to workspace: ${workspaceId}`);
      } else {
        // Create new conversation in the specified workspace
        console.log('Creating new conversation in workspace for move operation');
        
        const newConversation = await db.conversations.create(chatName, workspaceId);
        
        if (!newConversation) {
          setError('Failed to create conversation in workspace. Please try again.');
          return;
        }
        
        setCurrentConversationId(newConversation.id);
        setConversation(newConversation);
        
        console.log(`Successfully created "${chatName}" in workspace: ${workspaceId}`);
        
        // Notify parent component about the new conversation
        if (onConversationCreated) {
          onConversationCreated(newConversation.id);
        }
      }
    } catch (error) {
      console.error('Error moving chat to workspace:', error);
      setError('Failed to move chat to workspace. Please try again.');
    }
  };

  // Handle new workspace creation
  const handleCreateNewWorkspace = () => {
    console.log('Creating new workspace...');
    // This would trigger the same new workspace flow as in the main menu
  };

  // Handle agent change
  const handleAgentChange = async (newAgent: string) => {
    setSelectedAgent(newAgent);
    
    // Add system message indicating agent change
    if (currentConversationId && messages.length > 0) {
      try {
        const systemMessage = await db.messages.create(
          currentConversationId,
          `${newAgent} has joined the chat`,
          'system'
        );
        
        if (systemMessage) {
          const formattedSystemMessage = {
            id: systemMessage.id,
            content: systemMessage.content,
            sender: 'system' as 'user' | 'assistant' | 'system',
            timestamp: new Date(systemMessage.timestamp),
            mentionedAgents: [],
            assignment: undefined
          };
          
          setMessages(prev => [...prev, formattedSystemMessage]);
        }
      } catch (error) {
        console.error('Error adding agent change message:', error);
      }
    }
  };

  // Handle feedback (thumbs up/down)
  const handleFeedback = (messageId: string, feedback: 'up' | 'down') => {
    console.log(`Feedback for message ${messageId}: ${feedback}`);
    // TODO: Implement feedback storage and processing
  };

  // Function to detect assignment intent
  function wantsAssignment(text: string) {
    const s = text.toLowerCase();
    return /make .*assignment|turn .*into .*assignment|create .*assignment|open .*task|new .*assignment/.test(s);
  }

  // Handle assignment context selection
  async function handleAssignmentContextSelection(
    mode: 'full'|'summary'|'none',
    widgetMsg: any
  ) {
    if (!currentConversationId) return;

    // build initial assignment fields
    const assignmentTitle = getDynamicChatName() || "New assignment";
    const base = {
      title: assignmentTitle,
      description: "Created from chat",
      status: "In Progress",
      priority: "high",
      progress: 0,
      assignees: [],
      tags: [],
      est_hours: 0,
      actual_hours: 0,
      due_date: null,
      conversation_id: currentConversationId,
      context_mode: mode
    };

    // grab context according to mode
    if (mode === 'full') {
      const transcript = messages
        .filter(m => !m.type || m.type !== 'widget')
        .map(m => `${m.sender === 'user' ? 'You' : 'AI'}: ${m.content}`)
        .join('\n');
      base.description = `Context (full transcript):\n\n${transcript}`;
    } else if (mode === 'summary') {
      // quick heuristic or call your summarizer later
      base.description = "Context summary: Summary will be generated.";
    }

    const created = await db.assignments.create(base);
    if (!created) {
      setError('Failed to create assignment. Please try again.');
      return;
    }

    // assistant confirmation
    const conf = await db.messages.create(
      currentConversationId!,
      "✅ Assignment created.",
      'assistant'
    );

    if (conf) {
      setMessages(prev => [...prev, {
        id: conf.id, 
        content: conf.content, 
        sender: 'assistant', 
        timestamp: new Date(conf.timestamp)
      } as ExtendedChatMessage]);
    }

    // replace prompt widget with an assignment card widget
    setMessages(prev => {
      const withoutPrompt = prev.filter(m => m !== widgetMsg);
      return [...withoutPrompt, {
        id: crypto.randomUUID(),
        type: 'widget',
        widget: 'assignment-card',
        payload: { assignmentId: created.id },
        timestamp: new Date(),
        sender: 'assistant',
        content: '',
        conversation_id: currentConversationId!
      } as ExtendedChatMessage];
    });
  }

  // Handle message submission with mentions
  const handleSubmit = async (payload: { message?: string; text?: string; routing?: string[]; mentions?: Array<{ id: string; label: string; start: number; end: number }> }) => {
    console.log('ConversationsView: handleSubmit called with currentConversationId:', currentConversationId);
    
    try {
      setError(null);
      let activeConversationId = currentConversationId;
      
      // If no conversation exists, create one automatically
      if (!activeConversationId || activeConversationId === 'null' || activeConversationId === 'undefined' || activeConversationId.trim() === '') {
        console.log('ConversationsView: Creating new conversation for message submission');
        
        // Generate title based on the message and context
        const messageText = payload.message || payload.text || '';
        const title = generateConversationTitle(messageText, agent || 'general');
        
        // Create new conversation
        const newConversation = await db.conversations.create(title);
        
        if (!newConversation) {
          // Fallback: create a local-only conversation to keep UX responsive
          const localId = crypto.randomUUID();
          const localConv = {
            id: localId,
            title,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_archived: false
          } as unknown as Conversation;
          activeConversationId = localId;
          setCurrentConversationId(activeConversationId);
          setConversation(localConv);
          if (onConversationCreated) onConversationCreated(activeConversationId);
          console.warn('ConversationsView: Backend create failed; using local conversation id', localId);
        } else {
          activeConversationId = newConversation.id;
          setCurrentConversationId(activeConversationId);
          setConversation(newConversation);
          if (onConversationCreated) onConversationCreated(activeConversationId);
          console.log('ConversationsView: Created new conversation with ID:', activeConversationId);
        }
      }
      
      // Save user message to database
      const messageText = payload.message || payload.text || '';
      const mentionedAgents = payload.mentions?.map(m => m.id) || payload.routing || [];
      
      // Check for assignment intent before normal AI response
      if (wantsAssignment(messageText)) {
        // Save user message first (fallback to local state if backend fails)
        const userMessage = await db.messages.create(
          activeConversationId,
          messageText,
          'user',
          mentionedAgents
        );
        
        const formattedUserMessage: ExtendedChatMessage = userMessage ? {
          id: userMessage.id,
          content: userMessage.content,
          sender: userMessage.sender as 'user' | 'assistant' | 'system',
          timestamp: new Date(userMessage.timestamp),
          mentionedAgents: userMessage.mentioned_agents || [],
          assignment: userMessage.assignment_data || undefined
        } : {
          id: crypto.randomUUID(),
          content: messageText,
          sender: 'user',
          timestamp: new Date(),
          mentionedAgents
        } as ExtendedChatMessage;
        
        setMessages(prev => [...prev, formattedUserMessage]);

        // assistant acknowledges
        const ack = await db.messages.create(activeConversationId, 
          "Absolutely — I'll set that up. Which chat context should I include?",
          'assistant'
        );
        
        if (ack) {
          setMessages(prev => [...prev, {
            id: ack.id, content: ack.content, sender: 'assistant', timestamp: new Date(ack.timestamp)
          } as ExtendedChatMessage]);
        } else {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(), content: "Absolutely — I'll set that up. Which chat context should I include?", sender: 'assistant', timestamp: new Date()
          } as ExtendedChatMessage]);
        }

        // prompt widget
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          type: 'widget',
          widget: 'assignment-context-prompt',
          payload: { conversationId: activeConversationId },
          timestamp: new Date(),
          sender: 'assistant',
          content: '',
          conversation_id: activeConversationId
        } as ExtendedChatMessage]);

        return; // stop the normal flow
      }
      
      const userMessage = await db.messages.create(
        activeConversationId,
        messageText,
        'user',
        mentionedAgents
      );
      
      // Add to local state immediately (even if backend save failed)
      const localUserMsg: ExtendedChatMessage = userMessage ? {
        id: userMessage.id,
        content: userMessage.content,
        sender: userMessage.sender as 'user' | 'assistant' | 'system',
        timestamp: new Date(userMessage.timestamp),
        mentionedAgents: userMessage.mentioned_agents || [],
        assignment: userMessage.assignment_data || undefined
      } : {
        id: crypto.randomUUID(),
        content: messageText,
        sender: 'user',
        timestamp: new Date(),
        mentionedAgents,
      } as ExtendedChatMessage;
      
      setMessages(prev => [...prev, localUserMsg]);
      if (!userMessage) {
        addPendingMessage(activeConversationId, { content: messageText, sender: 'user', timestamp: new Date().toISOString(), mentionedAgents });
      }
      
      // Simulate AI response (in a real app, this would come from your AI service)
        setTimeout(async () => {
          // Persona-specific simulated response
          const responseText = generatePersonaResponse(selectedAgent, messageText);
          
          const aiMessage = await db.messages.create(
            activeConversationId,
            responseText,
            'assistant'
          );
          
          const formattedAiMessage: ExtendedChatMessage = aiMessage ? {
            id: aiMessage.id,
            content: aiMessage.content,
            sender: aiMessage.sender as 'user' | 'assistant' | 'system',
            timestamp: new Date(aiMessage.timestamp),
            mentionedAgents: aiMessage.mentioned_agents || [],
            assignment: aiMessage.assignment_data || undefined
          } : {
            id: crypto.randomUUID(),
            content: responseText,
            sender: 'assistant',
            timestamp: new Date(),
          } as ExtendedChatMessage;
          
          setMessages(prev => {
              const newMessages = [...prev, formattedAiMessage];
              
              // After first interaction (user + assistant messages), ensure conversation has proper title and appears in navigation
              if (newMessages.length === 2 && conversation) {
                const finalTitle = getDynamicChatName();
                
                // Update conversation title if it's still generic
                if (!conversation.title || conversation.title === 'New Conversation' || conversation.title.includes('Chat') || conversation.title.includes('Agent')) {
                  db.conversations.update(activeConversationId, {
                    title: finalTitle
                  }).then(() => {
                    // Update local conversation state
                    setConversation(prev => prev ? {
                      ...prev,
                      title: finalTitle
                    } : prev);
                    
                    // Notify parent component to refresh navigation data so chat appears in Chats section
                    if (onConversationCreated) {
                      onConversationCreated(activeConversationId);
                    }
                  }).catch(error => {
                    console.error('Error updating conversation title:', error);
                  });
                }
              }
              
              return newMessages;
            });
        }, 1500);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  // Legacy direct submit handler - can be removed later since TipTap handles submission
  const handleDirectSubmit = async () => {
    console.log('Legacy direct submit handler called - this should not happen with TipTap');
  };

  // Handle submissions from the mentions editor
  const handleMentionsSubmit = async (payload: { text: string; mentions: Array<{ id: string; label: string; start: number; end: number }> }) => {
    await handleSubmit({
      text: payload.text,
      mentions: payload.mentions
    });
  };

  // Agent labels for safe mention highlighting
  const AGENT_LABELS = [
    "DevOps Supervisor",
    "Network Troubleshooting",
    "Network Cost Management",
  ];

  // Escape special regex characters
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Create regex with longest first to avoid partial matches
  const mentionRegex = new RegExp(
    "@(?:" + [...AGENT_LABELS].sort((a,b)=>b.length-a.length).map(esc).join("|") + ")(?=$|[\\s.,;:!?])",
    "g"
  );

  // Safe HTML escape
  const htmlEscape = (s: string) =>
    s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  // Format message content with mentions
  const formatMessageContent = (content: string) => {
    const escaped = htmlEscape(content);
    const withMentions = escaped.replace(
      mentionRegex,
      m => `<span class="mention-in-message">${m}</span>`
    );
    return { __html: withMentions.replace(/\n/g,"<br/>") };
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Loading conversation...</div>
        </div>
      </div>
    );
  }

  if (searchMode) {
    return (
      <div className="h-full flex flex-col space-y-6">
        <div className="chat-card">
          <div className="chat-header">
            <div className="flex items-center justify-between">
              <h4 className="chat-title">
                <Search className="h-5 w-5" />
                Search Conversations
              </h4>
            </div>
          </div>
          <Separator />
          <div className="chat-content">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations, messages, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="chat-empty-state">
              <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Search through your conversations</p>
              <p className="text-sm">Find messages, topics, or specific agent interactions</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced card layout for all chat views
  const renderChatInterface = (showConversation = true) => (
    <div className="h-full flex flex-col space-y-6">
      <div className="chat-card">
        <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h4 className="chat-title">
                <Bot className="h-5 w-5" />
                {getTitle()}
              </h4>
              
              {/* Agent Selector Dropdown */}
              <Select value={selectedAgent} onValueChange={handleAgentChange}>
                <SelectTrigger className="w-auto min-w-[180px] h-8 text-xs bg-background-elevated border-border nav-item-hover">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {agentOptions.map((agent) => {
                    const AgentIcon = agent.icon;
                    return (
                      <SelectItem key={agent.id} value={agent.id}>
                        <div className="flex items-center gap-2">
                          <AgentIcon className={`h-4 w-4 ${agent.color}`} />
                          <span>{agent.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="chat-controls">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 nav-item-hover bg-transparent border-0 hover:bg-secondary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3 w-3 text-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Folder className="mr-2 h-4 w-4" />
                      Add to workspace
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-64 max-h-80 overflow-y-auto">
                      <DropdownMenuItem onClick={handleCreateNewWorkspace} className="border-b pb-2 mb-2">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New workspace
                      </DropdownMenuItem>
                      {taskSpaces.map((workspace) => {
                        const WorkspaceIcon = workspace.icon;
                        return (
                          <DropdownMenuItem key={workspace.id} onClick={() => handleWorkspaceSelect(workspace.id)}>
                            <WorkspaceIcon className="mr-2 h-4 w-4" />
                            {workspace.label}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Report
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <Separator />
        <div className="chat-content">
          <div className="flex flex-col h-full">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__container">
                  <h2 className="text-xl md:text-2xl mb-2">What's on the agenda today?</h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    Start a conversation with an AI agent
                  </p>

                  {/* Inline persona selector for quick access */}
                  <div className="mb-3 flex items-center justify-center gap-2 text-xs">
                    <span className="text-muted-foreground">Assistant:</span>
                    <Select value={selectedAgent} onValueChange={handleAgentChange}>
                      <SelectTrigger className="w-auto min-w-[190px] h-7 text-xs bg-background-elevated border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {agentOptions.map((agent) => {
                          const AgentIcon = agent.icon;
                          return (
                            <SelectItem key={agent.id} value={agent.id}>
                              <div className="flex items-center gap-2">
                                <AgentIcon className={`h-4 w-4 ${agent.color}`} />
                                <span>{agent.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="masked-row flex items-center gap-2 rounded-2xl border px-3 py-2 shadow-sm">
                    {/* Plus (left) */}
                    <button
                      type="button"
                      className="masked-send"
                      aria-label="Add"
                      onClick={(e) => openAddMenu(e.currentTarget)}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {/* Editor (centre) */}
                    <div className="masked-editor flex-1 flex items-center min-h-10">
                      <ChatMentionsEditor
                        ref={editorHandle}
                        placeholder="Type a message..."
                        onSend={handleMentionsSubmit}
                      />
                    </div>

                    {/* Send (right) */}
                    <button
                      type="button"
                      className="masked-send"
                      onClick={() => editorHandle.current?.submit()}
                      aria-label="Send"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[calc(100vh-280px)]">
                {messages.map((msg) => {
                  // Handle widget messages
                  if (msg.type === 'widget') {
                    return (
                      <div key={msg.id} className="mb-3 flex justify-start">
                        <div className="agent-message">
                          {msg.widget === 'assignment-context-prompt' && (
                            <AssignmentContextPrompt
                              onSelect={(mode) => handleAssignmentContextSelection(mode, msg)}
                            />
                          )}
                          {msg.widget === 'assignment-card' && (
                            <AssignmentCardWidget assignmentId={msg.payload.assignmentId} />
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Handle regular messages
                  const isUser = msg.sender === 'user';
                  const isSystem = msg.sender === 'system';
                  
                  return (
                    <div key={msg.id} className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={
                        isSystem ? 'system-message ml-4' :
                        isUser   ? 'user-message'   :
                                   'agent-message'
                      }>
                        <div
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={formatMessageContent(msg.content)}
                        />
                        {!isUser && !isSystem && (
                          <div className="feedback">
                            <button onClick={() => handleFeedback(msg.id, 'up')} aria-label="Thumbs up">
                              <ThumbsUp className="h-3 w-3" />
                            </button>
                            <button onClick={() => handleFeedback(msg.id, 'down')} aria-label="Thumbs down">
                              <ThumbsDown className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Input area at bottom when messages exist */}
            {messages.length > 0 && (
              <>
              {/* Inline persona selector when chatting */}
              <div className="mb-2 flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Assistant:</span>
                <Select value={selectedAgent} onValueChange={handleAgentChange}>
                  <SelectTrigger className="w-auto min-w-[190px] h-7 text-xs bg-background-elevated border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {agentOptions.map((agent) => {
                      const AgentIcon = agent.icon;
                      return (
                        <SelectItem key={agent.id} value={agent.id}>
                          <div className="flex items-center gap-2">
                            <AgentIcon className={`h-4 w-4 ${agent.color}`} />
                            <span>{agent.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="masked-row flex items-center gap-2 rounded-2xl border px-3 py-2 shadow-sm">
                {/* Plus (left) */}
                <button
                  type="button"
                  className="masked-send"
                  aria-label="Add"
                  onClick={(e) => openAddMenu(e.currentTarget)}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Editor (centre) */}
                <div className="masked-editor flex-1 flex items-center min-h-10">
                  <ChatMentionsEditor
                    ref={editorHandle}
                    placeholder="Type a message..."
                    onSend={handleMentionsSubmit}
                  />
                </div>

                {/* Send (right) */}
                <button
                  type="button"
                  className="masked-send"
                  onClick={() => editorHandle.current?.submit()}
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return renderChatInterface();
}
