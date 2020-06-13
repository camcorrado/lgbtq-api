CREATE TABLE IF NOT EXISTS lgbtq_profiles (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_id INTEGER REFERENCES lgbtq_users(id) ON DELETE CASCADE NOT NULL,
    username TEXT NOT NULL,
    bio TEXT NOT NULL,
    profile_pic TEXT NOT NULL,
    interests TEXT NOT NULL,
    pronouns TEXT NOT NULL,
    zipcode INTEGER NOT NULL
);