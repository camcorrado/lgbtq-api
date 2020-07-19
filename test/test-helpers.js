const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");

function makeFixtures() {
  const testUsers = makeUsersArray();
  const testProfiles = makeProfilesArray(testUsers);
  const testConversations = makeConversationsArray();
  const testMessages = makeMessagesArray(testUsers, testConversations);
  return { testUsers, testProfiles, testConversations, testMessages };
}

function makeUsersArray() {
  return [
    {
      id: 1,
      full_name: "Test user 1",
      email: "TU1@gmail.com",
      password: "Password1!",
      date_created: moment(new Date("2029-01-22T16:28:32.615Z")).format(
        "ddd MMM DD YYYY"
      ),
    },
    {
      id: 2,
      full_name: "Test user 2",
      email: "TU2@gmail.com",
      password: "Password2!",
      date_created: moment(new Date("2029-01-22T16:28:32.615Z")).format(
        "ddd MMM DD YYYY"
      ),
    },
    {
      id: 3,
      full_name: "Test user 3",
      email: "TU3@gmail.com",
      password: "Password3!",
      date_created: moment(new Date("2029-01-22T16:28:32.615Z")).format(
        "ddd MMM DD YYYY"
      ),
    },
    {
      id: 4,
      full_name: "Test user 4",
      email: "TU4@gmail.com",
      password: "Password4!",
      date_created: moment(new Date("2029-01-22T16:28:32.615Z")).format(
        "ddd MMM DD YYYY"
      ),
    },
  ];
}

function makeProfilesArray(users) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      username: "First test username!",
      bio: "First test bio!",
      profile_pic: "First test pic!",
      interests: ["First test interests"],
      pronouns: "First test pronouns!",
      geolocation: "(10, -10)",
      blocked_profiles: [1, 2, 3],
      favorited_profiles: [4, 5, 6],
    },
    {
      id: 2,
      user_id: users[1].id,
      username: "Second test username!",
      bio: "Second test bio!",
      profile_pic: "Second test pic!",
      interests: ["Second test interests"],
      pronouns: "Second test pronouns!",
      geolocation: "(20, -20)",
      blocked_profiles: [1, 2, 3],
      favorited_profiles: [4, 5, 6],
    },
    {
      id: 3,
      user_id: users[2].id,
      username: "Third test username!",
      bio: "Third test bio!",
      profile_pic: "Third test pic!",
      interests: ["Third test interests"],
      pronouns: "Third test pronouns!",
      geolocation: "(30, -30)",
      blocked_profiles: [1, 2, 3],
      favorited_profiles: [4, 5, 6],
    },
    {
      id: 4,
      user_id: users[3].id,
      username: "Fourth test username!",
      bio: "Fourth test bio!",
      profile_pic: "Fourth test pic!",
      interests: ["Fourth test interests"],
      pronouns: "Fourth test pronouns!",
      geolocation: "(40, -40)",
      blocked_profiles: [1, 2, 3],
      favorited_profiles: [4, 5, 6],
    },
  ];
}

function makeConversationsArray() {
  return [
    {
      id: 1,
      users: [1, 2],
      date_created: moment(new Date("2029-01-22T16:28:32.615Z")).format(
        "ddd MMM DD YYYY"
      ),
    },
    {
      id: 2,
      users: [1, 2],
      date_created: moment(new Date("2029-01-22T16:28:32.615Z")).format(
        "ddd MMM DD YYYY"
      ),
    },
    {
      id: 3,
      users: [3, 4],
      date_created: moment(new Date("2029-01-22T16:28:32.615Z")).format(
        "ddd MMM DD YYYY"
      ),
    },
    {
      id: 4,
      users: [3, 4],
      date_created: moment(new Date("2029-01-22T16:28:32.615Z")).format(
        "ddd MMM DD YYYY"
      ),
    },
  ];
}

function makeMessagesArray(users, conversations) {
  return [
    {
      id: 1,
      conversation_id: conversations[0].id,
      user_id: users[0].id,
      content: "Hi",
      msg_read: false,
      date_created: moment(new Date("2029-01-22T16:28:32.615Z")).format(
        "ddd MMM DD YYYY"
      ),
    },
    {
      id: 2,
      conversation_id: conversations[1].id,
      user_id: users[1].id,
      content: "Hi",
      msg_read: false,
      date_created: moment(new Date("2029-01-22T16:28:32.615Z")).format(
        "ddd MMM DD YYYY"
      ),
    },
    {
      id: 3,
      conversation_id: conversations[2].id,
      user_id: users[2].id,
      content: "Hi",
      msg_read: true,
      date_created: moment(new Date("2029-01-22T16:28:32.615Z")).format(
        "ddd MMM DD YYYY"
      ),
    },
    {
      id: 4,
      conversation_id: conversations[3].id,
      user_id: users[3].id,
      content: "Hi",
      msg_read: true,
      date_created: moment(new Date("2029-01-22T16:28:32.615Z")).format(
        "ddd MMM DD YYYY"
      ),
    },
  ];
}

