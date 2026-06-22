import { create } from 'zustand';
import { RoommatePost } from '../types';
import { supabase } from '../lib/supabaseClient';

interface RoommateState {
  posts: RoommatePost[];
  dbError: string | null;
  fetchPosts: () => Promise<void>;
  addPost: (
    name: string,
    area: string,
    requirement: string,
    contact: string,
    tags?: string[],
    googleMapsUrl?: string,
    isUpdate?: boolean,
    title?: string
  ) => Promise<string>;
  reportPost: (id: string) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  markAsFilled: (id: string) => Promise<void>;
  submitAppeal: (id: string, explanation: string) => Promise<void>;
  verifyPost: (id: string) => Promise<void>;
  banContact: (contact: string) => Promise<void>;
  checkIsBanned: (contact: string) => Promise<boolean>;
}

export const useRoommateStore = create<RoommateState>((set) => ({
  posts: [],
  dbError: null,

  fetchPosts: async () => {
    try {
      set({ dbError: null });
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Raw database select results from Supabase:', data);

      if (error) {
        console.error('Error fetching posts from Supabase:', error);
        set({ dbError: error.message });
        return;
      }

      // Auto-expire / auto-delete reported posts older than 5 days (retention rule)
      const now = Date.now();
      const mappedPosts: RoommatePost[] = [];

      for (const dbPost of (data || [])) {
        const post: RoommatePost = {
          id: dbPost.id,
          createdAt: dbPost.created_at,
          name: dbPost.name,
          area: dbPost.area,
          requirement: dbPost.requirement,
          contact: dbPost.contact,
          reportsCount: dbPost.reports_count,
          tags: dbPost.tags || [],
          googleMapsUrl: dbPost.google_maps_url,
          isUpdate: dbPost.is_update,
          title: dbPost.title,
        };

        const isUnderReview = post.tags?.includes('Status:Under Review') || post.reportsCount > 0;
        const isAppeal = post.tags?.includes('Status:Appeal Submitted');
        const reportedAtTag = post.tags?.find(t => t.startsWith('ReportedAt:'));

        if ((isUnderReview || isAppeal) && reportedAtTag) {
          const reportedTime = parseInt(reportedAtTag.replace('ReportedAt:', ''));
          if (!isNaN(reportedTime) && now - reportedTime > 5 * 24 * 60 * 60 * 1000) {
            // Auto-delete from DB in background, skip loading it
            supabase.from('posts').delete().eq('id', post.id).then((res: any) => {
              const delErr = res.error;
              if (delErr) console.error('Failed to auto-delete expired reported post:', delErr);
            });
            continue;
          }
        }

        mappedPosts.push(post);
      }

      set({ posts: mappedPosts, dbError: null });
    } catch (err: any) {
      console.error('Failed to fetch posts:', err);
      set({ dbError: err?.message || 'Failed to connect to database' });
    }
  },

  addPost: async (name, area, requirement, contact, tags = [], googleMapsUrl = '', isUpdate = false, title = '') => {
    try {
      // 1. Check if contact number is globally banned (except for System Admin announcements)
      if (!isUpdate && contact) {
        const cleanedContact = contact.replace(/\D/g, '');
        try {
          const { data: banData, error: banErr } = await supabase
            .from('banned_contacts')
            .select('contact')
            .eq('contact', cleanedContact);

          if (!banErr && banData && banData.length > 0) {
            throw new Error('This phone number has been banned for violating community guidelines.');
          }
        } catch (banCheckErr: any) {
          console.warn('banned_contacts check skipped or table missing:', banCheckErr?.message);
          if (banCheckErr?.message?.includes('banned')) {
            throw banCheckErr;
          }
        }
      }

      const dbPost = {
        name,
        area,
        requirement,
        contact,
        reports_count: 0,
        tags,
        google_maps_url: googleMapsUrl,
        is_update: isUpdate,
        title,
      };

      const { data, error } = await supabase
        .from('posts')
        .insert(dbPost)
        .select()
        .single();

      if (error) {
        console.error('Error inserting post to Supabase:', error);
        throw error;
      }

      const newPost: RoommatePost = {
        id: data.id,
        createdAt: data.created_at,
        name: data.name,
        area: data.area,
        requirement: data.requirement,
        contact: data.contact,
        reportsCount: data.reports_count,
        tags: data.tags || [],
        googleMapsUrl: data.google_maps_url,
        isUpdate: data.is_update,
        title: data.title,
      };

      set((state) => ({
        posts: [newPost, ...state.posts],
        dbError: null
      }));

      return newPost.id;
    } catch (err) {
      console.error('Failed to add post:', err);
      throw err;
    }
  },

  reportPost: async (id) => {
    try {
      // Find the post first to see its current reports count and tags
      const { data: post, error: fetchErr } = await supabase
        .from('posts')
        .select('reports_count, tags')
        .eq('id', id)
        .single();

      if (fetchErr || !post) {
        console.error('Error fetching reports count:', fetchErr);
        return;
      }

      const newReports = post.reports_count + 1;
      const currentTags = post.tags ? [...post.tags] : [];

      // Filter out other status tags
      const updatedTags = currentTags.filter((t: string) => !t.startsWith('Status:'));
      updatedTags.push('Status:Under Review');

      // Add ReportedAt timestamp tag if not already present
      const hasReportedAt = currentTags.some(t => t.startsWith('ReportedAt:'));
      if (!hasReportedAt) {
        updatedTags.push(`ReportedAt:${Date.now()}`);
      }

      // Update in Supabase
      const { error: updateErr } = await supabase
        .from('posts')
        .update({ reports_count: newReports, tags: updatedTags })
        .eq('id', id);

      if (updateErr) {
        console.error('Error updating reports count in Supabase:', updateErr);
        return;
      }

      set((state) => ({
        posts: state.posts.map((p) => 
          p.id === id ? { ...p, reportsCount: newReports, tags: updatedTags } : p
        ),
      }));
    } catch (err) {
      console.error('Failed to report post:', err);
    }
  },

  deletePost: async (id) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting post from Supabase:', error);
        return;
      }

      set((state) => ({
        posts: state.posts.filter((p) => p.id !== id),
      }));
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  },

  markAsFilled: async (id) => {
    try {
      const { data: post, error: fetchErr } = await supabase
        .from('posts')
        .select('tags')
        .eq('id', id)
        .single();

      if (fetchErr || !post) {
        console.error('Error fetching tags to mark as filled:', fetchErr);
        return;
      }

      // Remove other statuses
      const currentTags = post.tags ? [...post.tags] : [];
      const updatedTags = currentTags.filter((t: string) => !t.startsWith('Status:') && t !== 'Filled');
      updatedTags.push('Status:Roommate Found');

      const { error } = await supabase
        .from('posts')
        .update({ tags: updatedTags })
        .eq('id', id);

      if (error) {
        console.error('Error marking post as filled in Supabase:', error);
        return;
      }

      set((state) => ({
        posts: state.posts.map((p) => 
          p.id === id ? { ...p, tags: updatedTags } : p
        ),
      }));
    } catch (err) {
      console.error('Failed to mark post as filled:', err);
    }
  },

  submitAppeal: async (id, explanation) => {
    try {
      const { data: post, error: fetchErr } = await supabase
        .from('posts')
        .select('tags')
        .eq('id', id)
        .single();

      if (fetchErr || !post) {
        console.error('Error fetching tags to submit appeal:', fetchErr);
        return;
      }

      // Filter out existing status and appeal text tags
      const currentTags = post.tags ? [...post.tags] : [];
      const updatedTags = currentTags.filter((t: string) => !t.startsWith('Status:') && !t.startsWith('AppealText:'));
      
      updatedTags.push('Status:Appeal Submitted');
      updatedTags.push(`AppealText:${explanation}`);

      const { error } = await supabase
        .from('posts')
        .update({ tags: updatedTags })
        .eq('id', id);

      if (error) {
        console.error('Error submitting appeal to Supabase:', error);
        return;
      }

      set((state) => ({
        posts: state.posts.map((p) => 
          p.id === id ? { ...p, tags: updatedTags } : p
        ),
      }));
    } catch (err) {
      console.error('Failed to submit appeal:', err);
    }
  },

  verifyPost: async (id) => {
    try {
      const { data: post, error: fetchErr } = await supabase
        .from('posts')
        .select('tags')
        .eq('id', id)
        .single();

      if (fetchErr || !post) {
        console.error('Error fetching tags to verify post:', fetchErr);
        return;
      }

      // Restore active, clear scam tag and clear appeal text
      const currentTags = post.tags ? [...post.tags] : [];
      const updatedTags = currentTags.filter(
        (t: string) => !t.startsWith('Status:') && !t.startsWith('AppealText:') && !t.startsWith('ReportedAt:') && t !== 'Filled'
      );
      updatedTags.push('Status:Verified');

      const { error } = await supabase
        .from('posts')
        .update({ reports_count: 0, tags: updatedTags })
        .eq('id', id);

      if (error) {
        console.error('Error verifying post in Supabase:', error);
        return;
      }

      set((state) => ({
        posts: state.posts.map((p) => 
          p.id === id ? { ...p, reportsCount: 0, tags: updatedTags } : p
        ),
      }));
    } catch (err) {
      console.error('Failed to verify post:', err);
    }
  },

  banContact: async (contact) => {
    try {
      const cleanedContact = contact.replace(/\D/g, '');
      if (!cleanedContact) return;

      try {
        await supabase
          .from('banned_contacts')
          .insert({ contact: cleanedContact });
      } catch (banErr) {
        console.error('Failed to insert into banned_contacts table:', banErr);
      }

      const { error: delErr } = await supabase
        .from('posts')
        .delete()
        .eq('contact', cleanedContact);

      if (delErr) {
        console.error('Failed to delete banned contact posts from Supabase:', delErr);
      }

      set((state) => ({
        posts: state.posts.filter((p) => p.contact.replace(/\D/g, '') !== cleanedContact),
      }));
    } catch (err) {
      console.error('Failed to ban contact:', err);
    }
  },

  checkIsBanned: async (contact) => {
    try {
      const cleanedContact = contact.replace(/\D/g, '');
      if (!cleanedContact) return false;

      const { data, error } = await supabase
        .from('banned_contacts')
        .select('contact')
        .eq('contact', cleanedContact);

      if (error) {
        console.warn('banned_contacts check failed, table might be missing:', error.message);
        return false;
      }

      return data && data.length > 0;
    } catch (err) {
      console.warn('Failed checking ban status:', err);
      return false;
    }
  }
}));
