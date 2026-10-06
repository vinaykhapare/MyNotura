import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Plus,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  BookOpen,
  Settings,
  FileText,
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { useNotes } from '../../contexts/NotesContext';
import { Logo } from '../brand/Logo';
import { AppIcon } from '../brand/AppIcon';
import { formatDate } from '../../lib/utils';
import type { Note } from '../../types/note';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewNote: () => void;
  onDeleteNote: (id: string, e: React.MouseEvent) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenProfileSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  onNewNote,
  onDeleteNote,
  isMobileOpen,
  onCloseMobile,
  onOpenProfileSettings,
}) => {
  const { user, signOut, isDemoUser } = useAuth();
  const navigate = useNavigate();
  const {
    filteredNotes,
    activeNoteId,
    setActiveNoteId,
    searchQuery,
    setSearchQuery,
  } = useNotes();

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const userEmail = user?.email || 'Writer';
  const userInitial = (userEmail[0] || 'W').toUpperCase();

  const handleSelectNote = (note: Note) => {
    setActiveNoteId(note.id);
    onCloseMobile();
  };

  const expandedContent = (
    <div className="flex flex-col h-full bg-[#0A0A0A] border-r border-[#1A1A1A] select-none text-[#FFFFFF]">
      {/* 1. Header: Brand + Collapse */}
      <div className="p-4 pb-3 flex items-center justify-between border-b border-[#141414]">
        <div className="flex items-center gap-2 overflow-hidden">
          <Logo iconSize={28} showWordmark={true} />
          {isDemoUser && (
            <span className="text-[10px] font-sans font-medium px-1.5 py-0.5 rounded bg-[#161616] text-[#888888] border border-[#222222]">
              Local
            </span>
          )}
        </div>

        {/* Desktop Collapse Button */}
        <button
          type="button"
          onClick={onToggle}
          className="hidden md:flex p-1.5 rounded-md text-[#666666] hover:text-[#FFFFFF] hover:bg-[#141414] transition-colors cursor-pointer"
          title="Collapse sidebar (Ctrl+\)"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-md text-[#666666] hover:text-[#FFFFFF] hover:bg-[#141414] transition-colors cursor-pointer"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Action: New Note Button */}
      <div className="p-3 pb-2">
        <button
          type="button"
          onClick={() => {
            onNewNote();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#FFFFFF] text-[#000000] hover:bg-[#ECECEC] active:bg-[#DCDCDC] font-sans font-medium text-xs tracking-wide transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Entry</span>
        </button>
      </div>

      {/* 3. Search Field */}
      <div className="px-3 py-1.5">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-[#555555] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full bg-[#111111] border border-[#1A1A1A] text-xs font-sans text-[#FFFFFF] placeholder:text-[#555555] rounded-md pl-8 pr-7 py-2 focus:outline-none focus:border-[#333333] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 p-0.5 text-[#555555] hover:text-[#FFFFFF] rounded"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Notes List Header & Items */}
      <div className="flex-1 overflow-y-auto px-2 py-2 mt-1 space-y-1">
        <div className="px-2 pb-1.5 pt-1 text-[10px] font-sans font-medium tracking-wider text-[#555555] uppercase">
          Recent Entries ({filteredNotes.length})
        </div>

        {filteredNotes.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <BookOpen className="w-5 h-5 text-[#333333] mx-auto mb-2" />
            <p className="text-xs font-sans text-[#666666]">
              {searchQuery ? 'No matching notes found.' : 'No notes yet.'}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isActive = note.id === activeNoteId;
            const snippet = note.content
              ? note.content.replace(/\n+/g, ' ').slice(0, 75)
              : 'Empty entry';

            return (
              <div
                key={note.id}
                onClick={() => handleSelectNote(note)}
                className={`group relative flex flex-col p-2.5 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#141414] text-[#FFFFFF] border border-[#222222]'
                    : 'text-[#A0A0A0] hover:bg-[#101010] hover:text-[#FFFFFF] border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-serif text-sm font-semibold text-[#FFFFFF] line-clamp-1 leading-snug">
                    {note.title || 'Untitled Entry'}
                  </h4>

                  {/* Delete button (visible on hover) */}
                  <button
                    type="button"
                    onClick={(e) => onDeleteNote(note.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 -mr-1 -mt-0.5 rounded text-[#555555] hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="font-serif text-xs text-[#777777] line-clamp-1 mt-1 leading-normal">
                  {snippet}
                </p>

                <span className="font-sans text-[10px] text-[#444444] mt-1.5">
                  {formatDate(note.updated_at)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* 5. User Profile Footer */}
      <div className="p-3 border-t border-[#141414] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onOpenProfileSettings}
          className="flex items-center gap-2.5 min-w-0 text-left flex-1 p-1 -m-1 rounded-md hover:bg-[#111111] transition-colors cursor-pointer group"
          title={isDemoUser ? 'Profile (Read-only in Demo Mode)' : 'Edit profile & photo'}
        >
          <div className="w-7 h-7 rounded-full bg-[#1A1A1A] border border-[#262626] text-[#FFFFFF] font-sans font-semibold text-xs flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-transparent group-hover:ring-[#333333] transition-all">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt={user?.user_metadata?.full_name || userEmail}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              userInitial
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-sans text-xs text-[#EAEAEA] truncate font-medium group-hover:text-white transition-colors">
              {user?.user_metadata?.full_name || (user?.user_metadata?.username ? `@${user.user_metadata.username}` : userEmail.split('@')[0])}
            </p>
            <p className="font-sans text-[10px] text-[#555555] truncate group-hover:text-[#777777] transition-colors" title={userEmail}>
              {user?.user_metadata?.username ? `@${user.user_metadata.username}` : userEmail}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-0.5 shrink-0">
          {onOpenProfileSettings && (
            <button
              type="button"
              onClick={onOpenProfileSettings}
              className="p-1.5 rounded-md text-[#555555] hover:text-[#FFFFFF] hover:bg-[#141414] transition-colors cursor-pointer"
              title={isDemoUser ? 'Profile Settings (Disabled in Demo Mode)' : 'Profile Settings'}
              aria-label="Profile Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="p-1.5 rounded-md text-[#555555] hover:text-red-400 hover:bg-[#141414] transition-colors cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  const slimContent = (
    <div className="flex flex-col h-full bg-[#0A0A0A] border-r border-[#1A1A1A] select-none text-[#FFFFFF] items-center py-3">
      {/* 1. Slim Header: App Icon & Expand Toggle */}
      <div className="flex flex-col items-center gap-2 pb-3 border-b border-[#141414] w-full px-2">
        <button
          type="button"
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-[#141414] transition-colors cursor-pointer"
          title="Expand sidebar (Ctrl+\)"
          aria-label="Expand sidebar"
        >
          <AppIcon size={26} />
        </button>

        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 rounded-md text-[#666666] hover:text-[#FFFFFF] hover:bg-[#141414] transition-colors cursor-pointer"
          title="Expand sidebar (Ctrl+\)"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Slim Action: New Note Button */}
      <div className="p-2 w-full flex justify-center">
        <button
          type="button"
          onClick={onNewNote}
          className="w-10 h-10 rounded-lg bg-[#FFFFFF] text-[#000000] hover:bg-[#ECECEC] active:bg-[#DCDCDC] flex items-center justify-center transition-all shadow-sm cursor-pointer"
          title="New Entry"
          aria-label="New Entry"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* 3. Slim Search Button */}
      <div className="px-2 pb-2 w-full flex justify-center">
        <button
          type="button"
          onClick={onToggle}
          className="w-10 h-10 rounded-lg text-[#666666] hover:text-[#FFFFFF] hover:bg-[#141414] flex items-center justify-center transition-colors cursor-pointer"
          title="Search entries (expand sidebar)"
          aria-label="Search entries"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Slim Notes List: Icon items with active indicator */}
      <div className="flex-1 overflow-y-auto px-2 py-1 w-full space-y-1.5 flex flex-col items-center">
        {filteredNotes.slice(0, 8).map((note) => {
          const isActive = note.id === activeNoteId;
          const noteTitle = note.title || 'Untitled Entry';

          return (
            <button
              key={note.id}
              type="button"
              onClick={() => handleSelectNote(note)}
              title={noteTitle}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
                isActive
                  ? 'bg-[#181818] text-[#FFFFFF] border border-[#2E2E2E]'
                  : 'text-[#666666] hover:text-[#FFFFFF] hover:bg-[#121212]'
              }`}
            >
              <FileText className="w-4 h-4" />
              {isActive && (
                <span className="absolute -left-1 w-1 h-3.5 bg-white rounded-r-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* 5. Slim User Footer */}
      <div className="pt-2 border-t border-[#141414] w-full flex flex-col items-center gap-1.5 px-2">
        {/* Avatar */}
        <button
          type="button"
          onClick={onOpenProfileSettings}
          className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#262626] text-[#FFFFFF] font-sans font-semibold text-xs flex items-center justify-center overflow-hidden hover:ring-1 hover:ring-[#444444] transition-all cursor-pointer"
          title="Profile Settings"
          aria-label="Profile Settings"
        >
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt={user?.user_metadata?.full_name || userEmail}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            userInitial
          )}
        </button>

        {/* Settings button */}
        {onOpenProfileSettings && (
          <button
            type="button"
            onClick={onOpenProfileSettings}
            className="p-2 rounded-md text-[#555555] hover:text-[#FFFFFF] hover:bg-[#141414] transition-colors cursor-pointer"
            title={isDemoUser ? 'Profile Settings (Disabled in Demo Mode)' : 'Profile Settings'}
            aria-label="Profile Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Sign out button */}
        <button
          type="button"
          onClick={handleSignOut}
          className="p-2 rounded-md text-[#555555] hover:text-red-400 hover:bg-[#141414] transition-colors cursor-pointer"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar with smooth width transition */}
      <aside
        className={`hidden md:block shrink-0 h-screen transition-[width] duration-300 ease-in-out ${
          isOpen ? 'w-72' : 'w-16'
        } overflow-hidden`}
      >
        <div className={`h-full ${isOpen ? 'w-72' : 'w-16'} transition-[width] duration-300 ease-in-out`}>
          {isOpen ? expandedContent : slimContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-80 bg-[#0A0A0A] shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {expandedContent}
          </div>
        </div>
      )}
    </>
  );
};
