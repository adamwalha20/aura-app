import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { awardXP, calculateLevelProgress } from './lib/xp';
import { fetchWeather, WeatherData } from './lib/weather';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error || !data) {
          // If no profile exists, create one
          const { data: newProfile } = await supabase.from('users').upsert({
            id: session.user.id,
            full_name: session.user.user_metadata.full_name || 'Aura Seeker',
          }).select().single();
          setProfile(newProfile);
        } else {
          setProfile(data);
        }
        setLoading(false);
      };
      fetchProfile();
    }
  }, [session]);

  if (loading) return (
    <div className="min-h-screen bg-[#f9faf8] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#4b664a]/20 border-t-[#4b664a] rounded-full animate-spin"></div>
    </div>
  );

  if (!session) {
    return <AuthView />;
  }

  if (profile && !profile.onboarding_completed) {
    return <OnboardingView user={session.user} onComplete={(updatedProfile: any) => setProfile(updatedProfile)} />;
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#f9faf8]/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-[#ebefec] transition-colors rounded-full active:scale-95 duration-300">
            <span className="material-symbols-outlined text-[#4b664a]">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Aura Logo" className="w-10 h-10 object-contain mix-blend-multiply" />
            <h1 className="text-xl font-bold text-[#4b664a] tracking-tight font-headline">Aura AI</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {profile && (
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-bold tracking-widest text-[#4b664a] uppercase opacity-60">Level {profile.level || 1}</span>
              <span className="text-xs font-medium text-[#4b664a]/80 italic">{calculateLevelProgress(profile.xp || 0).tierName}</span>
            </div>
          )}
          <div className="relative group cursor-pointer">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container bg-surface-container transition-transform group-hover:scale-105">
              <img 
                alt="User profile avatar" 
                className="w-full h-full object-cover" 
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.user_metadata.full_name || session.user.email}`} 
              />
            </div>
            {profile && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#4b664a] text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm">
                {profile.level || 1}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      {activeTab === 'home' && <HomeTab userId={session.user.id} />}
      {activeTab === 'chat' && <ChatTab userId={session.user.id} onProfileUpdate={(p) => setProfile(p)} />}
      {activeTab === 'insights' && <InsightsTab userId={session.user.id} onProfileUpdate={(p) => setProfile(p)} />}
      {activeTab === 'profile' && <ProfileTab user={session.user} profile={profile} onProfileUpdate={(p) => setProfile(p)} />}

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-8 pb-6 h-24 bg-[#f9faf8]/90 backdrop-blur-lg rounded-t-[3rem] shadow-[0_-8px_24px_-4px_rgba(46,52,50,0.04)]">
        <NavButton icon="home" label="Home" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavButton icon="auto_awesome" label="Chat" isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
        <NavButton icon="monitoring" label="Insights" isActive={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
        <NavButton icon="person" label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </nav>
    </div>
  );
}

function NavButton({ icon, label, isActive, onClick }: { icon: string, label: string, isActive: boolean, onClick: () => void }) {
  if (isActive) {
    return (
      <button onClick={onClick} className="flex flex-col items-center justify-center bg-[#4b664a] text-white rounded-full p-3 scale-110 -translate-y-2 transition-all shadow-lg">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        <span className="text-[11px] font-medium font-label tracking-wider mt-0.5">{label}</span>
      </button>
    );
  }
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center text-[#5e632e] p-2 hover:text-[#4b664a] transition-all">
      <span className="material-symbols-outlined">{icon}</span>
      <span className="text-[11px] font-medium font-label tracking-wider mt-1">{label}</span>
    </button>
  );
}

const HomeTab = ({ userId }: { userId: string }) => {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rituals, setRituals] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [isGeneratingRitual, setIsGeneratingRitual] = useState(false);

  const moods = [
    { id: 'reflective', icon: 'auto_stories', label: 'Reflective', color: '#5e6c5b' },
    { id: 'energetic', icon: 'bolt', label: 'Energetic', color: '#8e9c7c' },
    { id: 'calm', icon: 'spa', label: 'Calm', color: '#aab4a2' },
    { id: 'focused', icon: 'center_focus_strong', label: 'Focused', color: '#4b664a' },
  ];

  useEffect(() => {
    const fetchHomeData = async () => {
      // 1. Fetch Daily Feeds
      const { data: feedData } = await supabase
        .from('daily_feeds')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (feedData) setFeeds(feedData);

      // 2. Fetch Profile for context
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      setProfile(profileData);

      // 3. Fetch Rituals - Filter for today
      const today = new Date().toISOString().split('T')[0];
      const { data: ritualData } = await supabase
        .from('daily_rituals')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', today)
        .order('created_at', { ascending: true });
      
      const currentRituals = ritualData || [];
      setRituals(currentRituals);

      // If no rituals exist at all for today, generate the first one
      if (currentRituals.length === 0 && profileData?.onboarding_completed) {
        triggerRitualGeneration(userId, profileData);
      }

      // 4. Fetch Weather
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const w = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
          setWeather(w);
          setWeatherLoading(false);
        },
        async () => {
          const w = await fetchWeather(); // Default location
          setWeather(w);
          setWeatherLoading(false);
        }
      );

      // 5. Fetch Today's Mood
      const { data: moodData } = await supabase
        .from('mood_logs')
        .select('mood')
        .eq('user_id', userId)
        .gte('created_at', today)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (moodData && moodData[0]) setCurrentMood(moodData[0].mood);
      
      setLoading(false);
    };
    fetchHomeData();
  }, [userId]);

  const triggerRitualGeneration = async (uid: string, userProfile: any) => {
    if (isGeneratingRitual) return;
    setIsGeneratingRitual(true);
    
    try {
      const { getRitualSuggestions } = await import('./lib/chat');
      const suggestions = await getRitualSuggestions(uid, userProfile);
      
      if (suggestions && suggestions.length > 0) {
        const newRitual = {
          user_id: uid,
          ritual_text: suggestions[0].text,
          time_label: suggestions[0].time,
          completed: false
        };

        const { data: inserted } = await supabase
          .from('daily_rituals')
          .insert(newRitual)
          .select();
        
        if (inserted) {
          setRituals(prev => [...prev, ...inserted]);
        }
      }
    } catch (err) {
      console.error("Failed to generate ritual:", err);
    } finally {
      setIsGeneratingRitual(false);
    }
  };

  const handleMoodSelect = async (moodId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { data: existingMood } = await supabase
      .from('mood_logs')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', today);

    const { error } = await supabase
      .from('mood_logs')
      .insert({ user_id: userId, mood: moodId });
    
    if (!error) {
      setCurrentMood(moodId);
      // Award XP only for the first mood check-in of the day
      if (!existingMood || existingMood.length === 0) {
        const updatedProfile = await awardXP(userId, 5);
        if (updatedProfile) setProfile(updatedProfile);
      }
    }
  };

  const toggleRitual = async (ritualId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('daily_rituals')
      .update({ completed: !currentStatus })
      .eq('id', ritualId);
    
    if (!error) {
      const updatedStatus = !currentStatus;
      setRituals(prev => prev.map(r => r.id === ritualId ? { ...r, completed: updatedStatus } : r));
      
      if (updatedStatus && profile) {
        // 1. Award XP
        const updatedProfile = await awardXP(userId, 15);
        if (updatedProfile) setProfile(updatedProfile);

        // 2. Generate the next mission if all current ones are done
        // Since we generate one by one, completing one means we should brew the next.
        triggerRitualGeneration(userId, profile);
      }
    }
  };

  const ritualsCompletedCount = rituals.filter(r => r.completed).length;
  const ritualsTotal = rituals.length || 1;
  const progressPercent = (ritualsCompletedCount / ritualsTotal) * 100;

  const defaultFeed = {
    outfit_image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    meal_image_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1000&auto=format&fit=crop',
    outfit_desc: 'Linen layers for the 22°C morning breeze. Breathable and intentional.',
    meal_desc: 'Green smoothie bowl with hemp seeds and organic honey.'
  };

  const rawFeed = feeds[0];
  const currentFeed = rawFeed?.content || defaultFeed;

  const getGreeting = () => {
    if (currentMood === 'energetic') return 'Fuel that energy ⚡';
    if (currentMood === 'reflective') return 'Breathe in clarity 📖';
    if (currentMood === 'calm') return 'Stay in the flow 🌊';
    if (currentMood === 'focused') return 'Sharp and steady 🎯';
    return 'Good morning 🌿';
  };

  return (
    <main className="pt-24 px-6 max-w-5xl mx-auto pb-32">
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-on-background tracking-tight mb-2">
            {getGreeting()}
          </h2>
          <p className="text-on-surface-variant font-body tracking-wide flex items-center gap-2">
            {profile?.full_name?.split(' ')[0] || 'Seeker'}, your path is clear.
          </p>
          {profile && (
            <div className="mt-4 flex items-center gap-3">
              <div className="w-48 h-1 bg-surface-container rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000" 
                  style={{ width: `${calculateLevelProgress(profile.xp).progressPercentage}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
                {calculateLevelProgress(profile.xp).currentXpInLevel} / {calculateLevelProgress(profile.xp).nextLevelXp} XP TO LEVEL {(profile.level || 1) + 1}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase opacity-60">Today's Vibe</p>
          <div className="flex gap-2">
            {moods.map((m) => (
              <button
                key={m.id}
                onClick={() => handleMoodSelect(m.id)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                  currentMood === m.id 
                    ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' 
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: currentMood === m.id ? "'FILL' 1" : "" }}>
                  {m.icon}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Aura Pulse Visual */}
        <div className="md:col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-primary/5 shadow-inner">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full tracking-widest uppercase">Spirit Pulse</span>
            <h3 className="text-2xl font-bold font-headline">Your Inner Rhythm</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-md">
              Your daily aura is {Math.round(progressPercent)}% aligned. Complete your rituals to synchronize with the sanctuary.
            </p>
          </div>
          <div className="relative w-48 h-48 flex items-center justify-center">
             {/* Pulsing Circles */}
             <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
             <div className="absolute inset-4 bg-primary/10 rounded-full animate-ping opacity-40" style={{ animationDuration: '4s' }}></div>
             <div className="relative w-32 h-32 rounded-full border-2 border-primary/20 flex items-center justify-center bg-surface backdrop-blur-sm shadow-xl">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary/5" />
                  <circle 
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" 
                    className="text-primary transition-all duration-1000"
                    strokeDasharray="282.7"
                    strokeDashoffset={282.7 - (282.7 * progressPercent) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl animate-pulse">energy_savings_leaf</span>
                </div>
             </div>
          </div>
        </div>

        {/* Weather Card */}
        <div className="md:col-span-6 lg:col-span-4 bg-primary text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          {weatherLoading ? (
            <div className="h-full flex flex-col justify-center items-center gap-4 py-6">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <p className="text-xs font-bold tracking-widest opacity-60 uppercase">Sense of Sky...</p>
            </div>
          ) : (
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                 <div>
                   <span className="text-[10px] font-bold tracking-[0.2em] opacity-60 uppercase mb-1 block">Sanctuary Weather</span>
                   <p className="text-lg font-bold">{weather?.condition}</p>
                 </div>
                 <span className="material-symbols-outlined text-4xl opacity-80">{weather?.icon}</span>
              </div>
              <div className="mt-8 flex items-end gap-2">
                <h4 className="text-6xl font-headline font-bold leading-none">{weather?.temp}°</h4>
                <div className="mb-1">
                  <p className="text-xs font-bold opacity-60 uppercase">Humidity</p>
                  <p className="text-sm font-bold">{weather?.humidity}%</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-6 lg:col-span-4 bg-surface-container rounded-xl overflow-hidden flex flex-col group cursor-pointer transition-transform duration-300 active:scale-[0.98]">
          <div className="relative h-64 w-full">
            <img alt="Outfit suggestion" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={currentFeed.outfit_image_url} />
            <div className="absolute inset-0 bg-gradient-to-t from-on-background/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <span className="bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold mb-2 inline-block tracking-widest uppercase">Daily Look</span>
              <h3 className="text-lg font-bold font-headline">Linen Layers</h3>
            </div>
          </div>
          <div className="p-6">
            <p className="text-on-surface-variant text-xs leading-relaxed">{currentFeed.outfit_desc}</p>
          </div>
        </div>

        <div className="md:col-span-6 lg:col-span-4 bg-surface-container-low rounded-xl p-6 flex flex-col justify-between hover:bg-surface-container-high transition-colors">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-secondary-container rounded-lg">
                  <span className="material-symbols-outlined text-on-secondary-container">restaurant</span>
                </div>
                <span className="text-[11px] font-bold tracking-widest text-tertiary uppercase">Nutrition</span>
              </div>
              <h3 className="text-lg font-bold font-headline mb-2">Morning Fuel</h3>
              <p className="text-on-surface-variant text-xs mb-4 line-clamp-2 md:line-clamp-none">{currentFeed.meal_desc}</p>
            </div>
            <div className="rounded-lg overflow-hidden h-24 mb-4">
              <img alt="Green smoothie bowl" className="w-full h-full object-cover" src={currentFeed.meal_image_url} />
            </div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <span>View Recipe</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
        </div>

        <div className="md:col-span-6 lg:col-span-4 bg-surface-container-lowest rounded-xl p-8 shadow-[0_8px_24px_-4px_rgba(46,52,50,0.04)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-headline">Rituals</h3>
              <span className="text-[10px] font-bold text-primary px-2 py-1 bg-primary/5 rounded-full">{ritualsCompletedCount}/{ritualsTotal}</span>
            </div>
            <div className="space-y-3">
              {rituals.length > 0 ? rituals.map((ritual) => (
                <div 
                  key={ritual.id} 
                  onClick={() => toggleRitual(ritual.id, ritual.completed)}
                  className={`flex items-center gap-3 p-3 rounded-xl group cursor-pointer transition-all ${
                    ritual.completed ? 'bg-primary/5 opacity-50' : 'bg-surface-container-low/50 hover:bg-surface-container-low'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    ritual.completed ? 'bg-primary border-primary' : 'border-primary-fixed-dim group-hover:bg-primary-fixed'
                  }`}>
                    {ritual.completed && <span className="material-symbols-outlined text-[12px] text-white font-bold">check</span>}
                  </div>
                  <span className={`text-on-surface text-xs font-medium ${ritual.completed ? 'line-through decoration-primary/30' : ''}`}>
                    {ritual.ritual_text}
                  </span>
                </div>
              )) : (
                <div className="py-6 text-center border-2 border-dashed border-primary/10 rounded-2xl">
                  <span className="material-symbols-outlined text-primary/30 text-2xl mb-1">auto_awesome</span>
                  <p className="text-on-surface-variant text-[10px] font-medium uppercase tracking-widest">Brewing...</p>
                </div>
              )}
            </div>
        </div>
      </div>
    </main>
  );
};

const ChatTab = ({ userId, onProfileUpdate }: { userId: string, onProfileUpdate?: (p: any) => void }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadConversation = async (convId: string) => {
    setLoading(true);
    const { getChatHistory } = await import('./lib/chat');
    const history = await getChatHistory(convId);
    setActiveConversationId(convId);
    if (history.length > 0) {
      setMessages(history);
    } else {
      setMessages([{ role: 'model', text: 'Peace be with you. How can I help you grow and find tranquility today?' }]);
    }
    setLoading(false);
    setIsHistoryOpen(false);
  };

  const fetchConvs = async () => {
    const { getUsersConversations } = await import('./lib/chat');
    const data = await getUsersConversations(userId);
    setConversations(data);
  };


  useEffect(() => {
    const initChat = async () => {
      setInitialLoading(true);
      await fetchConvs();
      
      // 1. Try to find the most recent conversation
      const { data: convs } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      let convId = convs?.[0]?.id;

      // 2. If no conversation exists, create one
      if (!convId) {
        const { createNewConversation } = await import('./lib/chat');
        const newConv = await createNewConversation(userId, 'New Conversation');
        convId = newConv?.id;
        await fetchConvs(); // Refresh list after creation
      }

      if (convId) {
        await loadConversation(convId);
      }
      setInitialLoading(false);
    };
    initChat();
  }, [userId]);


  const handleNewConversation = async () => {
    setLoading(true);
    const { createNewConversation } = await import('./lib/chat');
    const newConv = await createNewConversation(userId, 'New Conversation');
    if (newConv) {
      setActiveConversationId(newConv.id);
      setMessages([{ role: 'model', text: 'Peace be with you. How can I help you grow and find tranquility today?' }]);
      await fetchConvs();
    }
    setLoading(false);
  };



  const handleSend = async () => {
    if (!input.trim() || loading || !activeConversationId) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add to UI immediately
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const { sendMessage, saveChatMessage } = await import('./lib/chat');
      
      // 1. Persist user message
      await saveChatMessage(activeConversationId, userId, 'user', userMessage);

      // Check if this is the first user message (messages only had the initial model greeting)
      if (messages.length === 1 && messages[0].role === 'model') {
        const { updateConversationTitle } = await import('./lib/chat');
        const title = userMessage.length > 30 ? userMessage.substring(0, 27) + '...' : userMessage;
        await updateConversationTitle(activeConversationId, title);
        fetchConvs(); // Refresh the conversation history list
      }

      // 2. Get AI response
      const response = await sendMessage(userMessage, messages, userId, activeConversationId);
      
      // 3. Persist AI response
      await saveChatMessage(activeConversationId, userId, 'model', response);
      
      setMessages(prev => [...prev, { role: 'model', text: response }]);

      // Award XP for chatting (5 XP)
      const updatedProfile = await awardXP(userId, 5);
      if (updatedProfile && onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'I apologize, but my connection to the sanctuary is momentarily weak. Let us breathe together and try again.' }]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="min-h-screen pt-24 pb-48 px-6 max-w-4xl mx-auto flex flex-col">
      <section className="mb-12 flex justify-between items-start">
        <div>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-primary tracking-tight leading-tight mb-4">
            Let's nurture <br/>your inner glow.
          </h2>
          <p className="text-on-surface-variant tracking-wide max-w-md">
            Your peaceful companion for growth, style, and mindful living.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setIsHistoryOpen(true); fetchConvs(); }}
            className="flex items-center gap-2 px-4 py-3 bg-white text-on-surface rounded-full font-bold shadow-sm hover:bg-[#ebefec] transition-all border border-outline/10"
          >
            <span className="material-symbols-outlined">history</span>
            History
          </button>
          <button 
            onClick={handleNewConversation}
            disabled={loading || initialLoading}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-bold hover:scale-105 transition-all shadow-lg disabled:opacity-50"
          >
            <span className="material-symbols-outlined">add</span>
            New Chat
          </button>
        </div>
      </section>

      {/* History Sidebar/Layer */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[60] flex animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)}></div>
          <div className="relative ml-auto w-full max-w-sm bg-surface h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto pt-24 px-6">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-headline font-bold text-primary">Chat History</h3>
              <button onClick={() => setIsHistoryOpen(false)} className="p-2 hover:bg-surface-container rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              {conversations.length > 0 ? conversations.map((conv) => (
                <div 
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                    activeConversationId === conv.id 
                      ? 'bg-primary/5 border-primary' 
                      : 'bg-surface-container-low border-transparent hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm truncate pr-2">{conv.title || 'Untitled Conversation'}</span>
                    <span className="text-[10px] text-outline whitespace-nowrap">
                      {new Date(conv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-1 opacity-70">
                    Thread ID: ...{conv.id.slice(-6)}
                  </p>
                </div>
              )) : (
                <div className="py-20 text-center opacity-50">
                  <span className="material-symbols-outlined text-4xl mb-2">history</span>
                  <p className="text-sm">No previous conversations yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {initialLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex-1 space-y-8 overflow-y-auto pb-10 custom-scrollbar">

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            {msg.role === 'model' && (
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <span className="font-headline font-semibold text-xs text-primary uppercase tracking-widest">Aura Intelligence</span>
              </div>
            )}
            <div className={`max-w-[85%] p-6 rounded-2xl shadow-sm leading-relaxed ${
              msg.role === 'model' 
                ? 'bg-primary-container/40 backdrop-blur-md text-on-primary-container rounded-tl-none' 
                : 'bg-surface-container-highest text-on-surface rounded-tr-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex flex-col items-start animate-pulse">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
              </div>
              <span className="font-headline font-semibold text-xs text-primary/60 uppercase tracking-widest">Aura is reflecting...</span>
            </div>
            <div className="bg-primary-container/20 w-32 h-12 rounded-2xl rounded-tl-none"></div>
          </div>
        )}
      </div>
      )}
      <div className="fixed bottom-32 left-0 w-full px-6 z-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-surface-container-highest/90 backdrop-blur-2xl p-2 rounded-[2rem] flex items-center gap-2 shadow-2xl ring-1 ring-black/5 border border-white/20">
            <button className="p-4 text-on-surface-variant hover:text-primary transition-colors hover:scale-110 active:scale-95">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <input 
              className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline py-4 font-body outline-none" 
              placeholder="Type your thoughts..." 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:grayscale"
            >
              <span className="material-symbols-outlined font-bold">arrow_upward</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

const InsightsTab = ({ userId, onProfileUpdate }: { userId: string, onProfileUpdate?: (p: any) => void }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRitual, setNewRitual] = useState({ focus_type: 'Deep Work', start_time: '', duration: 30 });
  
  const [summary, setSummary] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    const [sessionsRes, summaryRes] = await Promise.all([
      supabase.from('focus_sessions').select('*').eq('user_id', userId).order('start_time', { ascending: true }),
      supabase.from('daily_summaries').select('*').eq('user_id', userId).eq('summary_date', today).single()
    ]);
    
    if (sessionsRes.data) setSessions(sessionsRes.data);
    if (summaryRes.data) setSummary(summaryRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, [userId]);

  const handlePrepareTomorrow = async () => {
    setGenerating(true);
    try {
      const { data: profile } = await supabase.from('users').select('*').eq('id', userId).single();
      const { getTomorrowPlan } = await import('./lib/chat');
      const planResult = await getTomorrowPlan(userId, profile);
      
      if (planResult) {
        const today = new Date().toISOString().split('T')[0];
        const { data: savedSummary } = await supabase.from('daily_summaries').upsert({
          user_id: userId,
          summary_date: today,
          reflection: planResult.reflection,
          tomorrow_plan: planResult.tomorrow_plan
        }).select().single();
        
        if (savedSummary) setSummary(savedSummary);
      }
    } catch (e) {
      console.error("Preparation failed:", e);
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateRitual = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('focus_sessions').insert({
      user_id: userId,
      focus_type: newRitual.focus_type,
      start_time: newRitual.start_time || new Date().toISOString(),
      duration_minutes: newRitual.duration,
      status: 'in_progress'
    });

    if (!error) {
      setIsModalOpen(false);
      fetchInsights();
      // Award XP for starting a ritual (10 XP)
      const updatedProfile = await awardXP(userId, 10);
      if (updatedProfile && onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }
    }
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">
      <section className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-primary mb-2">Today's Rhythm</h2>
          <p className="text-on-surface-variant font-body tracking-wide">Cultivating focus and balance.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Add Ritual
        </button>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-on-surface/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-2xl w-full max-w-md border border-white/20 animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold font-headline text-primary mb-6">New Ritual</h3>
            <form onSubmit={handleCreateRitual} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-outline uppercase ml-4">Ritual Type</label>
                <select 
                  className="w-full bg-surface-container border-none rounded-full px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                  value={newRitual.focus_type}
                  onChange={(e) => setNewRitual({...newRitual, focus_type: e.target.value})}
                >
                  <option>Deep Work</option>
                  <option>Meditation</option>
                  <option>Skincare Ritual</option>
                  <option>Reading</option>
                  <option>Movement</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-outline uppercase ml-4">Start Time</label>
                <input 
                  type="datetime-local"
                  className="w-full bg-surface-container border-none rounded-full px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                  value={newRitual.start_time}
                  onChange={(e) => setNewRitual({...newRitual, start_time: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-outline uppercase ml-4">Duration (min)</label>
                <input 
                  type="number"
                  className="w-full bg-surface-container border-none rounded-full px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                  value={newRitual.duration}
                  onChange={(e) => setNewRitual({...newRitual, duration: parseInt(e.target.value)})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-surface-container-high text-on-surface-variant rounded-full font-bold hover:bg-surface-container-highest transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-primary text-on-primary rounded-full font-bold shadow-xl hover:shadow-2xl transition-all"
                >
                  Begin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-10 flex flex-wrap gap-4">
        <div className="flex items-center gap-3 px-6 py-4 rounded-full bg-secondary-container/40 backdrop-blur-md border border-white/20">
          <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <span className="text-sm font-medium tracking-wider text-on-tertiary-container">Your focus is highest between 10 AM and 12 PM.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="bg-surface-container-low rounded-xl p-8">
            <div className="flex justify-between items-end mb-8">
              <h3 className="text-2xl font-bold font-headline text-primary">Schedule</h3>
              <span className="text-sm font-medium text-on-surface-variant tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
            </div>
            <div className="relative space-y-2">
              {loading ? (
                <div className="py-20 text-center text-on-surface-variant animate-pulse">Finding your rhythm...</div>
              ) : sessions.length > 0 ? (
                sessions.map((session, idx) => (
                  <div key={session.id} className="flex gap-6 group">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-outline-variant tracking-widest py-1">
                        {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="w-0.5 h-16 bg-surface-container-high"></div>
                    </div>
                    <div className="flex-1 pt-0.5 pb-4">
                      <div className={`p-4 rounded-lg shadow-sm border-l-4 transition-all hover:translate-x-1 ${session.status === 'completed' ? 'bg-surface-container-highest/20 border-outline opacity-60' : 'bg-primary-container/30 border-primary'}`}>
                        <p className="text-sm font-bold text-on-surface">{session.focus_type}</p>
                        <p className="text-xs mt-1 text-on-surface-variant">{session.duration_minutes} minutes of dedicated focus.</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <p className="text-on-surface-variant mb-6">No sessions scheduled yet.</p>
                  <button onClick={() => setIsModalOpen(true)} className="px-8 py-3 bg-primary text-on-primary rounded-full text-sm font-bold shadow-lg">Begin a New Ritual</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-10">
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-surface-container">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-headline text-on-surface">Tomorrow's Vision</h3>
              <button 
                onClick={handlePrepareTomorrow}
                disabled={generating}
                className="text-primary text-xs font-bold tracking-widest flex items-center gap-1 hover:underline disabled:opacity-50"
              >
                {generating ? 'BREWING...' : 'PREPARE FOR TOMORROW'}
                {!generating && <span className="material-symbols-outlined text-sm">auto_awesome</span>}
              </button>
            </div>
            {summary ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                <p className="text-sm italic text-on-surface-variant leading-relaxed">"{summary.reflection}"</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-primary uppercase mb-2">Suggested Focus</p>
                    <div className="flex flex-wrap gap-2">
                      {summary.tomorrow_plan.focus_blocks?.map((block: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-primary/5 rounded-full text-xs font-medium text-primary">{block}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-primary uppercase mb-2">Self-Care Rituals</p>
                    <ul className="text-xs text-on-surface-variant space-y-1">
                      {summary.tomorrow_plan.rituals?.map((ritual: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-primary/40"></span>
                          {ritual}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center border-2 border-dashed border-primary/5 rounded-2xl">
                <span className="material-symbols-outlined text-primary/20 text-4xl mb-2">history_edu</span>
                <p className="text-on-surface-variant text-sm font-medium">No plans brewed yet.</p>
                <button 
                  onClick={handlePrepareTomorrow}
                  className="mt-4 px-6 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold hover:bg-primary/20 transition-colors"
                >
                  Brew Tomorrow's Vision
                </button>
              </div>
            )}
          </div>

          <div className="bg-surface-container rounded-xl overflow-hidden relative aspect-square md:aspect-video lg:aspect-square group cursor-pointer shadow-inner">
            <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700">
               <source src="https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sun-4264-large.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8">
              <span className="inline-block px-3 py-1 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold rounded-full mb-3 tracking-widest uppercase">AI Insight</span>
              <h4 className="text-white text-2xl font-bold font-headline leading-tight mb-2">Steady Growth</h4>
              <p className="text-primary-fixed/80 text-sm leading-relaxed">By scheduling "Plant Care" after your high-focus sessions, you effectively reset your cortisol levels for the evening.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const getLevelTitle = (level: number) => {
  if (level <= 5) return 'Sprouting';
  if (level <= 10) return 'Blooming';
  if (level <= 20) return 'Aligned';
  return 'Radiant';
};

const ProfileTab = ({ user, profile, onProfileUpdate }: { user: any, profile: any, onProfileUpdate: (p: any) => void }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (!error && data) setMetrics(data);
      setLoading(false);
    };
    fetchMetrics();
  }, [user.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { data: updatedProfile, error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      if (updatedProfile) {
        onProfileUpdate(updatedProfile);
      }
    } catch (error: any) {
      console.error('Upload Error:', error.message);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const displayMetrics = metrics?.data || {
    overall_score: 85,
    skin_health: 92,
    productivity_score: 78
  };

  return (
    <main className="pt-24 px-6 max-w-2xl mx-auto space-y-10 pb-32">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*" 
      />
      <section className="flex flex-col items-center text-center space-y-4">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-primary-container relative">
            <div className="w-full h-full rounded-full border-4 border-surface overflow-hidden bg-surface-container">
              <img 
                alt="Profile large" 
                className="w-full h-full object-cover" 
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_metadata.full_name || user.email}`} 
              />
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            )}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-on-surface/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-white"
            >
              <span className="material-symbols-outlined text-3xl">photo_camera</span>
            </button>
          </div>
          <div className="absolute -bottom-2 right-0 bg-primary text-white rounded-full px-4 py-1 text-xs font-bold tracking-widest shadow-lg flex items-center gap-2 z-10">
            <span>LEVEL {profile?.level || 1}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
            <span>{profile?.xp || 0} XP</span>
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-headline font-extrabold tracking-tight text-on-background">{user.user_metadata.full_name || 'Aura Seeker'}</h2>
          <p className="text-primary font-medium tracking-wide mt-1">Growth Level: {getLevelTitle(profile?.level || 1)}</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        {/* Growth & Leveling System */}
        {profile && (
          <div className="col-span-2 bg-[#4b664a] text-white rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl shadow-[#4b664a]/20 mb-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.2em] opacity-60 uppercase mb-2 block">Current Ascension</span>
                  <h3 className="text-4xl font-headline font-bold mb-2">{calculateLevelProgress(profile.xp).tierName}</h3>
                  <p className="text-white/60 text-sm italic">"Your aura continues to brighten."</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex flex-col items-center justify-center border border-white/20 backdrop-blur-md">
                    <span className="text-[10px] uppercase tracking-widest opacity-60 font-bold">Level</span>
                    <span className="text-3xl font-bold leading-none">{profile.level || 1}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end text-sm">
                  <span className="font-bold tracking-wider opacity-80 uppercase text-[11px]">Spirit Progress</span>
                  <span className="font-medium opacity-60">{calculateLevelProgress(profile.xp).currentXpInLevel} / {calculateLevelProgress(profile.xp).nextLevelXp} XP</span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                    style={{ width: `${calculateLevelProgress(profile.xp).progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold tracking-widest opacity-40 uppercase pt-2">
                  <span>Level {profile.level}</span>
                  <span>Level {(profile.level || 1) + 1}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="col-span-2 bg-surface-container-low p-8 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-outline font-bold">Health Score</span>
            <p className="text-3xl font-headline font-bold text-on-background">{displayMetrics.overall_score}%</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-primary/10 flex items-center justify-center relative bg-primary/5">
            <svg className="w-full h-full transform -rotate-90 scale-110" viewBox="0 0 64 64">
              <circle className="text-transparent" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
              <circle 
                className="text-primary" 
                cx="32" 
                cy="32" 
                fill="transparent" 
                r="28" 
                stroke="currentColor" 
                strokeDasharray="175.9" 
                strokeDashoffset={175.9 - (175.9 * displayMetrics.overall_score) / 100} 
                strokeWidth="4" 
                strokeLinecap="round"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </div>
          </div>
        </div>
        <div className="bg-surface-container p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-tertiary">face</span>
            <span className="text-xs font-bold text-tertiary">{displayMetrics.skin_health}%</span>
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface-variant">Skin</p>
            <div className="h-1.5 w-full bg-outline-variant/20 rounded-full mt-2">
              <div className="h-full bg-tertiary rounded-full" style={{ width: `${displayMetrics.skin_health}%` }}></div>
            </div>
          </div>
        </div>
        <div className="bg-surface-container p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary">bolt</span>
            <span className="text-xs font-bold text-primary">{displayMetrics.productivity_score}%</span>
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface-variant">Productivity</p>
            <div className="h-1.5 w-full bg-outline-variant/20 rounded-full mt-2">
              <div className="h-full bg-primary rounded-full" style={{ width: `${displayMetrics.productivity_score}%` }}></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-surface-container">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="font-headline text-xl font-bold">Transformation</h3>
            <p className="text-sm text-outline-variant">Progress over last 30 days</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-headline font-bold text-primary">+12.4%</span>
          </div>
        </div>
        <div className="h-32 w-full flex items-end gap-1">
          <div className="bg-primary-container/40 flex-1 rounded-t-sm" style={{ height: '40%' }}></div>
          <div className="bg-primary-container/40 flex-1 rounded-t-sm" style={{ height: '35%' }}></div>
          <div className="bg-primary-container/40 flex-1 rounded-t-sm" style={{ height: '50%' }}></div>
          <div className="bg-primary-container/40 flex-1 rounded-t-sm" style={{ height: '45%' }}></div>
          <div className="bg-primary-container/40 flex-1 rounded-t-sm" style={{ height: '60%' }}></div>
          <div className="bg-primary-container/40 flex-1 rounded-t-sm" style={{ height: '55%' }}></div>
          <div className="bg-primary-container/60 flex-1 rounded-t-sm" style={{ height: '70%' }}></div>
          <div className="bg-primary-container/60 flex-1 rounded-t-sm" style={{ height: '65%' }}></div>
          <div className="bg-primary-container/80 flex-1 rounded-t-sm" style={{ height: '80%' }}></div>
          <div className="bg-primary flex-1 rounded-t-sm" style={{ height: '95%' }}></div>
        </div>
        <div className="flex justify-between mt-4 text-[10px] uppercase tracking-tighter text-outline font-bold">
          <span>30 Days ago</span>
          <span>Today</span>
        </div>
      </section>

      <button 
        onClick={handleLogout}
        className="w-full py-4 border-2 border-primary/20 text-primary rounded-full font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined">logout</span>
        Sign Out
      </button>
    </main>
  );
};

function AuthView() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        setMessage('Check your email for confirmation!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9faf8] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#4b664a]/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#8BA888]/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-white/40 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl border border-white/20 z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#4b664a]/10 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner overflow-hidden uppercase">
            <img src="/logo.png" alt="Aura Logo" className="w-14 h-14 object-contain mix-blend-multiply" />
          </div>
          <h2 className="text-4xl font-headline font-extrabold text-[#4b664a] tracking-tight mb-2">Aura</h2>
          <p className="text-[#5a605e] font-body">Begin your journey to a balanced life.</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {isSignUp && (
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-[#4b664a] uppercase ml-4">Full Name</label>
              <input 
                required
                className="w-full bg-[#dee4e1]/50 border-none rounded-full px-6 py-4 outline-none focus:ring-2 focus:ring-[#4b664a]/20 text-[#2e3432]"
                placeholder="Elena Vance"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest text-[#4b664a] uppercase ml-4">Email</label>
            <input 
              required
              type="email"
              className="w-full bg-[#dee4e1]/50 border-none rounded-full px-6 py-4 outline-none focus:ring-2 focus:ring-[#4b664a]/20 text-[#2e3432]"
              placeholder="aura@sanctuary.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest text-[#4b664a] uppercase ml-4">Password</label>
            <input 
              required
              type="password"
              className="w-full bg-[#dee4e1]/50 border-none rounded-full px-6 py-4 outline-none focus:ring-2 focus:ring-[#4b664a]/20 text-[#2e3432]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {message && (
            <p className="text-center text-xs font-medium text-[#791903] bg-red-100 py-2 rounded-lg px-4 border border-red-200">
              {message}
            </p>
          )}

          <button 
            disabled={loading}
            className="w-full py-5 bg-[#4b664a] text-white rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale mt-4"
          >
            {loading ? 'Aligning Aura...' : isSignUp ? 'Create Sanctuary' : 'Enter Sanctuary'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-medium text-[#5a605e] hover:text-[#4b664a] transition-colors gap-2 mx-auto"
          >
            {isSignUp ? 'Already have a sanctuary? ' : "New to Aura? "}
            <span className="font-bold underline underline-offset-4">
              {isSignUp ? 'Sign In' : 'Create One'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function OnboardingView({ user, onComplete }: { user: any, onComplete: (profile: any) => void }) {
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState<string[]>([]);
  const [skinType, setSkinType] = useState('');
  const [styleVibe, setStyleVibe] = useState('');
  const [focusTime, setFocusTime] = useState('Morning');
  const [isSaving, setIsSaving] = useState(false);

  const toggleGoal = (goal: string) => {
    setGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          goals,
          skin_type: skinType,
          style_vibe: styleVibe,
          preferred_focus_time: focusTime,
          onboarding_completed: true,
          xp: 100, // Reward for onboarding
          level: 1 // Start at Level 1 (Integer)
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (!error && data) {
        onComplete(data);
      }
    } catch (err) {
      console.error('Onboarding update error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    {
      title: "Set Your Intentions",
      subtitle: "What brings you to the sanctuary today?",
      content: (
        <div className="grid grid-cols-2 gap-4 mt-8">
          {['Mindfulness', 'Productivity', 'Personal Style', 'Daily Routine', 'Digital Detox', 'Creativity'].map(goal => (
            <button
              key={goal}
              onClick={() => toggleGoal(goal)}
              className={`p-6 rounded-2xl border-2 transition-all text-sm font-bold landscape:p-4 ${
                goals.includes(goal) 
                  ? 'bg-primary border-primary text-white shadow-lg' 
                  : 'bg-surface-container/50 border-transparent text-on-surface-variant hover:border-primary/20'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Your Personal Canvas",
      subtitle: "Tell us about your style and skincare goals.",
      content: (
        <div className="space-y-8 mt-8 text-left">
          <div className="space-y-4">
            <label className="text-xs font-bold tracking-widest text-primary uppercase ml-4">Skin Type</label>
            <div className="flex flex-wrap gap-2">
              {['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'].map(type => (
                <button
                  key={type}
                  onClick={() => setSkinType(type)}
                  className={`px-6 py-3 rounded-full border-2 transition-all text-xs font-bold ${
                    skinType === type ? 'bg-primary border-primary text-white' : 'bg-surface-container border-transparent'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-xs font-bold tracking-widest text-primary uppercase ml-4">Style Vibe</label>
            <div className="flex flex-wrap gap-2">
              {['Minimalist', 'Boho', 'Classic', 'Streetwear', 'Professional'].map(vibe => (
                <button
                  key={vibe}
                  onClick={() => setStyleVibe(vibe)}
                  className={`px-6 py-3 rounded-full border-2 transition-all text-xs font-bold ${
                    styleVibe === vibe ? 'bg-primary border-primary text-white' : 'bg-surface-container border-transparent'
                  }`}
                >
                  {vibe}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Your Daily Rhythm",
      subtitle: "When do you feel most aligned and focused?",
      content: (
        <div className="space-y-6 mt-10">
          <div className="grid grid-cols-1 gap-4">
            {['Morning (6AM - 12PM)', 'Afternoon (12PM - 6PM)', 'Evening (6PM - 12AM)', 'Night Owl (12AM - 6AM)'].map(time => (
              <button
                key={time}
                onClick={() => setFocusTime(time)}
                className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                  focusTime === time ? 'bg-primary border-primary text-white shadow-xl' : 'bg-surface-container/50 border-transparent'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${focusTime === time ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                  <span className="material-symbols-outlined">{time.includes('Morning') ? 'wb_sunny' : time.includes('Afternoon') ? 'sunny' : 'dark_mode'}</span>
                </div>
                <span className="font-bold text-sm">{time}</span>
              </button>
            ))}
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[step - 1];

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 relative overflow-hidden text-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl pt-12 px-6 flex justify-between items-center z-20">
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s === step ? 'w-12 bg-primary' : s < step ? 'w-6 bg-primary/40' : 'w-6 bg-surface-container-high'}`}></div>
          ))}
        </div>
        <button onClick={() => setStep(prev => Math.max(1, prev - 1))} className={`text-on-surface-variant font-bold text-xs uppercase tracking-widest ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}>Back</button>
      </div>

      <div className="w-full max-w-xl z-10 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-4 leading-tight">{currentStepData.title}</h2>
        <p className="text-on-surface-variant text-lg font-body">{currentStepData.subtitle}</p>

        {currentStepData.content}

        <div className="mt-20">
          <button
            onClick={() => step < 3 ? setStep(step + 1) : handleComplete()}
            disabled={isSaving || (step === 1 && goals.length === 0) || (step === 2 && (!skinType || !styleVibe))}
            className="w-full max-w-sm py-6 bg-primary text-on-primary rounded-full font-bold shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:grayscale flex items-center justify-center gap-3 mx-auto"
          >
            {isSaving ? 'Manifesting...' : step === 3 ? 'Finalize My Aura' : 'Continue Journey'}
            <span className="material-symbols-outlined">{step === 3 ? 'auto_awesome' : 'arrow_forward'}</span>
          </button>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] -z-10">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-secondary/5 rounded-full blur-[140px]"></div>
      </div>
    </div>
  );
}
