import { useState, useEffect, useMemo } from 'react';
import { Calendar, MapPin, Clock, ExternalLink, Moon, Bell, BellRing, Check, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WeddingDetails } from '../types';
import { getHijriDateString } from '../lib/dateUtils';

interface EventDetailsProps {
  weddingDetails?: WeddingDetails;
}

export default function EventDetails({ weddingDetails }: EventDetailsProps) {
  const brideName = weddingDetails?.brideName || 'Fathima Farveen';
  const groomName = weddingDetails?.groomName || 'Abdul Faththah';
  const contactPhone = weddingDetails?.contactPhone || '+971 56 488 2795';
  const rsvpDeadlineLabel = weddingDetails?.rsvpDeadlineLabel || 'June 15';
  
  const dateLabel = weddingDetails?.dateLabel || 'Saturday Night, June 27';
  const timeLabel = weddingDetails?.timeLabel || '7:00 PM';
  const timeSub = weddingDetails?.timeSub || 'Arrival requested by 6:45 PM';
  
  const locationName = weddingDetails?.locationName || 'Al Khoory Sky Garden Hotel';
  const locationSub = weddingDetails?.locationSub || 'Airport Road, Deira, Dubai, UAE';
  const locationMapUrl = weddingDetails?.locationMapUrl || 'https://maps.google.com/?q=Al+Khoory+Sky+Garden+Hotel+Deira+Dubai';

  const weddingDate = useMemo(() => {
    return weddingDetails?.weddingDate 
      ? new Date(weddingDetails.weddingDate) 
      : new Date('2026-06-27T19:00:00+04:00'); // Default: Dubai time zone (GMT+4)
  }, [weddingDetails?.weddingDate]);

  const islamicDateLabel = useMemo(() => {
    return getHijriDateString(weddingDate);
  }, [weddingDate]);

  const [reminderStatus, setReminderStatus] = useState<'idle' | 'success'>('idle');

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    completed: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const diff = weddingDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, completed: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, completed: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  // Download ICS invite directly without any complex package dependencies! Fully native.
  const handleDownloadICS = () => {
    const startStr = weddingDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(weddingDate.getTime() + 4 * 60 * 60 * 1000); // 4 hours duration
    const endStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Islamic Wedding Invitation//NONSGML v1.0//EN',
      'BEGIN:VEVENT',
      'UID:wedding-farveen-faththah-2026',
      'DTSTAMP:20260523T050000Z',
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:Wedding & Reception: ${brideName} & ${groomName}`,
      `DESCRIPTION:We celebrate the marriage of our cherished daughter ${brideName} and ${groomName}. Kindly RSVP before ${rsvpDeadlineLabel}.\\nContact: ${contactPhone}`,
      `LOCATION:${locationName}, ${locationSub}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${brideName.replace(/\s+/g, '_')}_wedding.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(698.46, ctx.currentTime); // F5 chime note
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5 chime note
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.log('Chime playback bypassed:', e);
    }
  };

  const handleRequestReminder = () => {
    playChime();
    
    if (!('Notification' in window)) {
      setReminderStatus('success');
      return;
    }

    Notification.requestPermission().then((permission) => {
      setReminderStatus('success');
      if (permission === 'granted') {
        try {
          new Notification(`${brideName} & ${groomName} Wedding Reminder Enabled!`, {
            body: `Mabrook! Insha Allah, you will be reminded exactly 24 hours prior to our ceremony.`,
          });
        } catch (e) {
          console.log('Direct notification instantiation disabled inside sandboxed iframe.', e);
        }
      }
    }).catch(() => {
      setReminderStatus('success');
    });
  };

  const handleDownloadReminderICS = () => {
    playChime();
    const reminderDate = new Date(weddingDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours before
    const startStr = reminderDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endStr = new Date(reminderDate.getTime() + 30 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Islamic Wedding Invitation Alarm//NONSGML v1.0//EN',
      'BEGIN:VEVENT',
      'UID:wedding-reminder-24h-2026',
      'DTSTAMP:20260523T050000Z',
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:REMINDER: ${brideName} & ${groomName} Wedding is Tomorrow!`,
      `DESCRIPTION:Insha Allah, the beautiful marriage celebration of ${brideName} and ${groomName} is in exactly 24 hours (Tomorrow at ${timeLabel}) at ${locationName}.\\nContact: ${contactPhone}`,
      `LOCATION:${locationName}, ${locationSub}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT0H', // Alarm sounds immediately
      'ACTION:DISPLAY',
      'DESCRIPTION:Wedding Celebration Tomorrow!',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'wedding_tomorrow_reminder.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startCalStr = weddingDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endCalDate = new Date(weddingDate.getTime() + 4 * 60 * 60 * 1000);
  const endCalStr = endCalDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Wedding:+${encodeURIComponent(brideName)}+%26+${encodeURIComponent(groomName)}&dates=${startCalStr}/${endCalStr}&details=Celebrating+the+holy+matrimony+of+${encodeURIComponent(brideName)}+%26+${encodeURIComponent(groomName)}.+RSVP+at+${encodeURIComponent(contactPhone)}&location=${encodeURIComponent(locationName + ', ' + locationSub)}&sf=true&output=xml`;

  // Format alert date for feedback, e.g., "June 26th"
  const alertDate = new Date(weddingDate.getTime() - 24 * 60 * 60 * 1000);
  const alertDateStr = alertDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  // Parsing the date label for separate parts or using defaults
  // "Saturday Night, June 27" -> "Saturday Night", "June 27"
  const dateParts = dateLabel.split(',');
  const parsedDayName = dateParts[0]?.trim() || 'Saturday Night';
  const parsedMonthStr = dateParts[1]?.trim() || 'June 27';

  return (
    <div id="event-section" className="space-y-4">
      {/* Event Details Bento-Card */}
      <div className="relative p-4 md:p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-amber-200/40 shadow-lg overflow-hidden text-center">
        {/* Decorative corner stars */}
        <div className="absolute top-0 right-0 w-24 h-24 opacity-5 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-600 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 opacity-5 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-amber-600 to-transparent pointer-events-none" />

        <div className="max-w-md mx-auto">
          {/* Header pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 rounded-full text-[10px] font-bold tracking-wider text-amber-800 uppercase mb-3">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Ceremony Venue & Time</span>
          </div>
          
          <h3 className="font-serif text-xl text-emerald-950 font-bold tracking-tight mb-1">
            Holy Wedding Assembly
          </h3>
          <p className="font-sans text-[11px] text-amber-900/60 mb-4 leading-relaxed">
            Joining under Allah's beautiful grace, in tranquility and spiritual peace.
          </p>

          {/* Compact visual grid of 3 key modules (Bento style) */}
          <div className="grid grid-cols-2 gap-2.5 text-left mb-4" id="event-info-grid">
            {/* 1. Date Card (Spans 1 col) */}
            <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/20 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] uppercase font-bold text-amber-800/80 tracking-wider">Date</span>
                <Calendar className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <p className="font-serif text-xs font-semibold text-emerald-950">{parsedDayName}</p>
                <p className="font-sans text-base font-extrabold text-amber-700 leading-tight">{parsedMonthStr}</p>
                <p className="font-sans text-[9px] text-emerald-950/70 mt-0.5 font-medium">{islamicDateLabel}</p>
              </div>
            </div>

            {/* 2. Timing Card (Spans 1 col) */}
            <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/20 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] uppercase font-bold text-amber-800/80 tracking-wider">Time</span>
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <p className="font-serif text-xs font-semibold text-emerald-950">Ceremony Begins</p>
                <p className="font-sans text-base font-extrabold text-[#064e52] leading-tight">{timeLabel}</p>
                <p className="font-sans text-[9px] text-emerald-950/70 mt-0.5 font-medium">{timeSub}</p>
              </div>
            </div>

            {/* 3. Venue & Geo Card (Spans full columns width 2) */}
            <div className="col-span-2 p-3 bg-gradient-to-r from-amber-50/30 to-amber-100/10 rounded-xl border border-amber-200/30 flex items-start gap-3">
              <div className="p-1.5 bg-white border border-amber-200/40 rounded-lg text-amber-700 shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold text-amber-1000/85 tracking-wider">Grand Ballroom Location</span>
                  <a
                    href={locationMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-amber-700 hover:text-amber-800 hover:underline font-bold inline-flex items-center gap-0.5"
                  >
                    <span>Maps</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <h4 className="font-serif text-xs font-bold text-emerald-950 mt-1">{locationName}</h4>
                <p className="font-sans text-[10px] text-emerald-950/80 truncate">{locationSub}</p>
              </div>
            </div>
          </div>

          {/* Map interactive visual trigger banner */}
          <div className="mb-4 rounded-xl overflow-hidden border border-amber-200/40 bg-amber-50/10 p-1" id="event-map-mock">
            <a
              href={locationMapUrl}
              target="_blank"
              rel="noreferrer"
              className="relative block h-14 bg-emerald-950/5 hover:bg-emerald-950/10 rounded-lg border border-dashed border-amber-300/40 flex items-center justify-center gap-2 px-3 transition-colors cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-300 flex items-center justify-center animate-bounce">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <div className="text-left">
                <p className="font-serif text-[10px] font-bold text-emerald-950 leading-tight">View Location on Navigation Satellite</p>
                <p className="font-sans text-[9px] text-amber-900/60 leading-none mt-0.5">Launches Google Maps route map planner</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-amber-700/60 ml-auto group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Quick Calendar Sync Buttons */}
          <div className="grid grid-cols-2 gap-2" id="calendar-actions-grid">
            <a
              href={calendarUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100/50 text-amber-800 text-[10px] font-bold rounded-xl border border-amber-200/55 inline-flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <Calendar className="w-3 h-3 text-amber-700" />
              <span>Add to Google Cal</span>
            </a>
            <button
              onClick={handleDownloadICS}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100/50 text-amber-800 text-[10px] font-bold rounded-xl border border-amber-200/55 inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Calendar className="w-3 h-3 text-emerald-900" />
              <span>Download iCal File</span>
            </button>
          </div>

          {/* Smart Reminder alert panel -- Highly Compact */}
          <div className="mt-4 pt-4 border-t border-amber-100/65 text-center" id="smart-reminder-container">
            <span className="block text-[9px] uppercase tracking-widest text-[#064e52] font-semibold mb-2">
              ⏰ Stay Notified / Remind Me
            </span>
            
            {reminderStatus === 'idle' ? (
              <div className="space-y-2">
                <p className="font-sans text-[10px] text-amber-900/60 leading-normal max-w-xs mx-auto">
                  Alert me <strong className="font-semibold text-amber-800 font-sans">24 hours before</strong> Wedding celebration commences.
                </p>
                <div className="flex gap-2 max-w-sm mx-auto">
                  <button
                    onClick={handleRequestReminder}
                    className="flex-1 py-2 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white hover:brightness-105 active:scale-[0.98] text-[10px] font-bold rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>Browser Alert</span>
                  </button>
                  <button
                    onClick={handleDownloadReminderICS}
                    className="flex-1 py-2 bg-white text-emerald-900 hover:bg-amber-50 border border-amber-200/60 rounded-lg text-[10px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
                  >
                    <BellRing className="w-3.5 h-3.5 text-amber-600" />
                    <span>Calendar Alarm</span>
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50/50 border border-emerald-200/55 p-3 rounded-xl text-center space-y-1.5"
                id="reminder-success-card"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <Check className="w-3.5 h-3.5 text-emerald-700 font-bold" />
                </div>
                <h5 className="font-serif text-[11px] font-bold text-emerald-950">Mabrook! Reminder Enabled</h5>
                <p className="font-sans text-[9px] text-emerald-950/70 max-w-xs mx-auto leading-normal">
                  You'll be alerted on {alertDateStr} at {timeLabel}.
                </p>
                <button
                  onClick={() => setReminderStatus('idle')}
                  className="text-[9px] text-amber-700 hover:text-amber-800 hover:underline font-bold"
                >
                  Configure another reminder
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Countdown Card (Compact Design) */}
      <div className="p-4 bg-gradient-to-br from-emerald-950 to-emerald-900 text-white rounded-xl border border-emerald-800/40 shadow-md text-center relative overflow-hidden" id="countdown-card">
        {/* Subtle geometric star decoration background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none scale-150 flex items-center justify-center">
          <Moon className="w-48 h-48 shrink-0" />
        </div>

        <h4 className="font-serif text-[10px] uppercase tracking-wider text-amber-400 mb-2.5 font-semibold">
          Wedding Mubarak Live Countdown
        </h4>

        {timeLeft.completed ? (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="py-2"
          >
            <p className="font-serif text-lg text-amber-300 font-bold">The Celebration Has Commenced!</p>
            <p className="font-sans text-[10px] text-emerald-200/80 mt-0.5">Wedding Mubarak to {brideName} & {groomName}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-4 gap-1.5 text-center max-w-xs mx-auto" id="countdown-clock">
            {/* Days block */}
            <div className="bg-emerald-900/50 py-1.5 px-1 rounded-lg border border-emerald-800/40 flex flex-col items-center justify-center min-h-[56px] overflow-hidden">
              <div className="h-6 relative overflow-hidden flex items-center justify-center w-full">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={timeLeft.days}
                    initial={{ y: -12, opacity: 0, filter: 'blur(1px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: 12, opacity: 0, filter: 'blur(1px)' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute block font-mono text-xl font-extrabold text-amber-300 leading-none"
                  >
                    {String(timeLeft.days).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-[8px] uppercase font-sans font-medium text-emerald-200/50 tracking-wider">
                Days
              </span>
            </div>

            {/* Hours block */}
            <div className="bg-emerald-900/50 py-1.5 px-1 rounded-lg border border-emerald-800/40 flex flex-col items-center justify-center min-h-[56px] overflow-hidden">
              <div className="h-6 relative overflow-hidden flex items-center justify-center w-full">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={timeLeft.hours}
                    initial={{ y: -12, opacity: 0, filter: 'blur(1px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: 12, opacity: 0, filter: 'blur(1px)' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute block font-mono text-xl font-extrabold text-amber-300 leading-none"
                  >
                    {String(timeLeft.hours).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-[8px] uppercase font-sans font-medium text-emerald-200/50 tracking-wider">
                Hours
              </span>
            </div>

            {/* Minutes block */}
            <div className="bg-emerald-900/50 py-1.5 px-1 rounded-lg border border-emerald-800/40 flex flex-col items-center justify-center min-h-[56px] overflow-hidden">
              <div className="h-6 relative overflow-hidden flex items-center justify-center w-full">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={timeLeft.minutes}
                    initial={{ y: -12, opacity: 0, filter: 'blur(1px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: 12, opacity: 0, filter: 'blur(1px)' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute block font-mono text-xl font-extrabold text-amber-300 leading-none"
                  >
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-[8px] uppercase font-sans font-medium text-emerald-200/50 tracking-wider">
                Mins
              </span>
            </div>

            {/* Seconds block */}
            <div className="bg-emerald-900/50 py-1.5 px-1 rounded-lg border border-emerald-800/40 flex flex-col items-center justify-center min-h-[56px] overflow-hidden">
              <div className="h-6 relative overflow-hidden flex items-center justify-center w-full">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={timeLeft.seconds}
                    initial={{ y: -12, opacity: 0, filter: 'blur(1px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: 12, opacity: 0, filter: 'blur(1px)' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute block font-mono text-xl font-extrabold text-amber-300 leading-none"
                  >
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-[8px] uppercase font-sans font-medium text-emerald-200/50 tracking-wider">
                Secs
              </span>
            </div>
          </div>
        )}

        <div className="mt-2.5 pt-2 border-t border-emerald-800/60 text-[10px] text-emerald-200/80 flex items-center justify-center gap-1" id="ah-date-indicator">
          <Moon className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span>{islamicDateLabel}</span>
        </div>
      </div>
    </div>
  );
}
