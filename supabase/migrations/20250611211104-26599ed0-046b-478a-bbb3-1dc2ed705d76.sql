
-- Criar tabela de convites
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar status de aprovação na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Atualizar o usuário admin existente para aprovado
UPDATE public.profiles 
SET status = 'approved', role = 'admin' 
WHERE email = 'davi@ippax.com';

-- Criar RLS policies para convites
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Admins podem ver todos os convites
CREATE POLICY "Admins can view all invitations" ON public.invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin' AND status = 'approved'
    )
  );

-- Admins podem criar convites
CREATE POLICY "Admins can create invitations" ON public.invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin' AND status = 'approved'
    )
  );

-- Função para validar convites (acessível publicamente para permitir cadastro)
CREATE OR REPLACE FUNCTION public.validate_invitation_token(invitation_token TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.invitations 
    WHERE token = invitation_token 
      AND NOT used 
      AND expires_at > now()
  );
$$;

-- Função para marcar convite como usado
CREATE OR REPLACE FUNCTION public.use_invitation_token(invitation_token TEXT, user_email TEXT)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE public.invitations 
  SET used = true 
  WHERE token = invitation_token AND email = user_email;
$$;

-- Atualizar a função handle_new_user para usar convites
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    'client',
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
