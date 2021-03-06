CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    msg_read TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL
);