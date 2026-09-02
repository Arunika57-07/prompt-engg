-- Run this SQL in your Supabase SQL Editor to create the songs table

CREATE TABLE songs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    cover_url TEXT,
    audio_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Since this is a simple project without authentication, 
-- you might want to disable Row Level Security (RLS) for testing, or set policies.
-- To allow anonymous read/write (ONLY FOR TESTING):
-- ALTER TABLE songs DISABLE ROW LEVEL SECURITY;
