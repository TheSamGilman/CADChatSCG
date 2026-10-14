-- Idempotent: inserts the cube only while there are no parts.
insert into public.parts (name)
select 'Cube'
where not exists (select 1 from public.parts);
