-- 1. Criação das Tabelas
CREATE TABLE IF NOT EXISTS public.forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    status TEXT DEFAULT 'active'::text NOT NULL,
    questions JSONB DEFAULT '[]'::jsonb NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'new'::text NOT NULL,
    answers JSONB DEFAULT '{}'::jsonb NOT NULL,
    form_snapshot JSONB DEFAULT '[]'::jsonb NOT NULL
);

-- 2. Ativar Segurança (RLS - Row Level Security)
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 3. Criar Políticas de Acesso
-- (Público: Pode ler formulários ativos)
CREATE POLICY "Public can read active forms" ON public.forms
    FOR SELECT USING (status = 'active');

-- (Público: Pode enviar respostas)
CREATE POLICY "Public can insert submissions" ON public.submissions
    FOR INSERT WITH CHECK (true);

-- (Admin Logado: Pode fazer TUDO nos formulários)
CREATE POLICY "Admin can do anything on forms" ON public.forms
    FOR ALL USING (auth.role() = 'authenticated');
    
-- (Admin Logado: Pode fazer TUDO nas respostas)
CREATE POLICY "Admin can do anything on submissions" ON public.submissions
    FOR ALL USING (auth.role() = 'authenticated');

-- 4. Criar Usuário Admin Automático
-- OBS: A senha será: FiveFormsProd2026!
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@fiveforms.com',
    crypt('FiveFormsProd2026!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;
