import { Character, ChatMessage, ChatSession } from '../lib/supabase'
import { RealDataService } from './realData'
import { DemoDataService } from './demoData'

// Combined data service that uses real data in production and demo data in demo mode
export class DataService {
  private static instance: DataService
  private realService: RealDataService
  private demoService: DemoDataService
  
  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService()
    }
    return DataService.instance
  }
  
  constructor() {
    this.realService = RealDataService.getInstance()
    this.demoService = DemoDataService.getInstance()
  }
  
  private isDemoMode(): boolean {
    return localStorage.getItem('demo_mode') === 'true'
  }
  
  async getCharacters(): Promise<Character[]> {
    if (this.isDemoMode()) {
      return this.demoService.getCharacters()
    }
    return await this.realService.getCharacters()
  }
  
  async getCharacterById(id: string): Promise<Character | null> {
    if (this.isDemoMode()) {
      return this.demoService.getCharacterById(id) || null
    }
    return await this.realService.getCharacterById(id)
  }
  
  async getChatSessions(userId: string): Promise<ChatSession[]> {
    if (this.isDemoMode()) {
      return this.demoService.getChatSessions(userId)
    }
    return await this.realService.getChatSessions(userId)
  }
  
  async getChatMessages(userId: string, characterId: string): Promise<ChatMessage[]> {
    if (this.isDemoMode()) {
      // For demo mode, we need to find the session ID first
      const sessions = this.demoService.getChatSessions(userId)
      const session = sessions.find(s => s.character_id === characterId)
      if (!session) return []
      return this.demoService.getChatMessages(session.id)
    }
    return await this.realService.getChatMessages(userId, characterId)
  }
  
  async sendMessage(userId: string, characterId: string, message: string): Promise<{ userMessage: ChatMessage; aiMessage: ChatMessage } | null> {
    if (this.isDemoMode()) {
      // Use demo service for mock responses
      const userMessage = this.demoService.addChatMessage(userId, characterId, message, 'user')
      const aiResponse = this.demoService.generateCharacterResponse(characterId, message)
      const aiMessage = this.demoService.addChatMessage(userId, characterId, aiResponse, 'character')
      return { userMessage, aiMessage }
    }
    return await this.realService.sendMessage(userId, characterId, message)
  }
}