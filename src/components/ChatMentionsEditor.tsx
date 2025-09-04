import { forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import tippy from 'tippy.js';
import { Crown, Wrench, Monitor } from 'lucide-react';

// Available agents for mentions
const AGENTS = [
  { 
    id: 'devops-supervisor', 
    label: 'DevOps Supervisor',
    icon: Crown,
    color: 'text-ai-energy'
  },
  { 
    id: 'network-troubleshooting', 
    label: 'Network Troubleshooting',
    icon: Wrench,
    color: 'text-ai-secondary'
  },
  { 
    id: 'network-cost-management', 
    label: 'Network Cost Management',
    icon: Monitor,
    color: 'text-ai-accent'
  },
];

// Suggestion system for the mentions dropdown
const suggestion = {
  items: ({ query }: { query: string }) =>
    AGENTS.filter(a => 
      a.label.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5),
    
  render: () => {
    let popup: any, ul: HTMLUListElement;
    let selectedIndex = 0;

    return {
      onStart: (props: any) => {
        selectedIndex = 0;
        ul = document.createElement('ul');
        ul.className = 'rounded-md border bg-card shadow-lg p-1 text-sm max-w-xs z-50';
        ul.style.backgroundColor = 'var(--card)';
        ul.style.borderColor = 'var(--border)';
        ul.style.color = 'var(--card-foreground)';
        
        const updateList = () => {
          ul.innerHTML = '';
          props.items.forEach((item: any, i: number) => {
            const li = document.createElement('li');
            li.className = `px-3 py-2 rounded cursor-pointer flex items-center gap-2 transition-colors ${
              i === selectedIndex ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
            }`;
            
            // Create icon element
            const iconSpan = document.createElement('span');
            iconSpan.className = `h-4 w-4 ${item.color}`;
            const AgentIcon = item.icon;
            iconSpan.innerHTML = `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${getIconPath(item.icon)}"/></svg>`;
            
            const textSpan = document.createElement('span');
            textSpan.textContent = item.label;
            
            li.appendChild(iconSpan);
            li.appendChild(textSpan);
            
            li.addEventListener('mousedown', e => { 
              e.preventDefault(); 
              props.command(item);
              props.hide(); // ✅ tell TipTap to close the menu
            });
            
            li.addEventListener('mouseenter', () => {
              selectedIndex = i;
              updateList();
            });
            
            ul.appendChild(li);
          });
        };

        updateList();
        
        popup = tippy('body', { 
          getReferenceClientRect: props.clientRect, 
          content: ul, 
          showOnCreate: true, 
          interactive: true, 
          trigger: 'manual', 
          placement: 'bottom-start',
          appendTo: document.body,
          zIndex: 9999
        });
      },
      
      onUpdate: (props: any) => {
        if (ul) {
          ul.innerHTML = '';
          props.items.forEach((item: any, i: number) => {
            const li = document.createElement('li');
            li.className = `px-3 py-2 rounded cursor-pointer flex items-center gap-2 transition-colors ${
              i === selectedIndex ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
            }`;
            
            const iconSpan = document.createElement('span');
            iconSpan.className = `h-4 w-4 ${item.color}`;
            iconSpan.innerHTML = `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${getIconPath(item.icon)}"/></svg>`;
            
            const textSpan = document.createElement('span');
            textSpan.textContent = item.label;
            
            li.appendChild(iconSpan);
            li.appendChild(textSpan);
            
            li.addEventListener('mousedown', e => { 
              e.preventDefault(); 
              props.command(item);
              props.hide(); // ✅ tell TipTap to close the menu
            });
            
            ul.appendChild(li);
          });
        }
        
        if (popup) {
          popup.setProps({
            getReferenceClientRect: props.clientRect,
          });
        }
      },
      
      onKeyDown: (props: any) => {
        if (props.event.key === 'ArrowUp') {
          selectedIndex = Math.max(0, selectedIndex - 1);
          return true;
        }
        
        if (props.event.key === 'ArrowDown') {
          selectedIndex = Math.min(props.items.length - 1, selectedIndex + 1);
          return true;
        }
        
        if (props.event.key === 'Enter') {
          const selectedItem = props.items[selectedIndex];
          if (selectedItem) {
            props.command(selectedItem);
            props.hide(); // ✅ tell TipTap to close the menu
          }
          return true;
        }
        
        return false;
      },
      
      onExit: () => {
        if (popup) {
          popup.destroy();
        }
      },
    };
  },
};

// Helper function to get SVG paths for icons
const getIconPath = (IconComponent: any) => {
  if (IconComponent === Crown) {
    return "M2 12h20M12 2l3 7h-6l3-7zM6 9l2-4 2 4M18 9l-2-4-2 4";
  } else if (IconComponent === Wrench) {
    return "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z";
  } else if (IconComponent === Monitor) {
    return "M7 17h10l2-2V5H5v10l2 2zm9-6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z M7 22h10M12 17v5";
  }
  return "";
};

// Custom mention extension with proper styling
const MentionBubble = Mention.extend({
  renderHTML({ node }) {
    return [
      'span', 
      { 
        class: 'mention px-1.5 py-0.5 rounded-md bg-ai-primary/10 text-ai-primary font-medium border border-ai-primary/20 hover:bg-ai-primary/20 transition-colors',
        'data-mention-id': node.attrs.id,
        'data-mention-label': node.attrs.label
      }, 
      `@${node.attrs.label}`
    ];
  },
}).configure({
  HTMLAttributes: { 
    class: 'mention' 
  },
  suggestion,
  renderText({ options, node }) {
    return `@${node.attrs.label}`;
  },
});

export type ChatMentionsEditorHandle = {
  submit: () => void;
  focusEnd: () => void;
};

interface ChatMentionsEditorProps {
  placeholder?: string;
  onSend: (payload: { text: string; mentions: Array<{ id: string; label: string; start: number; end: number }> }) => void;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export const ChatMentionsEditor = forwardRef<ChatMentionsEditorHandle, ChatMentionsEditorProps>(
  ({ placeholder = "Type a message...", onSend, value, onValueChange, className }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ 
        history: false,
        paragraph: {
          HTMLAttributes: {
            class: 'text-sm leading-relaxed m-0'
          }
        }
      }), 
      MentionBubble,
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        includeChildren: true,
      })
    ],
    editorProps: { 
      attributes: { 
        class: [
          // keep ProseMirror class
          'ProseMirror w-full outline-none',
          // vertically centre text visually
          'leading-6 py-1.5',            // 24px line-height + 6px top/bottom
        ].join(' ')
      }
    },
    content: value || '',
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      if (onValueChange) {
        onValueChange(text);
      }
    },
  });

  const submit = () => {
    if (!editor) return;
    
    const json = editor.getJSON();
    const plainText = editor.getText().trim();
    
    if (!plainText) return;

    // Extract mentions with positions
    const mentions: Array<{ id: string; label: string; start: number; end: number }> = [];
    let offset = 0;

    const walk = (node: any) => {
      if (!node) return;
      
      if (node.type === 'text') {
        offset += node.text.length;
      } else if (node.type === 'mention') {
        const start = offset;
        const label = node.attrs.label;
        const id = node.attrs.id || AGENTS.find(a => a.label === label)?.id || label;
        const token = `@${label}`;
        offset += token.length;
        mentions.push({ id, label, start, end: start + token.length });
      }
      
      if (node.content) {
        node.content.forEach(walk);
      }
    };

    walk(json);

    // Send the payload with text and mentions
    onSend({ text: plainText, mentions });
    
    // Clear the editor
    editor.commands.clearContent();
  };

  useImperativeHandle(ref, () => ({
    submit,
    focusEnd: () => editor?.commands.focus('end'),
  }));

  // Submit on Enter (but still respect the suggestions popup)
  const onKeyDown: React.KeyboardEventHandler = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="masked-editor flex-1 flex items-center min-h-10 text-left">
      {editor && (
        <EditorContent 
          editor={editor} 
          className={`w-full text-left ${className || ''}`}
          onKeyDown={onKeyDown}
        />
      )}
    </div>
  );
});