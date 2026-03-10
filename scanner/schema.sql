CREATE TABLE IF NOT EXISTS agents (
  id          BIGSERIAL PRIMARY KEY,
  github_id   TEXT UNIQUE NOT NULL,
  source      TEXT DEFAULT 'github',
  name        TEXT NOT NULL,
  full_name   TEXT,
  owner       TEXT,
  description TEXT,
  url         TEXT,
  stars       INTEGER DEFAULT 0,
  forks       INTEGER DEFAULT 0,
  language    TEXT,
  topics      TEXT[] DEFAULT '{}',
  category    TEXT DEFAULT 'general',
  score       FLOAT DEFAULT 0,
  created_at  TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ,
  scanned_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_score    ON agents(score DESC);
CREATE INDEX IF NOT EXISTS idx_stars    ON agents(stars DESC);
CREATE INDEX IF NOT EXISTS idx_category ON agents(category);
CREATE INDEX IF NOT EXISTS idx_language ON agents(language);
CREATE INDEX IF NOT EXISTS idx_source   ON agents(source);
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value JSONB
);
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta   ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lecture_agents" ON agents FOR SELECT USING (true);
CREATE POLICY "lecture_meta"   ON meta   FOR SELECT USING (true);
CREATE OR REPLACE VIEW agent_stats AS SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE category='research') AS research,
  COUNT(*) FILTER (WHERE category='coding') AS coding,
  COUNT(*) FILTER (WHERE category='knowledge') AS knowledge,
  COUNT(*) FILTER (WHERE category='assistant') AS assistant,
  COUNT(*) FILTER (WHERE category='orchestration') AS orchestration,
  COUNT(*) FILTER (WHERE category='multimodal') AS multimodal,
  COUNT(*) FILTER (WHERE category='automation') AS automation,
  COUNT(*) FILTER (WHERE category='finance') AS finance,
  COUNT(*) FILTER (WHERE category='devops') AS devops,
  COUNT(*) FILTER (WHERE category='data') AS data,
  COUNT(*) FILTER (WHERE source='github') AS src_github,
  COUNT(*) FILTER (WHERE source LIKE 'huggingface%') AS src_huggingface,
  COUNT(*) FILTER (WHERE source='pypi') AS src_pypi,
  COUNT(*) FILTER (WHERE source='npm') AS src_npm,
  COUNT(*) FILTER (WHERE source='arxiv') AS src_arxiv,
  MAX(scanned_at) AS last_scan
FROM agents;
GRANT SELECT ON agent_stats TO anon;
