// Database types for the Rider Community App

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          bike_type: string | null
          city: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          bike_type?: string | null
          city?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          bike_type?: string | null
          city?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          type: 'cop' | 'accident' | 'roadblock'
          description: string
          latitude: number
          longitude: number
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'cop' | 'accident' | 'roadblock'
          description: string
          latitude: number
          longitude: number
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'cop' | 'accident' | 'roadblock'
          description?: string
          latitude?: number
          longitude?: number
          created_at?: string
          expires_at?: string
        }
      }
      spots: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'water' | 'rest' | 'repair'
          latitude: number
          longitude: number
          average_rating: number
          total_reviews: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'water' | 'rest' | 'repair'
          latitude: number
          longitude: number
          average_rating?: number
          total_reviews?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'water' | 'rest' | 'repair'
          latitude?: number
          longitude?: number
          average_rating?: number
          total_reviews?: number
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          spot_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          spot_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          spot_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
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

// Helper types for easier use in components
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Alert = Database['public']['Tables']['alerts']['Row']
export type Spot = Database['public']['Tables']['spots']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']

export type AlertType = 'cop' | 'accident' | 'roadblock'
export type SpotType = 'water' | 'rest' | 'repair'
