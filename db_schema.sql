CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    display_name text NOT NULL,
    phone text,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    avatar_seed text,
    avatar_url text,
    activo boolean DEFAULT true,
    genero text,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert" ON public.users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow admin to update any profile" ON public.users FOR UPDATE USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'COORD'));
CREATE POLICY "Allow admin to delete any profile" ON public.users FOR DELETE USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'COORD'));