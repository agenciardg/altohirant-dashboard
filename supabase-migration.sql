-- Tabela de configurações do dashboard
-- Execute este script no SQL Editor do Supabase

create table if not exists configuracoes (
  chave        text primary key,
  valor        text,
  atualizado_em timestamptz default now()
);

-- Permite leitura e escrita pública (mesma política da tabela principal)
alter table configuracoes enable row level security;

create policy "leitura publica" on configuracoes
  for select using (true);

create policy "escrita publica" on configuracoes
  for insert with check (true);

create policy "atualizacao publica" on configuracoes
  for update using (true);

-- Insere valor padrão vazio para a logo (evita upsert falhar na primeira vez)
insert into configuracoes (chave, valor)
values ('logo', null)
on conflict (chave) do nothing;
