import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#f9faf8]/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-[#ebefec] transition-colors rounded-full active:scale-95 duration-300">
            <span className="material-symbols-outlined text-[#4b664a]">menu</span>
          </button>
          <h1 className="text-xl font-bold text-[#4b664a] tracking-tight font-headline">Aura AI</h1>
        </div>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
            <img alt="User profile avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUuv8KP7ziUdPNUHQGaX7zaigWbzedHdp25Z-nyPxX29-McNGkvTNAezEoKFpy4EQaQ8DhWIk3_RQASRaRrnLbCoZjXkeG-k1l_lsgYXkDODJcmJdvi4dhDaBLjUMdKvRe3HPADZ2Eh0MLybJnybSYhtt9VeoneCTqxM1MzYyyGrSVZU6QtmWXg5pjadpkAAFRihUnCVdtabR3W80UVfI8pOYw6nz7mQp-JxP3gMIqDKJ0_vKBGfgISULf69qtqc9JtPOpOPunERA" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      {activeTab === 'home' && <HomeTab />}
      {activeTab === 'chat' && <ChatTab />}
      {activeTab === 'insights' && <InsightsTab />}
      {activeTab === 'profile' && <ProfileTab />}

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

const HomeTab = () => (
  <main className="pt-24 px-6 max-w-5xl mx-auto pb-32">
    <section className="mb-10">
      <h2 className="text-4xl md:text-5xl font-headline font-bold text-on-background tracking-tight mb-2">Good morning, Adam 🌿</h2>
      <p className="text-on-surface-variant font-body tracking-wide">The air is fresh today. Ready to align your day?</p>
    </section>

    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-4 bg-surface-container rounded-xl overflow-hidden flex flex-col group cursor-pointer transition-transform duration-300 active:scale-[0.98]">
        <div className="relative h-80 w-full">
          <img alt="Outfit suggestion" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsPZlA9Ah1ofjIEfftT7iiIAYLDXkYLYCUA5435pzJQeJ7mu1Lu63-R6XMOss7AiEzFLZmT6ZOmU_7_AQLtmE1lWAXMEVDbEt3vFgaNICyIG8tNJNsHI5MSFiTEN7stvDVI8KDIC-quA0NmP5Mq3WEiOSVYuX0eDrviFo7pcQLHWCPf36uYgxjD7KIaKz0cFD7d44PqhQh9NuzuEG5etj9jiDBbBubITepSTJTsOc-GipGuG1fQXBxOd7PlmJNZlA0ooj6nt3eS7k" />
          <div className="absolute inset-0 bg-gradient-to-t from-on-background/60 to-transparent"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <span className="bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium mb-2 inline-block">Personal Style</span>
            <h3 className="text-xl font-bold font-headline">Daily Look</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-on-surface-variant text-sm leading-relaxed mb-4">Linen layers for the 22°C morning breeze. Breathable and intentional.</p>
          <button className="w-full py-3 bg-primary text-on-primary rounded-full font-semibold text-sm transition-all hover:opacity-90">View Details</button>
        </div>
      </div>

      <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between hover:bg-surface-container-high transition-colors">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-secondary-container rounded-lg">
                <span className="material-symbols-outlined text-on-secondary-container">restaurant</span>
              </div>
              <span className="text-[11px] font-bold tracking-widest text-tertiary uppercase">Nutrition</span>
            </div>
            <h3 className="text-xl font-bold font-headline mb-2">Morning Fuel</h3>
            <p className="text-on-surface-variant text-sm mb-4">Green smoothie bowl with hemp seeds and organic honey.</p>
          </div>
          <div className="rounded-lg overflow-hidden h-32 mb-4">
            <img alt="Green smoothie bowl" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQfsjTtvahxe94VlThr_1ylkJbCGbpd0L4CyIutmZBqN2ug8XqSZsupPzkv68XWB8mJ0zRBBVWfw6atClKv_QD4YhXBQZoPNBMuWXbJ7kjhSuAz0sZ6cKVr_T_KRaiZ7HF3jinAon7jCJlDg7uDbDerY5_mnSYpShr6f80g0riSgoktzNV4RYKpdJnqhUGDjSIpkpytpMnrfHev17zYwFfk8bjbC7hInmCaEVqxNHRT7JTgsNBlo09icZejDJmkZwhD0svDAPaDIU" />
          </div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <span>Recipe details</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        </div>

        <div className="bg-tertiary-container/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-tertiary">wb_sunny</span>
            <span className="text-xs font-bold tracking-widest text-tertiary uppercase">Self Care</span>
          </div>
          <h3 className="text-xl font-bold font-headline mb-3">Sunscreen Reminder</h3>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-6">UV index is climbing to 6 today. Apply your SPF 50 before heading to the workspace.</p>
          <div className="bg-white/50 rounded-lg p-4 flex items-center gap-4">
            <div className="w-2 h-12 bg-tertiary rounded-full"></div>
            <div>
              <p className="text-xs font-bold text-tertiary">CURRENT UV</p>
              <p className="text-lg font-bold">Moderate (4)</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-8 shadow-[0_8px_24px_-4px_rgba(46,52,50,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold font-headline">Today's Rituals</h3>
            <button className="text-primary material-symbols-outlined">add_circle</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-container-low/50 group cursor-pointer hover:bg-surface-container-low transition-colors">
              <div className="w-6 h-6 rounded-full border-2 border-primary-fixed-dim flex items-center justify-center group-hover:bg-primary-fixed transition-colors"></div>
              <span className="text-on-surface font-medium">10-minute mindful breathing</span>
              <span className="ml-auto text-xs text-on-surface-variant">08:00 AM</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-container-low/50 group cursor-pointer hover:bg-surface-container-low transition-colors">
              <div className="w-6 h-6 rounded-full border-2 border-primary-fixed-dim flex items-center justify-center"></div>
              <span className="text-on-surface font-medium">Hydrate: 500ml of lemon water</span>
              <span className="ml-auto text-xs text-on-surface-variant">09:30 AM</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-container-low/50 group cursor-pointer hover:bg-surface-container-low transition-colors">
              <div className="w-6 h-6 rounded-full border-2 border-primary-fixed-dim flex items-center justify-center"></div>
              <span className="text-on-surface font-medium">Review weekly focus areas</span>
              <span className="ml-auto text-xs text-on-surface-variant">10:00 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <section className="mt-12 flex flex-wrap gap-3 justify-center">
      <button className="bg-secondary-container/50 backdrop-blur-md px-6 py-3 rounded-full text-on-secondary-container text-sm font-medium hover:bg-secondary-container transition-colors flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">auto_awesome</span>
        Plan my evening
      </button>
      <button className="bg-secondary-container/50 backdrop-blur-md px-6 py-3 rounded-full text-on-secondary-container text-sm font-medium hover:bg-secondary-container transition-colors flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">lightbulb</span>
        Improve my sleep
      </button>
      <button className="bg-secondary-container/50 backdrop-blur-md px-6 py-3 rounded-full text-on-secondary-container text-sm font-medium hover:bg-secondary-container transition-colors flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">psychology</span>
        Focus session
      </button>
    </section>
  </main>
);

const ChatTab = () => (
  <main className="min-h-screen pt-24 pb-32 px-6 max-w-4xl mx-auto flex flex-col">
    <section className="mb-12">
      <h2 className="font-headline text-4xl md:text-5xl font-bold text-primary tracking-tight leading-tight mb-4">
        Let's nurture <br/>your inner glow.
      </h2>
      <p className="text-on-surface-variant tracking-wide max-w-md">
        Your peaceful companion for growth, style, and mindful living.
      </p>
    </section>

    <div className="flex-1 space-y-10">
      <div className="flex flex-col items-start max-w-[85%]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <span className="font-headline font-semibold text-xs text-primary uppercase tracking-widest">Aura Intelligence</span>
        </div>
        <div className="bg-primary-container/40 backdrop-blur-md p-6 rounded-tr-xl rounded-br-xl rounded-bl-xl text-on-primary-container leading-relaxed shadow-sm">
          How can I help you grow today?
        </div>
      </div>

      <div className="flex flex-wrap gap-3 py-4">
        <button className="px-6 py-3 rounded-full bg-secondary-container/50 backdrop-blur-md text-on-secondary-container font-medium hover:bg-secondary-container transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">calendar_today</span>
          Plan my day
        </button>
        <button className="px-6 py-3 rounded-full bg-secondary-container/50 backdrop-blur-md text-on-secondary-container font-medium hover:bg-secondary-container transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">checkroom</span>
          What should I wear?
        </button>
        <button className="px-6 py-3 rounded-full bg-secondary-container/50 backdrop-blur-md text-on-secondary-container font-medium hover:bg-secondary-container transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">face_retouching_natural</span>
          Improve my skin
        </button>
      </div>
    </div>

    <div className="fixed bottom-32 left-0 w-full px-6 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div className="bg-surface-container-highest/90 backdrop-blur-2xl p-2 rounded-2xl flex items-center gap-2 shadow-xl ring-1 ring-black/5">
          <button className="p-3 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">add_circle</span>
          </button>
          <input className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline py-4 font-body outline-none" placeholder="Type your thoughts..." type="text" />
          <button className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-95 transition-transform">
            <span className="material-symbols-outlined">arrow_upward</span>
          </button>
        </div>
      </div>
    </div>
  </main>
);

const InsightsTab = () => (
  <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">
    <section className="mb-12">
      <h2 className="text-4xl font-extrabold font-headline tracking-tight text-primary mb-2">Today's Rhythm</h2>
      <p className="text-on-surface-variant font-body tracking-wide">Cultivating focus and balance.</p>
    </section>

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
            <span className="text-sm font-medium text-on-surface-variant tracking-widest">JUNE 24, 2024</span>
          </div>
          <div className="relative space-y-2">
            <div className="flex gap-6 group">
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-outline-variant tracking-widest py-1">09 AM</span>
                <div className="w-0.5 h-16 bg-surface-container-high"></div>
              </div>
              <div className="flex-1 pt-0.5 pb-4">
                <div className="p-4 rounded-lg bg-surface-container-highest/50 border-l-4 border-tertiary">
                  <p className="text-sm font-bold text-on-tertiary-container">Morning Reflection</p>
                  <p className="text-xs text-on-surface-variant mt-1">Gratitude and intentions</p>
                </div>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-primary tracking-widest py-1">10 AM</span>
                <div className="w-0.5 h-32 bg-primary/20"></div>
              </div>
              <div className="flex-1 pt-0.5 pb-4">
                <div className="p-6 rounded-lg bg-primary-container text-on-primary-container shadow-sm transform translate-x-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-bold">Study Session</p>
                      <p className="text-sm opacity-80">Deep Work: Psychology of Design</p>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-outline-variant tracking-widest py-1">12 PM</span>
                <div className="w-0.5 h-16 bg-surface-container-high"></div>
              </div>
              <div className="flex-1 pt-0.5 pb-4">
                <div className="p-4 rounded-lg bg-surface-container-highest/30">
                  <p className="text-sm font-semibold text-on-surface">Lunch Break</p>
                </div>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-outline-variant tracking-widest py-1">02 PM</span>
                <div className="w-0.5 h-20 bg-surface-container-high"></div>
              </div>
              <div className="flex-1 pt-0.5 pb-4">
                <div className="p-5 rounded-lg bg-surface-container-highest/80 flex justify-between items-center">
                  <div>
                    <p className="text-md font-bold text-on-surface">Client Call</p>
                    <p className="text-xs text-on-surface-variant">Update on Aura redesign</p>
                  </div>
                  <div className="flex -space-x-2">
                    <img alt="Avatar" className="w-8 h-8 rounded-full border-2 border-surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAywkgeSC4Uso3Z3kk1fx00CTzj0wtVykTQ6qERYteCVx7Tf19TdA-NzkKf_aoznW3KxiM_FqH-Q-wX-M4eiMgkJcbYjwwK0hz6DfgEdtZbX7VJbl-SlYtU72OmqpJAWI_CZWccaborZkrGC5WJ85VB54V6aCssVChVgwsKXBCWlxVugrw6BGhGlYiPKl9TXqPla7VMIeOohiWH4WHdRL8hJ_x_ZL2RHhmuGLJ3nuU-iOS2jhZKicJuurLtksqDrPKcqxhuu-ux0CU" />
                    <img alt="Avatar" className="w-8 h-8 rounded-full border-2 border-surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWRrgCVA7BWvvSGW6WLZNvCASnhtZBrfcXkYN3MQuds61RZuKTgIG6d6QOrQ9HCVJjuwYyOzQh6dtQhYXsLCLYp9U67jDtc5SoGpKrUWVVxvG4ZLQ27HeRHykzPMzgtg18p72gm1nwkQPgbpV6xFEF-a49vFHmJ5zkv6zaoSAfXOYGDoOrUj7obUpvnxDE__P2GpTxucb1AoE6rDIUlW4hkuuYsQd_vkYdZHMsNaI5ds6Cy3j7bSAIqrqPGOjp_0O-5IlaEZphUgg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-10">
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-surface-container">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold font-headline text-on-surface">Top Priorities</h3>
            <button className="text-primary text-sm font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-lg">add</span> New
            </button>
          </div>
          <ul className="space-y-4">
            <li className="flex items-center gap-4 group">
              <div className="w-6 h-6 rounded-md border-2 border-primary flex items-center justify-center cursor-pointer group-hover:bg-primary-fixed-dim transition-colors">
                <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface-variant line-through">Morning Reflection</p>
              </div>
              <span className="material-symbols-outlined text-outline-variant text-lg">drag_indicator</span>
            </li>
            <li className="flex items-center gap-4 group">
              <div className="w-6 h-6 rounded-md border-2 border-outline-variant flex items-center justify-center cursor-pointer group-hover:border-primary transition-colors"></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-on-surface">Study Session</p>
                <p className="text-[11px] text-on-surface-variant font-medium tracking-widest uppercase">Deep Focus</p>
              </div>
              <span className="material-symbols-outlined text-outline-variant text-lg">drag_indicator</span>
            </li>
          </ul>
        </div>

        <div className="bg-surface-container rounded-xl overflow-hidden relative aspect-square md:aspect-video lg:aspect-square group cursor-pointer">
          <img alt="Focus visual" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmUIf7t42thADtUvqrBI2bBA7SGewHNAKT83DJ1Ocjaj5HDPEjWvmhhgzx0Npporo1QKwKK-RB2tFjz3dUh6YUPeQLS87QluLmBN8b2YVzl3eDnvPXa9niTeUD1ZkWN6-s46cw6lzk7yiQom1pMpwR1G0hHniAlpgAByICjeamY50vnl7gsWn0kOlQe__l_eRWOiIi7QEjIAVl0XGWRRztdhE-Pg39cp6V7sf24-ddpkKVEP5wBbHW-GmQo_duksOvXDJkcDgcapk" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
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

const ProfileTab = () => (
  <main className="pt-24 px-6 max-w-2xl mx-auto space-y-10 pb-32">
    <section className="flex flex-col items-center text-center space-y-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-primary-container">
          <div className="w-full h-full rounded-full border-4 border-surface overflow-hidden">
            <img alt="Profile large" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCM2MJCv16IfCnNoaVOpLuAgiHUYqqIBIxY-dEFXPJhDAjHAsNQuHhk7VQE8GVse57BbBrr6swDhzU4oClEDCrVBHyopW-5v9Q0V0eOVAUAqX-w8oxlXCMGQHEaxy63IsaS9iOLmW156dWVMTpJ77YldFyfNEt0hxHhJSovNncr3QIc188rwporK9oPyir-Hw-aUpk2VVkYSWedt1ETeNZMLPDeDo7-eB4yLoXnOdhw7VCzuGW2QEJnpLgUKiIh-pP65cLBoqjh3uw" />
          </div>
        </div>
        <div className="absolute -bottom-2 right-0 bg-primary text-white rounded-full px-4 py-1 text-xs font-bold tracking-widest shadow-lg">
          LEVEL 4
        </div>
      </div>
      <div>
        <h2 className="text-4xl font-headline font-extrabold tracking-tight text-on-background">Elena Vance</h2>
        <p className="text-primary font-medium tracking-wide mt-1">Growth Level: Sprouting</p>
      </div>
    </section>

    <section className="grid grid-cols-2 gap-4">
      <div className="col-span-2 bg-surface-container-low p-8 rounded-xl flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest text-outline font-bold">Health Score</span>
          <p className="text-3xl font-headline font-bold text-on-background">85%</p>
        </div>
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
          <svg className="w-full h-full transform -rotate-90">
            <circle className="text-primary-container" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
            <circle className="text-primary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175" strokeDashoffset="26" strokeWidth="4"></circle>
          </svg>
          <span className="absolute material-symbols-outlined text-primary">favorite</span>
        </div>
      </div>
      <div className="bg-surface-container p-6 rounded-lg space-y-4">
        <div className="flex justify-between items-start">
          <span className="material-symbols-outlined text-tertiary">face</span>
          <span className="text-xs font-bold text-tertiary">92%</span>
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface-variant">Skin</p>
          <div className="h-1.5 w-full bg-outline-variant/20 rounded-full mt-2">
            <div className="h-full bg-tertiary rounded-full" style={{ width: '92%' }}></div>
          </div>
        </div>
      </div>
      <div className="bg-surface-container p-6 rounded-lg space-y-4">
        <div className="flex justify-between items-start">
          <span className="material-symbols-outlined text-primary">bolt</span>
          <span className="text-xs font-bold text-primary">78%</span>
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface-variant">Productivity</p>
          <div className="h-1.5 w-full bg-outline-variant/20 rounded-full mt-2">
            <div className="h-full bg-primary rounded-full" style={{ width: '78%' }}></div>
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
  </main>
);

