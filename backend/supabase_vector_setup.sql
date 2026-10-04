-- ============================================================
-- KRISHIMIND AI — SUPABASE VECTOR DATABASE SETUP (pgvector)
-- Run this in your Supabase Project -> SQL Editor
-- ============================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create agricultural knowledge embeddings table
CREATE TABLE IF NOT EXISTS agricultural_knowledge_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    crop VARCHAR(50) DEFAULT 'all',
    topic VARCHAR(100) DEFAULT 'general',
    source VARCHAR(150),
    region VARCHAR(100) DEFAULT 'Pan-India',
    language VARCHAR(10) DEFAULT 'en',
    embedding vector(768), -- Gemini Text-Embedding-004 dimensions (768)
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create HNSW vector index for high-performance cosine similarity retrieval
CREATE INDEX IF NOT EXISTS ag_knowledge_embedding_idx 
ON agricultural_knowledge_embeddings 
USING hnsw (embedding vector_cosine_ops);

-- 4. Create vector similarity match function (RPC)
CREATE OR REPLACE FUNCTION match_agricultural_knowledge (
    query_embedding vector(768),
    match_threshold float DEFAULT 0.4,
    match_count int DEFAULT 5,
    filter_crop text DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    crop VARCHAR(50),
    topic VARCHAR(100),
    source VARCHAR(150),
    region VARCHAR(100),
    language VARCHAR(10),
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        k.id,
        k.title,
        k.content,
        k.crop,
        k.topic,
        k.source,
        k.region,
        k.language,
        (1 - (k.embedding <=> query_embedding))::float AS similarity
    FROM agricultural_knowledge_embeddings k
    WHERE (filter_crop IS NULL OR k.crop = 'all' OR k.crop ILIKE filter_crop)
      AND (1 - (k.embedding <=> query_embedding)) > match_threshold
    ORDER BY k.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 5. Seed initial agricultural knowledge chunks
INSERT INTO agricultural_knowledge_embeddings (title, content, crop, topic, source, region, language)
VALUES 
(
    'ICAR Wheat Water Management & Critical Growth Stages',
    'Wheat requires 4 to 6 irrigations depending upon soil type. The Critical Root Initiation (CRI) stage at 20-25 days after sowing and Flowering stage at 65-75 days are the most moisture-critical. Delaying irrigation during these periods can reduce yields by 20-30%. However, if topsoil moisture exceeds 70% or rainfall > 15mm is forecast within 24-48 hours, irrigation must be postponed to prevent root hypoxia.',
    'wheat',
    'irrigation',
    'ICAR Wheat Guidelines',
    'Pan-India',
    'en'
),
(
    'Wheat Soil Moisture & Nitrogen Balance',
    'Wheat grows best in well-drained loam or clay-loam soils with pH 6.0 to 7.5. Optimum root-zone soil moisture is between 60% and 75% of field capacity. If soil moisture exceeds 80%, nitrogen leaching occurs, causing characteristic yellowing of lower leaves (chlorosis).',
    'wheat',
    'soil management',
    'Directorate of Wheat Research',
    'Punjab & Haryana',
    'en'
),
(
    'Cotton Flowering & Boll Development Irrigation',
    'Cotton requires adequate moisture during peak squaring, flowering, and early boll development. Water deficit during this window induces extensive square and young boll shedding. In Vertisols (black cotton soil), avoid excess irrigation to prevent root rot and leaf reddening.',
    'cotton',
    'irrigation',
    'Central Institute for Cotton Research (CICR)',
    'Gujarat & Maharashtra',
    'en'
),
(
    'Tomato Drip Irrigation & Blossom End Rot Prevention',
    'Tomato requires uniform moisture to prevent blossom end rot (calcium deficiency induced by fluctuating water supply) and fruit cracking. Drip irrigation delivering 4-6 liters per plant per day during fruiting stage with fertigation provides optimal yield.',
    'tomato',
    'irrigation',
    'Indian Institute of Horticultural Research (IIHR)',
    'Pan-India',
    'en'
)
ON CONFLICT DO NOTHING;
