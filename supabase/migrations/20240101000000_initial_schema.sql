-- Enable Row Level Security
ALTER TABLE IF EXISTS presentations ENABLE ROW LEVEL SECURITY;

-- Create presentations table
CREATE TABLE IF NOT EXISTS presentations (
  id TEXT PRIMARY KEY DEFAULT 'default',
  slides JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_slide_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies (permissive for now, can be tightened later)
CREATE POLICY "Allow all operations on presentations" ON presentations
  FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_presentations_updated_at
  BEFORE UPDATE ON presentations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default presentation if it doesn't exist
INSERT INTO presentations (id, slides, current_slide_index)
VALUES ('default', '[]'::jsonb, 0)
ON CONFLICT (id) DO NOTHING;

