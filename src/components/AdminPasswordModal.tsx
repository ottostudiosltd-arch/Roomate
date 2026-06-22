import React, { useState } from 'react';
import { X, Shield } from 'lucide-react';

interface AdminPasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === 'hive1234') {
      onSuccess();
      onClose();
    } else {
      setError('Incorrect password. Access denied.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-xs p-4">
      <div className="bg-white border-2 border-black w-full max-w-sm shadow-[4px_4px_0px_#000000] p-6 animate-fade-in-up">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b-2 border-black">
          <div className="flex items-center space-x-2">
            <Shield size={18} className="text-black" />
            <h3 className="font-extrabold text-sm uppercase tracking-wide">Admin Access Required</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded border border-transparent hover:border-black hover:bg-slate-50 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-xs text-black font-semibold leading-relaxed">
            Enter the administration security key to unlock moderation privileges.
          </p>

          {error && (
            <div className="p-2 border-2 border-black bg-black text-white text-[10px] font-bold uppercase tracking-wider text-center">
              {error}
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-black uppercase block mb-1">Security Key</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 neo-input text-xs font-bold"
              required
              autoFocus
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-black bg-white hover:bg-slate-50 text-[10px] font-bold text-black cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="neo-btn-black px-4 py-2 text-[10px] font-bold cursor-pointer"
            >
              Unlock Console
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
