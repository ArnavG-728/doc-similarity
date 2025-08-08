// import { supabase } from './supabase';
// import type { Database } from './supabase';

// type Profile = Database['public']['Tables']['profiles']['Row'];
// type JobDescription = Database['public']['Tables']['job_descriptions']['Row'];
// type ConsultantProfile = Database['public']['Tables']['consultant_profiles']['Row'];
// type ComparisonResult = Database['public']['Tables']['comparison_results']['Row'];

// export class DatabaseService {
//   // Profile operations
//   static async getProfile(userId: string): Promise<Profile | null> {
//     const { data, error } = await supabase
//       .from('profiles')
//       .select('*')
//       .eq('id', userId)
//       .single();
    
//     if (error) {
//       console.error('Error fetching profile:', error);
//       return null;
//     }
    
//     return data;
//   }

//   static async createProfile(profile: Database['public']['Tables']['profiles']['Insert']): Promise<Profile | null> {
//     const { data, error } = await supabase
//       .from('profiles')
//       .insert(profile)
//       .select()
//       .single();
    
//     if (error) {
//       console.error('Error creating profile:', error);
//       return null;
//     }
    
//     return data;
//   }

//   static async updateProfile(userId: string, updates: Database['public']['Tables']['profiles']['Update']): Promise<Profile | null> {
//     const { data, error } = await supabase
//       .from('profiles')
//       .update(updates)
//       .eq('id', userId)
//       .select()
//       .single();
    
//     if (error) {
//       console.error('Error updating profile:', error);
//       return null;
//     }
    
//     return data;
//   }

//   // Job Description operations
//   static async getJobDescriptions(userId?: string): Promise<JobDescription[]> {
//     let query = supabase.from('job_descriptions').select('*');
    
//     if (userId) {
//       query = query.eq('created_by', userId);
//     }
    
//     const { data, error } = await query.order('created_at', { ascending: false });
    
//     if (error) {
//       console.error('Error fetching job descriptions:', error);
//       return [];
//     }
    
//     return data || [];
//   }

//   static async getJobDescription(id: string): Promise<JobDescription | null> {
//     const { data, error } = await supabase
//       .from('job_descriptions')
//       .select('*')
//       .eq('id', id)
//       .single();
    
//     if (error) {
//       console.error('Error fetching job description:', error);
//       return null;
//     }
    
//     return data;
//   }

//   static async createJobDescription(jobDescription: Database['public']['Tables']['job_descriptions']['Insert']): Promise<JobDescription | null> {
//     const { data, error } = await supabase
//       .from('job_descriptions')
//       .insert(jobDescription)
//       .select()
//       .single();
    
//     if (error) {
//       console.error('Error creating job description:', error);
//       return null;
//     }
    
//     return data;
//   }

//   static async updateJobDescription(id: string, updates: Database['public']['Tables']['job_descriptions']['Update']): Promise<JobDescription | null> {
//     const { data, error } = await supabase
//       .from('job_descriptions')
//       .update(updates)
//       .eq('id', id)
//       .select()
//       .single();
    
//     if (error) {
//       console.error('Error updating job description:', error);
//       return null;
//     }
    
//     return data;
//   }

//   static async deleteJobDescription(id: string): Promise<boolean> {
//     const { error } = await supabase
//       .from('job_descriptions')
//       .delete()
//       .eq('id', id);
    
//     if (error) {
//       console.error('Error deleting job description:', error);
//       return false;
//     }
    
//     return true;
//   }

//   // Consultant Profile operations
//   static async getConsultantProfiles(userId?: string): Promise<ConsultantProfile[]> {
//     let query = supabase.from('consultant_profiles').select('*');
    
//     if (userId) {
//       query = query.eq('created_by', userId);
//     }
    
//     const { data, error } = await query.order('created_at', { ascending: false });
    
//     if (error) {
//       console.error('Error fetching consultant profiles:', error);
//       return [];
//     }
    
//     return data || [];
//   }

//   static async getConsultantProfile(id: string): Promise<ConsultantProfile | null> {
//     const { data, error } = await supabase
//       .from('consultant_profiles')
//       .select('*')
//       .eq('id', id)
//       .single();
    
//     if (error) {
//       console.error('Error fetching consultant profile:', error);
//       return null;
//     }
    
//     return data;
//   }

//   static async createConsultantProfile(profile: Database['public']['Tables']['consultant_profiles']['Insert']): Promise<ConsultantProfile | null> {
//     const { data, error } = await supabase
//       .from('consultant_profiles')
//       .insert(profile)
//       .select()
//       .single();
    
//     if (error) {
//       console.error('Error creating consultant profile:', error);
//       return null;
//     }
    
//     return data;
//   }

//   static async updateConsultantProfile(id: string, updates: Database['public']['Tables']['consultant_profiles']['Update']): Promise<ConsultantProfile | null> {
//     const { data, error } = await supabase
//       .from('consultant_profiles')
//       .update(updates)
//       .eq('id', id)
//       .select()
//       .single();
    
//     if (error) {
//       console.error('Error updating consultant profile:', error);
//       return null;
//     }
    
//     return data;
//   }

//   static async deleteConsultantProfile(id: string): Promise<boolean> {
//     const { error } = await supabase
//       .from('consultant_profiles')
//       .delete()
//       .eq('id', id);
    
//     if (error) {
//       console.error('Error deleting consultant profile:', error);
//       return false;
//     }
    
//     return true;
//   }

//   // Comparison Result operations
//   static async getComparisonResults(userId?: string): Promise<ComparisonResult[]> {
//     let query = supabase.from('comparison_results').select('*');
    
//     if (userId) {
//       query = query.eq('created_by', userId);
//     }
    
//     const { data, error } = await query.order('created_at', { ascending: false });
    
//     if (error) {
//       console.error('Error fetching comparison results:', error);
//       return [];
//     }
    
//     return data || [];
//   }

//   static async createComparisonResult(result: Database['public']['Tables']['comparison_results']['Insert']): Promise<ComparisonResult | null> {
//     const { data, error } = await supabase
//       .from('comparison_results')
//       .insert(result)
//       .select()
//       .single();
    
//     if (error) {
//       console.error('Error creating comparison result:', error);
//       return null;
//     }
    
//     return data;
//   }

//   static async getComparisonResult(id: string): Promise<ComparisonResult | null> {
//     const { data, error } = await supabase
//       .from('comparison_results')
//       .select('*')
//       .eq('id', id)
//       .single();
    
//     if (error) {
//       console.error('Error fetching comparison result:', error);
//       return null;
//     }
    
//     return data;
//   }
// } 


import mongoose, { Mongoose } from "mongoose";
import logger from "./logger";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) throw new Error("MONGODB_URI not defined");

declare global {
  var mongoose: { conn: Mongoose | null; promise: Promise<Mongoose> | null };
}

let cached = global.mongoose || { conn: null, promise: null };

const dbConnect = async (): Promise<Mongoose> => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { dbName: "doc-similarity" })
      .then((conn) => {
        logger.info("MongoDB connected");
        return conn;
      })
      .catch((err) => {
        logger.error("MongoDB connection failed", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default dbConnect;
