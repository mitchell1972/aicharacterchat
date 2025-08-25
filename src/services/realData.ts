import { supabase, Character, ChatMessage, ChatSession } from '../lib/supabase'

// Real data service for production mode
export class RealDataService {
  private static instance: RealDataService
  
  static getInstance(): RealDataService {
    if (!RealDataService.instance) {
      RealDataService.instance = new RealDataService()
    }
    return RealDataService.instance
  }

  // Characters
  async getCharacters(): Promise<Character[]> {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Transform database characters to match our interface
      return (data || []).map(char => ({
        id: char.id,
        name: char.name,
        description: char.description || '',
        personality: char.personality || '',
        avatar_url: char.avatar_url,
        created_by: char.owner_id,
        is_public: char.is_active,
        created_at: char.created_at,
        updated_at: char.updated_at
      }))
    } catch (error) {
      console.error('Error fetching characters:', error)
      return []
    }
  }

  async getCharacterById(id: string): Promise<Character | null> {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle()
      
      if (error) throw error
      if (!data) return null
      
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        personality: data.personality || '',
        avatar_url: data.avatar_url,
        created_by: data.owner_id,
        is_public: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    } catch (error) {
      console.error('Error fetching character:', error)
      return null
    }
  }

  // Chat Sessions
  async getChatSessions(userId: string): Promise<ChatSession[]> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      
      return data || []
    } catch (error) {
      console.error('Error fetching chat sessions:', error)
      return []
    }
  }

  async getChatSessionById(id: string): Promise<ChatSession | null> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching chat session:', error)
      return null
    }
  }

  // Chat Messages
  async getChatMessages(userId: string, characterId: string): Promise<ChatMessage[]> {
    try {
      // First find the most recent session for this user and character
      const { data: sessions, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('character_id', characterId)
        .order('updated_at', { ascending: false })
        .limit(1)
      
      if (sessionError) throw sessionError
      if (!sessions || sessions.length === 0) return []
      
      const sessionId = sessions[0].id
      
      // Get messages for this session
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
      return (data || []).map(msg => ({
        id: msg.id,
        user_id: msg.user_id,
        character_id: msg.character_id,
        message: msg.message,
        sender: msg.sender as 'user' | 'character',
        created_at: msg.created_at
      }))
    } catch (error) {
      console.error('Error fetching chat messages:', error)
      return []
    }
  }

  // Send message and get AI response
  async sendMessage(userId: string, characterId: string, message: string): Promise<{ userMessage: ChatMessage; aiMessage: ChatMessage } | null> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          userId: userId,
          characterId: characterId,
          message: message
        }
      })
      
      if (error) throw error
      if (!data?.data) throw new Error('Invalid response from AI chat function')
      
      const response = data.data
      
      // Create user message object
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        user_id: userId,
        character_id: characterId,
        message: message,
        sender: 'user',
        created_at: new Date().toISOString()
      }
      
      // Use the AI message from the response
      const aiMessage: ChatMessage = response.message
      
      return { userMessage, aiMessage }
    } catch (error) {
      console.error('Error sending message:', error)
      return null
    }
  }
}