import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Profile } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isDemoMode: boolean
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<void>
  enableDemoMode: () => void
  disableDemoMode: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo user data
const DEMO_USER: User = {
  id: 'demo-user-123',
  email: 'demo@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  aud: 'authenticated',
  role: 'authenticated',
  user_metadata: { full_name: 'Demo User' },
  app_metadata: {},
  email_confirmed_at: new Date().toISOString(),
  phone_confirmed_at: null,
  confirmation_sent_at: null,
  recovery_sent_at: null,
  email_change_sent_at: null,
  new_email: null,
  invited_at: null,
  action_link: null,
  phone: null,
  new_phone: null,
  confirmed_at: new Date().toISOString(),
  banned_until: null,
  identities: [],
  factors: []
} as User

const DEMO_PROFILE: Profile = {
  user_id: 'demo-user-123',
  email: 'demo@example.com',
  full_name: 'Demo User',
  created_at: new Date().toISOString()
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(() => {
    return localStorage.getItem('demo_mode') === 'true'
  })

  // Load user on mount
  useEffect(() => {
    async function loadUser() {
      if (isDemoMode) {
        setUser(DEMO_USER)
        setProfile(DEMO_PROFILE)
        setSession({
          access_token: 'demo-token',
          refresh_token: 'demo-refresh',
          expires_in: 3600,
          expires_at: Date.now() / 1000 + 3600,
          token_type: 'bearer',
          user: DEMO_USER
        })
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setSession(session)
          setUser(session.user)
          
          // Load user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle()
          
          if (profile) {
            setProfile(profile)
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    // Set up auth listener for real auth mode only
    if (!isDemoMode) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session)
          setUser(session?.user || null)
          
          if (session?.user) {
            // Load user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle()
            
            setProfile(profile)
          } else {
            setProfile(null)
          }
        }
      )

      return () => subscription.unsubscribe()
    }
  }, [isDemoMode])

  const signIn = async (email: string, password: string) => {
    if (isDemoMode) {
      // Simulate successful login in demo mode
      setUser(DEMO_USER)
      setProfile(DEMO_PROFILE)
      setSession({
        access_token: 'demo-token',
        refresh_token: 'demo-refresh',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer',
        user: DEMO_USER
      })
      return { data: { user: DEMO_USER, session: null }, error: null }
    }

    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (isDemoMode) {
      // Simulate successful signup in demo mode
      const newUser = { ...DEMO_USER, email, user_metadata: { full_name: fullName || 'Demo User' } }
      const newProfile = { ...DEMO_PROFILE, email, full_name: fullName || 'Demo User' }
      
      setUser(newUser)
      setProfile(newProfile)
      setSession({
        access_token: 'demo-token',
        refresh_token: 'demo-refresh',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer',
        user: newUser
      })
      return { data: { user: newUser, session: null }, error: null }
    }

    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: fullName ? { full_name: fullName } : {},
        emailRedirectTo: `${window.location.protocol}//${window.location.host}/auth/callback`
      }
    })
  }

  const signOut = async () => {
    if (isDemoMode) {
      setUser(null)
      setProfile(null)
      setSession(null)
      return
    }

    await supabase.auth.signOut()
  }

  const enableDemoMode = () => {
    localStorage.setItem('demo_mode', 'true')
    setIsDemoMode(true)
    // Clear current session
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const disableDemoMode = () => {
    localStorage.removeItem('demo_mode')
    setIsDemoMode(false)
    // Clear demo session
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      isDemoMode,
      signIn,
      signUp,
      signOut,
      enableDemoMode,
      disableDemoMode
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}