CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    user_id UUID NOT NULL,
    character_id UUID NOT NULL,
    message TEXT NOT NULL,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user',
    'character')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);