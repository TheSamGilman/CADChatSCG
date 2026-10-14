create type public.review_status as enum ('pending', 'approved', 'rejected');

create table public.parts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  part_id     uuid not null references public.parts (id) on delete cascade,
  comment     text not null check (length(trim(comment)) > 0),
  status      public.review_status not null default 'pending',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index reviews_part_id_created_at_idx on public.reviews (part_id, created_at desc);

create extension if not exists moddatetime schema extensions;

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row
  execute procedure extensions.moddatetime (updated_at);

-- RLS on with no policies: only the API's secret key (service_role) can read or write.
alter table public.parts enable row level security;
alter table public.reviews enable row level security;
