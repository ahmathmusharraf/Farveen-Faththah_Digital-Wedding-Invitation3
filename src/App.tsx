import { useState, useEffect, useMemo } from 'react';
import { ViewMode, RSVP, WishDua, WeddingDetails } from './types';
import { getHijriYear } from './lib/dateUtils';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, onSnapshot, query, orderBy, setDoc, doc, updateDoc, increment, getDocFromServer } from 'firebase/firestore';
import RSVPForm from './components/RSVPForm';
import Guestbook from './components/Guestbook';
import EventDetails from './components/EventDetails';
import MusicPlayer from './components/MusicPlayer';
import GlitterDust from './components/GlitterDust';
import RoyalGatePass from './components/RoyalGatePass';
import GoldBorderFrame from './components/GoldBorderFrame';
import WeddingIcon from './components/WeddingIcon';
import EnvelopeView from './components/EnvelopeView';
import { 
  Heart, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Info, 
  Sparkles, 
  Gift, 
  MailOpen, 
  CheckCircle,
  Copy,
  Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// References to generated visual assets
// @ts-ignore
import weddingBanner from '@/src/assets/images/wedding_banner_royal_gold_1779529667041.png';

const initialWishes: WishDua[] = [
  {
    id: '1',
    name: 'Uncle Fawzy & Aunt Sameera',
    message: 'بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ. What a beautiful couple! We are so overjoyed to hear this news. Sending our sincere du\'as all the way from Muscat.',
    category: 'Dua',
    likes: 12,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: '2',
    name: 'The Fawser Family',
    message: 'Under Allah\'s divine guidance, two beautiful souls unite. A lifetime of tranquility, affection, and infinite barakah lies ahead for our dear daughter Farveen & Faththah. Alhamdulillah!',
    category: 'Blessing',
    likes: 18,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: '3',
    name: 'Brother Salman & Sarah',
    message: 'Mabrook to the golden couple! May Allah grant you both righteous offspring, deep affection, and high ranks in Jannah together. Ameen!',
    category: 'Congratulations',
    likes: 9,
    createdAt: Date.now() - 20 * 60 * 60 * 1000,
  }
];

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'nikkah' | 'venue' | 'rsvp' | 'gatepass' | 'duas'>('nikkah');

  useEffect(() => {
    const checkSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  useEffect(() => {
    // Reset view position on page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const contentContainer = document.getElementById('invitation-content-scroll');
    if (contentContainer) {
      contentContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeMobileTab]);

  // States with LocalStorage support
  const [rsvps, setRsvps] = useState<RSVP[]>(() => {
    const saved = localStorage.getItem('wedding_rsvps');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishes, setWishes] = useState<WishDua[]>(() => {
    const saved = localStorage.getItem('wedding_wishes');
    return saved ? JSON.parse(saved) : initialWishes;
  });

  // Dynamic Website details configuration with localStorage persistence
  const [weddingDetails, setWeddingDetails] = useState<WeddingDetails>(() => {
    const saved = localStorage.getItem('wedding_details');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean migration of old default 19:30 hours to 19:00 hours (7:00 PM)
        if (parsed.weddingDate === '2026-06-27T19:30:00+04:00' || parsed.timeLabel === '7:30 PM') {
          parsed.weddingDate = '2026-06-27T19:00:00+04:00';
          parsed.timeLabel = '7:00 PM';
          parsed.timeSub = 'Arrival requested by 6:45 PM';
          localStorage.setItem('wedding_details', JSON.stringify(parsed));
        }
        return parsed as WeddingDetails;
      } catch (e) {
        console.error("Failed to parse cached details, using fallback:", e);
      }
    }
    return {
      brideName: 'Fathima Farveen',
      brideSub: 'Our Cherished Daughter',
      brideParents: 'MR. MOHAMMAD FAWSER & MRS. ASMIKA WAHABDEEN',
      groomName: 'Abdul Faththah',
      groomSub: 'Son of Mr. & Mrs. M.H. Faslul Haq',
      weddingDate: '2026-06-27T19:00:00+04:00',
      dateLabel: 'Saturday Night, June 27',
      islamicDateLabel: '12 Dhu al-Hijjah 1447 AH',
      timeLabel: '7:00 PM',
      timeSub: 'Arrival requested by 6:45 PM',
      locationName: 'Al Khoory Sky Garden Hotel',
      locationSub: 'Airport Road, Deira, Dubai, UAE',
      locationMapUrl: 'https://maps.google.com/?q=Al+Khoory+Sky+Garden+Hotel+Deira+Dubai',
      rsvpDeadlineLabel: 'June 15',
      contactPhone: '+971 56 488 2795',
      groomPhone: '+971 56 488 2795',
      bridePhone: '+971 58 979 4114'
    };
  });

  const copyrightYear = useMemo(() => {
    try {
      const gYear = new Date(weddingDetails.weddingDate).getFullYear();
      const hYear = getHijriYear(new Date(weddingDetails.weddingDate));
      return `© ${hYear} AH / ${gYear}`;
    } catch {
      return `© 1447 AH / 2026`;
    }
  }, [weddingDetails.weddingDate]);

  const handleUpdateWeddingDetails = (updatedDetails: WeddingDetails) => {
    setWeddingDetails(updatedDetails);
    localStorage.setItem('wedding_details', JSON.stringify(updatedDetails));
  };

  // State synchronization with localStorage
  useEffect(() => {
    localStorage.setItem('wedding_rsvps', JSON.stringify(rsvps));
  }, [rsvps]);

  useEffect(() => {
    localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
  }, [wishes]);

  // Real-time Firestore synchronizer
  useEffect(() => {
    let isMounted = true;
    let unsubscribeRSVPs = () => {};
    let unsubscribeWishes = () => {};

    const setupSync = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Please check your Firebase configuration.");
        }
      }

      if (!isMounted) return;

      // 1. Listen to RSVPs collection
      const rsvpQuery = query(collection(db, 'rsvps'), orderBy('createdAt', 'desc'));
      unsubscribeRSVPs = onSnapshot(rsvpQuery, (snapshot) => {
        if (!isMounted) return;
        const dbRSVPs: RSVP[] = [];
        snapshot.forEach((doc) => {
          dbRSVPs.push(doc.data() as RSVP);
        });
        if (dbRSVPs.length > 0) {
          setRsvps(dbRSVPs);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'rsvps');
      });

      // 2. Listen to Guestbook/Wishes collection with robust seeding & client merging fallback
      const wishesQuery = query(collection(db, 'wishes'), orderBy('createdAt', 'desc'));
      unsubscribeWishes = onSnapshot(wishesQuery, async (snapshot) => {
        if (!isMounted) return;
        const dbWishes: WishDua[] = [];
        snapshot.forEach((doc) => {
          dbWishes.push(doc.data() as WishDua);
        });

        // Determine which initial wishes are missing from the data returned by Firestore
        const existingIds = new Set(dbWishes.map(w => w.id));
        const missingInitial = initialWishes.filter(w => !existingIds.has(w.id));

        // Always show the combination of Firestore-loaded wishes and missing initial/seed wishes.
        // This ensures the website never has blank UI while first-time/background seeding occurs,
        // and guarantees that added wishes don't get wiped out by state overrides during initial loads.
        const combinedWishes = [...dbWishes, ...missingInitial].sort((a, b) => b.createdAt - a.createdAt);
        setWishes(combinedWishes);

        // If Firestore is completely empty on first launch, start silent background seeding
        if (dbWishes.length === 0) {
          for (const wish of initialWishes) {
            setDoc(doc(db, 'wishes', wish.id), wish).catch((err) => {
              console.error("Failed to seed initial wish background write:", wish.id, err);
            });
          }
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'wishes');
      });
    };

    setupSync();

    return () => {
      isMounted = false;
      unsubscribeRSVPs();
      unsubscribeWishes();
    };
  }, []);

  const generateSafeUUID = () => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      try {
        return window.crypto.randomUUID();
      } catch (e) {
        // Fall through to pure Math.random fallback
      }
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleRSVPSubmit = async (newRSVP: Omit<RSVP, 'id' | 'createdAt'>) => {
    const rsvp: RSVP = {
      ...newRSVP,
      id: generateSafeUUID(),
      createdAt: Date.now(),
    };
    
    // Optimistic UI update
    setRsvps(prev => [rsvp, ...prev.filter(r => r.id !== rsvp.id)]);

    try {
      await setDoc(doc(db, 'rsvps', rsvp.id), rsvp);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `rsvps/${rsvp.id}`);
    }

    // Async push to Google Sheets Webhook if configured in Admin settings
    const webhookUrl = localStorage.getItem('wedding_apps_script_url');
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rsvp)
        });
        console.log("Real-time webhook post to Google Sheets accomplished!");
      } catch (err) {
        console.error("Webhook push error:", err);
      }
    }
  };

  const handleAddWish = async (newWish: Omit<WishDua, 'id' | 'likes' | 'createdAt'>) => {
    const wish: WishDua = {
      ...newWish,
      id: generateSafeUUID(),
      likes: 0,
      createdAt: Date.now(),
    };
    
    // Optimistic UI update
    setWishes(prev => [wish, ...prev.filter(w => w.id !== wish.id)]);

    try {
      await setDoc(doc(db, 'wishes', wish.id), wish);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `wishes/${wish.id}`);
    }
  };

  const handleLikeWish = async (id: string) => {
    // Optimistic UI update
    setWishes(prev => prev.map(w => w.id === id ? { ...w, likes: w.likes + 1 } : w));

    try {
      await updateDoc(doc(db, 'wishes', id), {
        likes: increment(1)
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `wishes/${id}`);
    }
  };

  const fallbackCopyText = (text: string, designation: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setCopiedAccount(designation);
        setTimeout(() => setCopiedAccount(null), 3000);
      }
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
  };

  const handleCopy = (text: string, designation: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedAccount(designation);
          setTimeout(() => setCopiedAccount(null), 3000);
        })
        .catch(() => {
          fallbackCopyText(text, designation);
        });
    } else {
      fallbackCopyText(text, designation);
    }
  };

  // Render core invitation single-view for premium mobile experience!
  const renderMobileSingleView = () => {
    // Determine active content
    const renderActiveTabContent = () => {
      switch (activeMobileTab) {
        case 'nikkah':
          return (
            <motion.div
              key="nikkah"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 pb-10"
              id="nikkah-tab-pane"
            >
              {/* Spiritual Opening */}
              <div className="space-y-3 text-center" id="intro-verse-section">
                <h2 className="font-serif text-[#064e52] text-sm md:text-base font-semibold tracking-wide animate-float-gentle">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </h2>
                <p className="font-sans text-[8px] text-amber-800 uppercase tracking-widest font-semibold">
                  IN THE NAME OF ALLAH, THE MOST GRACIOUS, THE MOST MERCIFUL
                </p>
                <div className="w-20 h-[1.5px] animate-gold-line mx-auto my-2 rounded-full" />
                
                {/* Arabic Quran Verse */}
                <p className="font-serif text-sm md:text-base text-emerald-950 font-medium leading-relaxed max-w-sm mx-auto" dir="rtl">
                  وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً
                </p>
                <p className="font-sans text-[10px] italic text-emerald-900/70 max-w-xs mx-auto leading-relaxed">
                  "And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy..."
                </p>
                <p className="font-sans text-[8px] text-amber-700 font-bold uppercase tracking-widest">
                  — SURAH AR-RUM: 21
                </p>
              </div>

              {/* Decorative ornament line */}
              <div className="flex items-center justify-center gap-2 text-amber-500 py-1">
                <div className="w-12 h-[1.5px] animate-gold-line rounded-full" />
                <Sparkles className="w-3 h-3 text-amber-400 animate-spin-slow" />
                <div className="w-12 h-[1.5px] animate-gold-line rounded-full" />
              </div>

              {/* Parents Context */}
              <div className="space-y-1 text-center font-sans">
                <p className="font-sans text-[8px] text-amber-800 uppercase tracking-widest font-medium">
                  We Celebrate the Holy Union of
                </p>
                <p className="font-sans text-[9px] text-amber-900/60 uppercase tracking-wider font-extrabold">
                  {weddingDetails.brideParents}
                </p>
                <p className="font-sans text-[10px] text-[#064e52] font-semibold max-w-xs mx-auto leading-relaxed">
                  request the honor of your presence to celebrate the Wedding ceremony of our cherished daughter
                </p>
              </div>

              {/* Names Display Card */}
              <div className="space-y-3 py-3 bg-gradient-to-b from-amber-50/20 to-transparent rounded-2xl p-4 border border-amber-500/10 shadow-sm text-center">
                <div>
                  <h1 className="font-serif text-xl md:text-2xl text-amber-600 font-bold tracking-tight">
                    {weddingDetails.brideName}
                  </h1>
                  <p className="font-sans text-[8px] text-amber-900/50 uppercase tracking-widest">
                    {weddingDetails.brideSub}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-12 h-[1.5px] animate-gold-line rounded-full" />
                  <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-600 animate-pulse" />
                  <div className="w-12 h-[1.5px] animate-gold-line rounded-full" />
                </div>
                <div>
                  <h1 className="font-serif text-xl md:text-2xl text-amber-600 font-bold tracking-tight">
                    {weddingDetails.groomName}
                  </h1>
                  <p className="font-sans text-[8px] text-amber-900/50 uppercase tracking-widest font-normal">
                    {weddingDetails.groomSub}
                  </p>
                </div>
              </div>

              {/* Prophet Sunnah quote block */}
              <div className="p-3 bg-amber-50/30 rounded-xl border border-amber-200/40 max-w-sm mx-auto shadow-sm text-center">
                <p className="font-sans text-[11px] font-semibold text-amber-900/80 mb-0.5" dir="rtl">
                  بَارَكَ اللهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
                </p>
                <p className="font-sans text-[9px] text-emerald-950 italic">
                  "May Allah bless for you, and shower His blessings upon you, and join you together in goodness."
                </p>
              </div>


              {/* Next Navigation Action */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveMobileTab('venue')}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-700 hover:to-teal-800 text-white font-sans font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 border border-emerald-700/30 cursor-pointer"
              >
                <span>Continue to Venue & Clock</span>
                <span className="text-amber-300 text-sm">→</span>
              </motion.button>
            </motion.div>
          );

        case 'venue':
          return (
            <motion.div
              key="venue"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 pb-12"
              id="venue-tab-pane"
            >
              <EventDetails weddingDetails={weddingDetails} />

              {/* Next Navigation Action */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveMobileTab('rsvp')}
                className="w-full py-3.5 bg-gradient-to-r from-[#064e52] to-emerald-950 text-white font-sans font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 border border-emerald-700/30 cursor-pointer"
              >
                <span>Continue to RSVP Form</span>
                <span className="text-amber-300 text-sm">→</span>
              </motion.button>
            </motion.div>
          );

        case 'rsvp':
          return (
            <motion.div
              key="rsvp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 pb-12"
              id="rsvp-tab-pane"
            >
              <RSVPForm onRSVPSubmit={handleRSVPSubmit} guestRSVPs={rsvps} />

              {/* Next Navigation Action */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveMobileTab('gatepass')}
                className="w-full py-3.5 bg-gradient-to-r from-[#064e52] to-emerald-950 text-white font-sans font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 border border-[#064e52]/35 cursor-pointer"
              >
                <span>Continue to Gate Pass Ticket</span>
                <span className="text-amber-300 text-sm">→</span>
              </motion.button>
            </motion.div>
          );

        case 'gatepass':
          return (
            <motion.div
              key="gatepass"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 pb-12"
              id="gatepass-tab-pane"
            >
              <RoyalGatePass rsvps={rsvps} weddingDetails={weddingDetails} />

              {/* Next Navigation Action */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveMobileTab('duas')}
                className="w-full py-3.5 bg-gradient-to-r from-[#064e52] to-emerald-950 text-white font-sans font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 border border-[#064e52]/35 cursor-pointer"
              >
                <span>Proceed to Guestbook Duas</span>
                <span className="text-amber-300 text-sm">→</span>
              </motion.button>
            </motion.div>
          );

        case 'duas':
          return (
            <motion.div
              key="duas"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 pb-12"
              id="duas-tab-pane"
            >
              <Guestbook wishes={wishes} onAddWish={handleAddWish} onLikeWish={handleLikeWish} weddingDetails={weddingDetails} />

              {/* Mini supportive Contact RSVP */}
              <div className="pt-6 border-t border-amber-200/40 space-y-4 text-center" id="support-footer-mini">
                <p className="font-sans text-[9px] font-bold text-emerald-950 tracking-[0.2em] uppercase">KINDLY RSVP SUPPORT</p>
                
                <div className="space-y-3 max-w-sm mx-auto text-left">
                  {/* Faththah's Support */}
                  <div className="bg-amber-50/40 p-2.5 rounded-2xl border border-amber-100/65 space-y-1.5">
                    <p className="font-sans text-[8.5px] uppercase tracking-wider text-amber-900/60 font-medium">Abdul Faththah (Groom)</p>
                    <div className="flex gap-2">
                      <a 
                        href="tel:+971564882795" 
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 bg-white border border-amber-100 rounded-full text-[10px] text-amber-900/95 font-bold transition-all active:scale-95 shadow-2xs group"
                      >
                        <Phone className="w-2.5 h-2.5 text-amber-700 group-hover:scale-110 transition-transform" />
                        <span>Call</span>
                      </a>
                      <a 
                        href="https://wa.me/971564882795" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 bg-emerald-50/60 border border-emerald-100/40 rounded-full text-[10px] text-emerald-800 font-bold transition-all active:scale-95 shadow-2xs group"
                      >
                        <MessageCircle className="w-2.5 h-2.5 text-emerald-600 fill-emerald-50 group-hover:scale-110 transition-transform" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Farveen's Support */}
                  <div className="bg-amber-50/40 p-2.5 rounded-2xl border border-amber-100/65 space-y-1.5">
                    <p className="font-sans text-[8.5px] uppercase tracking-wider text-amber-900/60 font-medium">Fathima Farveen (Bride)</p>
                    <div className="flex gap-2">
                      <a 
                        href="tel:+971589794114" 
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 bg-white border border-amber-100 rounded-full text-[10px] text-amber-900/95 font-bold transition-all active:scale-95 shadow-2xs group"
                      >
                        <Phone className="w-2.5 h-2.5 text-amber-700 group-hover:scale-110 transition-transform" />
                        <span>Call</span>
                      </a>
                      <a 
                        href="https://wa.me/971589794114" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 bg-emerald-50/60 border border-emerald-100/40 rounded-full text-[10px] text-emerald-800 font-bold transition-all active:scale-95 shadow-2xs group"
                      >
                        <MessageCircle className="w-2.5 h-2.5 text-emerald-600 fill-emerald-50 group-hover:scale-110 transition-transform" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Creative luxury designer stamp */}
                <div className="pt-2 flex flex-col items-center gap-1.5">
                  <div className="inline-flex items-center gap-1.5 bg-white/50 border border-amber-100/60 rounded-full px-3 py-1 shadow-4xs">
                    <span className="text-[7.5px] font-sans uppercase tracking-[0.1em] text-amber-900/40">Crafted by</span>
                    <a 
                      href="https://mushieditz.vercel.app/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[9px] font-serif font-black text-amber-800 hover:text-amber-950 underline decoration-amber-300 transition-colors"
                    >
                      Mushi Editz
                    </a>
                  </div>
                </div>
              </div>

              {/* Complete Restart/Back button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveMobileTab('nikkah')}
                className="w-full py-3 bg-gradient-to-r from-amber-700 to-amber-800 text-white font-sans font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1 border border-amber-700/30 cursor-pointer"
              >
                <span>↺ Return to Homepage</span>
              </motion.button>
            </motion.div>
          );
      }
    };

    // Calculation helper for current progress indicators
    const getProgressionInfo = () => {
      switch (activeMobileTab) {
        case 'nikkah': return { index: 1, title: 'Wedding Invitation' };
        case 'venue': return { index: 2, title: 'Venue & Clock' };
        case 'rsvp': return { index: 3, title: 'RSVP Response' };
        case 'gatepass': return { index: 4, title: 'Entrance Pass' };
        case 'duas': return { index: 5, title: 'Blessings & Duas' };
      }
    };
    const progress = getProgressionInfo();

    return (
      <div className="w-full bg-[#fdfbf8] min-h-screen text-[#2c1f17] flex flex-col relative pb-28" id="invitation-content-scroll">
        <GlitterDust />

        {/* Dynamic header tracker */}
        <div className="sticky top-0 z-30 bg-[#fdfbf8]/95 backdrop-blur-md border-b border-amber-600/10 py-3.5 px-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-800">
              {progress.index}
            </span>
            <div>
              <p className="text-[8px] uppercase font-sans font-extrabold text-amber-800 tracking-wider leading-none">Holy Union Celebrations</p>
              <h4 className="text-[11px] font-serif font-bold text-emerald-950 mt-1 leading-none">{progress.title}</h4>
            </div>
          </div>
          {/* Visual Progress steps */}
          <div className="flex items-center gap-1.5">
            {(['nikkah', 'venue', 'rsvp', 'gatepass', 'duas'] as const).map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveMobileTab(tab)}
                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeMobileTab === tab ? 'bg-amber-600 w-4' : 'bg-amber-200/50'
                }`}
                title={`Step ${i+1}`}
              />
            ))}
          </div>
        </div>

        {/* Custom Compact Mobile Banner decoration */}
        <div className="w-full relative overflow-hidden h-32 flex-shrink-0">
          <img 
            src={weddingBanner} 
            alt="Islamic Wedding Elegance Banner" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fdfbf8] via-transparent to-transparent" />
          <div className="absolute left-6 bottom-2 w-14 h-14 rounded-full border-2 border-amber-500/35 shadow-md overflow-hidden bg-[#151d1a] z-10 flex items-center justify-center p-0.5">
            <WeddingIcon className="w-full h-full" />
          </div>
        </div>

        {/* Container with popLayout transitions */}
        <div className="flex-1 px-4 pt-4 max-w-sm mx-auto w-full">
          <AnimatePresence mode="wait">
            {renderActiveTabContent()}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // Render core invitation timeline & contents
  const renderInvitationContent = () => {
    // If client is on mobile screen, or simulating mobile view mode, render the custom single view
    if (isSmallScreen || viewMode === 'mobile') {
      return renderMobileSingleView();
    }

    return (
      <div className="w-full bg-[#fdfbf8] min-h-screen text-[#2c1f17] flex flex-col items-center relative">
        {/* Falling Ambient White Petals & Glittering Stars */}
        <GlitterDust />

        {/* Dynamic Dual-Column Responsive Grid Layout for Monitors, Desktops, and Tablets */}
        <div className="w-full max-w-2xl lg:max-w-6xl xl:max-w-7xl px-5 sm:px-6 md:px-8 pt-8 md:pt-12 pb-24 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-12 items-start">
          
          {/* LEFT COLUMN: Invitation details and spiritual foundation (Sticky on widescreen monitors) */}
          <div className="lg:col-span-12 xl:col-span-5 lg:col-span-5 lg:sticky lg:top-24 space-y-8 text-center lg:text-left">
            {/* Elegant Hero Banner inside Left Box */}
            <div className="w-full relative overflow-hidden rounded-2xl shadow-md border border-amber-200/30" id="invitation-hero">
              <div className="w-full aspect-[21/9] lg:aspect-[16/10] relative">
                <img 
                  src={weddingBanner} 
                  alt="Islamic Wedding Elegance Banner" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#fdfbf8] via-transparent to-transparent opacity-85" />
              </div>
              
              {/* Central Ornament Icon overlay */}
              <div className="absolute left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 bottom-4 w-16 h-16 rounded-full border border-amber-500/35 shadow-md overflow-hidden bg-[#151d1a] z-10 animate-fade-in flex items-center justify-center p-0.5">
                <WeddingIcon className="w-full h-full" />
              </div>
            </div>

            {/* Spiritual Opening Verse */}
            <div className="space-y-3.5 pt-2" id="intro-verse-section">
              <h2 className="font-serif text-[#064e52] text-xl lg:text-2xl font-bold tracking-wide">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </h2>
              <p className="font-sans text-[9px] md:text-xs text-amber-800 uppercase tracking-widest font-semibold">
                IN THE NAME OF ALLAH, THE MOST GRACIOUS, THE MOST MERCIFUL
              </p>
              <div className="w-24 h-[1.5px] animate-gold-line mx-auto lg:mx-0 my-2 rounded-full" />
              
              {/* Arabic Quran Verse */}
              <p className="font-serif text-base lg:text-lg text-emerald-950 font-bold leading-normal" dir="rtl">
                وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً
              </p>
              <p className="font-sans text-[11px] md:text-xs italic text-emerald-900/70 leading-relaxed max-w-sm mx-auto lg:mx-0">
                "And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy..."
              </p>
              <p className="font-sans text-[9px] text-amber-700 font-bold uppercase tracking-widest leading-none">
                — SURAH AR-RUM: 21
              </p>
            </div>

            {/* Golden Ornamental Separator */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-amber-500 py-1">
              <div className="w-10 h-[1.5px] animate-gold-line lg:hidden rounded-full" />
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <div className="w-10 h-[1.5px] animate-gold-line rounded-full" />
            </div>

            {/* Host Details */}
            <div className="space-y-4">
              <p className="font-sans text-[10px] md:text-xs text-amber-800 uppercase tracking-[0.25em] font-medium leading-none">
                We Celebrate the Holy Union of
              </p>
              <div className="space-y-1">
                <p className="font-sans text-[10px] md:text-sm text-amber-900/60 font-bold uppercase tracking-wider leading-none">
                  {weddingDetails.brideParents}
                </p>
                <p className="font-sans text-[11px] md:text-xs text-[#064e52] font-semibold leading-relaxed max-w-md mx-auto lg:mx-0">
                  request the honor of your presence to celebrate the Wedding ceremony of our cherished daughter
                </p>
              </div>

              {/* Names Display Box */}
              <div className="p-5 bg-gradient-to-b from-amber-50/20 to-transparent rounded-2xl border border-amber-500/10 space-y-4 text-center">
                <div className="space-y-0.5">
                  <h1 className="font-serif text-2xl lg:text-3xl text-amber-600 font-extrabold tracking-tight">
                    {weddingDetails.brideName}
                  </h1>
                  <p className="font-sans text-[9px] text-amber-900/40 uppercase tracking-widest leading-none font-bold">
                    {weddingDetails.brideSub}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <div className="w-12 h-[1.5px] animate-gold-line rounded-full" />
                  <Heart className="w-4 h-4 text-amber-600 fill-amber-600 animate-pulse" />
                  <div className="w-12 h-[1.5px] animate-gold-line rounded-full" />
                </div>

                <div className="space-y-0.5">
                  <h1 className="font-serif text-2xl lg:text-3xl text-amber-600 font-extrabold tracking-tight">
                    {weddingDetails.groomName}
                  </h1>
                  <p className="font-sans text-[9px] text-amber-900/40 uppercase tracking-widest leading-none font-bold">
                    {weddingDetails.groomSub}
                  </p>
                </div>
              </div>

              {/* Marriage Prophetic Blessings */}
              <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/30 text-center lg:text-left shadow-xs">
                <p className="font-sans text-xs font-semibold text-amber-900/80 mb-1" dir="rtl">
                  بَارَكَ اللهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
                </p>
                <p className="font-sans text-[10px] md:text-[11px] text-emerald-950 italic">
                  "May Allah bless for you, and shower His blessings upon you, and join you together in goodness."
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Widgets & Information flow */}
          <div className="lg:col-span-12 xl:col-span-7 lg:col-span-7 space-y-8">
            {/* Live Countdowns, times, and location maps */}
            <div id="countdown-card">
              <GoldBorderFrame className="shadow-lg">
                <EventDetails weddingDetails={weddingDetails} />
              </GoldBorderFrame>
            </div>


            {/* Beautiful RSVP input box */}
            <div id="rsvp-card">
              <GoldBorderFrame className="shadow-lg">
                <RSVPForm onRSVPSubmit={handleRSVPSubmit} guestRSVPs={rsvps} />
              </GoldBorderFrame>
            </div>

            {/* Secure Ticket and gatepass locator */}
            <div id="gatepass-card">
              <GoldBorderFrame className="shadow-lg">
                <RoyalGatePass rsvps={rsvps} weddingDetails={weddingDetails} />
              </GoldBorderFrame>
            </div>

            {/* Interactive prayer wall guestbook */}
            <div id="guestbook-card">
              <GoldBorderFrame className="shadow-lg">
                <Guestbook wishes={wishes} onAddWish={handleAddWish} onLikeWish={handleLikeWish} weddingDetails={weddingDetails} />
              </GoldBorderFrame>
            </div>

            {/* Support and RSVP helpline footer */}
            <footer className="pt-10 border-t border-amber-200/55 text-center relative overflow-hidden space-y-6" id="invitation-support-footer">
              {/* Decorative top ornament flare */}
              <div className="flex items-center justify-center gap-2" id="footer-ornament">
                <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-amber-300" />
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-amber-300" />
              </div>

              <div className="space-y-1">
                <p className="font-sans font-extrabold text-[#11312c] tracking-[0.2em] uppercase text-[9px]">
                  KINDLY RSVP CONFIRMATION SUPPORT
                </p>
                <p className="text-[9.5px] font-sans text-amber-900/50 leading-relaxed max-w-xs mx-auto">
                  For attendance support or queries, contact us below:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left" id="contact-pills">
                {/* Groom's Contact Card */}
                <div className="bg-white/60 backdrop-blur-md border border-amber-200/30 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <p className="font-sans font-extrabold text-[#11312c] tracking-[0.1em] text-[10px] uppercase">
                      {weddingDetails.groomName} (Groom)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={`tel:${(weddingDetails.groomPhone || '+971 56 488 2795').replace(/[^0-9+]/g, '')}`} 
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-amber-50 border border-amber-200/50 rounded-full text-amber-900/95 hover:text-amber-950 font-bold transition-all duration-300 text-[10.5px] shadow-2xs active:scale-95 group"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                      <span>Call</span>
                    </a>
                    <a 
                      href={`https://wa.me/${(weddingDetails.groomPhone || '+971 56 488 2795').replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50/60 hover:bg-emerald-50/95 border border-emerald-200/40 rounded-full text-emerald-800 hover:text-emerald-950 font-bold transition-all duration-300 text-[10.5px] shadow-2xs active:scale-95 group"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-50 group-hover:scale-110 transition-transform" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Bride's Contact Card */}
                <div className="bg-white/60 backdrop-blur-md border border-amber-200/30 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    <p className="font-sans font-extrabold text-[#11312c] tracking-[0.1em] text-[10px] uppercase">
                      {weddingDetails.brideName} (Bride)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={`tel:${(weddingDetails.bridePhone || '+971 58 979 4114').replace(/[^0-9+]/g, '')}`} 
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-amber-50 border border-amber-200/50 rounded-full text-amber-900/95 hover:text-amber-950 font-bold transition-all duration-300 text-[10.5px] shadow-2xs active:scale-95 group"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                      <span>Call</span>
                    </a>
                    <a 
                      href={`https://wa.me/${(weddingDetails.bridePhone || '+971 58 979 4114').replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50/60 hover:bg-emerald-50/95 border border-emerald-200/40 rounded-full text-emerald-800 hover:text-emerald-950 font-bold transition-all duration-300 text-[10.5px] shadow-2xs active:scale-95 group"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-50 group-hover:scale-110 transition-transform" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Designer Signature Badge & Copyright */}
              <div className="mt-8 pt-4 flex flex-col items-center justify-center gap-3" id="designer-signature-block">
                {/* Micro Royal Stamp Seal */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/25 animate-spin-slow pointer-events-none" />
                  <div className="w-9 h-9 rounded-full border border-amber-400/35 bg-amber-500/5 flex items-center justify-center text-amber-600">
                    <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-500/10 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="font-sans text-[9px] font-medium text-[#2c1f17]/50 tracking-wide">
                    {copyrightYear}. Made with love for {weddingDetails?.groomName || 'Abdul Faththah'} & {weddingDetails?.brideName || 'Fathima Farveen'} celebrations.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                    <div className="inline-flex items-center gap-1.5 bg-white/45 hover:bg-amber-50/70 border border-amber-200/45 rounded-full px-3.5 py-1 transition-all duration-300 shadow-3xs group">
                      <span className="text-[8px] font-sans uppercase tracking-[0.14em] text-amber-900/45">Bespoke Digital Design by</span>
                      <a 
                        href="https://mushieditz.vercel.app/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[9.5px] font-serif font-black text-amber-800 hover:text-amber-950 tracking-wide underline decoration-amber-300/80 hover:decoration-amber-600 transition-all"
                      >
                        Mushi Editz
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>

        </div>
      </div>
    );
  };

  // Switch wrapper providing premium responsive simulation viewports!
  const renderSimulatedLayout = () => {
    if (isSmallScreen) {
      return renderInvitationContent();
    }

    switch (viewMode) {
      case 'mobile':
        return (
          <div className="min-h-screen bg-[#1c1511] py-8 px-4 flex flex-col items-center justify-center animate-fade-in" id="mobile-viewport-container">
            <p className="text-xs text-amber-300 font-bold mb-3 flex items-center gap-1">📱 Mobile View Simulation (iPhone Aspect Ratio)</p>
            {/* Elegant iPhone frame */}
            <div className="w-full max-w-[390px] h-[820px] rounded-[50px] border-[12px] border-[#c09958] bg-[#fdfbf8] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative">
              {/* Speaker & camera bar */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-full z-50 flex items-center justify-center">
                <span className="w-3 h-3 bg-zinc-800 rounded-full" />
                <span className="w-10 h-1 bg-zinc-900 rounded-full ml-4" />
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pt-6">
                {renderInvitationContent()}
              </div>
            </div>
          </div>
        );
      case 'tablet':
        return (
          <div className="min-h-screen bg-[#1c1511] py-10 px-6 flex flex-col items-center justify-center animate-fade-in" id="tablet-viewport-container">
            <p className="text-xs text-amber-300 font-bold mb-3 flex items-center gap-1">📟 Tablet View Simulation (iPad Aspect Ratio)</p>
            {/* Elegant Tablet frame */}
            <div className="w-full max-w-[768px] h-[1024px] rounded-[38px] border-[14px] border-[#c09958] bg-[#fdfbf8] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative">
              {/* Sensor notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-950 rounded-full z-50 shadow-inner" />
              <div className="flex-1 overflow-y-auto custom-scrollbar pt-3">
                {renderInvitationContent()}
              </div>
            </div>
          </div>
        );
      case 'desktop':
      default:
        return (
          <div className="w-full min-h-screen animate-fade-in" id="desktop-viewport-container">
            {renderInvitationContent()}
          </div>
        );
    }
  };

  return (
    <div id="application-root" className="relative min-h-screen bg-[#fcfaf7]">
      {/* Premium responsive Switcher Control panel */}
      <div className="sticky top-0 left-0 right-0 z-50 bg-[#16110e]/95 backdrop-blur-md border-b border-amber-900/30 text-white py-2 px-4 hidden md:flex flex-wrap gap-4 items-center justify-between" id="device-switcher-toolbar">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-amber-500 fill-amber-500" />
          <div>
            <h1 className="font-serif text-sm font-bold tracking-wider text-amber-400">Farveen & Faththah Wedding Invitation</h1>
          </div>
        </div>

        {/* Action controllers */}
        <div className="flex items-center gap-1.5" id="view-options-bar">
          <button
            onClick={() => setViewMode('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
              viewMode === 'desktop' ? 'bg-amber-600 text-white font-bold' : 'hover:bg-zinc-800 text-zinc-300'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden leading-none md:inline">Desktop</span>
          </button>
          <button
            onClick={() => setViewMode('tablet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
              viewMode === 'tablet' ? 'bg-amber-600 text-white font-bold' : 'hover:bg-zinc-800 text-zinc-300'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden leading-none md:inline">Tablet Preview</span>
            <span className="md:hidden">Tablet</span>
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
              viewMode === 'mobile' ? 'bg-amber-600 text-white font-bold' : 'hover:bg-zinc-800 text-zinc-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden leading-none md:inline">Mobile Screen UI UX</span>
            <span className="md:hidden">Mobile</span>
          </button>


        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isEnvelopeOpened ? (
          <EnvelopeView 
            brideName={weddingDetails.brideName} 
            groomName={weddingDetails.groomName} 
            onOpen={() => {
              setIsEnvelopeOpened(true);
              window.dispatchEvent(new Event('unveil-invitation'));
            }} 
          />
        ) : (
          /* Render Simulated Preview based on switch modes */
          <motion.div
            key="core-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full min-h-screen"
          >
            {renderSimulatedLayout()}
            {/* Ambient Audio control */}
            <MusicPlayer />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Glassmorphic Mobile Navigation Quick-HUD */}
      {isEnvelopeOpened && (isSmallScreen || viewMode === 'mobile') && (
        <motion.div 
          initial={{ y: 80, x: "-50%", opacity: 0 }}
          animate={{ y: 0, x: "-50%", opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.4 }}
          className="fixed bottom-6 left-1/2 w-[92%] max-w-sm bg-neutral-950/95 backdrop-blur-xl border border-amber-500/25 rounded-2xl py-2 px-1 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.6),0_0_20px_rgba(217,119,6,0.15)] flex justify-between items-center z-50 text-white" 
          id="mobile-floating-hud"
        >
          <button
            onClick={() => setActiveMobileTab('nikkah')}
            className={`flex flex-col items-center flex-1 py-1.5 text-center active:scale-95 transition-all cursor-pointer rounded-xl ${
              activeMobileTab === 'nikkah' ? 'bg-amber-500/10' : ''
            }`}
            title="Ceremony Core"
          >
            <Heart className={`w-4 h-4 transition-colors ${activeMobileTab === 'nikkah' ? 'text-amber-400 fill-amber-400' : 'text-zinc-400'}`} />
            <span className={`text-[9px] font-semibold mt-1 font-sans transition-colors ${activeMobileTab === 'nikkah' ? 'text-amber-300' : 'text-zinc-400'}`}>Wedding</span>
          </button>

          <button
            onClick={() => setActiveMobileTab('venue')}
            className={`flex flex-col items-center flex-1 py-1.5 text-center active:scale-95 transition-all cursor-pointer border-l border-zinc-800/40 rounded-xl ${
              activeMobileTab === 'venue' ? 'bg-amber-500/10' : ''
            }`}
            title="Venue location & time"
          >
            <MapPin className={`w-4 h-4 transition-colors ${activeMobileTab === 'venue' ? 'text-amber-400' : 'text-zinc-400'}`} />
            <span className={`text-[9px] font-semibold mt-1 font-sans transition-colors ${activeMobileTab === 'venue' ? 'text-amber-300' : 'text-zinc-400'}`}>Venue</span>
          </button>

          <button
            onClick={() => setActiveMobileTab('rsvp')}
            className={`flex flex-col items-center flex-1 py-1.5 text-center active:scale-95 transition-all cursor-pointer border-l border-zinc-800/40 rounded-xl ${
              activeMobileTab === 'rsvp' ? 'bg-amber-500/10' : ''
            }`}
            title="attendance response"
          >
            <CheckCircle className={`w-4 h-4 transition-colors ${activeMobileTab === 'rsvp' ? 'text-amber-400' : 'text-zinc-400'}`} />
            <span className={`text-[9px] font-semibold mt-1 font-sans transition-colors ${activeMobileTab === 'rsvp' ? 'text-amber-300' : 'text-zinc-400'}`}>RSVP</span>
          </button>

          <button
            onClick={() => setActiveMobileTab('gatepass')}
            className={`flex flex-col items-center flex-1 py-1.5 text-center active:scale-95 transition-all cursor-pointer border-l border-zinc-800/40 rounded-xl ${
              activeMobileTab === 'gatepass' ? 'bg-amber-500/10' : ''
            }`}
            title="Royal Entrance Pass"
          >
            <span className={`text-xs leading-none select-none transition-opacity ${activeMobileTab === 'gatepass' ? 'opacity-100' : 'opacity-50'}`}>🎫</span>
            <span className={`text-[9px] font-semibold mt-1 font-sans transition-colors ${activeMobileTab === 'gatepass' ? 'text-amber-300' : 'text-zinc-400'}`}>Pass</span>
          </button>

          <button
            onClick={() => setActiveMobileTab('duas')}
            className={`flex flex-col items-center flex-1 py-1.5 text-center active:scale-95 transition-all cursor-pointer border-l border-zinc-800/40 rounded-xl ${
              activeMobileTab === 'duas' ? 'bg-amber-500/10' : ''
            }`}
            title="Send duas & blessings"
          >
            <MessageCircle className={`w-4 h-4 transition-colors ${activeMobileTab === 'duas' ? 'text-amber-400' : 'text-zinc-400'}`} />
            <span className={`text-[9px] font-semibold mt-1 font-sans transition-colors ${activeMobileTab === 'duas' ? 'text-amber-300' : 'text-zinc-400'}`}>Duas</span>
          </button>
        </motion.div>
      )}

    </div>
  );
}
