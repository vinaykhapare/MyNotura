import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { Note, NoteInput } from '../types/note';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface NotesContextType {
  notes: Note[];
  filteredNotes: Note[];
  activeNote: Note | null;
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchNotes: () => Promise<void>;
  createNote: (initialData?: Partial<NoteInput>) => Promise<{ note?: Note; error?: string }>;
  updateNote: (id: string, input: Partial<NoteInput>) => Promise<{ note?: Note; error?: string }>;
  deleteNote: (id: string) => Promise<{ error?: string }>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const JOURNAL_STORAGE_KEY = 'mynotura_digital_journal_v3';

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getInitialJournalNotes(userId: string = 'demo-user-id-0001'): Note[] {
  return [
    {
      id: generateUUID(),
      user_id: userId,
      title: 'Morning Reflections on Simplicity',
      content: `There is a quiet power in having a dedicated space solely for thinking. In a world crowded with notifications, sidebars, and feature bloat, true luxury is empty space.

When the tools disappear, what remains is the clarity of the mind. Today's goal is not to do more, but to remove everything that doesn't matter.

Write simply. Speak clearly. Let the thoughts breathe.`,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: generateUUID(),
      user_id: userId,
      title: 'The Craft of Quiet Work',
      content: `The finest work often happens in silence, without fanfare or rush. It is shaped by patience, careful observation, and a willingness to sit with an idea until it reveals its true shape.

When we strip away formatting toolbars and complex systems, the page becomes a mirror of our raw thoughts.

A good notebook does not demand management. It simply waits for words.`,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      id: generateUUID(),
      user_id: userId,
      title: 'Books on Attention and Solitude',
      content: `Looking through my bookshelf this evening. The titles that stand out are the ones that taught me how to pay attention.

The Creative Act by Rick Rubin.
Letters to a Young Poet by Rainer Maria Rilke.
Walden by Henry David Thoreau.

Words that remind us that creation is an act of listening.`,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    },
  ];
}

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemoUser } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getStorageKey = useCallback((userId?: string) => {
    return userId ? `${JOURNAL_STORAGE_KEY}_${userId}` : JOURNAL_STORAGE_KEY;
  }, []);

  const saveLocalNotes = useCallback((updatedList: Note[], targetUserId?: string) => {
    setNotes(updatedList);
    const key = getStorageKey(targetUserId || user?.id);
    try {
      localStorage.setItem(key, JSON.stringify(updatedList));
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [getStorageKey, user?.id]);

  const fetchNotes = useCallback(async () => {
    if (!user) {
      setNotes([]);
      setActiveNoteId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const userKey = getStorageKey(user.id);
    let localList: Note[] = [];

    // Step A: Read local notes immediately (0ms delay)
    try {
      const raw = localStorage.getItem(userKey) || localStorage.getItem(JOURNAL_STORAGE_KEY);
      if (raw) {
        localList = JSON.parse(raw);
        setNotes(localList);
        if (localList.length > 0) {
          setActiveNoteId((curr) => curr || localList[0].id);
        }
      } else {
        const seeded = getInitialJournalNotes(user.id);
        localStorage.setItem(userKey, JSON.stringify(seeded));
        localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(seeded));
        localList = seeded;
        setNotes(localList);
        setActiveNoteId((curr) => curr || localList[0].id);
      }
    } catch (e) {
      console.error('Failed reading local notes:', e);
    }

    if (isDemoUser || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Step B: If Supabase authenticated, fetch and merge with local notes
    try {
      const { data, error: fetchErr } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      const remoteNotes = (data as Note[]) || [];

      // Merge remote and local notes (preserves local edits if newer)
      const mergedMap = new Map<string, Note>();
      for (const remote of remoteNotes) {
        mergedMap.set(remote.id, remote);
      }
      for (const local of localList) {
        const existingRemote = mergedMap.get(local.id);
        if (!existingRemote) {
          mergedMap.set(local.id, local);
        } else if (new Date(local.updated_at).getTime() > new Date(existingRemote.updated_at).getTime()) {
          mergedMap.set(local.id, local);
        }
      }

      const mergedList = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      setNotes(mergedList);
      if (mergedList.length > 0) {
        setActiveNoteId((curr) => curr || mergedList[0].id);
      }
      saveLocalNotes(mergedList, user.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to sync with Supabase.';
      console.warn('Supabase notes sync issue, using local journal:', err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [user, isDemoUser, getStorageKey, saveLocalNotes]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = async (initialData?: Partial<NoteInput>): Promise<{ note?: Note; error?: string }> => {
    const userId = user?.id || 'local-writer';
    const title = initialData?.title ?? '';
    const content = initialData?.content ?? '';
    const nowIso = new Date().toISOString();
    const noteId = generateUUID();

    const newNote: Note = {
      id: noteId,
      user_id: userId,
      title,
      content,
      created_at: nowIso,
      updated_at: nowIso,
    };

    // 1. Immediately persist locally so note is ready in 0ms
    setNotes((prev) => {
      const next = [newNote, ...prev.filter((n) => n.id !== noteId)];
      saveLocalNotes(next);
      return next;
    });
    setActiveNoteId(newNote.id);

    // 2. If demo mode or Supabase unconfigured, complete!
    if (isDemoUser || !isSupabaseConfigured || !user) {
      return { note: newNote };
    }

    // 3. Persist to Supabase
    try {
      const { data, error: insertErr } = await supabase
        .from('notes')
        .insert([
          {
            id: newNote.id,
            user_id: user.id,
            title: newNote.title,
            content: newNote.content,
          },
        ])
        .select()
        .single();

      if (insertErr) {
        console.warn('Supabase insert note notice (preserved locally):', insertErr.message);
        return { note: newNote };
      }

      const confirmed = data as Note;
      setNotes((prev) => {
        const next = [confirmed, ...prev.filter((n) => n.id !== confirmed.id)];
        saveLocalNotes(next);
        return next;
      });
      setActiveNoteId(confirmed.id);
      return { note: confirmed };
    } catch (err: unknown) {
      console.warn('Unexpected error creating note in Supabase (preserved locally):', err);
      return { note: newNote };
    }
  };

  const updateNote = async (id: string, input: Partial<NoteInput>): Promise<{ note?: Note; error?: string }> => {
    if (!id) return { error: 'Invalid note id' };

    const nowIso = new Date().toISOString();
    let updatedNote: Note | null = null;
    let nextList: Note[] = [];

    // 1. Instantly update in-memory state and localStorage (optimistic update)
    setNotes((prev) => {
      const idx = prev.findIndex((n) => n.id === id);
      if (idx === -1) {
        updatedNote = {
          id,
          user_id: user?.id || 'local-writer',
          title: input.title ?? '',
          content: input.content ?? '',
          created_at: nowIso,
          updated_at: nowIso,
          ...input,
        };
        nextList = [updatedNote, ...prev];
      } else {
        const existing = prev[idx];
        updatedNote = {
          ...existing,
          ...input,
          updated_at: nowIso,
        };
        nextList = [...prev];
        nextList[idx] = updatedNote;
      }

      nextList.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      saveLocalNotes(nextList);
      return nextList;
    });

    // 2. If in Demo mode or Supabase not configured, local persistence is complete
    if (isDemoUser || !isSupabaseConfigured || !user) {
      return { note: updatedNote || undefined };
    }

    // 3. Persist to Supabase
    try {
      const titleToSave = input.title !== undefined ? input.title : (updatedNote as any)?.title || '';
      const contentToSave = input.content !== undefined ? input.content : (updatedNote as any)?.content || '';

      let targetId = id;
      if (!isValidUUID(targetId)) {
        targetId = generateUUID();
      }

      // First attempt: Update existing record for this user
      const { data: updateData, error: updateErr } = await supabase
        .from('notes')
        .update({
          title: titleToSave,
          content: contentToSave,
          updated_at: nowIso,
        })
        .eq('id', targetId)
        .eq('user_id', user.id)
        .select()
        .maybeSingle();

      if (updateErr) {
        console.warn('Supabase update note warning, preserved locally:', updateErr.message);
        return { note: updatedNote || undefined, error: updateErr.message };
      }

      // If the row existed and was updated, we are done!
      if (updateData) {
        const serverNote = updateData as Note;
        setNotes((prev) => {
          const list = [serverNote, ...prev.filter((n) => n.id !== id && n.id !== targetId)].sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
          saveLocalNotes(list);
          return list;
        });
        if (targetId !== id) {
          setActiveNoteId(serverNote.id);
        }
        return { note: serverNote };
      }

      // If no row was updated (e.g. note not yet in Supabase for this user), insert it
      const { data: insertData, error: insertErr } = await supabase
        .from('notes')
        .insert([
          {
            id: targetId,
            user_id: user.id,
            title: titleToSave,
            content: contentToSave,
            updated_at: nowIso,
          },
        ])
        .select()
        .maybeSingle();

      if (insertErr) {
        // If unique violation on targetId (e.g. initial demo note ID collided with another user), retry with fresh UUID
        if (insertErr.code === '23505' || insertErr.message?.includes('duplicate key')) {
          const freshId = generateUUID();
          const { data: retryData, error: retryErr } = await supabase
            .from('notes')
            .insert([
              {
                id: freshId,
                user_id: user.id,
                title: titleToSave,
                content: contentToSave,
                updated_at: nowIso,
              },
            ])
            .select()
            .single();

          if (retryErr) {
            console.warn('Supabase retry insert note warning, preserved locally:', retryErr.message);
            return { note: updatedNote || undefined, error: retryErr.message };
          }

          const serverNote = retryData as Note;
          setNotes((prev) => {
            const list = [serverNote, ...prev.filter((n) => n.id !== id && n.id !== freshId)].sort(
              (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            );
            saveLocalNotes(list);
            return list;
          });
          setActiveNoteId(serverNote.id);
          return { note: serverNote };
        }

        console.warn('Supabase insert note warning, preserved locally:', insertErr.message);
        return { note: updatedNote || undefined, error: insertErr.message };
      }

      if (insertData) {
        const serverNote = insertData as Note;
        setNotes((prev) => {
          const list = [serverNote, ...prev.filter((n) => n.id !== id && n.id !== targetId)].sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
          saveLocalNotes(list);
          return list;
        });
        if (targetId !== id) {
          setActiveNoteId(serverNote.id);
        }
        return { note: serverNote };
      }

      return { note: updatedNote || undefined };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update note';
      console.warn('Unexpected error updating note in Supabase (preserved locally):', err);
      return { note: updatedNote || undefined, error: msg };
    }
  };

  const deleteNote = async (id: string): Promise<{ error?: string }> => {
    if (!id) return { error: 'Invalid note id' };

    let nextNotes: Note[] = [];
    setNotes((prev) => {
      nextNotes = prev.filter((n) => n.id !== id);
      saveLocalNotes(nextNotes);
      return nextNotes;
    });

    if (activeNoteId === id) {
      setActiveNoteId(nextNotes[0]?.id || null);
    }

    if (isDemoUser || !isSupabaseConfigured || !user) {
      return {};
    }

    try {
      if (isValidUUID(id)) {
        const { error: delErr } = await supabase
          .from('notes')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (delErr) {
          console.warn('Supabase delete error (deleted locally):', delErr.message);
        }
      }
      return {};
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete note.';
      return { error: msg };
    }
  };

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase().trim();
    return notes.filter(
      (note) =>
        (note.title || '').toLowerCase().includes(q) ||
        (note.content || '').toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  const activeNote = useMemo(() => {
    if (!activeNoteId) return null;
    return notes.find((n) => n.id === activeNoteId) || null;
  }, [notes, activeNoteId]);

  return (
    <NotesContext.Provider
      value={{
        notes,
        filteredNotes,
        activeNote,
        activeNoteId,
        setActiveNoteId,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        fetchNotes,
        createNote,
        updateNote,
        deleteNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
