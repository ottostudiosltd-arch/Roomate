import React, { useState, useEffect } from 'react';
import { useRoommateStore } from '../store/roommateStore';
import { X, MapPin, Check, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface PostRoommateModalProps {
  onClose: () => void;
  isAdmin?: boolean;
}

const BAD_WORDS = [
  'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'cunt', 'dick', 'pussy', 'whore', 'slut', 'crap',
  'chutiya', 'chut', 'gandu', 'bhosdike', 'bhosadi', 'bhenchod', 'madarchod', 'harami', 'saala', 'saali',
  'randi', 'loda', 'lauda', 'bsdk', 'mc', 'bc'
];

const hasProfanity = (text: string): boolean => {
  const regex = new RegExp('\\b(' + BAD_WORDS.join('|') + ')\\b', 'i');
  return regex.test(text);
};

export const PostRoommateModal: React.FC<PostRoommateModalProps> = ({ onClose, isAdmin = false }) => {
  const { addPost, posts } = useRoommateStore();

  // Mode Selection: 'listing' (roommate card) or 'update' (platform announcement banner card)
  const [postType, setPostType] = useState<'listing' | 'update'>('listing');

  // Roommate Listing Fields
  const [name, setName] = useState('');
  const [area, setArea] = useState('Wagholi');
  const [customArea, setCustomArea] = useState('');
  const [city, setCity] = useState('Pune');
  const [requirement, setRequirement] = useState('');
  const [contact, setContact] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  // Platform Update Fields (Admin Only)
  const [updateTitle, setUpdateTitle] = useState('');

  // Rules & Verification States
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState<number>(0);
  const [userCaptcha, setUserCaptcha] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const [showRobotCheckbox, setShowRobotCheckbox] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTags = ['Vegetarian', 'Non-Smoker', 'Study Focused', 'Night Owl', 'Early Riser'];

  // Initialize Captcha (e.g. 44 + 55 - 1 style)
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 80) + 10; // Two digit (10-89)
    const num2 = Math.floor(Math.random() * 80) + 10; // Two digit (10-89)
    const num3 = Math.floor(Math.random() * 9) + 1;   // One digit (1-9)
    setCaptchaQuestion(`Solve: ${num1} + ${num2} - ${num3}`);
    setCaptchaAnswer(num1 + num2 - num3);
    setUserCaptcha('');
    setCaptchaVerified(false);
    setCaptchaError(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

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
        setError('Could not fetch location. Please allow location permissions or paste a link manually.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // CAPTCHA Handlers
  const handleRobotClick = () => {
    setShowRobotCheckbox(true);
  };

  const handleCaptchaChange = (val: string) => {
    setUserCaptcha(val);
    const parsed = parseInt(val.trim());
    if (!isNaN(parsed) && parsed === captchaAnswer) {
      setCaptchaVerified(true);
      setCaptchaError(false);
    } else {
      setCaptchaVerified(false);
    }
  };

  const handleVerifyCaptcha = () => {
    const val = parseInt(userCaptcha.trim());
    if (!isNaN(val) && val === captchaAnswer) {
      setCaptchaVerified(true);
      setCaptchaError(false);
    } else {
      setCaptchaError(true);
      setCaptchaVerified(false);
    }
  };

  // Posting limit checks (3/day, 1/5min)
  const checkRateLimits = (): string | null => {
    if (localStorage.getItem('roomate_device_banned') === 'true') {
      return 'This device has been temporarily blocked from posting due to community guideline violations.';
    }

    try {
      const timestamps = JSON.parse(localStorage.getItem('roomate_post_timestamps') || '[]');
      const now = Date.now();

      // Check 5-minute limit
      const lastPost = timestamps[timestamps.length - 1];
      if (lastPost && now - lastPost < 5 * 60 * 1000) {
        const timeLeft = Math.ceil((5 * 60 * 1000 - (now - lastPost)) / 1000);
        return `Spam Alert: Please wait ${Math.ceil(timeLeft / 60)} minutes before posting again.`;
      }

      // Check 24-hour limit
      const last24h = timestamps.filter((t: number) => now - t < 24 * 60 * 60 * 1000);
      if (last24h.length >= 3) {
        return 'Rate Limit: Maximum of 3 posts per day reached. Try again tomorrow.';
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  // Duplicate Check
  const checkDuplicate = (cleanedContact: string, finalArea: string, requirementText: string): boolean => {
    const cleanReq = requirementText.toLowerCase().replace(/\s+/g, '');
    return posts.some(post => {
      if (post.isUpdate) return false;
      const dbContactCleaned = post.contact.replace(/\D/g, '');
      const dbReqClean = post.requirement.toLowerCase().replace(/\s+/g, '');
      return dbContactCleaned === cleanedContact &&
             post.area.toLowerCase() === finalArea.toLowerCase() &&
             (dbReqClean.includes(cleanReq) || cleanReq.includes(dbReqClean));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Rate Limit Checks (skip for Admin Updates)
    if (postType !== 'update') {
      const limitError = checkRateLimits();
      if (limitError) {
        setError(limitError);
        return;
      }
    }

    // Captcha Validation
    if (!captchaVerified) {
      const val = parseInt(userCaptcha.trim());
      if (!isNaN(val) && val === captchaAnswer) {
        setCaptchaVerified(true);
        setCaptchaError(false);
      } else {
        setError('Please enter the correct Captcha answer to verify you are human.');
        setCaptchaError(true);
        return;
      }
    }

    // Guidelines Check
    if (!guidelinesAccepted) {
      setError('You must accept the Community Guidelines before posting.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (postType === 'update') {
        // Validation for Admin updates
        if (!updateTitle.trim() || !requirement.trim()) {
          setError('Please enter both the update title and announcement details.');
          setIsSubmitting(false);
          return;
        }

        if (updateTitle.trim().length < 10 || updateTitle.trim().length > 80) {
          setError('Announcement Title must be between 10 and 80 characters.');
          setIsSubmitting(false);
          return;
        }

        if (requirement.trim().length < 20 || requirement.trim().length > 500) {
          setError('Announcement details must be between 20 and 500 characters.');
          setIsSubmitting(false);
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
        setError('Please fill in all required fields.');
        setIsSubmitting(false);
        return;
      }

      // Character limit validations
      if (name.trim().length < 3 || name.trim().length > 50) {
        setError('Name must be between 3 and 50 characters.');
        setIsSubmitting(false);
        return;
      }

      if (requirement.trim().length < 20 || requirement.trim().length > 500) {
        setError('Requirement description must be between 20 and 500 characters.');
        setIsSubmitting(false);
        return;
      }

      // Indian Mobile Validation (10-digit check starting with 6-9)
      const cleanedContact = contact.replace(/\D/g, '');
      const isIndianMobile = /^[6-9]\d{9}$/.test(cleanedContact);
      if (!isIndianMobile) {
        setError('Please enter a valid 10-digit Indian WhatsApp mobile number (starts with 6, 7, 8, or 9).');
        setIsSubmitting(false);
        return;
      }

      // Location Validation: Area and City
      const finalArea = area === 'custom' ? customArea.trim() : area;
      if (!finalArea || finalArea.length < 3) {
        setError('Please enter a valid Area location name.');
        setIsSubmitting(false);
        return;
      }

      if (!city.trim() || city.trim().length < 3) {
        setError('City location is required (e.g. Pune).');
        setIsSubmitting(false);
        return;
      }

      // Profanity Filter Checks
      if (hasProfanity(name) || hasProfanity(requirement) || hasProfanity(finalArea)) {
        setError('Abusive language or inappropriate content detected. Please keep listings clean.');
        setIsSubmitting(false);
        return;
      }

      // Duplicate Post Detection
      if (checkDuplicate(cleanedContact, finalArea, requirement)) {
        setError('Similar post already exists. Please avoid duplicate listings.');
        setIsSubmitting(false);
        return;
      }

      // Save post to Database
      const newId = await addPost(
        name.trim(),
        finalArea,
        requirement.trim(),
        cleanedContact,
        selectedTags,
        googleMapsUrl.trim(),
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

      // Log successful timestamp for Rate Limiting
      try {
        const timestamps = JSON.parse(localStorage.getItem('roomate_post_timestamps') || '[]');
        timestamps.push(Date.now());
        localStorage.setItem('roomate_post_timestamps', JSON.stringify(timestamps));
      } catch (err) {
        console.error('Failed to log timestamp', err);
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
            <div className="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-start space-x-2">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Admin Selector Tab */}
          {isAdmin && (
            <div className="border border-slate-200 rounded-xl p-1.5 flex gap-1.5 bg-slate-50 mb-2">
              <button
                type="button"
                onClick={() => { setPostType('listing'); setError(''); }}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  postType === 'listing' ? 'bg-white text-black shadow-xs border border-slate-200' : 'text-slate-400 hover:text-slate-605'
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
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Announcement Title *</label>
                  <span className="text-[9px] text-slate-400 font-bold">{updateTitle.length}/80</span>
                </div>
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
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Update Details *</label>
                  <span className="text-[9px] text-slate-400 font-bold">{requirement.length}/500</span>
                </div>
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
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Name *</label>
                  <span className="text-[9px] text-slate-400 font-bold">{name.length}/50</span>
                </div>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Area / Place *</label>
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
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 premium-input text-xs font-bold text-slate-700 bg-slate-50"
                    placeholder="Pune"
                    required
                  />
                </div>
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
                <span className="text-[9px] text-slate-400 font-medium block mt-1">Used for direct WhatsApp redirects (Format: 10 digits starting with 6-9).</span>
              </div>

              {/* GPS Room Location & URL */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Room Location URL (Optional)</label>
                <div className="flex items-center space-x-2 mb-2">
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
                      className="text-[10px] font-extrabold text-slate-450 hover:text-red-650 uppercase tracking-wider cursor-pointer ml-1"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Paste Google Maps Link or Coordinates"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 premium-input text-xs font-semibold text-black mb-1.5"
                />

                <span className="text-[9px] text-slate-400 font-medium block leading-relaxed">
                  📍 Click standard button to save current device GPS coordinates, or paste a customized location link above. Other users will view this exact link.
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
                            : 'border-slate-200 bg-white text-slate-650 hover:border-slate-350'
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
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Requirement *</label>
                  <span className="text-[9px] text-slate-400 font-bold">{requirement.length}/500</span>
                </div>
                <textarea
                  placeholder="Describe your roommate needs, budget share, flat details, and specific guidelines... (Minimum 20 characters)"
                  rows={3}
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  className="w-full px-3.5 py-2.5 premium-input text-xs font-semibold text-black focus:outline-none"
                  required
                ></textarea>
              </div>
            </>
          )}

          {/* Privacy Notice Banner */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-500 leading-relaxed font-semibold">
            🔒 <strong>Privacy Notice:</strong> Do not share sensitive personal information. Contact details shared on posts are visible to interested users.
          </div>

          {/* Terms & Community Guidelines Checkbox */}
          <label className="flex items-start space-x-2.5 pt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={guidelinesAccepted}
              onChange={(e) => setGuidelinesAccepted(e.target.checked)}
              className="mt-0.5 accent-black rounded border-slate-300 w-3.5 h-3.5 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 leading-snug font-bold">
              I agree to the Community Guidelines. I will not post fake listings, spam, scams, or abusive messages.
            </span>
          </label>

          {/* Verification CAPTCHA section */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            {!showRobotCheckbox ? (
              <button
                type="button"
                onClick={handleRobotClick}
                className="w-full py-3 px-4 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer bg-white"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-slate-300 rounded flex items-center justify-center"></div>
                  <span className="text-xs font-bold text-slate-700">I am not a robot</span>
                </div>
                <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="h-6 w-6 opacity-60" />
              </button>
            ) : (
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3 animate-fade-in-up">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800">{captchaQuestion}</span>
                  <button 
                    type="button" 
                    onClick={generateCaptcha} 
                    className="text-[9px] font-black uppercase text-slate-400 hover:text-black"
                  >
                    Refresh Question
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Your Answer"
                    value={userCaptcha}
                    onChange={(e) => handleCaptchaChange(e.target.value)}
                    disabled={captchaVerified}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-slate-400 bg-white"
                  />
                  {!captchaVerified ? (
                    <button
                      type="button"
                      onClick={handleVerifyCaptcha}
                      className="px-4 py-2 bg-slate-850 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Verify
                    </button>
                  ) : (
                    <div className="px-3.5 py-2 bg-emerald-50 text-emerald-600 rounded-xl flex items-center space-x-1 border border-emerald-250">
                      <CheckCircle2 size={13} />
                      <span className="text-xs font-extrabold uppercase tracking-wide">Verified</span>
                    </div>
                  )}
                </div>

                {captchaError && !captchaVerified && (
                  <p className="text-[10px] text-red-650 font-bold">Incorrect answer. Please solve the logical sum to proceed.</p>
                )}
              </div>
            )}
          </div>

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
