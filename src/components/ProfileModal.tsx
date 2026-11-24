import React, { useState, useRef } from 'react';
import { X, Camera, Check, LogOut, Trash2, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  stats: {
    habitsCount: number;
    routinesCount: number;
    txCount: number;
  };
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  stats
}) => {
  const [displayName, setDisplayName] = useState(user.displayName || 'Maksudul');
  const [avatar, setAvatar] = useState<string | null>(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatar(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...user,
      displayName: displayName.trim() || 'Maksudul',
      avatar
    };
    onUpdateUser(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <UserIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-800">User Profile Settings</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          
          {/* Avatar Section (Strictly NO superimposed 'M' letter badge overlays) */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500/30 bg-emerald-50 flex items-center justify-center shadow-md shrink-0">
              {avatar ? (
                <img 
                  src={avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-2xl font-black text-emerald-700">
                  {(displayName || 'M').charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                <span>Change Photo</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>

              {avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="block text-xs font-semibold text-rose-600 hover:underline"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          {/* Display Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Display Name *</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block font-mono">User ID: {user.username.startsWith('@') ? user.username : `@${user.username}`}</span>
          </div>

          {/* Activity Statistics Grid */}
          <div className="grid grid-cols-3 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <div>
              <span className="text-base font-black text-slate-800 font-mono block">{stats.habitsCount}</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Habits</span>
            </div>
            <div className="border-x border-slate-200/80">
              <span className="text-base font-black text-slate-800 font-mono block">{stats.routinesCount}</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Routines</span>
            </div>
            <div>
              <span className="text-base font-black text-slate-800 font-mono block">{stats.txCount}</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Ledger</span>
            </div>
          </div>

          {/* Enlarged Prominent Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save Changes</span>
            </button>
          </div>

          {/* Sign Out Action */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 py-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Session</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
