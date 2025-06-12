
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN ('active', 'inactive', 'prospect')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pipelines table
CREATE TABLE public.pipelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stages table
CREATE TABLE public.stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  pipeline_id UUID NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deals table
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  contact TEXT,
  value DECIMAL(10,2),
  priority TEXT NOT NULL DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
  stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
  confidential TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notes table
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for clients
CREATE POLICY "Users can view their own clients" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON public.clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON public.clients
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for pipelines
CREATE POLICY "Users can view their own pipelines" ON public.pipelines
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pipelines" ON public.pipelines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pipelines" ON public.pipelines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pipelines" ON public.pipelines
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for stages
CREATE POLICY "Users can view stages of their pipelines" ON public.stages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pipelines 
      WHERE id = pipeline_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create stages for their pipelines" ON public.stages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pipelines 
      WHERE id = pipeline_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stages of their pipelines" ON public.stages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.pipelines 
      WHERE id = pipeline_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete stages of their pipelines" ON public.stages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.pipelines 
      WHERE id = pipeline_id AND user_id = auth.uid()
    )
  );

-- Create RLS policies for deals
CREATE POLICY "Users can view their own deals" ON public.deals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deals" ON public.deals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deals" ON public.deals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deals" ON public.deals
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for notes
CREATE POLICY "Users can view notes on their deals" ON public.notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.deals 
      WHERE id = deal_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create notes on their deals" ON public.notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deals 
      WHERE id = deal_id AND user_id = auth.uid()
    ) AND auth.uid() = author_id
  );

CREATE POLICY "Users can update their own notes" ON public.notes
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own notes" ON public.notes
  FOR DELETE USING (auth.uid() = author_id);

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
