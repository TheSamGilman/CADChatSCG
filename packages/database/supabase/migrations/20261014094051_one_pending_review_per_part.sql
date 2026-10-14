-- At most one open (pending) review per part; decided reviews remain as history.
create unique index reviews_one_pending_per_part on public.reviews (part_id) where status = 'pending';
