CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    users INTEGER[] NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    new_msg TIMESTAMP DEFAULT now() NOT NULL
);