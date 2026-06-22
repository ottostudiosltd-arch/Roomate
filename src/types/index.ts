export type PostStatus = 'Active' | 'Roommate Found' | 'Under Review' | 'Appeal Submitted' | 'Verified' | 'Expired';

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
  deviceId?: string;
}

export const getPostStatus = (post: RoommatePost): PostStatus => {
  if (post.isUpdate) return 'Verified';
  
  // Check tags for status overrides (e.g. Status:Under Review, Status:Appeal Submitted)
  const statusTag = post.tags?.find(t => t.startsWith('Status:'));
  if (statusTag) {
    return statusTag.replace('Status:', '') as PostStatus;
  }
  
  // Backward compatibility check
  if (post.tags?.includes('Filled')) {
    return 'Roommate Found';
  }
  
  // Check if reported
  if (post.reportsCount > 0) {
    return 'Under Review';
  }
  
  // Check if expired (> 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  if (new Date(post.createdAt).getTime() < thirtyDaysAgo.getTime()) {
    return 'Expired';
  }

  return 'Active';
};

export const getPostAppealText = (post: RoommatePost): string => {
  const appealTag = post.tags?.find(t => t.startsWith('AppealText:'));
  return appealTag ? appealTag.replace('AppealText:', '') : '';
};
