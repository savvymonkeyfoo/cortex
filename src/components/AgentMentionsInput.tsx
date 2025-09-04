import * as React from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Send, Crown, Wrench, Monitor, User, Bot, Plus, Paperclip, ChevronRight, MoreHorizontal, Database, Play, Clock, CheckCircle, Circle } from "lucide-react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

type Agent = { 
  id: string; 
  name: string; 
  icon: React.ComponentType<any>;
  color: string;
};

type TaskStep = {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'running' | 'pending';
  timestamp: Date;
};

type Assignment = {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'running' | 'pending' | 'completed';
  progress: number;
  tags: string[];
  agent: string;
  duration: string;
  estimatedDuration: string;
  icon: React.ComponentType<any>;
  createdAt: Date;
  updatedAt: Date;
  taskSteps: TaskStep[];
};

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  mentionedAgents?: string[];
  assignment?: Assignment;
};

type Props = {
  agents: Agent[];
  value: string;
  onChange: (v: string) => void;
  onSubmit: (payload: { message: string; routing: string[] }) => void;
  placeholder?: string;
  className?: string;
  showConversation?: boolean;
  selectedAgent?: Agent;
  showConversationStarter?: boolean;
  initialMessages?: Message[];
};

export function AgentMentionsInput({ 
  agents, 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "Type your message and @tag agents...",
  className = "",
  showConversation = true,
  selectedAgent,
  showConversationStarter = false,
  initialMessages = []
}: Props) {
  const taRef = React.useRef<HTMLTextAreaElement | null>(null);
  const mirrorRef = React.useRef<HTMLDivElement | null>(null);
  const hiddenMirrorRef = React.useRef<HTMLDivElement | null>(null);
  const conversationRef = React.useRef<HTMLDivElement | null>(null);

  // Conversation state
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = React.useState(false);
  const [waitingForTranscriptChoice, setWaitingForTranscriptChoice] = React.useState(false);
  const [pendingUserMessage, setPendingUserMessage] = React.useState("");

  // Popup state
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const [menuPos, setMenuPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });
  
  // Expand panel state
  const [expandPanelOpen, setExpandPanelOpen] = React.useState(false);

  const suggestions = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agents.slice(0, 6); // Show all agents when just "@" is typed
    return agents.filter(a => a.name.toLowerCase().includes(q)).slice(0, 6);
  }, [agents, query]);

  // Find current @token before caret
  function getAtToken(text: string, caret: number) {
    // Scan backwards until a space/newline or start
    let i = caret - 1;
    while (i >= 0 && !/[\s]/.test(text[i])) i--;
    const tokenStart = i + 1;
    const token = text.slice(tokenStart, caret);
    const isMention = token.startsWith("@") && token.length >= 1;
    return { isMention, token, tokenStart, tokenEnd: caret };
  }

  // Insert chosen mention at caret, then close menu
  function insertMention(name: string) {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart, selectionEnd } = ta;
    const { tokenStart, tokenEnd } = getAtToken(value, selectionStart);

    const mentionText = `@${name}`;
    const next =
      value.slice(0, tokenStart) + mentionText + " " + value.slice(tokenEnd);

    onChange(next);

    // Restore caret just after the inserted mention
    const pos = tokenStart + mentionText.length + 1; // after the space
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(pos, pos);
      // keep caret visible if we wrapped lines
      ta.scrollTop = ta.scrollHeight;
    });

    setOpen(false);
    setQuery("");
    setActive(0);
  }

  // Compute popup position under the caret using a mirror
  function updateCaretPosition() {
    const ta = taRef.current;
    const mirror = hiddenMirrorRef.current;
    if (!ta || !mirror) return;

    const styles = window.getComputedStyle(ta);
    // Mirror essential layout props
    const propsToCopy = [
      "boxSizing","width","height","fontSize","fontFamily","fontWeight",
      "lineHeight","letterSpacing","textTransform","padding","border",
      "whiteSpace","wordBreak","overflowWrap"
    ];
    propsToCopy.forEach(p => {
      // @ts-ignore
      mirror.style[p] = styles.getPropertyValue(p);
    });
    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.wordBreak = "break-word";
    mirror.style.overflow = "auto";

    const caret = ta.selectionStart ?? value.length;
    const textBefore = value.slice(0, caret);
    const textAfter = value.slice(caret);

    // Place a marker at caret
    const safe = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    mirror.innerHTML = safe(textBefore) + `<span id="caret-marker">\u200b</span>` + safe(textAfter);

    const marker = mirror.querySelector<HTMLSpanElement>("#caret-marker");
    if (!marker) return;

    const rect = marker.getBoundingClientRect();
    const hostRect = ta.getBoundingClientRect();

    setMenuPos({
      top: rect.top - hostRect.top + ta.scrollTop - 280, // Position above caret with menu height offset
      left: rect.left - hostRect.left + ta.scrollLeft
    });
  }

  // Handle typing: open menu when typing @..., filter by current token
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value;
    onChange(next);

    const caret = e.target.selectionStart ?? next.length;
    const { isMention, token } = getAtToken(next, caret);

    if (isMention) {
      setOpen(true);
      setQuery(token.slice(1)); // Remove the "@" to get the search query
      queueMicrotask(updateCaretPosition);
    } else {
      setOpen(false);
      setQuery("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!open) {
      // Trigger menu when user types '@'
      if (e.key === "@") {
        queueMicrotask(() => {
          updateCaretPosition();
          setOpen(true);
          setQuery("");
          setActive(0);
        });
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(i => (i + 1) % Math.max(1, suggestions.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(i => (i - 1 + Math.max(1, suggestions.length)) % Math.max(1, suggestions.length));
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const pick = suggestions[active] ?? suggestions[0];
      if (pick) {
        insertMention(pick.name);
      } else {
        // No suggestion, submit the message
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery("");
    } else {
      // After any other key, keep menu aligned to caret
      queueMicrotask(updateCaretPosition);
    }
  }

  // Handle regular Enter key when menu is not open
  function handleTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!open && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else {
      handleKeyDown(e);
    }
  }

  // Highlight mentions visually behind the textarea
  function renderHighlighted(text: string) {
    const safe = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const html = safe(text).replace(
      /@([A-Za-z0-9_][\w-]*)/g,
      (_m, name) => `<span class="mention">@${name}</span>`
    ).replace(/\n/g, "<br/>");
    return { __html: html };
  }

  // Submit helper: strip mentions from message, map to agent ids for routing
  function handleSubmit() {
    if (!value.trim()) return;
    
    const mentioned = Array.from(value.matchAll(/@([A-Za-z0-9_][\w-]*)/g)).map(m => m[1].toLowerCase());
    const routing = agents
      .filter(a => mentioned.includes(a.name.toLowerCase()))
      .map(a => a.id);

    const message = value; // keep mentions in text

    // Add user message to conversation
    if (showConversation) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: 'user',
        timestamp: new Date(),
        mentionedAgents: routing
      };

      setMessages(prev => [...prev, userMessage]);
      
      // Clear input
      onChange("");
      
      // Simulate AI response
      simulateAIResponse(message, routing);
    }

    onSubmit({ message, routing });
  }

  // Generate assignment based on user message context
  function generateAssignment(userMessage: string, mentionedAgents: string[]): Assignment {
    const messageKeywords = userMessage.toLowerCase();
    
    // Determine assignment type based on message content
    let title = "System Task";
    let tags = ["general"];
    let icon = Monitor;
    let agent = "AutoScaler";
    let taskSteps: TaskStep[] = [];
    
    const now = new Date();
    const createdAt = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    const updatedAt = new Date(now.getTime() - 2 * 60 * 1000); // 2 minutes ago
    
    if (messageKeywords.includes("database") || messageKeywords.includes("db")) {
      title = "Database Performance Investigation";
      tags = ["database", "performance", "investigation"];
      icon = Database;
      agent = "DB Monitor (Infrastructure Cluster)";
      taskSteps = [
        {
          id: "step-1",
          title: "Query Performance Analysis",
          description: "Analyzing slow running queries and resource usage",
          status: "completed",
          timestamp: new Date(createdAt.getTime() + 2 * 60 * 1000)
        },
        {
          id: "step-2", 
          title: "Index Optimization",
          description: "Identifying missing indexes and optimization opportunities",
          status: "completed",
          timestamp: new Date(createdAt.getTime() + 4 * 60 * 1000)
        },
        {
          id: "step-3",
          title: "Connection Pool Tuning", 
          description: "Optimizing database connection parameters",
          status: "running",
          timestamp: new Date(updatedAt.getTime())
        }
      ];
    } else if (messageKeywords.includes("network") || messageKeywords.includes("connectivity")) {
      title = "Network Connectivity Resolution";
      tags = ["network", "troubleshooting", "connectivity"];
      icon = Wrench;
      agent = "NetworkTroubleshooting (Network Cluster)";
      taskSteps = [
        {
          id: "step-1",
          title: "Network Path Analysis",
          description: "Tracing network route and identifying bottlenecks",
          status: "completed",
          timestamp: new Date(createdAt.getTime() + 1 * 60 * 1000)
        },
        {
          id: "step-2",
          title: "Firewall Rule Validation",
          description: "Checking firewall configurations and port accessibility", 
          status: "completed",
          timestamp: new Date(createdAt.getTime() + 3 * 60 * 1000)
        },
        {
          id: "step-3",
          title: "Connection Restoration",
          description: "Implementing fixes and restoring connectivity",
          status: "running", 
          timestamp: new Date(updatedAt.getTime())
        }
      ];
    } else if (messageKeywords.includes("server") || messageKeywords.includes("access")) {
      title = "Server Access Investigation";
      tags = ["server", "access", "permissions"];
      icon = Monitor;
      agent = "Infrastructure Monitor (Security Cluster)";
      taskSteps = [
        {
          id: "step-1",
          title: "Authentication Log Review",
          description: "Checking authentication logs for access patterns",
          status: "completed",
          timestamp: new Date(createdAt.getTime() + 1.5 * 60 * 1000)
        },
        {
          id: "step-2",
          title: "Permission Analysis",
          description: "Validating user permissions and access controls",
          status: "running",
          timestamp: new Date(updatedAt.getTime())
        },
        {
          id: "step-3",
          title: "Access Restoration",
          description: "Implementing permission fixes and restoring access",
          status: "pending",
          timestamp: new Date(updatedAt.getTime() + 2 * 60 * 1000)
        }
      ];
    } else if (messageKeywords.includes("ticket") || messageKeywords.includes("prod")) {
      title = "Production Ticket Resolution";
      tags = ["production", "ticket", "resolution"];
      icon = Crown;
      agent = "DevOps Supervisor (Production Cluster)";
      taskSteps = [
        {
          id: "step-1",
          title: "Ticket Validation",
          description: "Verifying ticket requirements and completion criteria",
          status: "completed",
          timestamp: new Date(createdAt.getTime() + 1 * 60 * 1000)
        },
        {
          id: "step-2",
          title: "Post-Resolution Verification",
          description: "Running automated verification checks",
          status: "running",
          timestamp: new Date(updatedAt.getTime())
        },
        {
          id: "step-3",
          title: "Ticket Closure",
          description: "Finalizing ticket status and documentation",
          status: "pending",
          timestamp: new Date(updatedAt.getTime() + 1 * 60 * 1000)
        }
      ];
    } else {
      title = "Scale API Gateway Instances";
      tags = ["scaling", "api", "performance"];
      icon = Monitor;
      agent = "AutoScaler (Infrastructure Cluster)";
      taskSteps = [
        {
          id: "step-1",
          title: "Load Threshold Exceeded",
          description: "API gateway CPU usage above 80%",
          status: "completed",
          timestamp: new Date(createdAt.getTime() + 30 * 1000)
        },
        {
          id: "step-2",
          title: "Scaling Decision",
          description: "Determined need for 2 additional instances",
          status: "completed",
          timestamp: new Date(createdAt.getTime() + 5 * 60 * 1000)
        },
        {
          id: "step-3",
          title: "Instance Provisioning",
          description: "Launching new gateway instances",
          status: "running",
          timestamp: new Date(updatedAt.getTime())
        }
      ];
    }

    return {
      id: `assign-${Date.now()}`,
      title,
      priority: 'high',
      status: 'running',
      progress: Math.floor(Math.random() * 40) + 55, // Random progress between 55-95%
      tags,
      agent,
      duration: "5m 30s",
      estimatedDuration: "20m",
      icon,
      createdAt,
      updatedAt,
      taskSteps
    };
  }

  // Handle transcript choice selection
  function handleTranscriptChoice(choice: 'no-transcript' | 'summarise-transcript' | 'full-transcript') {
    setWaitingForTranscriptChoice(false);
    
    // Now proceed with assignment creation
    setIsTyping(true);
    
    // Simulate brief delay for processing choice
    setTimeout(() => {
      const responseText = "I'm on it. You can leave this chat and can keep track of this in assignments. I'll let you know when I have an update.";
      const assignment = generateAssignment(pendingUserMessage, []);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseText,
        sender: 'assistant',
        timestamp: new Date(),
        assignment
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      setPendingUserMessage("");
      
      // Scroll to bottom after response
      setTimeout(() => {
        if (conversationRef.current) {
          conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
        }
      }, 100);
    }, 800);
  }

  // Simulate AI assistant response
  function simulateAIResponse(userMessage: string, mentionedAgents: string[]) {
    setIsTyping(true);
    
    // Check if user is requesting assignment creation
    const isAssignmentRequest = /create\s+(an?\s+)?assignment|make\s+(an?\s+)?assignment|generate\s+(an?\s+)?assignment|create\s+(a\s+)?task/i.test(userMessage);
    
    // Simulate typing delay
    setTimeout(() => {
      let responseText = "";
      let assignment: Assignment | undefined;

      if (isAssignmentRequest) {
        // Instead of immediately creating assignment, ask for transcript choice
        responseText = "What context should I add to the ticket from this chat?";
        setPendingUserMessage(userMessage);
        setWaitingForTranscriptChoice(true);
      } else {
        const responses = [
          "I understand your request. Let me help you with that.",
          "Thanks for the message! I'm processing your request now.",
          "Got it! I'll work on this right away.",
          "I see what you need. Let me gather the relevant information.",
          "Perfect! I'm on it. I'll coordinate with the mentioned agents.",
          "Understood. I'll handle this task and keep you updated.",
          "Great! I'm analyzing the situation and will provide a solution.",
          "Thanks for the details. I'm working with the team to resolve this."
        ];

        responseText = responses[Math.floor(Math.random() * responses.length)];
        
        // Mention specific agents if they were tagged
        if (mentionedAgents.length > 0) {
          const agentNames = agents
            .filter(a => mentionedAgents.includes(a.id))
            .map(a => a.name);
          
          if (agentNames.length > 0) {
            responseText += ` I've notified ${agentNames.map(name => `@${name}`).join(', ')} to assist with this.`;
          }
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseText,
        sender: 'assistant',
        timestamp: new Date(),
        assignment
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      // Scroll to bottom after response
      setTimeout(() => {
        if (conversationRef.current) {
          conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
        }
      }, 100);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  }

  // Scroll to bottom when new messages are added
  React.useEffect(() => {
    if (conversationRef.current && messages.length > 0) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages]);

  // Format message content with mentions
  function formatMessageContent(content: string) {
    const safe = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const html = safe(content).replace(
      /@([A-Za-z0-9_][\w-]*)/g,
      (_m, name) => `<span class="mention-in-message">@${name}</span>`
    ).replace(/\n/g, "<br/>");
    return { __html: html };
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Initial Centered State - Only show when no messages and showConversationStarter is true */}
      {showConversation && messages.length === 0 && showConversationStarter && (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-center mb-8">
            {selectedAgent ? (
              <selectedAgent.icon className={`h-16 w-16 mx-auto mb-6 ${selectedAgent.color}`} />
            ) : (
              <Bot className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            )}
            <p className="text-foreground mb-8" style={{ fontSize: '24px' }}>Where should we begin?</p>
          </div>
          
          {/* Centered Input Area */}
          <div className="w-full max-w-2xl">
            {/* Expand Panel - Positioned above input */}
            {expandPanelOpen && (
              <div className="mb-3 bg-card border border-border rounded-xl shadow-sm p-3 w-fit">
                <div className="space-y-2">
                  <button className="flex items-center gap-3 p-3 rounded-lg nav-item-hover transition-colors text-left min-w-[200px]">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Add photos & files</span>
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-lg nav-item-hover transition-colors text-left min-w-[200px]">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">More</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="relative bg-card border border-border rounded-xl shadow-sm">
              {/* Plus Button - Positioned at the left */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20">
                <Button
                  onClick={() => setExpandPanelOpen(!expandPanelOpen)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 nav-item-hover"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Highlight layer - positioned to match textarea exactly */}
              <div
                ref={mirrorRef}
                className="highlighter pointer-events-none absolute inset-0 rounded-xl z-10"
                aria-hidden={true}
                style={{
                  padding: "16px 52px 16px 48px",
                  border: "1px solid transparent",
                  fontSize: "14px",
                  lineHeight: "1.5", 
                  fontFamily: "inherit",
                  fontWeight: "inherit",
                  letterSpacing: "inherit",
                  wordSpacing: "inherit",
                  textTransform: "inherit",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                  overflow: "hidden",
                  boxSizing: "border-box",
                  tabSize: "inherit"
                }}
              >
                {value.trim() === '' ? (
                  <div className="text-muted-foreground">
                    {placeholder}
                  </div>
                ) : (
                  <div
                    className="text-foreground"
                    dangerouslySetInnerHTML={renderHighlighted(value)}
                  />
                )}
              </div>

              {/* Textarea - make text transparent but keep functionality */}
              <Textarea
                ref={taRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleTextareaKeyDown}
                onScroll={(e) => {
                  // Sync scroll position with highlight layer
                  const highlightLayer = mirrorRef.current;
                  const textarea = e.target as HTMLTextAreaElement;
                  if (highlightLayer) {
                    highlightLayer.scrollTop = textarea.scrollTop;
                    highlightLayer.scrollLeft = textarea.scrollLeft;
                  }
                  updateCaretPosition();
                }}
                onClick={updateCaretPosition}
                placeholder=""
                className="relative bg-transparent text-transparent caret-foreground selection:bg-ai-primary/20 min-h-[52px] pr-14 resize-none placeholder:text-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl"
                style={{
                  caretColor: "var(--foreground)",
                  color: value.trim() === '' ? 'transparent' : 'var(--foreground)',
                  fontSize: "14px",
                  lineHeight: "1.5",
                  fontFamily: "inherit",
                  fontWeight: "inherit",
                  letterSpacing: "inherit",
                  wordSpacing: "inherit",
                  textTransform: "inherit",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                  boxSizing: "border-box",
                  tabSize: "inherit",
                  padding: "16px 52px 16px 48px"
                }}
              />

              {/* Hidden mirror for caret maths */}
              <div ref={hiddenMirrorRef} className="invisible absolute top-0 left-0 whitespace-pre-wrap break-words pointer-events-none" />

              {/* Mention menu */}
              {open && suggestions.length > 0 && (
                <ul
                  className="absolute z-50 w-64 max-h-64 overflow-auto rounded-lg border border-border bg-popover shadow-lg"
                  style={{ top: menuPos.top, left: menuPos.left }}
                  role="listbox"
                >
                  <div className="text-xs text-muted-foreground px-3 py-2 border-b border-border">
                    Select an agent to tag
                  </div>
                  {suggestions.map((agent, i) => {
                    const AgentIcon = agent.icon;
                    return (
                      <li
                        key={agent.id}
                        onMouseDown={e => { e.preventDefault(); insertMention(agent.name); }}
                        className={`px-3 py-2 cursor-pointer flex items-center gap-3 hover:bg-muted ${i === active ? "bg-muted" : ""}`}
                        aria-selected={i === active}
                      >
                        <AgentIcon className={`h-4 w-4 ${agent.color}`} />
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{agent.name}</span>
                          <span className="text-xs text-muted-foreground">@{agent.name}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Send button overlay */}
              <div className="absolute right-3 bottom-3 z-20">
                <Button
                  onClick={handleSubmit}
                  disabled={!value.trim() || isTyping}
                  size="sm"
                  className="h-8 w-8 p-0 bg-ai-primary hover:bg-ai-primary/90 text-white border-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regular Conversation State - Show when messages exist or showConversationStarter is false */}
      {showConversation && (messages.length > 0 || !showConversationStarter) && (
        <>
          {/* Conversation History */}
          <div 
            ref={conversationRef}
            className="flex-1 overflow-y-auto mb-6 space-y-6 px-1"
          >
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                {selectedAgent ? (
                  <>
                    <selectedAgent.icon className={`h-12 w-12 mx-auto mb-4 ${selectedAgent.color}`} />
                    <p className="text-base mb-2">Start a conversation with {selectedAgent.name}</p>
                  </>
                ) : (
                  <>
                    <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-base mb-2">Start a conversation with AI agents</p>
                  </>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-0 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                      <AvatarFallback className={`text-xs ${message.sender === 'user' ? 'bg-muted text-foreground' : 'bg-muted text-foreground'}`}>
                        {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-3 rounded-2xl ${
                        message.sender === 'user' 
                          ? 'bg-muted text-foreground' 
                          : 'text-foreground'
                      }`}>
                        <div 
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={formatMessageContent(message.content)}
                        />
                        
                        {/* Transcript Choice Card */}
                        {waitingForTranscriptChoice && message.sender === 'assistant' && message.content.includes("What context should I add") && (
                          <div className="mt-4 border border-border rounded-lg bg-card p-4 shadow-sm max-w-md w-full">
                            <div className="space-y-3">
                              <Button
                                onClick={() => handleTranscriptChoice('no-transcript')}
                                variant="outline"
                                className="w-full justify-start text-sm"
                              >
                                No transcript
                              </Button>
                              <Button
                                onClick={() => handleTranscriptChoice('summarise-transcript')}
                                variant="outline"
                                className="w-full justify-start text-sm"
                              >
                                Summarise transcript
                              </Button>
                              <Button
                                onClick={() => handleTranscriptChoice('full-transcript')}
                                variant="outline"
                                className="w-full justify-start text-sm"
                              >
                                Full transcript
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Enhanced Assignment Tile - Only show for assistant messages with assignments */}
                      {message.sender === 'assistant' && message.assignment && (
                        <div className="mt-6 w-full max-w-4xl">
                          <div className="bg-card border border-border rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[600px]">
                            {/* Assignment Header */}
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-muted rounded-xl">
                                  <message.assignment.icon className="h-8 w-8 text-foreground" />
                                </div>
                                <div className="flex-1">
                                  <h2 className="text-xl font-semibold text-foreground mb-1">{message.assignment.title}</h2>
                                </div>
                              </div>
                              <Badge 
                                variant={message.assignment.priority === 'critical' ? 'destructive' : message.assignment.priority === 'high' ? 'secondary' : 'outline'}
                                className="text-sm px-3 py-1"
                              >
                                {message.assignment.priority}
                              </Badge>
                            </div>

                            {/* Status and Progress Grid */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Status:</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-ai-accent rounded-full"></div>
                                    <span className="text-sm font-medium capitalize">{message.assignment.status}</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Progress:</span>
                                  <span className="text-sm font-medium">{message.assignment.progress}%</span>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Created:</span>
                                  <span className="text-sm font-medium">
                                    {message.assignment.createdAt.toLocaleString('en-US', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false
                                    }).replace(',', '')}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Updated:</span>
                                  <span className="text-sm font-medium">
                                    {message.assignment.updatedAt.toLocaleString('en-US', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false
                                    }).replace(',', '')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-8">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Estimated Duration:</span>
                                <span className="text-sm font-medium">{message.assignment.estimatedDuration}</span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Agent:</span>
                                <span className="text-sm font-medium">{message.assignment.agent}</span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-8">
                              <Progress value={message.assignment.progress} className="h-3" />
                            </div>

                            {/* Task Steps Section */}
                            <div className="space-y-6">
                              <h3 className="text-lg font-semibold text-foreground">Task Steps</h3>
                              
                              <div className="space-y-4">
                                {message.assignment.taskSteps.map((step, index) => (
                                  <div key={step.id} className="bg-muted/50 border border-border rounded-lg p-6 hover:bg-muted/70 transition-colors cursor-pointer group">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-4 flex-1">
                                        <div className="flex-shrink-0">
                                          {step.status === 'completed' ? (
                                            <CheckCircle className="h-6 w-6 text-success" />
                                          ) : step.status === 'running' ? (
                                            <div className="relative">
                                              <Circle className="h-6 w-6 text-ai-accent" />
                                              <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-2 h-2 bg-ai-accent rounded-full animate-pulse"></div>
                                              </div>
                                            </div>
                                          ) : (
                                            <Circle className="h-6 w-6 text-muted-foreground" />
                                          )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-base text-foreground mb-1">{step.title}</h4>
                                          <p className="text-sm text-muted-foreground">{step.description}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-4">
                                        <span className="text-sm text-muted-foreground">
                                          {step.timestamp.toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: '2-digit', 
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false
                                          }).replace(',', ' ')}
                                        </span>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
                              {message.assignment.tags.map((tag, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="text-sm bg-ai-secondary/10 text-ai-secondary border-ai-secondary/20 px-3 py-1"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground mt-2 px-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-0 justify-start">
                <div className="flex gap-3 max-w-[85%]">
                  <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                    <AvatarFallback className="bg-muted text-foreground text-xs">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-card border border-border px-4 py-3 rounded-2xl shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Expand Panel - Positioned above input */}
          {expandPanelOpen && (
            <div className="mb-3 bg-card border border-border rounded-xl shadow-sm p-3 w-fit">
              <div className="space-y-2">
                <button className="flex items-center gap-3 p-3 rounded-lg nav-item-hover transition-colors text-left min-w-[200px]">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Add photos & files</span>
                </button>
                <button className="flex items-center gap-3 p-3 rounded-lg nav-item-hover transition-colors text-left min-w-[200px]">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">More</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                </button>
              </div>
            </div>
          )}

          {/* Input Area - Fixed at bottom */}
          <div className="relative bg-card border border-border rounded-xl shadow-sm flex-shrink-0 mb-6">
            {/* Plus Button - Positioned at the left */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20">
              <Button
                onClick={() => setExpandPanelOpen(!expandPanelOpen)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 nav-item-hover"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Highlight layer - positioned to match textarea exactly */}
            <div
              ref={mirrorRef}
              className="highlighter pointer-events-none absolute inset-0 rounded-xl z-10"
              aria-hidden
              style={{
                padding: "16px 52px 16px 48px", // Updated left padding for plus button
                border: "1px solid transparent",
                fontSize: "14px",
                lineHeight: "1.5", 
                fontFamily: "inherit",
                fontWeight: "inherit",
                letterSpacing: "inherit",
                wordSpacing: "inherit",
                textTransform: "inherit",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                overflow: "hidden",
                boxSizing: "border-box",
                tabSize: "inherit"
              }}
            >
              {value ? (
                <div
                  className="text-foreground"
                  dangerouslySetInnerHTML={renderHighlighted(value)}
                />
              ) : (
                <div className="text-muted-foreground">
                  {placeholder}
                </div>
              )}
            </div>

            {/* Textarea - make text transparent but keep functionality */}
            <Textarea
              ref={taRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleTextareaKeyDown}
              onScroll={(e) => {
                // Sync scroll position with highlight layer
                const highlightLayer = mirrorRef.current;
                const textarea = e.target as HTMLTextAreaElement;
                if (highlightLayer) {
                  highlightLayer.scrollTop = textarea.scrollTop;
                  highlightLayer.scrollLeft = textarea.scrollLeft;
                }
                updateCaretPosition();
              }}
              onClick={updateCaretPosition}
              placeholder=""
              className="relative bg-transparent text-transparent caret-foreground selection:bg-ai-primary/20 min-h-[52px] pr-14 resize-none placeholder:text-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl"
              style={{
                caretColor: "var(--foreground)",
                fontSize: "14px",
                lineHeight: "1.5",
                fontFamily: "inherit",
                fontWeight: "inherit",
                letterSpacing: "inherit",
                wordSpacing: "inherit",
                textTransform: "inherit",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                boxSizing: "border-box",
                tabSize: "inherit",
                padding: "16px 52px 16px 48px" // Updated padding for plus button on left and send button on right
              }}
            />

            {/* Hidden mirror for caret maths */}
            <div ref={hiddenMirrorRef} className="invisible absolute top-0 left-0 whitespace-pre-wrap break-words pointer-events-none" />

            {/* Mention menu */}
            {open && suggestions.length > 0 && (
              <ul
                className="absolute z-50 w-64 max-h-64 overflow-auto rounded-lg border border-border bg-popover shadow-lg"
                style={{ top: menuPos.top, left: menuPos.left }}
                role="listbox"
              >
                <div className="text-xs text-muted-foreground px-3 py-2 border-b border-border">
                  Select an agent to tag
                </div>
                {suggestions.map((agent, i) => {
                  const AgentIcon = agent.icon;
                  return (
                    <li
                      key={agent.id}
                      onMouseDown={e => { e.preventDefault(); insertMention(agent.name); }}
                      className={`px-3 py-2 cursor-pointer flex items-center gap-3 hover:bg-muted ${i === active ? "bg-muted" : ""}`}
                      aria-selected={i === active}
                    >
                      <AgentIcon className={`h-4 w-4 ${agent.color}`} />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{agent.name}</span>
                        <span className="text-xs text-muted-foreground">@{agent.name}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Send button overlay */}
            <div className="absolute right-3 bottom-3 z-20">
              <Button
                onClick={handleSubmit}
                disabled={!value.trim() || isTyping}
                size="sm"
                className="h-8 w-8 p-0 bg-ai-primary hover:bg-ai-primary/90 text-white border-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Mention chip styles */}
      <style jsx>{`
        .mention {
          background-color: var(--ai-primary);
          color: var(--ai-primary-foreground);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
        }
        
        .mention-in-message {
          background-color: var(--ai-primary);
          color: var(--ai-primary-foreground);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}