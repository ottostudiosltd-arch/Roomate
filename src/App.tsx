import { useState, useEffect, useMemo } from 'react';
import { useRoommateStore } from './store/roommateStore';
import { RoommateCard } from './components/RoommateCard';
import { PostRoommateModal } from './components/PostRoommateModal';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { AdminPanel } from './pages/AdminPanel';
import { Search, Plus, Shield, MapPin, SlidersHorizontal, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { getPostStatus } from './types';

// Legal Pages Components
const TermsPage = ({ onBack }: { onBack: () => void }) => (
  <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 text-slate-800 animate-fade-in-up">
    <button onClick={onBack} className="premium-btn-outline px-4 py-2 text-xs flex items-center space-x-1.5 cursor-pointer">
      <span>← Back to Board</span>
    </button>
    <div className="border border-slate-200 rounded-3xl p-6 sm:p-8 bg-white shadow-sm space-y-6">
      <h1 className="text-2xl font-black uppercase tracking-wide border-b border-slate-100 pb-4 text-black">Terms & Conditions</h1>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Effective Date: June 22, 2026</p>

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase text-black">1. Platform Usage Rules</h2>
        <p className="text-xs text-slate-650 leading-relaxed">
          Roommate India is a free, public board. Scraping, bot access, automated submissions, and malicious API scripting are strictly prohibited. All users must verify themselves as human via the platform's security mechanisms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase text-black">2. User Responsibilities</h2>
        <p className="text-xs text-slate-650 leading-relaxed">
          Users publish contact numbers and location details voluntarily. You are solely responsible for verifying the identity, financial standing, and safety of any potential roommates you contact. Do not share banking passwords or pay booking deposits before physical verification.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase text-black">3. Fake Listing Policy</h2>
        <p className="text-xs text-slate-650 leading-relaxed">
          Roommate India operates a zero-tolerance policy for fake listings, fake room photos, or misleading details. Postings flagged as fraud will be locked under review and permanently deleted if unable to satisfy verification requirements.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase text-black">4. Spam Policy</h2>
        <p className="text-xs text-slate-650 leading-relaxed">
          To prevent feed flooding, devices are limited to 3 posts per day and a 5-minute posting cooldown. Duplicate postings with identical contents are blocked automatically.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase text-black">5. Privacy Notice</h2>
        <p className="text-xs text-slate-650 leading-relaxed">
          All contact details and room coordinates you publish are visible to the public. Do not post highly sensitive personal documents (e.g. Aadhaar cards, PAN cards, lease deeds) in post description text fields.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase text-black">6. Report Abuse Process</h2>
        <p className="text-xs text-slate-650 leading-relaxed">
          Users can report listings using the "Report Post" menu. Reported listings are placed under admin review. If flagged repeatedly, they are automatically queued for deletion. You can submit a "Verify Myself" appeal if your post was reported unfairly.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase text-black">7. Contact Information</h2>
        <p className="text-xs text-slate-650 leading-relaxed">
          For help removing listings or reporting fraudulent behavior, contact the administration at <strong>support@roommateindia.org</strong>.
        </p>
      </section>
    </div>
  </div>
);

const PrivacyPolicyPage = ({ onBack }: { onBack: () => void }) => (
  <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 text-slate-800 animate-fade-in-up">
    <button onClick={onBack} className="premium-btn-outline px-4 py-2 text-xs flex items-center space-x-1.5 cursor-pointer">
      <span>← Back to Board</span>
    </button>
    <div className="border border-slate-200 rounded-3xl p-6 sm:p-8 bg-white shadow-sm space-y-6">
      <h1 className="text-2xl font-black uppercase tracking-wide border-b border-slate-100 pb-4 text-black">Privacy Policy</h1>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Effective Date: June 22, 2026</p>

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase text-black">1. What Information is Collected</h2>
        <p className="text-xs text-slate-650 leading-relaxed">
          We collect the information you voluntarily type into our roommate posting form: Name, Area, Requirement Description, WhatsApp/phone contact number, selected lifestyle tags, and optional Google Maps/GPS coordinates. We also store local cookies/localStorage flags to identify post ownership and track rate limits.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase text-black">2. How Information is Used</h2>
        <p className="text-xs text-slate-650 leading-relaxed">
          Your details are displayed publicly on the roommate feed to let prospective flatmates contact you directly via call or WhatsApp. Your GPS coordinates are mapped to a clickable link to guide users to your room location.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase text-black">3. Data Retention Policy</h2>
        <p className="text-xs text-slate-650 leading-relaxed">
          listings automatically expire and are hidden from public views 30 days after creation. Reported scam listings are stored temporarily for 5 days under review to allow appeals before being permanently removed from database records.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase text-black">4. User Rights</h2>
        <p className="text-xs text-slate-650 leading-relaxed">
          You can delete your listing at any time using the 3-dot dropdown menu on your card (if using the same device/browser where the post was created). You can also mark a post as "Filled" to hide your contact buttons.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase text-black">5. Contact Information</h2>
        <p className="text-xs text-slate-650 leading-relaxed">
          If you have questions regarding data removal or privacy controls, please email <strong>privacy@roommateindia.org</strong>.
        </p>
      </section>
    </div>
  </div>
);

function App() {
  const { posts, fetchPosts, dbError } = useRoommateStore();

  // Fetch posts from Supabase on mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // App States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [maxBudget, setMaxBudget] = useState(15000);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showFilled, setShowFilled] = useState(false);
  const [currentView, setCurrentView] = useState<'board' | 'terms' | 'privacy'>('board');

  // Human Verification popup
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [popupQuestion, setPopupQuestion] = useState('');
  const [popupAnswer, setPopupAnswer] = useState<number>(0);
  const [userPopupAnswer, setUserPopupAnswer] = useState('');
  const [popupError, setPopupError] = useState(false);

  // View & Modal states
  const [showPostModal, setShowPostModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Animated Startup Loading Screen State
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  // Check device ban
  const isDeviceBanned = localStorage.getItem('roomate_device_banned') === 'true';

  // Verification popup check
  useEffect(() => {
    const isVerified = sessionStorage.getItem('roomate_verified') === 'true';
    if (!isVerified) {
      // Generate puzzle (e.g. 44 + 55 - 1 style)
      const num1 = Math.floor(Math.random() * 80) + 10; // Two digit (10-89)
      const num2 = Math.floor(Math.random() * 80) + 10; // Two digit (10-89)
      const num3 = Math.floor(Math.random() * 9) + 1;   // One digit (1-9)
      setPopupQuestion(`${num1} + ${num2} - ${num3}`);
      setPopupAnswer(num1 + num2 - num3);
      setShowVerificationPopup(true);
    }
  }, []);

  const handleVerifyPopup = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(userPopupAnswer.trim());
    if (!isNaN(val) && val === popupAnswer) {
      sessionStorage.setItem('roomate_verified', 'true');
      setShowVerificationPopup(false);
      setPopupError(false);
    } else {
      setPopupError(true);
    }
  };

  const handleCloseWebsite = () => {
    window.location.href = 'https://www.google.com';
  };

  // Cycle onboarding text
  useEffect(() => {
    if (loadingStep < 3) {
      const timer = setTimeout(() => {
        setLoadingStep(prev => prev + 1);
      }, 1300);
      return () => clearTimeout(timer);
    } else {
      const fetchTimer = setTimeout(() => {
        setIsFetching(false);
      }, 1200);
      return () => clearTimeout(fetchTimer);
    }
  }, [loadingStep]);

  // Monitor search input for secret backdoor code '661983'
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim() === '661983') {
      setShowPasswordModal(true);
      setSearchQuery(''); 
    }
  };

  // Compile unique areas for dropdown selection
  const uniqueAreas = useMemo(() => {
    const defaultAreas = ['Wagholi', 'Kharadi', 'Viman Nagar', 'Shivajinagar', 'Kothrud'];
    const areas = new Set<string>(defaultAreas);
    posts.forEach(p => {
      if (p.area) {
        const formatted = p.area.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        areas.add(formatted);
      }
    });
    return Array.from(areas);
  }, [posts]);

  // Filtering & Sorting Logic
  const filteredAndSortedPosts = useMemo(() => {
    let myPostIds: string[] = [];
    try {
      myPostIds = JSON.parse(localStorage.getItem('roomate_my_posts') || '[]');
    } catch (e) {
      console.error(e);
    }

    const filtered = posts.filter(post => {
      // Admin announcements stay active
      if (post.isUpdate) return true;

      // Extract current status
      const status = getPostStatus(post);
      const isMyPost = myPostIds.includes(post.id);

      // Exclude expired posts (>30 days) from public users, unless it's their own post
      if (status === 'Expired' && !isMyPost) return false;

      // Exclude Under Review posts from public users, unless it's their own post
      if (status === 'Under Review' && !isMyPost) return false;

      // Exclude Appeal Submitted posts from public users, unless it's their own post
      if (status === 'Appeal Submitted' && !isMyPost) return false;

      // Filled listings filter
      if (status === 'Roommate Found' && !showFilled) return false;

      // Place / Area filter
      if (selectedArea && post.area !== selectedArea) return false;

      // Budget filter (auto extract numbers from requirement)
      const budgetMatch = post.requirement.match(/₹\s?(\d+[\d,]*)/);
      if (budgetMatch) {
        const rentAmount = parseInt(budgetMatch[1].replace(/,/g, ''));
        if (!isNaN(rentAmount) && rentAmount > maxBudget) return false;
      }

      // Keyword query match
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = post.name.toLowerCase().includes(query);
        const matchesReq = post.requirement.toLowerCase().includes(query);
        if (!matchesName && !matchesReq) return false;
      }

      return true;
    });

    // Sort listings: System Admin announcements (isUpdate) always go to the top, then sort others by time
    return [...filtered].sort((a, b) => {
      if (a.isUpdate && !b.isUpdate) return -1;
      if (!a.isUpdate && b.isUpdate) return 1;

      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [posts, selectedArea, searchQuery, maxBudget, sortBy, showFilled]);

  const handleOpenPostModal = () => {
    if (isDeviceBanned) {
      alert('This device has been temporarily blocked from posting due to community guideline violations.');
    } else {
      setShowPostModal(true);
    }
  };

  // Render onboarding/loading sequences
  if (loadingStep < 3) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-black font-sans select-none">
        <div className="flex flex-col items-center space-y-8 max-w-md px-6 text-center animate-pulse-slow">
          
          {/* Circular Loader */}
          <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-black animate-spin"></div>
          
          <div className="h-16 flex flex-col justify-center items-center">
            {loadingStep === 0 && (
              <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400 animate-pulse">
                Finding best room...
              </h2>
            )}
            {loadingStep === 1 && (
              <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400 animate-pulse">
                Finding best roommate...
              </h2>
            )}
            {loadingStep === 2 && (
              <h2 className="text-2xl font-black uppercase tracking-wider text-black animate-bounce">
                Welcome to Roomate!
              </h2>
            )}
          </div>

          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
            Roomate Pune Campus Board
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white text-slate-900 font-sans transition-all duration-200 ${
      showVerificationPopup ? 'blur-md select-none pointer-events-none' : ''
    }`}>
      
      {/* Ticker Animation Styling */}
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.333%, 0, 0); }
        }
        .ticker-wrap {
          overflow: hidden;
          background: #000;
          color: #fff;
          padding: 8px 0;
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 900;
          letter-spacing: 0.1em;
          border-bottom: 1px solid #1e293b;
        }
        .ticker-content {
          display: inline-block;
          white-space: nowrap;
          animation: ticker-scroll 28s linear infinite;
        }
        .ticker-item {
          display: inline-block;
          padding-right: 4rem;
        }
      `}</style>

      {/* Header bar matching the user's aesthetic */}
      <header className="border-b border-slate-200 sticky top-0 z-30 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo brand */}
          <div 
            onClick={() => { setIsAdminMode(false); setSelectedArea(''); setSearchQuery(''); setCurrentView('board'); }}
            className="flex items-center space-x-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="font-extrabold text-white text-base tracking-wider">R</span>
            </div>
            <div>
              <span className="font-black text-lg text-black tracking-tight">Roomate</span>
              <span className="text-[9px] block font-black uppercase text-slate-400 tracking-tighter leading-none mt-0.5">PUNE CAMPUS BOARD</span>
            </div>
          </div>

          {/* Actions: Admin Status and Header Add Post */}
          <div className="flex items-center space-x-3">
            {isAdminMode && (
              <div className="flex items-center space-x-1.5 px-3 py-1 border border-black bg-black text-white text-[9px] font-black uppercase tracking-wider rounded-md">
                <Shield size={11} />
                <span>Admin Console</span>
              </div>
            )}
            <button
              onClick={handleOpenPostModal}
              className="premium-btn-black px-4.5 py-2 flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Post Listing</span>
            </button>
          </div>

        </div>
      </header>

      {/* Scrolling Announcement Bar */}
      <div className="ticker-wrap select-none">
        <div className="ticker-content">
          <span className="ticker-item">🚀 PG Listings Coming Soon • Stay Tuned For Future Updates • More Accommodation Features Arriving Soon</span>
          <span className="ticker-item">🚀 PG Listings Coming Soon • Stay Tuned For Future Updates • More Accommodation Features Arriving Soon</span>
          <span className="ticker-item">🚀 PG Listings Coming Soon • Stay Tuned For Future Updates • More Accommodation Features Arriving Soon</span>
        </div>
      </div>

      {/* Main Feed Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {isAdminMode ? (
          // Admin Panel View
          <AdminPanel onExit={() => setIsAdminMode(false)} onAddPost={handleOpenPostModal} />
        ) : currentView === 'terms' ? (
          <TermsPage onBack={() => setCurrentView('board')} />
        ) : currentView === 'privacy' ? (
          <PrivacyPolicyPage onBack={() => setCurrentView('board')} />
        ) : (
          // Public Board View
          <>
            {/* Hero Banner */}
            <div className="border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-white shadow-sm">
              <div className="space-y-4 flex-1">
                <span className="text-[9px] font-black uppercase tracking-wider border border-slate-200 px-2.5 py-1 bg-slate-50 rounded-full text-slate-500">
                  OPEN LISTING BOARD
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none text-black">
                  Need a roommate? Post now.
                </h1>
                <p className="text-xs text-slate-500 font-semibold max-w-md leading-relaxed">
                  No accounts, no logins, no complex configs. Find flatmates and PGs around GHRCEM and Pune colleges. Simply list your details and get direct phone calls.
                </p>
                
                {/* Embedded Add button inside Hero */}
                <button
                  onClick={handleOpenPostModal}
                  className="premium-btn-black px-5 py-2.5 flex items-center space-x-1.5 cursor-pointer shadow-md shadow-black/5"
                >
                  <Plus size={15} />
                  <span>Add Post Listing</span>
                </button>
              </div>

              {/* Premium vector illustration image */}
              <div className="shrink-0 flex items-center justify-center p-2">
                <img 
                  src="/hero.png" 
                  alt="Roomate Living Room" 
                  className="w-full max-w-[280px] rounded-2xl hidden md:block border border-slate-100" 
                />
              </div>

            </div>

            {/* Search, Location and Filters control bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white">
              
              {/* Search keywords */}
              <div className="relative md:col-span-2">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by roommate name or requirements (e.g. Vegetarian)..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 text-black"
                />
              </div>

              {/* Place select dropdown */}
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 text-slate-800 cursor-pointer appearance-none bg-white"
                >
                  <option value="">All Areas</option>
                  {uniqueAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
              </div>

              {/* Filters Toggle Button */}
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`py-3 px-4 border rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer bg-white ${
                  showFiltersPanel ? 'border-black text-black bg-slate-50' : 'border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>

            </div>

            {/* Collapsible Filter settings panel */}
            {showFiltersPanel && (
              <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-4 animate-fade-in-up">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  
                  {/* Budget Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Max Rent Budget</span>
                      <span className="text-xs font-extrabold text-black">₹{maxBudget}</span>
                    </div>
                    <input
                      type="range"
                      min="2000"
                      max="20000"
                      step="500"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(Number(e.target.value))}
                      className="w-full accent-black h-1 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Sorting dropdown */}
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-2">Sort Listings</span>
                    <div className="flex gap-2">
                      {['newest', 'oldest'].map(mode => (
                        <button
                          key={mode}
                          onClick={() => setSortBy(mode as any)}
                          className={`px-3 py-1.5 border text-xs font-bold rounded-lg capitalize cursor-pointer transition-all ${
                            sortBy === mode 
                              ? 'border-black bg-black text-white' 
                              : 'border-slate-200 bg-white text-slate-650 hover:border-slate-350'
                          }`}
                        >
                          {mode === 'newest' ? 'Most Recent' : 'Oldest'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Show Filled Toggle */}
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-2">Listing Status</span>
                    <label className="flex items-center space-x-2.5 py-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showFilled}
                        onChange={(e) => setShowFilled(e.target.checked)}
                        className="accent-black rounded border-slate-300 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700">Include Filled Listings</span>
                    </label>
                  </div>

                </div>
              </div>
            )}

            {/* Listings Grid */}
            <div className="space-y-4 pt-4">
              
              {dbError && (
                <div className="p-4 border border-red-200 bg-red-50 text-red-700 text-xs font-semibold rounded-2xl flex items-center space-x-2 animate-fade-in-up">
                  <AlertCircle size={15} className="shrink-0 text-red-650" />
                  <span><strong>Database error:</strong> {dbError}</span>
                </div>
              )}

              {/* Grid Header Info */}
              <div className="flex justify-between items-center">
                <h2 className="font-extrabold text-sm uppercase tracking-wide text-black">
                  Active Roommate Listings
                </h2>
                {!isFetching && (
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                    {filteredAndSortedPosts.length} Roommates Listed
                  </span>
                )}
              </div>

              {isFetching ? (
                // Skeletons during Simulated loading
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <RoommateCard isLoading={true} />
                  <RoommateCard isLoading={true} />
                  <RoommateCard isLoading={true} />
                </div>
              ) : filteredAndSortedPosts.length === 0 ? (
                // Empty Board
                <div className="border border-slate-200 rounded-2xl py-16 text-center max-w-md mx-auto space-y-2.5 bg-white">
                  <AlertCircle size={28} className="mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-500">No roommate postings found</p>
                  <p className="text-[10px] text-slate-400">Try widening your search queries or resetting place filters.</p>
                </div>
              ) : (
                // Active Listings
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {filteredAndSortedPosts.map(post => (
                    <RoommateCard key={post.id} post={post} />
                  ))}
                </div>
              )}

            </div>
          </>
        )}

      </main>

      {/* Footer conforming to the legal requirement */}
      <footer className="border-t border-slate-200 py-10 mt-16 bg-slate-50 text-slate-500 text-center font-bold text-[10px] tracking-wide uppercase">
        <div className="max-w-6xl mx-auto px-4 space-y-4">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 text-slate-500">
            <button onClick={() => setCurrentView('terms')} className="hover:text-black cursor-pointer uppercase transition-colors">Terms & Conditions</button>
            <span className="hidden sm:inline text-slate-300">•</span>
            <button onClick={() => setCurrentView('privacy')} className="hover:text-black cursor-pointer uppercase transition-colors">Privacy Policy</button>
          </div>
          <div className="border-t border-slate-200 pt-4 text-slate-400 font-medium">
            <span>© 2026 Roommate India • Created by OTTO Labs</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showPostModal && (
        <PostRoommateModal 
          onClose={() => setShowPostModal(false)} 
          isAdmin={isAdminMode}
        />
      )}
      {showPasswordModal && (
        <AdminPasswordModal 
          onClose={() => setShowPasswordModal(false)} 
          onSuccess={() => setIsAdminMode(true)} 
        />
      )}

      {/* Initial Website Human Verification Popup Modal */}
      {showVerificationPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 pointer-events-auto">
          <div className="bg-white border border-slate-250 w-full max-w-sm shadow-2xl rounded-2xl p-6 text-slate-800 animate-fade-in-up space-y-5">
            <div className="text-center space-y-1.5">
              <span className="text-3xl">🛡️</span>
              <h3 className="text-lg font-black uppercase tracking-wide text-slate-900">Verify You're Human</h3>
              <p className="text-[11px] text-slate-450 leading-relaxed font-bold">
                Welcome to Roommate India. Please solve the security puzzle to access listings and posting services.
              </p>
            </div>

            {popupError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-650 text-[10px] font-bold rounded-xl flex items-center space-x-1.5">
                <ShieldAlert size={14} className="shrink-0" />
                <span>Incorrect sum. Please try again.</span>
              </div>
            )}

            <form onSubmit={handleVerifyPopup} className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Verification Puzzle</span>
                <p className="text-lg font-black text-black tracking-wide">Solve: {popupQuestion} = ?</p>
              </div>

              <input
                type="text"
                placeholder="Enter Answer"
                value={userPopupAnswer}
                onChange={(e) => setUserPopupAnswer(e.target.value)}
                className="w-full px-3.5 py-2.5 premium-input text-xs font-semibold text-black text-center"
                required
              />

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseWebsite}
                  className="flex-1 premium-btn-outline py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Close Website
                </button>
                <button
                  type="submit"
                  className="flex-1 premium-btn-black py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Verify & Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
