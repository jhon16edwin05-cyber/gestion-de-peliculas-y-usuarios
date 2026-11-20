CREATE TABLE IF NOT EXISTS app_users (
  id serial PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS movies (
  id serial PRIMARY KEY,
  title text NOT NULL,
  director text NOT NULL,
  genre text NOT NULL,
  year integer NOT NULL,
  duration integer NOT NULL,
  rating text NOT NULL,
  description text NOT NULL,
  poster_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS favorites (
  id serial PRIMARY KEY,
  user_id integer NOT NULL,
  movie_id integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, movie_id)
);
