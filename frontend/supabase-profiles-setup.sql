-- Run this in Supabase SQL Editor to fix RLS / profile creation on signup
-- The trigger runs with SECURITY DEFINER so it bypasses RLS

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    first_name,
    last_name,
    student_email,
    account_type
  )
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'first_name'), ''), 'User'),
    coalesce(nullif(trim(new.raw_user_meta_data->>'last_name'), ''), 'User'),
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'account_type', ''), 'student')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
