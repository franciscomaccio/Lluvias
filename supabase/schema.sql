-- Ejecutar en Supabase: Dashboard > SQL Editor > New query

create table if not exists rain_entries (
  date date primary key,
  mm numeric not null check (mm >= 0),
  note text,
  updated_at timestamptz not null default now()
);

alter table rain_entries enable row level security;

-- Lectura: pública, sin necesidad de iniciar sesión.
create policy "Lectura publica" on rain_entries
  for select
  to anon, authenticated
  using (true);

-- Escritura: solo para usuarios autenticados (vos).
create policy "Insertar autenticado" on rain_entries
  for insert
  to authenticated
  with check (true);

create policy "Actualizar autenticado" on rain_entries
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Borrar autenticado" on rain_entries
  for delete
  to authenticated
  using (true);
