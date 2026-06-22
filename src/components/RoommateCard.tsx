import React, { useState, useEffect } from 'react';
import { RoommatePost } from '../types';
import { useRoommateStore } from '../store/roommateStore';
import { MoreVertical, Phone, MessageSquare, AlertTriangle, ShieldCheck, Check, MapPin, Trash2, CheckCircle2 } from 'lucide-react';

interface RoommateCardProps {
  post?: RoommatePost;
  isLoading?: boolean;
  isAdmin?: boolean;
}

export const RoommateCard: React.FC<RoommateCardProps> = ({ post, isLoading = false, isAdmin = false }) => {
  const { reportPost, deletePost, markAsFilled } = useRoommateStore();
  
  // States
  const [showDropdown, setShowDropdown] = useState(false);
  const [reported, setReported] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isMyPost, setIsMyPost] = useState(false);

  // Check if this post was created on this local browser device
  useEffect(() => {
    if (post) {
      try {
        const myPosts = JSON.parse(localStorage.getItem('roomate_my_posts') || '[]');
        setIsMyPost(myPosts.includes(post.id));
      } catch (err) {
        console.error(err);
      }
    }
  }, [post]);

  const handleReport = () => {
    if (!post) return;
    reportPost(post.id);
    setReported(true);
    setShowDropdown(false);
    setTimeout(() => {
      setReported(false);
    }, 2500);
  };

  const handleDeleteTrigger = () => {
    setShowDeleteConfirm(true);
    setShowDropdown(false);
  };

  const handleDeleteConfirm = () => {
    if (!post) return;
    deletePost(post.id);
    setShowDeleteConfirm(false);
  };

  const handleMarkAsFilled = () => {
    if (!post) return;
    markAsFilled(post.id);
    setShowDropdown(false);
  };

  // WhatsApp chat redirect
  const handleWhatsApp = () => {
    if (!post) return;
    const cleaned = post.contact.replace(/\D/g, '');
    const waNumber = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
    const waUrl = `https://wa.me/${waNumber}?text=Hey%20${encodeURIComponent(post.name)},%20I%20saw%20your%2520listing%20on%20Roomate%20and%20wanted%20to%252520connect!`;
    window.open(waUrl, '_blank');
  };

  if (isLoading || !post) {
    // Pulse Skeleton Card
    return (
      <div className="premium-card p-5 space-y-4 bg-white animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-3 bg-slate-200 rounded w-1/4"></div>
          </div>
          <div className="w-6 h-6 bg-slate-200 rounded"></div>
        </div>
        <div className="space-y-2 mt-4">
          <div className="h-3 bg-slate-200 rounded w-full"></div>
          <div className="h-3 bg-slate-200 rounded w-5/6"></div>
        </div>
        <div className="flex space-x-2 pt-2">
          <div className="h-6 bg-slate-200 rounded-full w-20"></div>
          <div className="h-6 bg-slate-200 rounded-full w-16"></div>
        </div>
        <div className="border-t border-slate-100 pt-3.5 flex justify-between items-center">
          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
          <div className="flex space-x-2 w-1/2 justify-end">
            <div className="h-8 bg-slate-200 rounded-full w-20"></div>
            <div className="h-8 bg-slate-200 rounded-full w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  const isFilled = post.tags?.includes('Filled') || false;

  // Check if it is a platform update announcement
  if (post.isUpdate) {
    return (
      <div className="premium-card p-5 relative flex flex-col justify-between gap-4 bg-white text-slate-800 animate-fade-in-up min-h-[170px] overflow-hidden border border-slate-200 md:col-span-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-black">
              📢
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-slate-900 text-base leading-none">System Admin</span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md">Official Update</span>
              </div>
              <span className="text-[9px] block font-bold text-slate-400 uppercase tracking-wider mt-0.5">Roomate Platform Announcement</span>
            </div>
          </div>

          {/* Delete Option for Announcement (Owner / Admin) */}
          {(isMyPost || isAdmin) && (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1 rounded-full text-slate-400 hover:text-black hover:bg-slate-50 transition-colors cursor-pointer"
                title="Post options"
              >
                <MoreVertical size={16} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1.5 text-slate-800">
                  <button
                    onClick={handleDeleteTrigger}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-red-650 hover:bg-red-50 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete Update</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Overlay for Announcement */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-30 bg-white/95 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between items-center text-center animate-fade-in-up">
            <div className="my-auto space-y-1.5">
              <p className="font-extrabold text-sm text-slate-900">Are you sure you want to delete this post?</p>
              <p className="text-[10px] text-slate-400 font-semibold max-w-[220px] leading-relaxed">
                This action cannot be undone and this platform announcement will be permanently removed.
              </p>
            </div>
            <div className="flex space-x-2 w-full pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 premium-btn-outline py-2 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-650 hover:bg-red-700 text-white rounded-full font-bold text-xs py-2 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          {post.title && (
            <h4 className="font-black text-sm text-black uppercase tracking-wide">
              {post.title}
            </h4>
          )}
          <p className="text-xs text-slate-650 leading-relaxed font-semibold">
            {post.requirement}
          </p>
        </div>

        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            {`Published ${new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}`}
          </span>
        </div>
      </div>
    );
  }

  // Exact location link resolution (Checks if poster saved coordinates, else queries area)
  const exactMapsUrl = post.googleMapsUrl && post.googleMapsUrl.trim() !== ''
    ? post.googleMapsUrl
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.area + ', Pune')}`;

  return (
    <div className={`premium-card p-5 relative flex flex-col justify-between gap-4 bg-white text-slate-800 animate-fade-in-up min-h-[170px] overflow-hidden ${
      isFilled ? 'border-dashed border-slate-350 opacity-80 bg-slate-50/40' : ''
    }`}>
      
      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-30 bg-white/95 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between items-center text-center animate-fade-in-up">
          <div className="my-auto space-y-1.5">
            <p className="font-extrabold text-sm text-slate-900">Are you sure you want to delete this post?</p>
            <p className="text-[10px] text-slate-400 font-semibold max-w-[220px] leading-relaxed">
              This action cannot be undone and your post will be deleted permanently.
            </p>
          </div>
          <div className="flex space-x-2 w-full pt-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 premium-btn-outline py-2 cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="flex-1 bg-red-650 hover:bg-red-700 text-white rounded-full font-bold text-xs py-2 cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <span className="font-black text-slate-900 text-base leading-none">{post.name}</span>
            <span title="Verified student profile">
              <ShieldCheck size={14} className="text-blue-600 fill-blue-500/10 shrink-0" />
            </span>
            {isFilled && (
              <span className="bg-slate-100 text-slate-500 border border-slate-250 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md flex items-center gap-0.5 leading-none">
                <Check size={9} strokeWidth={3} /> Filled
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-bold uppercase mt-1.5 tracking-wider">
            <MapPin size={11} className="text-slate-400 shrink-0" />
            <span>{post.area}, Pune</span>
          </div>
        </div>

        {/* Actions: Location Map Pin & 3-Dot Options Action Menu */}
        <div className="flex items-center space-x-1 shrink-0">
          {/* Google Maps Pin */}
          <a
            href={exactMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded-full text-red-500 hover:bg-slate-50 transition-colors cursor-pointer"
            title={post.googleMapsUrl ? "View exact room coordinates on Google Maps" : "View area location on Google Maps"}
          >
            <MapPin size={16} className={post.googleMapsUrl ? "fill-red-500" : "fill-red-500/10"} />
          </a>

          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1 rounded-full text-slate-400 hover:text-black hover:bg-slate-50 transition-colors cursor-pointer"
              title="Post options"
            >
              <MoreVertical size={16} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1.5 animate-fade-in-up text-slate-800">
                {/* Report button */}
                <button
                  onClick={handleReport}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-650 flex items-center space-x-1.5 cursor-pointer"
                >
                  <AlertTriangle size={13} className="text-slate-400" />
                  <span>Report Scam ({post.reportsCount}/5)</span>
                </button>

                {/* Mark as Filled option for owner */}
                {isMyPost && !isFilled && (
                  <button
                    onClick={handleMarkAsFilled}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 flex items-center space-x-1.5 cursor-pointer border-t border-slate-100 mt-1 pt-1.5"
                  >
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    <span>Mark as Filled</span>
                  </button>
                )}

                {/* Owner/Admin Delete Button */}
                {(isMyPost || isAdmin) && (
                  <button
                    onClick={handleDeleteTrigger}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-red-650 border-t border-slate-100 mt-1 pt-1.5 hover:bg-red-50 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete Post</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Requirement Details */}
      <p className="text-xs text-slate-650 leading-relaxed font-semibold">
        {post.requirement}
      </p>

      {/* Explicit Tag list */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.filter(t => t !== 'Filled').map((tag, index) => (
            <span 
              key={index} 
              className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer controls */}
      <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between mt-1">
        
        {/* Date posted / Report notice */}
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          {reported ? (
            <span className="text-red-500 flex items-center gap-1">
              <Check size={11} /> Flagged
            </span>
          ) : (
            `Posted ${new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
          )}
        </span>

        {/* Buttons: WhatsApp & Call */}
        <div className="flex space-x-2">
          
          {/* WhatsApp Direct Chat */}
          <button
            onClick={handleWhatsApp}
            disabled={isFilled}
            className={`premium-btn-outline px-4 py-2 text-xs flex items-center space-x-1.5 ${
              isFilled 
                ? 'opacity-40 border-slate-200 text-slate-450 cursor-not-allowed'
                : 'cursor-pointer text-emerald-600 hover:text-white hover:bg-emerald-600 hover:border-emerald-600'
            }`}
          >
            <MessageSquare size={12} className="shrink-0" />
            <span>Message</span>
          </button>

          {/* Phone dialer trigger */}
          {isFilled ? (
            <button
              disabled
              className="bg-slate-100 border border-slate-200 text-slate-400 px-4.5 py-2 text-xs rounded-full font-bold cursor-not-allowed"
            >
              Filled
            </button>
          ) : (
            <a
              href={`tel:${post.contact}`}
              className="premium-btn-black px-4.5 py-2 text-xs cursor-pointer flex items-center space-x-1.5"
            >
              <Phone size={12} className="shrink-0" />
              <span>Call</span>
            </a>
          )}

        </div>

      </div>

    </div>
  );
};
