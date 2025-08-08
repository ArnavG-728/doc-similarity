-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('AR Requestor', 'Recruiter Admin')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_descriptions table
CREATE TABLE IF NOT EXISTS job_descriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create consultant_profiles table
CREATE TABLE IF NOT EXISTS consultant_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  skills TEXT[] NOT NULL,
  experience TEXT NOT NULL,
  education TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create comparison_results table
CREATE TABLE IF NOT EXISTS comparison_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_description_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
  consultant_profile_id UUID REFERENCES consultant_profiles(id) ON DELETE CASCADE,
  similarity_score DECIMAL(5,4) NOT NULL CHECK (similarity_score >= 0 AND similarity_score <= 1),
  analysis_result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_job_descriptions_created_by ON job_descriptions(created_by);
CREATE INDEX IF NOT EXISTS idx_consultant_profiles_created_by ON consultant_profiles(created_by);
CREATE INDEX IF NOT EXISTS idx_comparison_results_created_by ON comparison_results(created_by);
CREATE INDEX IF NOT EXISTS idx_comparison_results_job_description ON comparison_results(job_description_id);
CREATE INDEX IF NOT EXISTS idx_comparison_results_consultant_profile ON comparison_results(consultant_profile_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_descriptions_updated_at BEFORE UPDATE ON job_descriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultant_profiles_updated_at BEFORE UPDATE ON consultant_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Job Descriptions: Users can see all job descriptions but only modify their own
CREATE POLICY "Users can view all job descriptions" ON job_descriptions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own job descriptions" ON job_descriptions
  FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Users can update own job descriptions" ON job_descriptions
  FOR UPDATE USING (auth.uid()::text = created_by::text);

CREATE POLICY "Users can delete own job descriptions" ON job_descriptions
  FOR DELETE USING (auth.uid()::text = created_by::text);

-- Consultant Profiles: Users can see all consultant profiles but only modify their own
CREATE POLICY "Users can view all consultant profiles" ON consultant_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own consultant profiles" ON consultant_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Users can update own consultant profiles" ON consultant_profiles
  FOR UPDATE USING (auth.uid()::text = created_by::text);

CREATE POLICY "Users can delete own consultant profiles" ON consultant_profiles
  FOR DELETE USING (auth.uid()::text = created_by::text);

-- Comparison Results: Users can see all results but only modify their own
CREATE POLICY "Users can view all comparison results" ON comparison_results
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own comparison results" ON comparison_results
  FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Users can update own comparison results" ON comparison_results
  FOR UPDATE USING (auth.uid()::text = created_by::text);

CREATE POLICY "Users can delete own comparison results" ON comparison_results
  FOR DELETE USING (auth.uid()::text = created_by::text); 