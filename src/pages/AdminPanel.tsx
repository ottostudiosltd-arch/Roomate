import React, { useEffect } from 'react';
import { useRoommateStore } from '../store/roommateStore';
import { RoommateCard } from '../components/RoommateCard';
import { Shield, ArrowLeft, Trash2, Plus } from 'lucide-react';

interface AdminPanelProps {
  onExit: () => void;
  onAddPost: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExit, onAddPost }) => {
  const { posts, deletePost, fetchPosts } = useRoommateStore();

  // Refresh feed on mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const totalListings = posts.length;
  const reportedListings = posts.filter(p => p.reportsCount > 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Admin Panel Header */}
      <div className="flex justify-between items-center pb-4 border-b-2 border-black">
        <div className="flex items-center space-x-2">
          <Shield size={22} className="text-black" />
          <h2 className="text-xl font-black uppercase tracking-wide">Administration Console</h2>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onAddPost}
            className="premium-btn-black px-4.5 py-2 text-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Post</span>
          </button>
          <button
            onClick={onExit}
            className="neo-btn px-4 py-2 text-xs flex items-center space-x-1.5 cursor-pointer bg-white"
          >
            <ArrowLeft size={14} />
            <span>Exit Admin Feed</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="neo-card p-5">
          <span className="text-[10px] font-black text-black uppercase tracking-wider block">Total Postings</span>
          <span className="text-3xl font-black text-black mt-1 block">{totalListings}</span>
        </div>
        <div className="neo-card p-5">
          <span className="text-[10px] font-black text-red-600 uppercase tracking-wider block">Reported scam postings</span>
          <span className="text-3xl font-black text-red-600 mt-1 block">{reportedListings.length}</span>
        </div>
      </div>

      {/* Flagged listings and All postings moderation feed */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-sm uppercase tracking-wide">Active Listings Moderation</h3>
        
        {posts.length === 0 ? (
          <div className="p-8 border-2 border-black text-center text-xs font-bold text-slate-400">
            No active postings in the database.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map(post => (
              <div key={post.id} className="relative group">
                <RoommateCard post={post} isAdmin={true} />
                
                {/* Admin Delete Action Button overlay */}
                <button
                  onClick={() => deletePost(post.id)}
                  className="absolute top-5 right-12 p-1.5 bg-red-600 text-white border border-black hover:bg-red-700 transition-colors shadow-[1px_1px_0px_#000000] cursor-pointer"
                  title="Remove Fake Listing"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
