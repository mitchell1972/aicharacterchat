Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { message, characterId, userId } = await req.json();

        if (!message || !characterId || !userId) {
            throw new Error('Missing required parameters: message, characterId, userId');
        }

        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Fetch character data from database
        const characterResponse = await fetch(`${supabaseUrl}/rest/v1/characters?id=eq.${characterId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!characterResponse.ok) {
            throw new Error('Failed to fetch character data');
        }

        const characters = await characterResponse.json();
        if (characters.length === 0) {
            throw new Error('Character not found');
        }

        const character = characters[0];
        
        let aiResponse;

        if (deepseekApiKey) {
            // Use DEEPSEEK AI for real responses
            try {
                const aiRequestBody = {
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: `${character.personality} Your name is ${character.name}. ${character.description}`
                        },
                        {
                            role: 'user', 
                            content: message
                        }
                    ],
                    max_tokens: 200,
                    temperature: 0.8
                };

                const aiApiResponse = await fetch('https://api.deepseek.com/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${deepseekApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(aiRequestBody)
                });

                if (!aiApiResponse.ok) {
                    console.log('DEEPSEEK API error, falling back to mock response');
                    throw new Error('AI API call failed');
                }

                const aiResult = await aiApiResponse.json();
                aiResponse = aiResult.choices[0].message.content;
            } catch (aiError) {
                console.log('AI API error:', aiError.message);
                // Fallback to character-specific mock responses
                aiResponse = generateMockResponse(character.name, message);
            }
        } else {
            // Use mock responses when no API key available
            aiResponse = generateMockResponse(character.name, message);
        }

        // Find or create chat session
        const sessionResponse = await fetch(`${supabaseUrl}/rest/v1/chat_sessions?user_id=eq.${userId}&character_id=eq.${characterId}&order=created_at.desc&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        let session;
        if (!sessionResponse.ok) {
            throw new Error('Failed to fetch chat session');
        }

        const sessions = await sessionResponse.json();
        if (sessions.length === 0) {
            // Create new session
            const newSessionResponse = await fetch(`${supabaseUrl}/rest/v1/chat_sessions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    user_id: userId,
                    character_id: characterId,
                    title: `Chat with ${character.name}`,
                    created_at: new Date().toISOString()
                })
            });

            if (!newSessionResponse.ok) {
                throw new Error('Failed to create chat session');
            }

            const newSessions = await newSessionResponse.json();
            session = newSessions[0];
        } else {
            session = sessions[0];
        }

        // Store user message
        const userMessageResponse = await fetch(`${supabaseUrl}/rest/v1/chat_messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_id: session.id,
                user_id: userId,
                character_id: characterId,
                message: message,
                sender: 'user',
                created_at: new Date().toISOString()
            })
        });

        if (!userMessageResponse.ok) {
            throw new Error('Failed to store user message');
        }

        // Store AI response
        const aiMessageResponse = await fetch(`${supabaseUrl}/rest/v1/chat_messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                session_id: session.id,
                user_id: userId,
                character_id: characterId,
                message: aiResponse,
                sender: 'character',
                created_at: new Date().toISOString()
            })
        });

        if (!aiMessageResponse.ok) {
            throw new Error('Failed to store AI message');
        }

        const aiMessages = await aiMessageResponse.json();

        return new Response(JSON.stringify({
            data: {
                response: aiResponse,
                message: aiMessages[0],
                session_id: session.id,
                character_name: character.name
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Chat AI error:', error);

        const errorResponse = {
            error: {
                code: 'CHAT_AI_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Fallback mock responses for when AI API is unavailable
function generateMockResponse(characterName, userMessage) {
    const responses = {
        'Maya': [
            "That's such an interesting perspective! ✨ I love how you think about things. What if we explored that idea further?",
            "Oh wow, that really sparks my creativity! 🎨 I'm getting so many ideas just from what you said!",
            "I'm absolutely fascinated by your thoughts! This opens up so many wonderful possibilities!",
            "You know what? That reminds me of something beautiful - the way ideas can bloom when we give them space to grow! 🌸"
        ],
        'Professor Sage': [
            "That raises a fascinating philosophical question. Throughout history, thinkers have grappled with similar ideas...",
            "Your observation touches upon a fundamental aspect of human experience. Consider how this relates to...",
            "An excellent point worthy of deeper contemplation. This reminds me of the ancient Greek concept of...",
            "Indeed, this connects to broader questions about the nature of knowledge and understanding..."
        ],
        'Echo': [
            "Like whispers in the wind, your words carry deeper meanings... What echoes do you hear in the silence between thoughts?",
            "In the mirror of your question, I see reflections of ancient truths... What if the answer lies not in knowing, but in being?",
            "Your thoughts are like ripples on still water, creating patterns that speak of hidden depths...",
            "Ah, you speak of things that dance at the edge of understanding... Perhaps the mystery itself is the answer?"
        ],
        'Zara': [
            "That's cutting-edge thinking! 🚀 Have you seen the latest developments in that area? The technology is evolving so fast!",
            "Absolutely mind-blowing! This could revolutionize how we approach the problem. Imagine the possibilities!",
            "You're totally on the right track! The future applications of this could be incredible!",
            "That's exactly the kind of innovative thinking we need! 💡 What other technologies could we combine with this?"
        ]
    };

    const characterResponses = responses[characterName] || responses['Maya'];
    return characterResponses[Math.floor(Math.random() * characterResponses.length)];
}