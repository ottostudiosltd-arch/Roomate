// Minimalist TypeScript Definitions - RoomSync
// Supports open public postings with community report flags.

export interface RoommatePost {
  id: string;
  createdAt: string;
  name: string;
  area: string;
  requirement: string;
  contact: string;
  reportsCount: number;
  tags?: string[];
  googleMapsUrl?: string;
  isUpdate?: boolean;
  title?: string;
}
