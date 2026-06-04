import React, { useState } from 'react';
import { WishDua, WeddingDetails } from '../types';
import { Heart, MessageSquare, Plus, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GuestbookProps {
  wishes: WishDua[];
  onAddWish: (wish: Omit<WishDua, 'id' | 'likes' | 'createdAt'>) => void;
  onLikeWish: (id: string) => void;
  weddingDetails?: WeddingDetails;
}

export default function Guestbook({ wishes, onAddWish, onLikeWish, weddingDetails }: GuestbookProps) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'Blessing' | 'Dua' | 'Love' | 'Congratulations'>('Dua');
  const [isWritng, setIsWriting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    onAddWish({
      name: name.trim(),
      message: message.trim(),
      category,
    });

    setName('');
    setMessage('');
    setIsWriting(false);
  };

  const presetDuas = [
    { title: "Barakah Dua", text: "بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ (May Allah bless you both and unite you in goodness.)" },
    { title: "Quranic Marriage Verse", text: "ربنا هب لنا من أزواجنا وذرياتنا قرة أعين (Our Lord, grant us from among our spouses eyes of comfort.)" },
    { title: "Mabrook wishes", text: "Mabrook to the golden couple! May your marriage represent love, tranquility, and endless barakah, Ameen." }
  ];

  return (
    <div id="guestbook-section" className="relative p-4 md:p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-amber-200/40 shadow-lg overflow-hidden">
      {/* Decorative background stars */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-5 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-600 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-20 h-20 opacity-5 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-amber-600 to-transparent pointer-events-none" />

      <div className="max-w-md mx-auto text-center mb-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 rounded-full text-[9px] font-bold tracking-wider text-amber-800 uppercase mb-2">
          ✨ Continuous Charity & Dua
        </span>
        <h3 className="font-serif text-lg md:text-xl text-emerald-950 font-bold tracking-tight">
          Guestbook & Duas
        </h3>
        <p className="font-sans text-[10px] text-amber-900/60 leading-relaxed max-w-sm mx-auto mt-1">
          Share your beautiful prayers, messages, and duas for {weddingDetails?.brideName || "Fathima Farveen"} & {weddingDetails?.groomName || "Abdul Faththah"}.
        </p>
      </div>

      {/* Button to open writing pad */}
      {!isWritng ? (
        <div className="text-center mb-4" id="open-wishbook-trigger">
          <button
            onClick={() => setIsWriting(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-900 text-white font-sans font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>Write a Dua or Message</span>
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3.5 bg-gradient-to-tr from-amber-50/20 to-emerald-50/10 border border-amber-200/30 rounded-xl"
          id="wishbook-writing-panel"
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <h4 className="font-serif text-xs text-emerald-950 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
              <span>Compose Your Wedding Blessing</span>
            </h4>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="space-y-0.5">
                <label className="block text-[8px] font-bold text-emerald-950/70 uppercase">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Uncle Faris & Family"
                  className="w-full px-2.5 py-1.5 bg-white text-emerald-950 placeholder-emerald-950/30 border border-amber-200/40 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 outline-none transition-all font-sans"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-0.5">
                <label className="block text-[8px] font-bold text-emerald-950/70 uppercase">Dua Category</label>
                <div className="flex gap-0.5 bg-white p-0.5 rounded-lg border border-amber-200/40 font-sans text-[9px]">
                  {(['Dua', 'Blessing', 'Love', 'Mabrook'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat === 'Mabrook' ? 'Congratulations' : cat)}
                      className={`flex-1 py-1 rounded-md text-center font-bold transition-all cursor-pointer ${
                        (category === 'Congratulations' && cat === 'Mabrook') || category === cat
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-emerald-950 hover:bg-amber-50/60'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preset quick buttons - HORIZONTAL CHIPS SCROLL */}
            <div className="space-y-0.5 text-left">
              <span className="block text-[8px] font-bold text-amber-800 uppercase tracking-widest">Or choose prayer template:</span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none snap-x" id="preset-duas-horizontal">
                {presetDuas.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMessage(p.text)}
                    className="flex-shrink-0 text-left text-[9px] font-medium p-1.5 bg-white hover:bg-amber-50/50 border border-amber-150 rounded-lg text-emerald-950 truncate max-w-[200px] cursor-pointer transition-all snap-center"
                    title={p.text}
                  >
                    <span className="font-bold text-amber-700 mr-1">✨ {p.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Area */}
            <div className="space-y-0.5 text-left">
              <label className="block text-[8px] font-bold text-emerald-950/70 uppercase">Blessing Words</label>
              <textarea
                required
                rows={2}
                placeholder="May Allah unite your hearts with peace, security, love, and endless barakah. Ameen."
                className="w-full px-2.5 py-1.5 bg-white text-emerald-950 border border-amber-200/40 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 outline-none transition-all resize-none font-sans"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="flex gap-1.5 justify-end" id="submit-wish-controls">
              <button
                type="button"
                onClick={() => setIsWriting(false)}
                className="px-3 py-1 text-[10px] text-emerald-950 hover:bg-amber-100/10 rounded-lg border border-amber-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Share Dua
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Grid of existing wishes */}
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1.5 custom-scrollbar" id="wishes-scroller">
        {wishes.length === 0 ? (
          <div className="text-center py-6 text-amber-900/40">
            <MessageSquare className="w-8 h-8 mx-auto opacity-30 mb-1" />
            <p className="font-sans text-xs">No blessings written yet. Be the first!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {wishes.map((w, index) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="p-3.5 rounded-xl bg-white/70 border border-amber-200/20 shadow-xs relative group hover:border-amber-400/30 transition-all duration-300"
              >
                {/* Visual quote indicator */}
                <div className="absolute top-2 right-3.5 text-2xl font-serif text-amber-200/30 leading-none pointer-events-none select-none">
                  ”
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center font-serif text-amber-800 text-[10px] font-bold uppercase shadow-inner shrink-0">
                    {w.name.substring(0, 2)}
                  </div>
                  <div className="text-left leading-none">
                    <h5 className="font-sans text-xs font-bold text-emerald-950 leading-tight">{w.name}</h5>
                    <span className="inline-block px-1.5 py-0.5 bg-emerald-50 rounded-full text-[8px] font-bold text-emerald-800 tracking-wider uppercase mt-1">
                      {w.category}
                    </span>
                  </div>
                </div>

                {/* Substantive text greeting */}
                <p className="font-sans text-[11px] text-emerald-950/80 leading-relaxed text-left italic pr-3 pl-0.5">
                  {w.message}
                </p>

                {/* Footer with timestamp and heart likes */}
                <div className="mt-2.5 pt-2 border-t border-amber-100/60 flex items-center justify-between text-[9px] text-amber-900/50">
                  <span className="font-medium">
                    {new Date(w.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <button
                    onClick={() => onLikeWish(w.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-amber-100/30 text-amber-700 hover:text-amber-800 border border-amber-100/20 hover:border-amber-200/50 cursor-pointer transition-all active:scale-95 bg-white/40 shadow-xs"
                    title="Send an additional blessing"
                  >
                    <motion.div
                      key={w.likes}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: w.likes > 0 ? [1, 1.3, 1.05, 1] : 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="inline-block shrink-0"
                    >
                      <Heart className={`w-3 h-3 ${w.likes > 0 ? 'fill-amber-600 text-amber-600' : 'text-amber-700'}`} />
                    </motion.div>
                    <span className="font-semibold text-[9px]">{w.likes} Pearls</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
