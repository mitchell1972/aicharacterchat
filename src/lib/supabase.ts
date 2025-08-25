import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zjfilhbczaquokqlcoej.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZmlsaGJjemFxdW9rcWxjb2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzQ2MjIsImV4cCI6MjA3MTExMDYyMn0.b6YATor8UyDwYSiSagOQUxM_4sqfCv-89CBXVgC2hP0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  user_id: string
  email: string
  full_name: string
  created_at: string
  updated_at?: string
}

export interface Character {
  id: string
  name: string
  description: string
  personality: string
  avatar_url?: string
  created_by: string
  is_public: boolean
  created_at: string
  updated_at?: string
}

export interface ChatMessage {
  id: string
  user_id: string
  character_id: string
  message: string
  sender: 'user' | 'character'
  created_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  character_id: string
  title: string
  created_at: string
  updated_at?: string
}