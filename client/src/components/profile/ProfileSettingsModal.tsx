import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  AtSign,
  AlignLeft,
  Upload,
  Trash2,
  Loader2,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Lock,
  KeyRound,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const { user, isDemoUser, updateProfile, uploadAvatar } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(false);

  // Password change states
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prefill form with current user metadata when opened
  useEffect(() => {
    if (isOpen && user) {
      setFullName(user.user_metadata?.full_name || '');
      setUsername(user.user_metadata?.username || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
      setBio(user.user_metadata?.bio || '');
      setError(null);
      setSuccess(null);
      setImageLoadError(false);
      setIsUrlMode(false);
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordSection(false);
    }
  }, [isOpen, user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setUploading(true);

    if (isDemoUser) {
      setError('Profile photo upload is disabled in Demo Mode.');
      return;
    }

    try {
      const { url, error: uploadErr } = await uploadAvatar(file);
      if (uploadErr) {
        setError(uploadErr);
      } else if (url) {
        setAvatarUrl(url);
        setImageLoadError(false);
        setSuccess('Photo uploaded. Click Save Changes to preserve your profile.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo.');
    } finally {
      setUploading(false);
      // Reset input value so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    if (isDemoUser) {
      setError('Profile editing is disabled in Demo Mode.');
      return;
    }
    setAvatarUrl('');
    setImageLoadError(false);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Enforce Demo user restriction
    if (isDemoUser) {
      setError('Profile editing is disabled in Demo Mode.');
      return;
    }

    // Validation
    if (username.trim()) {
      const usernameClean = username.trim().toLowerCase();
      const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
      if (!usernameRegex.test(usernameClean)) {
        setError('Username must be 3–20 characters, containing only letters, numbers, hyphens, or underscores.');
        return;
      }
    }

    if (avatarUrl.trim() && !avatarUrl.startsWith('data:')) {
      try {
        new URL(avatarUrl.trim());
      } catch {
        setError('Please enter a valid URL for your profile picture.');
        return;
      }
    }

    if (bio.length > 160) {
      setError('Bio must be 160 characters or less.');
      return;
    }

    if (showPasswordSection && newPassword) {
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError('New passwords do not match.');
        return;
      }
    }

    setSaving(true);

    try {
      const res = await updateProfile({
        full_name: fullName.trim(),
        username: username.trim().toLowerCase(),
        avatar_url: avatarUrl.trim(),
        bio: bio.trim(),
      });

      if (res.error) {
        setError(res.error);
        return;
      }

      // If user specified a new password, update it in Supabase Auth
      if (showPasswordSection && newPassword) {
        if (!isDemoUser && isSupabaseConfigured) {
          const { error: pwdErr } = await supabase.auth.updateUser({ password: newPassword });
          if (pwdErr) {
            setError(`Profile updated, but password update failed: ${pwdErr.message}`);
            return;
          }
        }
      }

      setSuccess('Profile updated successfully.');
      if (onSuccessToast) onSuccessToast('Profile updated successfully');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const displayInitial = (
    fullName.trim()[0] ||
    user?.email?.[0] ||
    'W'
  ).toUpperCase();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      title={
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-[#A0A0A0]" />
          <span className="font-serif text-base font-medium text-[#FFFFFF]">
            Profile Settings
          </span>
          {isDemoUser && (
            <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 ml-auto">
              Demo Mode
            </span>
          )}
        </div>
      }
    >
      <form onSubmit={handleSave} className="space-y-5 text-left">
        {/* Prominent Demo Mode Notification */}
        {isDemoUser && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-200 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-medium text-amber-200">Profile editing is disabled in Demo Mode</p>
              <p className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed">
                This demo account is read-only. Create a personal account to customize your name, username, bio, and avatar.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-300 animate-in fade-in duration-150">
            <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* 1. Profile Picture Management */}
        <div className="pb-4 border-b border-[#1A1A1A]">
          <label className="block text-xs font-medium text-[#A0A0A0] mb-3 select-none">
            Profile Picture
          </label>
          <div className="flex items-center gap-4">
            {/* Avatar Circle with live preview / uploading overlay */}
            <div className="relative w-16 h-16 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center text-lg font-serif font-medium text-[#FFFFFF] shrink-0 overflow-hidden shadow-inner group">
              {avatarUrl && !imageLoadError ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={() => setImageLoadError(true)}
                  onLoad={() => setImageLoadError(false)}
                />
              ) : (
                <span>{displayInitial}</span>
              )}

              {/* Uploading loading overlay */}
              {uploading && (
                <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Action buttons for avatar */}
            {isDemoUser ? (
              <div className="flex-1 space-y-1">
                <span className="text-xs font-sans text-[#AAAAAA] font-medium">Demo Avatar</span>
                <p className="text-[11px] font-sans text-[#666666]">
                  Photo changes are disabled in Demo Mode.
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    loading={uploading}
                    icon={<Upload className="w-3.5 h-3.5" />}
                  >
                    {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                  </Button>

                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#666666]">
                  <span>JPEG, PNG, or WebP (max 5MB)</span>
                  <button
                    type="button"
                    onClick={() => setIsUrlMode(!isUrlMode)}
                    className="text-[#888888] hover:text-[#FFFFFF] underline transition-colors"
                  >
                    {isUrlMode ? 'Upload from device' : 'Or paste URL'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Optional Direct URL input (only in non-demo mode) */}
          {!isDemoUser && isUrlMode && (
            <div className="mt-3 pt-3 border-t border-[#141414] animate-in fade-in duration-150">
              <Input
                label="Image Web Address (URL)"
                type="url"
                value={avatarUrl}
                onChange={(e) => {
                  setAvatarUrl(e.target.value);
                  setImageLoadError(false);
                }}
                placeholder="https://example.com/avatar.jpg"
                icon={<ImageIcon className="w-4 h-4" />}
              />
            </div>
          )}
        </div>

        {/* 2. Full Name & Username */}
        <div className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Eleanor Vance"
            disabled={isDemoUser}
            icon={<User className="w-4 h-4" />}
          />

          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. eleanor"
            disabled={isDemoUser}
            icon={<AtSign className="w-4 h-4" />}
          />

          {/* Read-only Email info */}
          <div className="text-left">
            <label className="block text-xs font-medium text-[#777777] mb-1 select-none">
              Account Email
            </label>
            <p className="text-xs font-sans text-[#A0A0A0] bg-[#0A0A0A] border border-[#141414] rounded-lg px-3 py-2">
              {user?.email || 'writer@mynotura.app'}
            </p>
          </div>

          {/* Short Bio */}
          <div className="text-left">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#A0A0A0] select-none">
                Short Bio
              </label>
              <span className="text-[10px] font-sans text-[#555555]">
                {bio.length}/160
              </span>
            </div>
            <div className="relative">
              <div className="absolute top-2.5 left-3 pointer-events-none text-[#666666]">
                <AlignLeft className="w-4 h-4" />
              </div>
              <textarea
                rows={3}
                maxLength={160}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={isDemoUser}
                placeholder="A few words about your writing, thoughts, or daily journal..."
                className={`w-full bg-[#0A0A0A] border border-[#1A1A1A] text-[#FFFFFF] placeholder:text-[#555555] text-xs font-sans rounded-lg pl-9 pr-3 py-2 transition-all focus:outline-none focus:border-[#444444] focus:ring-1 focus:ring-[#444444] resize-none ${
                  isDemoUser ? 'opacity-50 cursor-not-allowed bg-[#000000]' : ''
                }`}
              />
            </div>
          </div>

          {/* Change Password Collapsible Section (Hidden in Demo Mode) */}
          {!isDemoUser && (
            <div className="pt-2 border-t border-[#141414]">
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="w-full flex items-center justify-between py-2 text-xs text-[#888888] hover:text-[#FFFFFF] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-[#666666] group-hover:text-[#FFFFFF] transition-colors" />
                  <span className="font-sans font-medium">Change Password</span>
                </div>
                {showPasswordSection ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showPasswordSection && (
                <div className="mt-3 space-y-3 p-3 rounded-lg bg-[#0F0F0F] border border-[#1A1A1A] animate-in fade-in duration-150">
                  <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    icon={<Lock className="w-4 h-4" />}
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    icon={<Lock className="w-4 h-4" />}
                    error={
                      confirmNewPassword && newPassword !== confirmNewPassword
                        ? 'Passwords do not match.'
                        : undefined
                    }
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-[#1A1A1A] flex items-center justify-end gap-3">
          {isDemoUser ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={saving || uploading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={saving}
                disabled={uploading}
              >
                Save Changes
              </Button>
            </>
          )}
        </div>
      </form>
    </Modal>
  );
};