function cleanTables(db) {
  return db.transaction((trx) =>
    trx.raw(
      `TRUNCATE
                users,
                profiles,
                conversations,
                messages
            `
    )
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db
    .into("users")
    .insert(preppedUsers)
    .then(() =>
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    );
}

function seedProfiles(db, users, profiles) {
  return db.transaction(async (trx) => {
    await seedUsers(trx, users);
    await trx.into("profiles").insert(profiles);
    await trx.raw(`SELECT setval('profiles_id_seq', ?)`, [
      profiles[profiles.length - 1].id,
    ]);
  });
}

function seedConversations(db, users, conversations) {
  return db.transaction(async (trx) => {
    await seedUsers(trx, users);
    await trx.into("conversations").insert(conversations);
    await trx.raw(`SELECT setval('conversations_id_seq', ?)`, [
      conversations[conversations.length - 1].id,
    ]);
  });
}

function seedMessages(db, users, conversations, messages) {
  return db.transaction(async (trx) => {
    await seedConversations(trx, users, conversations);
    await trx.into("messages").insert(messages);
    await trx.raw(`SELECT setval('messages_id_seq', ?)`, [
      messages[messages.length - 1].id,
    ]);
  });
}

function makeExpectedUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    date_created: moment(user.date_created).format("ddd MMM DD YYYY"),
  };
}

function makeExpectedProfile(profile) {
  let geoData = profile.geolocation
    .replace("(", "")
    .replace(")", "")
    .split(",");
  return {
    id: profile.id,
    user_id: profile.user_id,
    username: profile.username,
    bio: profile.bio,
    profile_pic: profile.profile_pic,
    interests: profile.interests,
    pronouns: profile.pronouns,
    geolocation: { x: Number(geoData[0]), y: Number(geoData[1]) },
    blocked_profiles: profile.blocked_profiles,
    favorited_profiles: profile.favorited_profiles,
  };
}

function makeExpectedConversation(conversation) {
  return {
    id: conversation.id,
    users: conversation.users,
    date_created: moment(conversation.date_created).format("ddd MMM DD YYYY"),
  };
}

function makeExpectedMessage(message) {
  return {
    id: message.id,
    conversation_id: message.conversation_id,
    user_id: message.user_id,
    content: message.content,
    msg_read: message.msg_read,
    date_created: moment(message.date_created).format("ddd MMM DD YYYY"),
  };
}

function makeMaliciousProfile(user) {
  const maliciousProfile = {
    id: 911,
    user_id: user.id,
    username: "Bad Guy",
    bio: "mwahahaha",
    profile_pic: 'Naughty naughty very naughty <script>alert("xss");</script>',
    interests: ["hacking"],
    pronouns: `Meanie`,
    geolocation: "40, -73",
    blocked_profiles: [666],
    favorited_profiles: [999],
  };
  const expectedProfile = {
    ...maliciousProfile,
    username: "Bad Guy",
    bio: `mwahahaha`,
    profile_pic:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    pronouns: `Meanie`,
  };
  return {
    maliciousProfile,
    expectedProfile,
  };
}

function makeMaliciousMessage(conversation, user) {
  const maliciousMessage = {
    id: 911,
    conversation_id: conversation.id,
    user_id: user.id,
    content: 'Naughty naughty very naughty <script>alert("xss");</script>',
    msg_read: false,
    date_created: moment(new Date("2029-01-22T16:28:32.615Z")).format(
      "ddd MMM DD YYYY"
    ),
  };
  const expectedMessage = {
    ...maliciousMessage,
    content:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
  };
  return {
    maliciousMessage,
    expectedMessage,
  };
}

function seedMaliciousProfile(db, user, profile) {
  return seedUsers(db, [user]).then(() =>
    db.into("profiles").insert([profile])
  );
}

function seedMaliciousMessage(db, user, conversation, message) {
  return seedConversations(db, [user], [conversation]).then(() =>
    db.into("messages").insert([message])
  );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.email,
    algorithm: "HS256",
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeFixtures,
  cleanTables,
  seedUsers,
  makeMaliciousProfile,
  makeExpectedProfile,
  seedMaliciousProfile,
  makeAuthHeader,
  seedProfiles,
  makeProfilesArray,
  seedConversations,
  makeExpectedConversation,
  makeMessagesArray,
  makeExpectedMessage,
  makeConversationsArray,
  makeMaliciousMessage,
  seedMaliciousMessage,
  seedMessages,
  makeExpectedUser,
};
