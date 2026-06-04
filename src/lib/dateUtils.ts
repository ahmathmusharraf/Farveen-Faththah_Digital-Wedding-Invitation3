/**
 * Converts a Gregorian Date to Hijri (Umm al-Qura) Calendar date string.
 * Automatically formats as "DD Month Name YYYY AH".
 */
export function getHijriDateString(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '12 Dhu al-Hijjah 1447 AH';
    
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const parts = formatter.formatToParts(d);
    let day = '';
    let month = '';
    let year = '';
    
    for (const part of parts) {
      if (part.type === 'day') day = part.value;
      if (part.type === 'month') month = part.value;
      if (part.type === 'year') year = part.value;
    }
    
    if (day && month && year) {
      // Clean up common month variations to match standard spellings
      let cleanMonth = month;
      if (cleanMonth === "Dhu'l-Hijjah") {
        cleanMonth = "Dhu al-Hijjah";
      } else if (cleanMonth === "Dhu'l-Qi'dah") {
        cleanMonth = "Dhu al-Qi'dah";
      } else if (cleanMonth === "Shabaan" || cleanMonth === "Shaʻban" || cleanMonth === "Sha'ban") {
        cleanMonth = "Sha'ban";
      } else if (cleanMonth === "Rabi' I" || cleanMonth === "Rabīʻ I" || cleanMonth === "Rabi' I") {
        cleanMonth = "Rabi' al-Awwal";
      } else if (cleanMonth === "Rabi' II" || cleanMonth === "Rabīʻ II" || cleanMonth === "Rabi' II") {
        cleanMonth = "Rabi' al-Thani";
      } else if (cleanMonth === "Jumada I" || cleanMonth === "Jumādá I" || cleanMonth === "Jumada I") {
        cleanMonth = "Jumada al-Awwal";
      } else if (cleanMonth === "Jumada II" || cleanMonth === "Jumādá II" || cleanMonth === "Jumada II") {
        cleanMonth = "Jumada al-Thani";
      } else if (cleanMonth === "Shawwāl") {
        cleanMonth = "Shawwal";
      } else if (cleanMonth === "Muḥarram") {
        cleanMonth = "Muharram";
      } else if (cleanMonth === "Ṣafar") {
        cleanMonth = "Safar";
      } else if (cleanMonth === "Rajab") {
        cleanMonth = "Rajab";
      } else if (cleanMonth === "Ramaḍān" || cleanMonth === "Ramadan") {
        cleanMonth = "Ramadan";
      }
      return `${day} ${cleanMonth} ${year} AH`;
    }
  } catch (e) {
    console.error('Error calculating Hijri date:', e);
  }
  return '12 Dhu al-Hijjah 1447 AH'; // Safe fallback
}

/**
 * Returns the Hijri year (e.g. "1447") of a given date.
 */
export function getHijriYear(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '1447';
    
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      year: 'numeric'
    });
    
    const parts = formatter.formatToParts(d);
    for (const part of parts) {
      if (part.type === 'year') {
        return part.value;
      }
    }
  } catch (e) {
    console.error('Error calculating Hijri year:', e);
  }
  return '1447';
}
