/**
 * Formats a WhatsApp number or slug into a proper wa.me link
 */
export function formatWhatsAppUrl(contact: string | undefined, text?: string) {
  if (!contact) return '#';
  
  let cleaned = contact.trim();
  
  // If it's a number (starts with digits or + followed by digits)
  if (/^\+?\d+/.test(cleaned.replace(/\s/g, ''))) {
    cleaned = cleaned.replace(/\D/g, '');
    // Ensure it has country code if it looks like a local Brazilian number
    if (cleaned.length === 11 && (cleaned.startsWith('11') || cleaned.startsWith('12'))) {
       // Assume Brazil if no CC and 11 digits
       cleaned = '55' + cleaned;
    }
  }
  
  const baseUrl = `https://wa.me/${cleaned}`;
  return text ? `${baseUrl}?text=${encodeURIComponent(text)}` : baseUrl;
}
