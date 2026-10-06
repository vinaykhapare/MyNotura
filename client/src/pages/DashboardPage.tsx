import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { JournalEditor } from '../components/dashboard/JournalEditor';
import { DeleteConfirmModal } from '../components/dashboard/DeleteConfirmModal';
import { ProfileSettingsModal } from '../components/profile/ProfileSettingsModal';
import { Toast, type ToastType } from '../components/ui/Toast';
import { EnvNoticeBanner } from '../components/ui/EnvNoticeBanner';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';

export const DashboardPage: React.FC = () => {
  const { isDemoUser } = useAuth();
  const {
    activeNote,
    setActiveNoteId,
    setSearchQuery,
    createNote,
    updateNote,
    deleteNote,
  } = useNotes();

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return localStorage.getItem('mynotura_sidebar_open') !== 'false';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; noteId: string; noteTitle: string }>({
    isOpen: false,
    noteId: '',
    noteTitle: '',
  });
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleOpenProfileSettings = () => {
    if (isDemoUser) {
      showToast('Profile editing is disabled in Demo Mode', 'info');
    }
    setProfileModalOpen(true);
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      const next = !sidebarOpen;
      setSidebarOpen(next);
      localStorage.setItem('mynotura_sidebar_open', String(next));
    }
  };

  // Keyboard shortcut Ctrl+\ or Cmd+\ to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        handleToggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  const handleNewNote = async () => {
    setSearchQuery('');
    const res = await createNote({
      title: '',
      content: '',
    });
    if (res.note) {
      setActiveNoteId(res.note.id);
      showToast('New entry created');
    }
  };

  const handlePromptDeleteFromSidebar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModalState({
      isOpen: true,
      noteId: id,
      noteTitle: '',
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.noteId) return;
    const res = await deleteNote(deleteModalState.noteId);
    setDeleteModalState({ isOpen: false, noteId: '', noteTitle: '' });
    if (!res.error) {
      showToast('Entry deleted', 'info');
    } else {
      showToast(res.error, 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-[#FFFFFF]">
      <EnvNoticeBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Collapsible Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={handleToggleSidebar}
          onNewNote={handleNewNote}
          onDeleteNote={handlePromptDeleteFromSidebar}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onOpenProfileSettings={handleOpenProfileSettings}
        />

        {/* Focused Journal Writing Canvas */}
        <JournalEditor
          note={activeNote}
          onSave={updateNote}
          onDelete={async (id) => {
            const res = await deleteNote(id);
            if (!res.error) showToast('Entry deleted', 'info');
            return res;
          }}
          onNewNote={handleNewNote}
          isSidebarOpen={sidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          onOpenProfileSettings={handleOpenProfileSettings}
        />
      </div>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSuccessToast={(msg) => showToast(msg, 'success')}
      />

      {/* Confirmation Modal when deleting from sidebar */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, noteId: '', noteTitle: '' })}
        onConfirm={handleConfirmDelete}
        noteTitle={deleteModalState.noteTitle}
      />

      {/* Toast Feedback */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
