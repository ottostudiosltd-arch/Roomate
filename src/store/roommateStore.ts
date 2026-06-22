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

      const mappedPosts: RoommatePost[] = (data || []).map((dbPost: any) => ({
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
      }));

      set({ posts: mappedPosts, dbError: null });
    } catch (err: any) {
      console.error('Failed to fetch posts:', err);
      set({ dbError: err?.message || 'Failed to connect to database' });
    }
  },

  addPost: async (name, area, requirement, contact, tags = [], googleMapsUrl = '', isUpdate = false, title = '') => {
    try {
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
      // Find the post first to see its current reports count
      const { data: post, error: fetchErr } = await supabase
        .from('posts')
        .select('reports_count')
        .eq('id', id)
        .single();

      if (fetchErr || !post) {
        console.error('Error fetching reports count:', fetchErr);
        return;
      }

      const newReports = post.reports_count + 1;

      if (newReports >= 5) {
        // Auto-delete if reported 5 or more times
        const { error: delErr } = await supabase
          .from('posts')
          .delete()
          .eq('id', id);

        if (delErr) {
          console.error('Error auto-deleting reported post:', delErr);
          return;
        }

        set((state) => ({
          posts: state.posts.filter((p) => p.id !== id),
        }));
      } else {
        // Increment reports count in DB
        const { error: updateErr } = await supabase
          .from('posts')
          .update({ reports_count: newReports })
          .eq('id', id);

        if (updateErr) {
          console.error('Error updating reports count in Supabase:', updateErr);
          return;
        }

        set((state) => ({
          posts: state.posts.map((p) => 
            p.id === id ? { ...p, reportsCount: newReports } : p
          ),
        }));
      }
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
}));
