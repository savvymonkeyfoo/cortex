import { useState, useEffect, startTransition } from "react";
import { 
  Home, 
  Inbox, 
  MessageCircle, 
  ListChecks,
  Users, 
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Crown,
  Wrench,
  Monitor,
  FolderPlus,
  Folder,
  FileText,
  GitBranch,
  MoreHorizontal,
  Share,
  Edit,
  Archive,
  Trash2
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "./ui/dropdown-menu";
import { db, type Workspace, type Conversation } from "../utils/supabase/client";

type ViewType = "control-centre" | "triage" | "conversations" | "assignments" | "live-assignments" | "assignment-archive" | "roster" | "admin" | 
  "new-chat" | "chat-workspace" | "search-chats" | "supervisor" | "network-troubleshooting" | "network-monitoring" |
  "network-tickets" | "server-monitoring" | "conversation" | "team-standup-chat";

interface LeftNavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onConversationSelect: (conversationId: string) => void;
  activeConversationId?: string | null;
  workspaces?: any[];
  onWorkspacesChange?: (workspaces: any[]) => void;
  onTaskSpacesChange?: (taskSpaces: any[]) => void;
  refreshTrigger?: number;
}

export function LeftNavigation({ 
  currentView, 
  onViewChange, 
  onConversationSelect, 
  activeConversationId,
  workspaces,
  onWorkspacesChange,
  onTaskSpacesChange,
  refreshTrigger
}: LeftNavigationProps) {
  const [conversationsExpanded, setConversationsExpanded] = useState(false);
  const [assignmentsExpanded, setAssignmentsExpanded] = useState(false);
  
  // Editing state for inline rename
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  // --- add near other edit state ---
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [editingWorkspaceValue, setEditingWorkspaceValue] = useState<string>("");
  
  // Database state
  const [dbWorkspaces, setDbWorkspaces] = useState<Workspace[]>([]);
  const [workspaceConversations, setWorkspaceConversations] = useState<Record<string, Conversation[]>>({});
  const [standaloneConversations, setStandaloneConversations] = useState<Conversation[]>([]);
  const [bootstrapping, setBootstrapping] = useState(true);   // initial load only
  const [mutating, setMutating] = useState(false);            // lightweight ops
  
  // Task spaces state with dynamic data
  const [taskSpaces, setTaskSpaces] = useState<Array<{
    id: string;
    label: string;
    icon: any;
    expanded: boolean;
    conversations: Array<{ id: string; label: string }>;
    setExpanded: (expanded: boolean) => void;
  }>>([]);

  // Chats section state with dynamic data
  const [chatsData, setChatsData] = useState({
    label: "Chats",
    icon: MessageCircle,
    expanded: false,
    conversations: [] as Array<{ id: string; label: string }>,
    setExpanded: (expanded: boolean) => {
      setChatsData(prev => ({ ...prev, expanded }));
    }
  });

  // Load data from database
  useEffect(() => {
    initLoad();
  }, []);

  // Reload data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      initLoad();
    }
  }, [refreshTrigger]);

  async function initLoad() {
    try {
      setBootstrapping(true);
      await loadData();
      // Update Network Operations icon after initial load
      await updateNetworkOperationsIcon();
    } finally {
      setBootstrapping(false);
    }
  }

  const loadData = async () => {
    // Initialize variables at function scope to avoid ReferenceError
    let standalone: Conversation[] = [];
    
    try {
      // Load workspaces with error handling
      const workspacesData = await db.workspaces.getAll();
      setDbWorkspaces(workspacesData);
      
      // Load conversations for each workspace with error handling
      const workspaceConvs: Record<string, Conversation[]> = {};
      for (const workspace of workspacesData) {
        try {
          const conversations = await db.conversations.getAll(workspace.id);
          workspaceConvs[workspace.id] = conversations;
        } catch (error) {
          workspaceConvs[workspace.id] = []; // Continue with empty array
        }
      }
      setWorkspaceConversations(workspaceConvs);
      
      // Load standalone conversations (not assigned to any workspace) with error handling
      try {
        standalone = await db.conversations.getAll();
        setStandaloneConversations(standalone);
      } catch (error) {
        standalone = []; // Set to empty array on error
        setStandaloneConversations([]); // Continue with empty array
      }
      
      // Update task spaces with database data
      const newTaskSpaces = workspacesData.map(workspace => {
        const conversations = workspaceConvs[workspace.id] || [];
        const iconMap: Record<string, any> = {
          'Monitor': Monitor,
          'Folder': Folder,
          'Crown': Crown,
          'Wrench': Wrench,
          'Network': Folder,
          'Operations': Folder,
          'NetworkOperations': Folder,
          'network-operations': Folder,
        };
        
        return {
          id: workspace.id,
          label: workspace.name,
          icon: iconMap[workspace.icon] || Folder,
          expanded: false,
          conversations: conversations.map(conv => ({
            id: conv.id,
            label: conv.title
          })),
          setExpanded: (expanded: boolean) => {
            setTaskSpaces(prev => prev.map(space => 
              space.id === workspace.id ? { ...space, expanded } : space
            ));
          }
        };
      });
      
      setTaskSpaces(newTaskSpaces);
      
      // Notify parent component of taskSpaces changes
      if (onTaskSpacesChange) {
        onTaskSpacesChange(newTaskSpaces);
      }
      
      // Update chats data with standalone conversations
      setChatsData(prev => ({
        ...prev,
        conversations: standalone.map(conv => ({
          id: conv.id,
          label: conv.title
        }))
      }));
      
    } catch (error) {
      // Set empty states so UI doesn't break - silent failure for clean development experience
      setDbWorkspaces([]);
      setWorkspaceConversations({});
      setStandaloneConversations([]);
      setTaskSpaces([]);
      setChatsData(prev => ({ ...prev, conversations: [] }));
    }
  };

  // Rename helper functions
  function startRename(id: string, current: string) {
    setEditingId(id);
    setEditingValue(current);
  }

  function optimisticRenameLocal(conversationId: string, newTitle: string) {
    startTransition(() => {
      // update chats list
      setChatsData(prev => ({
        ...prev,
        conversations: prev.conversations.map(c =>
          c.id === conversationId ? { ...c, label: newTitle } : c
        )
      }));
      // update each workspace list too
      setTaskSpaces(prev => prev.map(space => ({
        ...space,
        conversations: space.conversations.map(c =>
          c.id === conversationId ? { ...c, label: newTitle } : c
        )
      })));
    });
  }

  async function saveRename() {
    if (!editingId) return;
    const newTitle = editingValue.trim() || "Untitled chat";

    // optimistic UI
    optimisticRenameLocal(editingId, newTitle);
    setEditingId(null);
    setEditingValue("");

    // persist, rollback if needed
    try {
      setMutating(true);
      await db.conversations.update(editingId, { title: newTitle });
    } catch (e) {
      // best effort re-sync from server on failure
      await initLoad();
    } finally {
      setMutating(false);
    }
  }

  function cancelRename() {
    setEditingId(null);
    setEditingValue("");
  }

  // Start/Cancel/Save Workspace rename
  function startWorkspaceRename(id: string, current: string) {
    setEditingWorkspaceId(id);
    setEditingWorkspaceValue(current);
  }
  function cancelWorkspaceRename() {
    setEditingWorkspaceId(null);
    setEditingWorkspaceValue("");
  }
  async function saveWorkspaceRename() {
    if (!editingWorkspaceId) return;
    const newName = editingWorkspaceValue.trim() || "Untitled workspace";

    // optimistic UI
    startTransition(() => {
      setTaskSpaces(prev => prev.map(ws =>
        ws.id === editingWorkspaceId ? { ...ws, label: newName } : ws
      ));
    });

    setEditingWorkspaceId(null);
    setEditingWorkspaceValue("");

    try {
      setMutating(true);
      await db.workspaces.update(editingWorkspaceId, { name: newName });
    } catch (e) {
      await initLoad(); // rollback
    } finally {
      setMutating(false);
    }
  }

  // Cascade delete workspace + its children
  async function deleteWorkspaceAndChildren(workspaceId: string) {
    // quick confirm
    if (!window.confirm("Delete this workspace and all its chats? This cannot be undone.")) return;

    // optimistic UI: remove the workspace immediately
    startTransition(() => {
      setTaskSpaces(prev => prev.filter(ws => ws.id !== workspaceId));
    });

    try {
      setMutating(true);
      // 1) remove all conversations in this workspace
      const convs = await db.conversations.getAll(workspaceId);
      for (const c of convs) {
        await db.conversations.delete(c.id);
      }
      // 2) remove the workspace itself
      await db.workspaces.delete(workspaceId);

      // 3) reload to be safe
      await initLoad();
    } catch (e) {
      console.error("Error deleting workspace:", e);
      await initLoad(); // resync if anything failed
    } finally {
      setMutating(false);
    }
  }

  const mainNavItems = [
    { 
      icon: Home, 
      label: "Control Centre", 
      view: "control-centre" as ViewType,
      badge: "3",
      expandable: false
    },
    { 
      icon: Inbox, 
      label: "Triage", 
      view: "triage" as ViewType,
      badge: "12",
      expandable: false
    },
    { 
      icon: ListChecks, 
      label: "Assignments", 
      view: "assignments" as ViewType,
      expandable: true
    },
    { 
      icon: MessageCircle, 
      label: "Conversations", 
      view: "conversations" as ViewType,
      expandable: true
    }
  ];

  const secondaryNavItems = [
    { 
      icon: Users, 
      label: "Roster", 
      view: "roster" as ViewType,
      expandable: false
    },
    { 
      icon: Settings, 
      label: "Settings", 
      view: "admin" as ViewType,
      expandable: false
    }
  ];

  const conversationMenuItems = [
    { icon: Plus, label: "New chat", view: "new-chat" as ViewType },
    { icon: MessageCircle, label: "Chat Workspace", view: "chat-workspace" as ViewType },
    { icon: Search, label: "Search chats", view: "search-chats" as ViewType }
  ];

  function isConversationActive(view: ViewType) {
    const conversationViews: ViewType[] = [
      "conversations", "new-chat", "chat-workspace", "search-chats", "supervisor", 
      "network-troubleshooting", "network-monitoring", "conversation", "team-standup-chat"
    ];
    return conversationViews.includes(currentView);
  }

  function isAssignmentActive(view: ViewType) {
    const assignmentViews: ViewType[] = [
      "assignments", "live-assignments", "assignment-archive"
    ];
    return assignmentViews.includes(currentView);
  }

  function handleConversationsClick() {
    setConversationsExpanded(!conversationsExpanded);
  }

  function handleAssignmentsClick() {
    setAssignmentsExpanded(!assignmentsExpanded);
  }

  // Function to move a chat to a workspace (or to standalone/chats if workspaceId is null)
  async function moveConversationToWorkspace(conversationId: string, workspaceId: string | null) {
    // find the convo in any list
    let moved: { id: string; label: string } | null = null;

    startTransition(() => {
      // First find and remove the conversation from its current location
      setChatsData(prev => {
        const remaining = prev.conversations.filter(c => {
          if (c.id === conversationId) { moved = c; return false; }
          return true;
        });
        return { ...prev, conversations: remaining };
      });

      setTaskSpaces(prev => prev.map(space => {
        const remaining = space.conversations.filter(c => {
          if (c.id === conversationId && !moved) { moved = c; }
          return c.id !== conversationId;
        });
        return { ...space, conversations: remaining };
      }));

      // Then add it to the target location
      if (workspaceId === null) {
        // Moving to standalone/chats
        if (moved) {
          setChatsData(prev => ({ ...prev, conversations: [...prev.conversations, moved!] }));
        }
      } else {
        // Moving to a specific workspace
        setTaskSpaces(prev => prev.map(space => {
          if (space.id === workspaceId && moved) {
            return { ...space, conversations: [...space.conversations, moved] };
          }
          return space;
        }));
      }
    });

    try {
      setMutating(true);
      await db.conversations.update(conversationId, { workspace_id: workspaceId });
      console.log(`Moved conversation ${conversationId} to ${workspaceId ? `workspace ${workspaceId}` : 'standalone/chats'}`);
    } catch (e) {
      // re-sync from server on error to restore correct state
      await initLoad();
      console.error('Error moving conversation:', e);
    } finally {
      setMutating(false);
    }
  }

  // Function to create new workspace
  async function createNewWorkspace() {
    try {
      const newWorkspace = await db.workspaces.create("New Workspace", "Folder");
      if (newWorkspace) {
        await loadData(); // Reload to show new workspace
        console.log("Created new workspace:", newWorkspace.name);
      }
    } catch (error) {
      console.error('Error creating new workspace:', error);
    }
  }

  // Function to update Network Operations workspace icon to Folder
  async function updateNetworkOperationsIcon() {
    try {
      const workspaces = await db.workspaces.getAll();
      const networkOpsWorkspace = workspaces.find(w => w.name === "Network Operations");
      if (networkOpsWorkspace) {
        await db.workspaces.update(networkOpsWorkspace.id, { icon: "Folder" });
        await loadData(); // Reload to show updated icon
        console.log("Updated Network Operations workspace icon to Folder");
      } else {
        console.log("Network Operations workspace not found");
      }
    } catch (error) {
      console.error('Error updating Network Operations workspace icon:', error);
    }
  }

  return (
    <div className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Main Navigation */}
      <div className="flex-1 p-3 space-y-1 overflow-auto">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.expandable ? 
            (item.label === "Conversations" ? isConversationActive(item.view) : 
             item.label === "Assignments" ? isAssignmentActive(item.view) : 
             currentView === item.view) : 
            currentView === item.view;
          
          if (item.expandable && item.label === "Conversations") {
            return (
              <div key={item.label} className="space-y-1 my-3 p-2 rounded-lg bg-muted/30">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-9 px-3 nav-item-hover"
                  onClick={handleConversationsClick}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                  {conversationsExpanded ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                </Button>

                {/* Expanded Conversations Menu */}
                {conversationsExpanded && (
                  <div className="space-y-1">
                    {/* Conversation Actions */}
                    {conversationMenuItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = currentView === subItem.view;
                      return (
                        <Button
                          key={subItem.label}
                          variant={isSubActive ? "secondary" : "ghost"}
                          size="sm"
                          className={`w-full justify-start gap-3 h-8 px-6 text-sm ${!isSubActive ? 'nav-item-hover' : ''}`}
                          onClick={() => onViewChange(subItem.view)}
                        >
                          <SubIcon className="h-3 w-3 flex-shrink-0" />
                          <span className="flex-1 text-left">{subItem.label}</span>
                        </Button>
                      );
                    })}

                    {/* New Workspace */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-3 h-8 px-6 text-sm nav-item-hover"
                      onClick={createNewWorkspace}
                    >
                      <FolderPlus className="h-3 w-3 flex-shrink-0" />
                      <span className="flex-1 text-left">New Workspace</span>
                    </Button>

                    {/* Dynamic Workspaces from Database */}
                    {bootstrapping ? (
                      <div className="px-6 py-2 text-xs text-muted-foreground">Loading...</div>
                    ) : (
                      taskSpaces.map((taskSpace) => {
                        const TaskIcon = taskSpace.icon;
                        return (
                          <div key={taskSpace.id} className="space-y-1">
                            {/* Workspace row with no chevron; shows 3-dots on hover */}
                            <div className="relative group">
                              {editingWorkspaceId === taskSpace.id ? (
                                <input
                                  autoFocus
                                  value={editingWorkspaceValue}
                                  onChange={(e) => setEditingWorkspaceValue(e.target.value)}
                                  onBlur={saveWorkspaceRename}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") { e.preventDefault(); saveWorkspaceRename(); }
                                    if (e.key === "Escape") { e.preventDefault(); cancelWorkspaceRename(); }
                                  }}
                                  className="w-full h-8 px-9 text-sm rounded-md bg-muted/40 outline-none focus:ring-2 focus:ring-ai-primary"
                                  onFocus={(e) => e.currentTarget.select()}
                                />
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start gap-3 h-8 px-6 text-sm nav-item-hover"
                                  onClick={() => taskSpace.setExpanded(!taskSpace.expanded)}
                                >
                                  <TaskIcon className="h-3 w-3 flex-shrink-0" />
                                  <span className="flex-1 text-left">{taskSpace.label}</span>
                                  {/* no chevron */}
                                </Button>
                              )}

                              {/* three-dots, like page rows; only Rename + Delete */}
                              {editingWorkspaceId !== taskSpace.id && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0 nav-item-hover bg-transparent border-0 hover:bg-secondary"
                                        onClick={(e) => e.stopPropagation()}
                                        aria-label="Workspace options"
                                      >
                                        {mutating ? (
                                          <div className="h-3 w-3 animate-spin rounded-full border border-foreground border-t-transparent" />
                                        ) : (
                                          <MoreHorizontal className="h-3 w-3 text-foreground" />
                                        )}
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          startWorkspaceRename(taskSpace.id, taskSpace.label);
                                        }}
                                      >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Rename
                                      </DropdownMenuItem>

                                      <DropdownMenuSeparator />

                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteWorkspaceAndChildren(taskSpace.id);
                                        }}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                            </div>

                            {/* Workspace Conversations */}
                            {taskSpace.expanded && (
                              <div className="space-y-1">
                                {taskSpace.conversations.map((conversation) => {
                                  const isConvActive = currentView === "conversation" && conversation.id === activeConversationId;
                                  const isEditing = editingId === conversation.id;
                                  return (
                                    <div key={conversation.id} className="relative group">
                                      {isEditing ? (
                                        <input
                                          autoFocus
                                          value={editingValue}
                                          onChange={(e) => setEditingValue(e.target.value)}
                                          onBlur={saveRename}                   // save on click-away
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") { e.preventDefault(); saveRename(); }
                                            if (e.key === "Escape") { e.preventDefault(); cancelRename(); }
                                          }}
                                          className="w-full h-7 px-9 text-xs rounded-md bg-muted/40 outline-none focus:ring-2 focus:ring-ai-primary"
                                          onFocus={(e) => e.currentTarget.select()} // highlight selection like your screenshot
                                        />
                                      ) : (
                                        <Button
                                          variant={isConvActive ? "secondary" : "ghost"}
                                          size="sm"
                                          className={`w-full justify-start h-7 px-9 text-xs pr-8 ${!isConvActive ? 'nav-item-hover' : ''}`}
                                          onClick={() => onConversationSelect(conversation.id)}
                                        >
                                          <span className="flex-1 text-left truncate">{conversation.label}</span>
                                        </Button>
                                      )}
                                      
                                      {/* Three dots menu (hide when editing) */}
                                      {!isEditing && (
                                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-0 nav-item-hover bg-transparent border-0 hover:bg-secondary"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              {mutating ? (
                                                <div className="h-3 w-3 animate-spin rounded-full border border-foreground border-t-transparent" />
                                              ) : (
                                                <MoreHorizontal className="h-3 w-3 text-foreground" />
                                              )}
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="w-48">

                                            <DropdownMenuItem
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                startRename(conversation.id, conversation.label);
                                              }}
                                            >
                                              <Edit className="mr-2 h-4 w-4" />
                                              Rename
                                            </DropdownMenuItem>
                                            <DropdownMenuSub>
                                              <DropdownMenuSubTrigger>
                                                <Folder className="mr-2 h-4 w-4" />
                                                Move to workspace
                                              </DropdownMenuSubTrigger>
                                              <DropdownMenuSubContent>
                                                {/* Add to chats option */}
                                                <DropdownMenuItem
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveConversationToWorkspace(conversation.id, null); // null means move to standalone/chats
                                                  }}
                                                >
                                                  <MessageCircle className="mr-2 h-4 w-4" />
                                                  Chats
                                                </DropdownMenuItem>
                                                {taskSpaces.filter(ws => ws.id !== taskSpace.id).map((workspace) => {
                                                  const WorkspaceIcon = workspace.icon;
                                                  return (
                                                    <DropdownMenuItem
                                                      key={workspace.id}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        moveConversationToWorkspace(conversation.id, workspace.id);
                                                      }}
                                                    >
                                                      <WorkspaceIcon className="mr-2 h-4 w-4" />
                                                      {workspace.label}
                                                    </DropdownMenuItem>
                                                  );
                                                })}
                                              </DropdownMenuSubContent>
                                            </DropdownMenuSub>
                                            <DropdownMenuSeparator />

                                            <DropdownMenuItem
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                
                                                // Check if this is the currently active conversation
                                                const isActiveConversation = activeConversationId === conversation.id;
                                                
                                                // If deleting the active conversation, navigate to new chat
                                                if (isActiveConversation) {
                                                  onViewChange("new-chat");
                                                }
                                                
                                                // Optimistic removal
                                                startTransition(() => {
                                                  setChatsData(prev => ({
                                                    ...prev,
                                                    conversations: prev.conversations.filter(c => c.id !== conversation.id)
                                                  }));
                                                  setTaskSpaces(prev => prev.map(space => ({
                                                    ...space,
                                                    conversations: space.conversations.filter(c => c.id !== conversation.id)
                                                  })));
                                                });

                                                try {
                                                  setMutating(true);
                                                  await db.conversations.delete(conversation.id);
                                                } catch (e) {
                                                  // re-sync from server on failure
                                                  await initLoad();
                                                } finally {
                                                  setMutating(false);
                                                }
                                              }}
                                              className="text-destructive focus:text-destructive"
                                            >
                                              <Trash2 className="mr-2 h-4 w-4" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    {/* Chats Section */}
                    <div className="space-y-1">
                      {(() => {
                        const ChatsIcon = chatsData.icon;
                        return (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-3 h-8 px-6 text-sm nav-item-hover"
                            onClick={() => chatsData.setExpanded(!chatsData.expanded)}
                          >
                            <ChatsIcon className="h-3 w-3 flex-shrink-0" />
                            <span className="flex-1 text-left">{chatsData.label}</span>
                            {chatsData.expanded ? (
                              <ChevronDown className="h-3 w-3 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-3 w-3 flex-shrink-0" />
                            )}
                          </Button>
                        );
                      })()}

                      {/* Chat Conversations */}
                      {chatsData.expanded && (
                        <div className="space-y-1">
                          {chatsData.conversations.map((conversation) => {
                            const isConvActive = currentView === "conversation" && conversation.id === activeConversationId;
                            const isEditing = editingId === conversation.id;
                            return (
                              <div key={conversation.id} className="relative group">
                                {isEditing ? (
                                  <input
                                    autoFocus
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    onBlur={saveRename}                   // save on click-away
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") { e.preventDefault(); saveRename(); }
                                      if (e.key === "Escape") { e.preventDefault(); cancelRename(); }
                                    }}
                                    className="w-full h-7 px-9 text-xs rounded-md bg-muted/40 outline-none focus:ring-2 focus:ring-ai-primary"
                                    onFocus={(e) => e.currentTarget.select()} // highlight selection like your screenshot
                                  />
                                ) : (
                                  <Button
                                    variant={isConvActive ? "secondary" : "ghost"}
                                    size="sm"
                                    className={`w-full justify-start h-7 px-9 text-xs pr-8 ${!isConvActive ? 'nav-item-hover' : ''}`}
                                    onClick={() => onConversationSelect(conversation.id)}
                                  >
                                    <span className="flex-1 text-left truncate">{conversation.label}</span>
                                  </Button>
                                )}
                                
                                {/* Three dots menu (hide when editing) */}
                                {!isEditing && (
                                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0 nav-item-hover bg-transparent border-0 hover:bg-secondary"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {mutating ? (
                                          <div className="h-3 w-3 animate-spin rounded-full border border-foreground border-t-transparent" />
                                        ) : (
                                          <MoreHorizontal className="h-3 w-3 text-foreground" />
                                        )}
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">

                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          startRename(conversation.id, conversation.label);
                                        }}
                                      >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Rename
                                      </DropdownMenuItem>
                                      <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                          <Folder className="mr-2 h-4 w-4" />
                                          Move to workspace
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                          {taskSpaces.map((workspace) => {
                                            const WorkspaceIcon = workspace.icon;
                                            return (
                                              <DropdownMenuItem
                                                key={workspace.id}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  moveConversationToWorkspace(conversation.id, workspace.id);
                                                }}
                                              >
                                                <WorkspaceIcon className="mr-2 h-4 w-4" />
                                                {workspace.label}
                                              </DropdownMenuItem>
                                            );
                                          })}
                                        </DropdownMenuSubContent>
                                      </DropdownMenuSub>
                                      <DropdownMenuSeparator />

                                      <DropdownMenuItem
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          
                                          // Check if this is the currently active conversation
                                          const isActiveConversation = activeConversationId === conversation.id;
                                          
                                          // If deleting the active conversation, navigate to new chat
                                          if (isActiveConversation) {
                                            onViewChange("new-chat");
                                          }
                                          
                                          // Optimistic removal
                                          startTransition(() => {
                                            setChatsData(prev => ({
                                              ...prev,
                                              conversations: prev.conversations.filter(c => c.id !== conversation.id)
                                            }));
                                            setTaskSpaces(prev => prev.map(space => ({
                                              ...space,
                                              conversations: space.conversations.filter(c => c.id !== conversation.id)
                                            })));
                                          });

                                          try {
                                            setMutating(true);
                                            await db.conversations.delete(conversation.id);
                                          } catch (e) {
                                            // re-sync from server on failure
                                            await initLoad();
                                          } finally {
                                            setMutating(false);
                                          }
                                        }}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          if (item.expandable && item.label === "Assignments") {
            return (
              <div key={item.label} className="space-y-1 my-3 p-2 rounded-lg bg-muted/30">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-9 px-3 nav-item-hover"
                  onClick={handleAssignmentsClick}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                  {assignmentsExpanded ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                </Button>

                {/* Expanded Assignments Menu */}
                {assignmentsExpanded && (
                  <div className="space-y-1">
                    <Button
                      variant={currentView === "live-assignments" ? "secondary" : "ghost"}
                      size="sm"
                      className={`w-full justify-start gap-3 h-8 px-6 text-sm ${currentView !== "live-assignments" ? 'nav-item-hover' : ''}`}
                      onClick={() => onViewChange("live-assignments")}
                    >
                      <ListChecks className="h-3 w-3 flex-shrink-0" />
                      <span className="flex-1 text-left">Live Assignments</span>
                    </Button>
                    <Button
                      variant={currentView === "assignment-archive" ? "secondary" : "ghost"}
                      size="sm"
                      className={`w-full justify-start gap-3 h-8 px-6 text-sm ${currentView !== "assignment-archive" ? 'nav-item-hover' : ''}`}
                      onClick={() => onViewChange("assignment-archive")}
                    >
                      <Archive className="h-3 w-3 flex-shrink-0" />
                      <span className="flex-1 text-left">Assignment Archive</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          }

          return (
            <Button
              key={item.label}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 h-9 px-3 ${!isActive ? 'nav-item-hover' : ''}`}
              onClick={() => onViewChange(item.view)}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 text-left text-sm">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs bg-ai-secondary-accessible glow-ai-primary flex-shrink-0">
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Secondary Navigation - Bottom Aligned */}
      <div className="p-3 space-y-1 border-t border-sidebar-border">
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          
          return (
            <Button
              key={item.label}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 h-9 px-3 ${!isActive ? 'nav-item-hover' : ''}`}
              onClick={() => onViewChange(item.view)}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 text-left text-sm">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}