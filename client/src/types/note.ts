export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_pinned?: boolean;
  is_favorite?: boolean;
  is_archived?: boolean;
  is_trashed?: boolean;
  tags?: string[];
}

export type NoteInput = {
  title: string;
  content: string;
  is_pinned?: boolean;
  is_favorite?: boolean;
  is_archived?: boolean;
  is_trashed?: boolean;
  tags?: string[];
};

export type DashboardView = 'all' | 'pinned' | 'favorites' | 'archived' | 'trash' | 'tag';
