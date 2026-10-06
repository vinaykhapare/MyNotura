import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  AtSign,
  Image as ImageIcon,
  AlignLeft,
  AlertCircle,
  ArrowRight,
  Check,
  Sparkles,
  Upload,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useAuth, type SignUpProfileData } from '../../contexts/AuthContext';
import { Logo } from '../brand/Logo';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface AuthFormProps {
  initialMode?: 'login' | 'register';
}

export const AuthForm: React.FC<AuthFormProps> = ({ initialMode = 'login' }) => {
  const [isRegister, setIsRegister] = useState<boolean>(initialMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Optional profile fields for signup
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { signIn, signUp, loginAsDemo, uploadAvatar, isConfigured } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in both email and password.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return false;
    }

    if (isRegister) {
      if (!confirmPassword) {
        setErrorMessage('Please confirm your password.');
        return false;
      }

      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return false;
      }

      if (username.trim()) {
        const usernameClean = username.trim().toLowerCase();
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        if (!usernameRegex.test(usernameClean)) {
          setErrorMessage(
            'Username must be 3–20 characters, using only letters, numbers, hyphens, or underscores.'
          );
          return false;
        }
      }

      if (avatarUrl.trim() && !avatarUrl.startsWith('data:')) {
        try {
          new URL(avatarUrl.trim());
        } catch {
          setErrorMessage('Please enter a valid URL for your profile picture.');
          return false;
        }
      }

      if (bio.length > 160) {
        setErrorMessage('Bio must be 160 characters or less.');
        return false;
      }
    }

    return true;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setAvatarUploading(true);

    try {
      const { url, error: uploadErr } = await uploadAvatar(file);
      if (uploadErr) {
        setErrorMessage(uploadErr);
      } else if (url) {
        setAvatarUrl(url);
        setAvatarLoadError(false);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload photo.');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isRegister) {
        const profileData: SignUpProfileData = {
          full_name: fullName.trim() || undefined,
          username: username.trim().toLowerCase() || undefined,
          avatar_url: avatarUrl.trim() || undefined,
          bio: bio.trim() || undefined,
        };

        const { error, message } = await signUp(email, password, profileData);
        if (error) {
          setErrorMessage(error);
        } else if (message) {
          setSuccessMessage(message);
        } else {
          navigate('/notes');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMessage(error);
        } else {
          navigate('/notes');
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    loginAsDemo();
    navigate('/notes');
  };

  const avatarDisplayInitial = (fullName.trim()[0] || email.trim()[0] || 'W').toUpperCase();
  const passwordsMatch = !isRegister || (confirmPassword.length > 0 && password === confirmPassword);
  const passwordMismatch = isRegister && confirmPassword.length > 0 && password !== confirmPassword;
  const isSubmitDisabled = loading || (isRegister && (!password || !confirmPassword || password !== confirmPassword || password.length < 6));

  return (
    <div className={`w-full mx-auto transition-all duration-200 ${isRegister ? 'max-w-md' : 'max-w-sm'}`}>
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <Logo iconSize={34} showWordmark={true} />
        </Link>
        <h1 className="font-serif text-2xl font-normal text-[#FFFFFF] tracking-tight">
          {isRegister ? 'Begin your journal' : 'Welcome back'}
        </h1>
        <p className="font-sans text-xs text-[#777777] mt-1.5">
          {isRegister
            ? 'A private, quiet place for your personal writing'
            : 'Enter your credentials to access your notes'}
        </p>
      </div>

      <div className="bg-[#0A0A0A] rounded-xl border border-[#1A1A1A] p-6 sm:p-7 shadow-2xl">
        {errorMessage && (
          <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-300 animate-in fade-in duration-150">
            <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address */}
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            icon={<Mail className="w-4 h-4" />}
          />

          {/* Password */}
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            icon={<Lock className="w-4 h-4" />}
          />

          {/* Confirm Password (Registration only) */}
          {isRegister && (
            <div className="space-y-1 animate-in fade-in duration-150">
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                autoComplete="new-password"
                icon={<Lock className="w-4 h-4" />}
                error={passwordMismatch ? 'Passwords do not match.' : undefined}
              />
              {confirmPassword && passwordsMatch && (
                <p className="text-[11px] font-sans text-emerald-400 flex items-center gap-1 pl-1">
                  <Check className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>
          )}

          {/* Optional Profile Section for Registration */}
          {isRegister && (
            <div className="pt-2 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="relative py-2 flex items-center justify-center">
                <div className="w-full border-t border-[#141414]" />
                <span className="absolute bg-[#0A0A0A] px-2.5 text-[10px] font-sans text-[#555555] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#777777]" />
                  Optional Profile
                </span>
              </div>

              {/* Full Name & Username in 2-column grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  autoComplete="name"
                  icon={<User className="w-4 h-4" />}
                />

                <Input
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. eleanor"
                  autoComplete="username"
                  icon={<AtSign className="w-4 h-4" />}
                />
              </div>

              {/* Profile Picture with file upload / URL option */}
              <div className="text-left">
                <label className="block text-xs font-medium text-[#A0A0A0] mb-1.5 select-none">
                  Profile Picture
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center text-xs font-serif text-[#FFFFFF] shrink-0 overflow-hidden shadow-inner">
                    {avatarUrl.trim() && !avatarLoadError ? (
                      <img
                        src={avatarUrl.trim()}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                        onError={() => setAvatarLoadError(true)}
                        onLoad={() => setAvatarLoadError(false)}
                      />
                    ) : (
                      avatarDisplayInitial
                    )}
                    {avatarUploading && (
                      <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        loading={avatarUploading}
                        icon={<Upload className="w-3.5 h-3.5" />}
                      >
                        {avatarUrl ? 'Change' : 'Upload Image'}
                      </Button>

                      {avatarUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAvatarUrl('');
                            setAvatarLoadError(false);
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#555555]">
                      <span>Max 5MB</span>
                      <button
                        type="button"
                        onClick={() => setIsUrlMode(!isUrlMode)}
                        className="text-[#777777] hover:text-[#FFFFFF] underline transition-colors"
                      >
                        {isUrlMode ? 'Hide URL input' : 'Or paste URL'}
                      </button>
                    </div>
                  </div>
                </div>

                {isUrlMode && (
                  <div className="mt-2.5 animate-in fade-in duration-150">
                    <Input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => {
                        setAvatarUrl(e.target.value);
                        setAvatarLoadError(false);
                      }}
                      placeholder="https://example.com/avatar.jpg"
                      icon={<ImageIcon className="w-4 h-4" />}
                    />
                  </div>
                )}
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
                    rows={2}
                    maxLength={160}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="A few words about your writing, thoughts, or daily focus..."
                    className="w-full bg-[#0A0A0A] border border-[#1A1A1A] text-[#FFFFFF] placeholder:text-[#555555] text-xs font-sans rounded-lg pl-9 pr-3 py-2 transition-all focus:outline-none focus:border-[#444444] focus:ring-1 focus:ring-[#444444] resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={isSubmitDisabled}
            className="w-full mt-3"
          >
            {isRegister ? 'Create Account' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4 ml-1.5" />}
          </Button>
        </form>

        {/* Toggle Login / Register */}
        <div className="mt-5 pt-5 border-t border-[#141414] text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="text-xs text-[#777777] hover:text-[#FFFFFF] font-sans transition-colors cursor-pointer"
          >
            {isRegister
              ? 'Already have an account? Sign in'
              : "Don't have an account? Create one"}
          </button>
        </div>

        {/* Demo Mode Action */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="text-xs text-[#555555] hover:text-[#FFFFFF] font-sans transition-colors cursor-pointer underline"
          >
            {isConfigured ? 'Explore with Demo Journal' : 'Continue with Local Demo Mode'}
          </button>
        </div>
      </div>
    </div>
  );
};
