import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'AR Requestor' | 'Recruiter Admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'AR Requestor' | 'Recruiter Admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'AR Requestor' | 'Recruiter Admin'
          created_at?: string
          updated_at?: string
        }
      }
      job_descriptions: {
        Row: {
          id: string
          title: string
          description: string
          requirements: string
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          requirements: string
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          requirements?: string
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      consultant_profiles: {
        Row: {
          id: string
          name: string
          skills: string[]
          experience: string
          education: string
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          skills: string[]
          experience: string
          education: string
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          skills?: string[]
          experience?: string
          education?: string
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      comparison_results: {
        Row: {
          id: string
          job_description_id: string
          consultant_profile_id: string
          similarity_score: number
          analysis_result: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          job_description_id: string
          consultant_profile_id: string
          similarity_score: number
          analysis_result: string
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          job_description_id?: string
          consultant_profile_id?: string
          similarity_score?: number
          analysis_result?: string
          created_at?: string
          created_by?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 