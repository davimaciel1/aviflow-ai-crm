
-- Atualizar a senha do usuário admin para uma senha provisória
-- A senha será "admin123" (hash gerado pelo Supabase)
UPDATE auth.users 
SET encrypted_password = crypt('admin123', gen_salt('bf'))
WHERE email = 'davi@ippax.com';

-- Garantir que o usuário está confirmado (sem tocar na coluna confirmed_at)
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email = 'davi@ippax.com';
