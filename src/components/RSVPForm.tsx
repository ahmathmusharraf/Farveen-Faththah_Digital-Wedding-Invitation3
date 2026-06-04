import React, { useState } from 'react';
import { RSVP, WeddingDetails } from '../types';
import { Sparkles, Calendar, CheckCircle2, UserCheck, Heart, MessageCircle, Car, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RSVPFormProps {
  onRSVPSubmit: (rsvp: Omit<RSVP, 'id' | 'createdAt'>) => void;
  guestRSVPs: RSVP[];
  weddingDetails?: WeddingDetails;
}

export default function RSVPForm({ onRSVPSubmit, guestRSVPs, weddingDetails }: RSVPFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    attending: true,
    guestsCount: 1,
    dietaryRequirements: 'Halal Only',
    message: '',
    whatsappContact: '',
    needsParking: false,
    parkingSpaces: 1,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onRSVPSubmit({
      ...formData,
      guestsCount: formData.attending ? formData.guestsCount : 0,
      parkingSpaces: (formData.attending && formData.needsParking) ? formData.parkingSpaces : 0,
    });
    setSubmitted(true);
  };

  const quickMessages = [
    "Barakallahu lakuma! Perfect wishes.",
    "Thrilled to celebrate! Insha Allah we will be there.",
    "May Allah bless your union with endless barakah.",
    "Sending prayers & warmest love!"
  ];

  const totalAttending = guestRSVPs
    .filter(r => r.attending)
    .reduce((sum, r) => sum + (r.guestsCount || 1), 0);

  const getWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const attendanceStatus = formData.attending ? '✅ Attending (Insha Allah)' : '❌ Unable to Attend';
    const guestLabel = formData.attending ? `👥 ${formData.guestsCount} Guest(s)` : 'None';
    const blessings = formData.message.trim() ? `\n\n📌 *Message:* "${formData.message.trim()}"` : '';
    const contact = formData.whatsappContact.trim() ? `\n📞 *Contact:* ${formData.whatsappContact.trim()}` : '';

    const parkingStatus = formData.attending 
      ? (formData.needsParking ? `🚗 *Parking Required:* Yes (${formData.parkingSpaces} space${formData.parkingSpaces > 1 ? 's' : ''})` : '🚗 *Parking Required:* No')
      : '';
    const parkingLine = parkingStatus ? `\n${parkingStatus}` : '';

    const text = `*Wedding RSVP Confirmation* 🌟\n\nAssalamu Alaikum! I have submitted my RSVP for the wedding of *${weddingDetails?.brideName || 'Fathima Farveen'}* and *${weddingDetails?.groomName || 'Abdul Faththah'}*:\n\n👤 *Guest Name:* ${formData.name}\n💌 *Status:* ${attendanceStatus}\n${formData.attending ? `👥 *Total Guests:* ${formData.guestsCount}\n` : ''}${parkingLine}${contact}${blessings}\n\nSent from wedding website invitation. Insha Allah!`;
    
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div id="rsvp-section" className="relative p-4 md:p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-amber-200/40 shadow-lg overflow-hidden">
      {/* Decorative background stars */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-5 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-600 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-20 h-20 opacity-5 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-amber-600 to-transparent pointer-events-none" />

      <div className="max-w-md mx-auto text-center mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-full text-[9px] font-bold tracking-wider text-amber-800 uppercase mb-2">
          💌 Reply Before June 15th
        </span>
        <h3 className="font-serif text-lg md:text-xl text-emerald-950 font-bold tracking-tight">
          Kindly Respond / RSVP
        </h3>
        <p className="font-sans text-[10px] text-amber-900/65 leading-relaxed mt-1">
          Kindly submit your response below, so we can prepare your welcome. Insha Allah!
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="space-y-3 relative"
            id="rsvp-form"
          >
            {/* Name Input */}
            <div className="space-y-0.5 text-left">
              <label htmlFor="rsvp-name" className="block text-[9px] font-bold text-emerald-950/80 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                id="rsvp-name"
                name="name"
                type="text"
                required
                placeholder="Enter your name"
                className="w-full px-3 py-2 bg-amber-50/20 text-emerald-950 placeholder-emerald-900/35 font-sans text-xs border border-amber-200/50 rounded-lg focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Attendance Selector Tabs */}
            <div className="space-y-1 text-left">
              <span className="block text-[9px] font-bold text-emerald-950/80 uppercase tracking-wider">
                Will You Attend?
              </span>
              <div className="grid grid-cols-2 gap-2" id="rsvp-attendance-radios">
                <button
                  type="button"
                  id="rsvp-attend-yes"
                  onClick={() => setFormData({ ...formData, attending: true })}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border font-sans text-xs font-semibold transition-all cursor-pointer ${
                    formData.attending
                      ? 'bg-gradient-to-br from-emerald-800 to-emerald-950 text-white border-emerald-900 shadow-sm'
                      : 'bg-white text-emerald-950 border-amber-200/50 hover:bg-amber-50/30'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${formData.attending ? 'text-amber-300' : 'text-emerald-800'}`} />
                  <span className="text-[11px]">Yes, Insha Allah</span>
                </button>

                <button
                  type="button"
                  id="rsvp-attend-no"
                  onClick={() => setFormData({ ...formData, attending: false })}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border font-sans text-xs font-semibold transition-all cursor-pointer ${
                    !formData.attending
                      ? 'bg-gradient-to-br from-red-800 to-red-950 text-white border-red-900 shadow-sm'
                      : 'bg-white text-emerald-950 border-amber-200/50 hover:bg-amber-50/30'
                  }`}
                >
                  <span className="text-xs">😔</span>
                  <span className="text-[11px]">Unable to attend</span>
                </button>
              </div>
            </div>

            {/* Compact select options on the same row */}
            {formData.attending && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-3 text-left"
              >
                {/* Guest Count */}
                <div className="space-y-0.5">
                  <label htmlFor="rsvp-guests" className="block text-[9px] font-bold text-emerald-950/80 uppercase tracking-wider">
                    Total Attending
                  </label>
                  <select
                    id="rsvp-guests"
                    className="w-full px-2.5 py-2 bg-amber-50/20 text-emerald-950 border border-amber-200/50 rounded-lg focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition-all cursor-pointer font-sans text-xs"
                    value={formData.guestsCount}
                    onChange={(e) => setFormData({ ...formData, guestsCount: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Do you want parking Yes/No */}
                <div className="space-y-1">
                  <span className="block text-[9px] font-bold text-emerald-950/80 uppercase tracking-wider">
                    Do you need hotel parking?
                  </span>
                  <div className="grid grid-cols-2 gap-2" id="rsvp-parking-selection">
                    <button
                      type="button"
                      id="rsvp-parking-yes"
                      onClick={() => setFormData({ ...formData, needsParking: true })}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border font-sans text-xs font-semibold cursor-pointer transition-all ${
                        formData.needsParking
                          ? 'bg-gradient-to-br from-emerald-800 to-emerald-950 text-white border-emerald-900 shadow-sm'
                          : 'bg-white text-emerald-950 border-amber-200/50 hover:bg-amber-50/30'
                      }`}
                    >
                      <Car className={`w-3.5 h-3.5 ${formData.needsParking ? 'text-amber-300' : 'text-emerald-800'}`} />
                      <span className="text-[11px]">Yes</span>
                    </button>

                    <button
                      type="button"
                      id="rsvp-parking-no"
                      onClick={() => setFormData({ ...formData, needsParking: false })}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border font-sans text-xs font-semibold cursor-pointer transition-all ${
                        !formData.needsParking
                          ? 'bg-gradient-to-br from-amber-800 to-amber-950 text-white border-amber-900 shadow-sm'
                          : 'bg-white text-emerald-950 border-amber-200/50 hover:bg-amber-50/30'
                      }`}
                    >
                      <span className="text-[11px]">No, thanks</span>
                    </button>
                  </div>
                </div>

                {/* Number of Parking Spaces Inquiry (Only if needsParking is true) */}
                <AnimatePresence>
                  {formData.needsParking && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-0.5 text-left"
                      id="parking-spaces-section"
                    >
                      <label htmlFor="rsvp-parking-spaces" className="block text-[9px] font-bold text-emerald-950/80 uppercase tracking-wider">
                        How many parking spaces do you want?
                      </label>
                      <select
                        id="rsvp-parking-spaces"
                        className="w-full px-2.5 py-2 bg-amber-50/20 text-emerald-950 border border-amber-200/50 rounded-lg focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition-all cursor-pointer font-sans text-xs"
                        value={formData.parkingSpaces}
                        onChange={(e) => setFormData({ ...formData, parkingSpaces: Number(e.target.value) })}
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'Space' : 'Spaces'}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* WhatsApp Contact */}
            <div className="space-y-0.5 text-left">
              <label htmlFor="rsvp-whatsapp" className="block text-[9px] font-bold text-emerald-950/80 uppercase tracking-wider">
                WhatsApp Phone
              </label>
              <input
                id="rsvp-whatsapp"
                name="whatsapp"
                type="tel"
                placeholder="e.g. +971 50 XXXXXXX"
                className="w-full px-3 py-2 bg-amber-50/20 text-emerald-950 placeholder-emerald-900/35 border border-amber-200/50 rounded-lg focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition-all font-sans text-xs"
                value={formData.whatsappContact}
                onChange={(e) => setFormData({ ...formData, whatsappContact: e.target.value })}
              />
            </div>

            {/* Message Area with Horizontal suggestion chips */}
            <div className="space-y-0.5 text-left">
              <label htmlFor="rsvp-message" className="block text-[9px] font-bold text-emerald-950/80 uppercase tracking-wider">
                Blessings / Message to Couple
              </label>
              <textarea
                id="rsvp-message"
                name="message"
                rows={2}
                placeholder="Your warm prayers..."
                className="w-full px-3 py-2 bg-amber-50/20 text-emerald-950 placeholder-emerald-900/35 border border-amber-200/50 rounded-lg focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition-all resize-none font-sans text-xs"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
              {/* Horizontally scrollable creative blessing templates chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none snap-x" id="quick-messages-container">
                {quickMessages.map((msg, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData({ ...formData, message: msg })}
                    className="flex-shrink-0 text-[9px] font-medium tracking-wide px-2 py-1 bg-amber-50 border border-amber-100 rounded-full text-amber-800 hover:bg-amber-100/40 cursor-pointer transition-all snap-center"
                    title={msg}
                  >
                    💌 {msg.substring(0, 18)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              id="rsvp-submit-btn"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white font-sans font-bold text-xs rounded-xl border border-amber-700/60 cursor-pointer shadow-md flex items-center justify-center gap-1.5 overflow-hidden relative"
            >
              <div className="absolute inset-0 w-12 h-full bg-white/20 skew-x-12 -translate-x-full animate-gold-shine pointer-events-none" />
              <Sparkles className="w-4 h-4 text-amber-200 anim-pulse" />
              <span>Submit Invitation RSVP</span>
            </motion.button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 px-4 bg-amber-50/40 rounded-xl border border-amber-200/30"
            id="rsvp-success-view"
          >
            <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <h4 className="font-serif text-lg text-emerald-950 font-bold mb-1">
              Barak-Allah! Received
            </h4>
            <p className="font-sans text-[10px] text-emerald-950/80 mb-4 max-w-xs mx-auto leading-relaxed">
              Thank you, <strong className="text-amber-800 font-bold">{formData.name}</strong>, for responding! Your attendance preferences are logged safely.
            </p>

            {/* Optional WhatsApp notification action */}
            <div className="my-5 p-3.5 bg-emerald-50/40 border border-emerald-300/30 rounded-xl space-y-2 text-left shadow-2xs">
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-emerald-950 block text-center mb-0.5 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] inline-block animate-ping"></span>
                📲 OPTIONAL: NOTIFY FAMILIES VIA WHATSAPP
              </span>
              <p className="text-[9px] text-emerald-900/60 text-center leading-normal mb-3 leading-relaxed">
                Click a button below to automatically send your invitation RSVP details directly to either family over WhatsApp!
              </p>
              <div className="grid grid-cols-2 gap-2" id="whatsapp-notify-actions">
                <a
                  href={getWhatsAppLink(weddingDetails?.groomPhone || '+971 56 488 2795')}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2 bg-emerald-500/10 hover:bg-[#25D366] border border-[#25D366]/45 text-emerald-950 hover:text-white font-sans font-bold transition-all duration-300 uppercase shrink-0 rounded-lg text-[9.5px] cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Groom's Side</span>
                </a>
                <a
                  href={getWhatsAppLink(weddingDetails?.bridePhone || '+971 58 979 4114')}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2 bg-emerald-500/10 hover:bg-[#25D366] border border-[#25D366]/45 text-emerald-950 hover:text-white font-sans font-bold transition-all duration-300 uppercase shrink-0 rounded-lg text-[9.5px] cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Bride's Side</span>
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: '',
                  attending: true,
                  guestsCount: 1,
                  dietaryRequirements: 'Halal Only',
                  message: '',
                  whatsappContact: '',
                  needsParking: false,
                  parkingSpaces: 1,
                });
              }}
              className="px-3 py-1.5 bg-white text-emerald-950 hover:bg-amber-100/10 text-[10px] font-bold rounded-lg border border-amber-200 cursor-pointer transition-all mx-auto block"
            >
              Update Response
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guest confirmation counters -- Highly Compact */}
      <div className="mt-4 pt-4 border-t border-amber-100/70 flex justify-center text-center text-emerald-950 font-sans" id="rsvp-summary-counters">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-50 rounded-lg">
            <Calendar className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-left font-sans">
            <p className="text-[8px] text-amber-900/60 font-medium uppercase tracking-wider leading-none">Date of marriage</p>
            <p className="text-[11px] font-bold text-amber-950 mt-1 leading-none">27 June, 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
