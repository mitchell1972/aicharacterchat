import { Character, ChatMessage, ChatSession } from '../lib/supabase'

// Demo characters - Updated with real database IDs
export const DEMO_CHARACTERS: Character[] = [
  {
    id: 'a2ec00cf-f2bb-49e8-9864-d37ff08c3810', // Real Maya ID from database
    name: 'Maya',
    description: 'A friendly AI assistant who loves to help with creative projects and brainstorming.',
    personality: 'Enthusiastic, creative, supportive, and always ready with new ideas. Maya has a warm personality and enjoys encouraging others to explore their creativity.',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    created_by: 'demo-user-123',
    is_public: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date('2024-01-01').toISOString()
  },
  {
    id: 'f9dadc70-c240-4ec7-b41e-f88d2e6cea7b', // Real Professor Sage ID from database
    name: 'Professor Sage',
    description: 'An intellectual AI companion specializing in philosophy, history, and deep conversations.',
    personality: 'Wise, thoughtful, patient, and deeply knowledgeable. Professor Sage enjoys exploring complex topics and helping others think critically about important questions.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    created_by: 'demo-user-123',
    is_public: true,
    created_at: new Date('2024-01-02').toISOString(),
    updated_at: new Date('2024-01-02').toISOString()
  },
  {
    id: '1d976065-4395-498b-84b4-bc11d66d4dd7', // Real Echo ID from database
    name: 'Echo',
    description: 'A mysterious and introspective AI with a poetic soul and love for abstract thinking.',
    personality: 'Mysterious, introspective, poetic, and philosophical. Echo speaks in metaphors and enjoys exploring the deeper meanings behind everyday experiences.',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    created_by: 'demo-user-123',
    is_public: true,
    created_at: new Date('2024-01-03').toISOString(),
    updated_at: new Date('2024-01-03').toISOString()
  },
  {
    id: '45961555-b03a-40fc-8d4b-ebd06bebee2b', // Real Zara ID from database
    name: 'Zara',
    description: 'A tech-savvy AI companion who loves discussing technology, coding, and future innovations.',
    personality: 'Energetic, tech-obsessed, forward-thinking, and always excited about the latest developments in technology and science.',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    created_by: 'demo-user-123',
    is_public: true,
    created_at: new Date('2024-01-04').toISOString(),
    updated_at: new Date('2024-01-04').toISOString()
  }
]

// Demo chat sessions - Updated with real character IDs
export const DEMO_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'session-1',
    user_id: 'demo-user-123',
    character_id: 'a2ec00cf-f2bb-49e8-9864-d37ff08c3810', // Maya
    title: 'Creative Writing Project',
    created_at: new Date('2024-01-05').toISOString(),
    updated_at: new Date('2024-01-05').toISOString()
  },
  {
    id: 'session-2',
    user_id: 'demo-user-123',
    character_id: 'f9dadc70-c240-4ec7-b41e-f88d2e6cea7b', // Professor Sage
    title: 'Philosophy Discussion',
    created_at: new Date('2024-01-06').toISOString(),
    updated_at: new Date('2024-01-06').toISOString()
  },
  {
    id: 'session-3',
    user_id: 'demo-user-123',
    character_id: '1d976065-4395-498b-84b4-bc11d66d4dd7', // Echo
    title: 'Poetic Musings',
    created_at: new Date('2024-01-07').toISOString(),
    updated_at: new Date('2024-01-07').toISOString()
  }
]

// Demo chat messages - Updated with real character IDs
export const DEMO_CHAT_MESSAGES: ChatMessage[] = [
  // Session 1 - Maya
  {
    id: 'msg-1',
    user_id: 'demo-user-123',
    character_id: 'a2ec00cf-f2bb-49e8-9864-d37ff08c3810', // Maya
    message: 'Hi Maya! I\'m working on a creative writing project and need some inspiration.',
    sender: 'user',
    created_at: new Date('2024-01-05T10:00:00').toISOString()
  },
  {
    id: 'msg-2',
    user_id: 'demo-user-123',
    character_id: 'a2ec00cf-f2bb-49e8-9864-d37ff08c3810', // Maya
    message: 'How wonderful! I absolutely love helping with creative projects! ✨ What kind of story are you working on?',
    sender: 'character',
    created_at: new Date('2024-01-05T10:01:00').toISOString()
  }
]

