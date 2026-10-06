import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PanelLeft,
  Trash2,
  Check,
  Plus,
  BookOpen,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { Note, NoteInput } from '../../types/note';
import { getWordCount } from '../../lib/utils';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useAuth } from '../../contexts/AuthContext';

interface JournalEditorProps {
  note: Note | null;
  onSave: (id: string, data: Partial<NoteInput>) => Promise<{ note?: Note; error?: string }>;
  onDelete: (id: string) => Promise<{ error?: string }>;
  onNewNote: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenProfileSettings?: () => void;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  note,
  onSave,
  onDelete,
  onNewNote,
  isSidebarOpen,
  onToggleSidebar,
  onOpenProfileSettings,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty' | 'error'>('saved');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // High-reliability ref tracking to eliminate stale closure overwrites
  const currentNoteIdRef = useRef<string | null>(null);
  const currentTitleRef = useRef<string>('');
  const currentContentRef = useRef<string>('');
  const isDirtyRef = useRef<boolean>(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Reliable flush-save function that validates onSave response
  const flushSave = useCallback(async () => {
    if (!currentNoteIdRef.current || !isDirtyRef.current) return;

    const targetId = currentNoteIdRef.current;
    const targetTitle = currentTitleRef.current;
    const targetContent = currentContentRef.current;

    // Reset dirty flag
    isDirtyRef.current = false;
    setSaveStatus('saving');

    try {
      const res = await onSave(targetId, {
        title: targetTitle,
        content: targetContent,
      });

      if (res && res.error) {
        console.error('Note auto-save returned error:', res.error);
        setSaveStatus('error');
        // Re-flag dirty on failure so user/retry can re-attempt
        isDirtyRef.current = true;
      } else {
        setSaveStatus('saved');
      }
    } catch (err) {
      console.error('Unexpected note save failure:', err);
      setSaveStatus('error');
      isDirtyRef.current = true;
    }
  }, [onSave]);

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      flushSave();
    }, 600);
  }, [flushSave]);

  // Synchronize and handle switching notes cleanly
  useEffect(() => {
    // If switching from another note and there are unsaved changes, flush save immediately!
    if (
      currentNoteIdRef.current &&
      currentNoteIdRef.current !== note?.id &&
      isDirtyRef.current
    ) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      const prevId = currentNoteIdRef.current;
      const prevTitle = currentTitleRef.current;
      const prevContent = currentContentRef.current;
      isDirtyRef.current = false;
      onSave(prevId, { title: prevTitle, content: prevContent });
    }

    if (note) {
      currentNoteIdRef.current = note.id;
      currentTitleRef.current = note.title || '';
      currentContentRef.current = note.content || '';
      isDirtyRef.current = false;

      setTitle(note.title || '');
      setContent(note.content || '');
      setSaveStatus('saved');

      // If newly opened empty note, immediately focus title input
      if (!note.title && !note.content) {
        const timer = setTimeout(() => {
          titleInputRef.current?.focus();
        }, 50);
        return () => clearTimeout(timer);
      }
    } else {
      currentNoteIdRef.current = null;
      currentTitleRef.current = '';
      currentContentRef.current = '';
      isDirtyRef.current = false;
      setTitle('');
      setContent('');
      setSaveStatus('saved');
    }
  }, [note?.id, onSave]);

  // Handle browser close or tab refresh without losing data
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentNoteIdRef.current && isDirtyRef.current) {
        onSave(currentNoteIdRef.current, {
          title: currentTitleRef.current,
          content: currentContentRef.current,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // On unmount flush any pending dirty work
      if (currentNoteIdRef.current && isDirtyRef.current) {
        onSave(currentNoteIdRef.current, {
          title: currentTitleRef.current,
          content: currentContentRef.current,
        });
      }
    };
  }, [onSave]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    currentTitleRef.current = val;
    isDirtyRef.current = true;
    setSaveStatus('dirty');
    scheduleAutoSave();
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    currentContentRef.current = val;
    isDirtyRef.current = true;
    setSaveStatus('dirty');
    scheduleAutoSave();
  };

  const handleDelete = async () => {
    if (!note) return;
    setIsDeleting(true);
    await onDelete(note.id);
    setIsDeleting(false);
    setShowDeleteModal(false);
  };

  // Keyboard shortcut Ctrl+S or Cmd+S to save immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        flushSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flushSave]);

  const wordCount = getWordCount(content);

  // If there is no active note, show clean journal empty state
  if (!note) {
    return (
      <main className="flex-1 flex flex-col h-screen bg-[#000000] select-none">
        <div className="w-full border-b border-[#141414] px-4 sm:px-8 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1.5 rounded-md text-[#777777] hover:text-[#FFFFFF] hover:bg-[#111111] transition-colors cursor-pointer"
            title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            <PanelLeft className="w-4 h-4" />
          </button>
          {onOpenProfileSettings && (
            <button
              type="button"
              onClick={onOpenProfileSettings}
              className="w-7 h-7 rounded-full bg-[#1A1A1A] border border-[#262626] text-[#FFFFFF] font-sans font-semibold text-xs flex items-center justify-center overflow-hidden hover:ring-1 hover:ring-[#444444] transition-all cursor-pointer"
              title="Profile Settings"
              aria-label="Profile Settings"
            >
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user?.user_metadata?.full_name || 'User'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                (user?.email?.[0] || 'W').toUpperCase()
              )}
            </button>
          )}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#0A0A0A] border border-[#1A1A1A] flex items-center justify-center text-[#A0A0A0] mx-auto mb-5">
              <BookOpen className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#FFFFFF] mb-2 tracking-tight">
              A blank page awaits.
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#777777] mb-8 leading-relaxed max-w-xs mx-auto">
              Clear your mind, capture an idea, or begin a daily journal entry.
            </p>
            <button
              type="button"
              onClick={onNewNote}
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-lg bg-[#FFFFFF] text-[#000000] hover:bg-[#EAEAEA] font-sans font-medium text-xs tracking-wide transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Begin Writing</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col h-screen bg-[#000000] overflow-y-auto">
      {/* 1. Header Toolbar (Quiet & Minimal) */}
      <div className="sticky top-0 z-10 w-full bg-[#000000]/80 backdrop-blur-md border-b border-[#141414] px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Toggle Sidebar Button */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1.5 rounded-md text-[#777777] hover:text-[#FFFFFF] hover:bg-[#111111] transition-colors cursor-pointer"
            title={isSidebarOpen ? 'Hide sidebar (Zen Mode)' : 'Show sidebar'}
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Auto-save Status */}
          <div className="text-xs font-sans flex items-center gap-1.5">
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-[#888888]">
                <Check className="w-3 h-3 text-[#A0A0A0]" /> Saved
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="text-[#A0A0A0] flex items-center gap-1 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin text-[#A0A0A0]" /> Saving...
              </span>
            )}
            {saveStatus === 'dirty' && (
              <span className="text-[#666666]">Editing...</span>
            )}
            {saveStatus === 'error' && (
              <button
                type="button"
                onClick={() => flushSave()}
                className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                title="Failed to save. Click to retry now."
              >
                <AlertCircle className="w-3 h-3" /> Save failed (retry)
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Word count */}
          <span className="text-xs font-sans text-[#666666]">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>

          {/* Delete current note */}
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="p-1.5 rounded-md text-[#666666] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Delete this note"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* User profile avatar button */}
          {onOpenProfileSettings && (
            <button
              type="button"
              onClick={onOpenProfileSettings}
              className="w-6 h-6 rounded-full bg-[#1A1A1A] border border-[#262626] text-[#FFFFFF] font-sans font-semibold text-[10px] flex items-center justify-center overflow-hidden hover:ring-1 hover:ring-[#444444] transition-all cursor-pointer ml-1"
              title="Profile Settings"
              aria-label="Profile Settings"
            >
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user?.user_metadata?.full_name || 'User'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                (user?.email?.[0] || 'W').toUpperCase()
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. Focused Writing Paper Canvas (Centered & Journal-like) */}
      <div className="flex-1 w-full max-w-2xl lg:max-w-3xl mx-auto px-6 sm:px-12 pt-10 sm:pt-16 pb-24 flex flex-col">
        {/* Title Field (Playfair Display) */}
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={handleTitleChange}
          onBlur={() => {
            if (isDirtyRef.current) {
              if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
              flushSave();
            }
          }}
          placeholder="Untitled"
          className="journal-editor-title w-full text-3xl sm:text-4xl text-[#FFFFFF] placeholder:text-[#333333] bg-transparent border-none focus:outline-none mb-6 pb-2"
        />

        {/* Body Writing Field (Playfair Display, line-height 1.85, large comfortable text) */}
        <textarea
          ref={contentTextareaRef}
          value={content}
          onChange={handleContentChange}
          onBlur={() => {
            if (isDirtyRef.current) {
              if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
              flushSave();
            }
          }}
          placeholder="Write your thoughts..."
          className="journal-editor-body flex-1 w-full bg-transparent border-none focus:outline-none resize-none min-h-[500px]"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        noteTitle={title}
        loading={isDeleting}
      />
    </main>
  );
};
