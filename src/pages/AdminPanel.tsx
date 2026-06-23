import React, { useEffect, useState } from 'react';
import { useRoommateStore } from '../store/roommateStore';
import { RoommateCard } from '../components/RoommateCard';
import { Shield, ArrowLeft, Trash2, Plus, Ban, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getPostStatus, getPostAppealText } from '../types';

interface AdminPanelProps {
  onExit: () => void;
  onAddPost: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExit, onAddPost }) => {
  const { posts, deletePost, fetchPosts, banContact, verifyPost, addPost } = useRoommateStore();
  const [activeTab, setActiveTab] = useState<'listings' | 'reported' | 'appeals' | 'expired'>('reported');

  const isMaintenanceOn = posts.some(p => p.isUpdate && p.title === 'MAINTENANCE_ACTIVE');

  const handleToggleMaintenance = async () => {
    if (isMaintenanceOn) {
      const confirmOff = window.confirm('Are you sure you want to end the maintenance break and restore public website access?');
      if (confirmOff) {
        const maintenancePosts = posts.filter(p => p.isUpdate && p.title === 'MAINTENANCE_ACTIVE');
        for (const mp of maintenancePosts) {
          await deletePost(mp.id);
        }
        alert('Maintenance break ended. Website is now fully live.');
      }
    } else {
      const confirmOn = window.confirm('Are you sure you want to start a maintenance break? This will block public access and show a maintenance page to all users globally.');
      if (confirmOn) {
        await addPost(
          'System Admin',
          '',
          'We are currently installing system upgrades and performance improvements. We will be back online shortly! ⛑',
          '',
          [],
          '',
          true,
          'MAINTENANCE_ACTIVE'
        );
        alert('Maintenance break started successfully. Website is now offline for public users.');
      }
    }
  };

  // Refresh feed on mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const totalListings = posts.length;
  
  // Categorize listings
  const reportedPosts = posts.filter(p => getPostStatus(p) === 'Under Review');
  const appealingPosts = posts.filter(p => getPostStatus(p) === 'Appeal Submitted');
  const expiredPosts = posts.filter(p => getPostStatus(p) === 'Expired');

  const handleBanContact = (contact: string) => {
    const confirmBan = window.confirm(`Are you sure you want to delete this listing and permanently ban phone number: ${contact} from posting again?`);
    if (confirmBan) {
      banContact(contact);
      alert(`Phone number ${contact} has been globally blacklisted. All their posts have been deleted.`);
    }
  };

  const handleDeletePost = (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this listing from the platform?');
    if (confirmDelete) {
      deletePost(id);
    }
  };

  const handleVerifyPost = (id: string) => {
    const confirmVerify = window.confirm('Are you sure you want to approve this listing, remove all flags, and mark it as Verified?');
    if (confirmVerify) {
      verifyPost(id);
      alert('Listing approved successfully and restored to the active feed.');
    }
  };

  // Get active list to display
  const activeListings = posts.filter(post => {
    if (activeTab === 'reported') return getPostStatus(post) === 'Under Review';
    if (activeTab === 'appeals') return getPostStatus(post) === 'Appeal Submitted';
    if (activeTab === 'expired') return getPostStatus(post) === 'Expired';
    return true; // listings tab
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-2 border-black">
        <div className="flex items-center space-x-2">
          <Shield size={22} className="text-black" />
          <h2 className="text-xl font-black uppercase tracking-wide">Administration Console</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleToggleMaintenance}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs flex items-center space-x-1.5 cursor-pointer rounded-xl font-bold transition-all ${
              isMaintenanceOn 
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                : 'border border-slate-200 bg-white text-slate-800 hover:border-slate-400'
            }`}
          >
            <span>{isMaintenanceOn ? 'End Maintenance' : 'Start Maintenance'} ⛑</span>
          </button>
          <button
            onClick={onAddPost}
            className="premium-btn-black px-3.5 sm:px-4.5 py-1.5 sm:py-2 text-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Post</span>
          </button>
          <button
            onClick={onExit}
            className="neo-btn px-3 sm:px-4 py-1.5 sm:py-2 text-xs flex items-center space-x-1.5 cursor-pointer bg-white"
          >
            <ArrowLeft size={14} />
            <span>Exit <span className="hidden sm:inline">Admin Feed</span><span className="inline sm:hidden">Feed</span></span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="neo-card p-4">
          <span className="text-[10px] font-black text-black uppercase tracking-wider block">Total Postings</span>
          <span className="text-2xl font-black text-black mt-1 block">{totalListings}</span>
        </div>
        <div className="neo-card p-4">
          <span className="text-[10px] font-black text-red-650 uppercase tracking-wider block font-bold">Reported (Review)</span>
          <span className="text-2xl font-black text-red-650 mt-1 block">{reportedPosts.length}</span>
        </div>
        <div className="neo-card p-4">
          <span className="text-[10px] font-black text-amber-650 uppercase tracking-wider block font-bold">User Appeals</span>
          <span className="text-2xl font-black text-amber-650 mt-1 block">{appealingPosts.length}</span>
        </div>
        <div className="neo-card p-4">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Expired Posts</span>
          <span className="text-2xl font-black text-slate-500 mt-1 block">{expiredPosts.length}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border border-slate-200 rounded-xl p-1.5 flex gap-1.5 bg-slate-55 text-[10px] sm:text-[11px] font-black uppercase tracking-wider overflow-x-auto whitespace-nowrap scrollbar-thin">
        <button
          onClick={() => setActiveTab('reported')}
          className={`flex-1 min-w-[110px] sm:min-w-0 py-2 text-center rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'reported' ? 'bg-black text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🚨 Under Review ({reportedPosts.length})
        </button>
        <button
          onClick={() => setActiveTab('appeals')}
          className={`flex-1 min-w-[110px] sm:min-w-0 py-2 text-center rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'appeals' ? 'bg-black text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ✉️ Appeals ({appealingPosts.length})
        </button>
        <button
          onClick={() => setActiveTab('expired')}
          className={`flex-1 min-w-[110px] sm:min-w-0 py-2 text-center rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'expired' ? 'bg-black text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ⏳ Expired ({expiredPosts.length})
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex-1 min-w-[110px] sm:min-w-0 py-2 text-center rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'listings' ? 'bg-black text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📁 All<span className="hidden sm:inline"> Listings</span> ({totalListings})
        </button>
      </div>

      {/* Flagged listings and All postings moderation feed */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-sm uppercase tracking-wide">
          {activeTab === 'reported' ? 'Reported Scam Moderation' :
           activeTab === 'appeals' ? 'Verify Myself Appeals' :
           activeTab === 'expired' ? 'Expired Listings (Archive)' :
           'All Postings Catalog'}
        </h3>
        
        {activeListings.length === 0 ? (
          <div className="p-12 border border-dashed border-slate-250 rounded-2xl text-center text-xs font-bold text-slate-400 bg-slate-50/20">
            No posts found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeListings.map(post => {
              const hasAppealText = getPostAppealText(post);
              return (
                <div key={post.id} className="relative group border border-slate-200 rounded-2xl p-1 bg-white">
                  
                  {/* Appeal Explanation Header Banner */}
                  {activeTab === 'appeals' && hasAppealText && (
                    <div className="m-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed font-semibold">
                      📝 <strong>Appeal Explanation:</strong> "{hasAppealText}"
                    </div>
                  )}

                  <RoommateCard post={post} isAdmin={true} />
                  
                  {/* Admin Controls Overlay */}
                  <div className="absolute top-5 right-12 flex items-center space-x-1.5 bg-white/80 p-1 rounded-xl backdrop-blur-xs">
                    
                    {/* Approve / Verify Post Action */}
                    {(getPostStatus(post) === 'Under Review' || getPostStatus(post) === 'Appeal Submitted' || getPostStatus(post) === 'Expired') && (
                      <button
                        onClick={() => handleVerifyPost(post.id)}
                        className="p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer rounded-lg flex items-center"
                        title="Approve Listing (Clear Flags)"
                      >
                        <ShieldCheck size={13} />
                      </button>
                    )}

                    {/* Delete & Ban Contact Action (only for non-admin announcements) */}
                    {!post.isUpdate && post.contact && (
                      <button
                        onClick={() => handleBanContact(post.contact)}
                        className="p-1.5 bg-black text-red-500 border border-slate-800 hover:bg-slate-900 transition-colors shadow-xs cursor-pointer rounded-lg flex items-center"
                        title={`Ban contact: ${post.contact}`}
                      >
                        <Ban size={13} />
                      </button>
                    )}

                    {/* Standard Admin Delete Action Button */}
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 bg-red-650 text-white hover:bg-red-700 transition-colors shadow-xs cursor-pointer rounded-lg flex items-center"
                      title="Remove Listing"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
