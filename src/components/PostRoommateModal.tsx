import React, { useState } from 'react';
import { useRoommateStore } from '../store/roommateStore';
import { X, MapPin, Check, Loader2 } from 'lucide-react';

interface PostRoommateModalProps {
  onClose: () => void;
  isAdmin?: boolean;
}

export const PostRoommateModal: React.FC<PostRoommateModalProps> = ({ onClose, isAdmin = false }) => {
  const { addPost } = useRoommateStore();

  // Mode Selection: 'listing' (roommate card) or 'update' (platform announcement banner card)
  const [postType, setPostType] = useState<'listing' | 'update'>('listing');

  // Roommate Listing Fields
  const [name, setName] = useState('');
  const [area, setArea] = useState('Wagholi');
  const [customArea, setCustomArea] = useState('');
  const [requirement, setRequirement] = useState('');
  const [contact, setContact] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  // Platform Update Fields (Admin Only)
  const [updateTitle, setUpdateTitle] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTags = ['Vegetarian', 'Non-Smoker', 'Study Focused', 'Night Owl', 'Early Riser'];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGoogleMapsUrl(`https://www.google.com/maps?q=${latitude},${longitude}`);
        setIsLocating(false);
      },
      (err) => {
        console.error(err);
        setError('Could not fetch location. Please allow location permissions in your browser.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (postType === 'update') {
        // Validate announcement details
        if (!updateTitle.trim() || !requirement.trim()) {
          setError('Please enter both the update title and announcement details.');
          return;
        }

        // Add Platform Announcement
        const newId = await addPost(
          'System Admin',
          '',
          requirement.trim(),
          '',
          [],
          '',
          true,
          updateTitle.trim()
        );

        // Save ownership locally
        try {
          const myPosts = JSON.parse(localStorage.getItem('roomate_my_posts') || '[]');
          localStorage.setItem('roomate_my_posts', JSON.stringify([...myPosts, newId]));
        } catch (err) {
          console.error(err);
        }

        onClose();
        return;
      }

      // Roommate listing validations
      if (!name.trim() || !requirement.trim() || !contact.trim()) {
        setError('Please fill in all fields.');
        return;
      }

      // Clean phone number format (only digits)
      const cleanedContact = contact.replace(/\D/g, '');
      if (cleanedContact.length < 10) {
        setError('Please enter a valid 10-digit phone number.');
        return;
      }

      const finalArea = area === 'custom' ? customArea.trim() : area;
      if (!finalArea) {
        setError('Please enter a custom area name.');
        return;
      }

      const newId = await addPost(
        name.trim(),
        finalArea,
        requirement.trim(),
        cleanedContact,
        selectedTags,
        googleMapsUrl,
        false,
        ''
      );
      
      // Save post ownership locally to allow deletion later without logins
      try {
        const myPosts = JSON.parse(localStorage.getItem('roomate_my_posts') || '[]');
        localStorage.setItem('roomate_my_posts', JSON.stringify([...myPosts, newId]));
      } catch (err) {
        console.error('Failed to save post ID to localStorage', err);
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Could not publish listing. Please check your network connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 w-full max-w-md shadow-2xl rounded-2xl overflow-hidden animate-fade-in-up text-slate-800">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white">
          <h3 className="font-extrabold text-slate-900 text-base uppercase tracking-wide">
            {postType === 'update' ? 'Post Platform Announcement' : 'Add Roommate Listing'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-slate-400 hover:text-black hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {error && (
            <div className="p-3 bg-red-50 text-red-650 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          {/* Admin Selector Tab */}
          {isAdmin && (
            <div className="border border-slate-200 rounded-xl p-1.5 flex gap-1.5 bg-slate-55 mb-2">
              <button
                type="button"
                onClick={() => { setPostType('listing'); setError(''); }}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  postType === 'listing' ? 'bg-white text-black shadow-xs border border-slate-200' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Roommate Card
              </button>
              <button
                type="button"
                onClick={() => { setPostType('update'); setError(''); }}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  postType === 'update' ? 'bg-black text-white' : 'text-slate-400 hover:text-slate-650'
                }`}
              >
                Platform Announcement
              </button>
            </div>
          )}

          {postType === 'update' ? (
            // Platform Announcement Form Fields
            <>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Announcement Title</label>
                <input
                  type="text"
                  placeholder="e.g. Platform Upgrade: V1.2 Live!"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 premium-input text-xs font-semibold text-black"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Update Details</label>
                <textarea
                  placeholder="Describe the platform updates, server schedules, or announcements..."
                  rows={4}
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  className="w-full px-3.5 py-2.5 premium-input text-xs font-semibold text-black focus:outline-none"
                  required
                ></textarea>
              </div>
            </>
          ) : (
            // Roommate Listing Form Fields
            <>
              {/* Name */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aryan Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 premium-input text-xs font-semibold text-black"
                  required
                />
              </div>

              {/* Place / Area */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Place / Area</label>
                <div className="relative mb-2">
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 premium-input text-xs font-bold text-slate-800 focus:outline-none cursor-pointer appearance-none bg-white"
                  >
                    <option value="Wagholi">Wagholi</option>
                    <option value="Kharadi">Kharadi</option>
                    <option value="Viman Nagar">Viman Nagar</option>
                    <option value="Shivajinagar">Shivajinagar</option>
                    <option value="Kothrud">Kothrud</option>
                    <option value="custom">+ Add Custom Area...</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-450 text-[10px]">▼</div>
                </div>
                {area === 'custom' && (
                  <input
                    type="text"
                    placeholder="Enter custom area name (e.g. Hadapsar)"
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 premium-input text-xs font-semibold text-black animate-fade-in-up"
                    required
                  />
                )}
              </div>

              {/* WhatsApp Contact Details */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">WhatsApp Number *</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210 (10 digits)"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 premium-input text-xs font-semibold text-black"
                  required
                />
                <span className="text-[9px] text-slate-400 font-medium block mt-1">Used for direct WhatsApp messaging and calls.</span>
              </div>

              {/* GPS Room Location (Optional) */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Room Location (Optional)</label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className={`px-4 py-2.5 border text-xs font-bold rounded-xl flex items-center space-x-2 cursor-pointer transition-all ${
                      googleMapsUrl
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-extrabold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {isLocating ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-slate-400 shrink-0" />
                        <span>Getting GPS...</span>
                      </>
                    ) : googleMapsUrl ? (
                      <>
                        <Check size={13} className="text-emerald-600 shrink-0" />
                        <span>Location Captured!</span>
                      </>
                    ) : (
                      <>
                        <MapPin size={13} className="text-red-500 shrink-0 animate-bounce" />
                        <span>Set Current Location</span>
                      </>
                    )}
                  </button>
                  {googleMapsUrl && (
                    <button
                      type="button"
                      onClick={() => setGoogleMapsUrl('')}
                      className="text-[10px] font-extrabold text-slate-400 hover:text-red-650 uppercase tracking-wider cursor-pointer ml-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 font-medium block mt-1.5">
                  {googleMapsUrl 
                    ? "📍 Coordinates saved successfully. Users can click the map icon to navigate here."
                    : "Uses browser GPS to pin your exact room location (recommended to click while inside the room)."
                  }
                </span>
              </div>

              {/* Lifestyle Tags */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Lifestyle Tags (Optional)</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 border text-xs font-semibold rounded-full cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-black bg-black text-white' 
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-350'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Requirement */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Your Requirement</label>
                <textarea
                  placeholder="Describe your roommate needs, flat location, budget share, and specific rules..."
                  rows={3}
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  className="w-full px-3.5 py-2.5 premium-input text-xs font-semibold text-black focus:outline-none"
                  required
                ></textarea>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="pt-3.5 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="premium-btn-outline px-4.5 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="premium-btn-black px-5 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
            >
              {isSubmitting && <Loader2 size={13} className="animate-spin text-slate-350" />}
              <span>
                {isSubmitting 
                  ? 'Posting...' 
                  : (postType === 'update' ? 'Publish Announcement' : 'Post Listing')}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
