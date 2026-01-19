-- Add email column to profiles table
alter table profiles add column if not exists email text;

-- Update the handle_new_user trigger function to include email
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone, email)
  values (
    new.id, 
    new.raw_user_meta_data ->> 'first_name', 
    new.raw_user_meta_data ->> 'last_name', 
    new.raw_user_meta_data ->> 'phone',
    new.email
  );
  return new;
end;
$$;

-- Optional: Backfill existing users (if any exist without email in profiles)
update profiles 
set email = auth.users.email 
from auth.users 
where profiles.id = auth.users.id 
and profiles.email is null;
