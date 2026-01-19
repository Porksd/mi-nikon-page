
-- Workshops Table
create table if not exists workshops (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    description text,
    image_url text,
    teacher text,
    date date,
    time time,
    location text,
    total_spots int not null default 0
);

-- Workshop Registrations
create table if not exists workshop_registrations (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    workshop_id uuid references workshops(id) on delete cascade not null,
    user_id uuid references auth.users(id) not null,
    unique(workshop_id, user_id)
);

-- Notifications
create table if not exists notifications (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    message text not null,
    category text not null check (category in ('eventos', 'mi_equipo', 'novedades', 'promociones')),
    target_audience text default 'all'
);

-- User Notification Preferences
create table if not exists user_notification_preferences (
    user_id uuid references auth.users(id) on delete cascade not null,
    category text not null check (category in ('eventos', 'mi_equipo', 'novedades', 'promociones')),
    enabled boolean default true,
    primary key (user_id, category)
);

-- RLS
alter table workshops enable row level security;
alter table workshop_registrations enable row level security;
alter table notifications enable row level security;
alter table user_notification_preferences enable row level security;

-- Policies
create policy "Workshops are viewable by everyone" on workshops for select using (true);
create policy "Workshops are editable by everyone" on workshops for all using (true); 

create policy "Registrations viewable by everyone" on workshop_registrations for select using (true);
create policy "Users can register" on workshop_registrations for insert with check (auth.uid() = user_id);
create policy "Users can unregister" on workshop_registrations for delete using (auth.uid() = user_id);

create policy "Notifications viewable by everyone" on notifications for select using (true);
create policy "Notifications editable by everyone" on notifications for all using (true); 

create policy "Users manage own preferences" on user_notification_preferences for all using (auth.uid() = user_id);
