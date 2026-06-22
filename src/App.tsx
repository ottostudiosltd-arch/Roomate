import { useState, useEffect, useMemo } from 'react';
import { useRoommateStore } from './store/roommateStore';
import { RoommateCard } from './components/RoommateCard';
import { PostRoommateModal } from './components/PostRoommateModal';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { AdminPanel } from './pages/AdminPanel';
import { Search, Plus, Shield, MapPin, SlidersHorizontal, AlertCircle, Loader2 } from 'lucide-react';

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

  // View & Modal states
  const [showPostModal, setShowPostModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Animated Startup Loading Screen State
  // 0: finding room, 1: finding roommate, 2: welcome, 3: completed
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  // Cycle onboarding text sequentially
  useEffect(() => {
    if (loadingStep < 3) {
      const timer = setTimeout(() => {
        setLoadingStep(prev => prev + 1);
      }, 1300);
      return () => clearTimeout(timer);
    } else {
      // Once onboarding completes, trigger a simulated 1.2s data fetch skeleton state
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
      setSearchQuery(''); // Reset search input immediately to hide trace
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
    const filtered = posts.filter(post => {
      // Place / Area filter
      if (selectedArea && post.area !== selectedArea) return false;

      // Budget filter (auto extract numbers from requirement for sorting)
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

    // Sort listings
    return [...filtered].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [posts, selectedArea, searchQuery, maxBudget, sortBy]);

  // Render onboarding/loading sequences
  if (loadingStep < 3) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-black font-sans select-none">
        <div className="flex flex-col items-center space-y-8 max-w-md px-6 text-center animate-pulse-slow">
          
          {/* Circular Loader */}
          <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-black animate-spin"></div>
          
          {/* Animated Onboarding Texts */}
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
    <div className="min-h-screen bg-white text-slate-900 font-sans transition-all duration-200">
      
      {/* Header bar matching the user's aesthetic */}
      <header className="border-b border-slate-200 sticky top-0 z-30 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo brand */}
          <div 
            onClick={() => { setIsAdminMode(false); setSelectedArea(''); setSearchQuery(''); }}
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
              onClick={() => setShowPostModal(true)}
              className="premium-btn-black px-4.5 py-2 flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Post Listing</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Feed Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {isAdminMode ? (
          // Admin Panel View
          <AdminPanel onExit={() => setIsAdminMode(false)} onAddPost={() => setShowPostModal(true)} />
        ) : (
          // Public Board View
          <>
            {/* Hero Banner with SVG Line Vector */}
            <div className="border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-white shadow-sm">
              <div className="space-y-4 flex-1">
                <span className="text-[9px] font-black uppercase tracking-wider border border-slate-200 px-2.5 py-1 bg-slate-55 rounded-full text-slate-500">
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
                  onClick={() => setShowPostModal(true)}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
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
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-350'
                          }`}
                        >
                          {mode === 'newest' ? 'Most Recent' : 'Oldest'}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Listings Grid */}
            <div className="space-y-4 pt-4">
              
              {dbError && (
                <div className="p-4 border border-red-250 bg-red-50 text-red-750 text-xs font-semibold rounded-2xl flex items-center space-x-2 animate-fade-in-up">
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
                  
                  {/* Troubleshooting Tip */}
                  <div className="pt-2 border-t border-slate-100 max-w-[280px] mx-auto text-[9px] text-slate-400 font-medium leading-relaxed">
                    💡 <strong>Tip:</strong> If you see listings in your Supabase dashboard but they aren't showing here, check that your RLS <strong>SELECT</strong> policy is enabled for public/anon access in your Supabase project.
                  </div>
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

      {/* Footer without any visible admin link trigger */}
      <footer className="border-t border-slate-200 py-8 mt-16 bg-white text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <div className="max-w-6xl mx-auto px-4">
          <span>© {new Date().getFullYear()} Roomate India. Simple, community-driven roommate board.</span>
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

    </div>
  );
}

export default App;
