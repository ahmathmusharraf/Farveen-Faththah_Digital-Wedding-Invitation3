export interface RSVP {
  id: string;
  name: string;
  attending: boolean;
  guestsCount: number;
  dietaryRequirements: string;
  message: string;
  whatsappContact: string;
  needsParking?: boolean;
  parkingSpaces?: number;
  createdAt: number;
}

export interface WishDua {
  id: string;
  name: string;
  message: string;
  category: 'Blessing' | 'Dua' | 'Love' | 'Congratulations';
  likes: number;
  createdAt: number;
}

export type ViewMode = 'desktop' | 'tablet' | 'mobile';

export interface WeddingEvent {
  title: string;
  subtitle: string;
  date: string;
  time: string;
  venueName: string;
  address: string;
  googleMapsUrl: string;
  arabicPhrase?: string;
}

export interface WeddingDetails {
  brideName: string;
  brideSub: string;
  brideParents: string;
  groomName: string;
  groomSub: string;
  weddingDate: string; // ISO string e.g. "2026-06-27T19:30:00+04:00"
  dateLabel: string; // "Saturday Night, June 27"
  islamicDateLabel: string; // "12 Dhu al-Hijjah 1447 AH"
  timeLabel: string; // "7:30 PM"
  timeSub: string; // "Arrival requested by 7:15 PM"
  locationName: string; // "Al Khoory Sky Garden Hotel"
  locationSub: string; // "Airport Road, Deira, Dubai, UAE"
  locationMapUrl: string; // "https://maps.google.com/?q=Al+Khoory+Sky+Garden+Hotel+Deira+Dubai"
  rsvpDeadlineLabel: string; // "June 15"
  contactPhone: string; // "+971 56 488 2795"
  groomPhone?: string; // "+971 56 488 2795"
  bridePhone?: string; // "+971 58 979 4114"
}