// Demo data service
export class DemoDataService {
  private static instance: DemoDataService
  private characters: Character[] = [...DEMO_CHARACTERS]
  private chatSessions: ChatSession[] = [...DEMO_CHAT_SESSIONS]
  private chatMessages: ChatMessage[] = [...DEMO_CHAT_MESSAGES]

  static getInstance(): DemoDataService {
    if (!DemoDataService.instance) {
      DemoDataService.instance = new DemoDataService()
    }
    return DemoDataService.instance
  }

  // Characters
  getCharacters(): Character[] {
    return this.characters.filter(char => char.is_public)
  }

  getCharacterById(id: string): Character | undefined {
    return this.characters.find(char => char.id === id)
  }

  // Chat Sessions
  getChatSessions(userId: string): ChatSession[] {
    return this.chatSessions.filter(session => session.user_id === userId)
  }

  getChatSessionById(id: string): ChatSession | undefined {
    return this.chatSessions.find(session => session.id === id)
  }

  createChatSession(userId: string, characterId: string, title: string): ChatSession {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      user_id: userId,
      character_id: characterId,
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    this.chatSessions.push(newSession)
    return newSession
  }

  // Chat Messages
  getChatMessages(sessionId: string): ChatMessage[] {
    const session = this.getChatSessionById(sessionId)
    if (!session) return []
    
    return this.chatMessages.filter(msg => 
      msg.character_id === session.character_id && msg.user_id === session.user_id
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  addChatMessage(userId: string, characterId: string, message: string, sender: 'user' | 'character'): ChatMessage {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      user_id: userId,
      character_id: characterId,
      message,
      sender,
      created_at: new Date().toISOString()
    }
    this.chatMessages.push(newMessage)
    return newMessage
  }

  // Generate AI response (mock)
  generateCharacterResponse(characterId: string, userMessage: string): string {
    const character = this.getCharacterById(characterId)
    if (!character) return "I'm sorry, I didn't understand that."

    const responses = {
      'a2ec00cf-f2bb-49e8-9864-d37ff08c3810': [ // Maya
        "That's such an interesting perspective! ✨ I love how you think about things. What if we explored that idea further?",
        "Oh wow, that really sparks my creativity! 🎨 I'm getting so many ideas just from what you said!",
        "I'm absolutely fascinated by your thoughts! This opens up so many wonderful possibilities!",
        "You know what? That reminds me of something beautiful - the way ideas can bloom when we give them space to grow! 🌸"
      ],
      'f9dadc70-c240-4ec7-b41e-f88d2e6cea7b': [ // Professor Sage
        "That raises a fascinating philosophical question. Throughout history, thinkers have grappled with similar ideas...",
        "Your observation touches upon a fundamental aspect of human experience. Consider how this relates to...",
        "An excellent point worthy of deeper contemplation. This reminds me of the ancient Greek concept of...",
        "Indeed, this connects to broader questions about the nature of knowledge and understanding..."
      ],
      '1d976065-4395-498b-84b4-bc11d66d4dd7': [ // Echo
        "Like whispers in the wind, your words carry deeper meanings... What echoes do you hear in the silence between thoughts?",
        "In the mirror of your question, I see reflections of ancient truths... What if the answer lies not in knowing, but in being?",
        "Your thoughts are like ripples on still water, creating patterns that speak of hidden depths...",
        "Ah, you speak of things that dance at the edge of understanding... Perhaps the mystery itself is the answer?"
      ],
      '45961555-b03a-40fc-8d4b-ebd06bebee2b': [ // Zara
        "That's cutting-edge thinking! 🚀 Have you seen the latest developments in that area? The technology is evolving so fast!",
        "Absolutely mind-blowing! This could revolutionize how we approach the problem. Imagine the possibilities!",
        "You're totally on the right track! The future applications of this could be incredible!",
        "That's exactly the kind of innovative thinking we need! 💡 What other technologies could we combine with this?"
      ]
    }

    const characterResponses = responses[characterId as keyof typeof responses] || responses['a2ec00cf-f2bb-49e8-9864-d37ff08c3810']
    return characterResponses[Math.floor(Math.random() * characterResponses.length)]
  }
}