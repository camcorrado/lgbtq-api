const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeFixtures() {
  const testUsers = makeUsersArray()
  const testProfiles = makeProfilesArray(testUsers)
  const testConversations = makeConversationsArray()
  const testMessages = makeMessagesArray(testUsers, testConversations)
  return { testUsers, testProfiles, testConversations, testMessages }
}

function makeUsersArray() {
  return [
    {
      id: 1,
      full_name: 'Test user 1',
      email: 'TU1@gmail.com',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 2,
      full_name: 'Test user 2',
      email: 'TU2@gmail.com',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 3,
      full_name: 'Test user 3',
      email: 'TU3@gmail.com',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 4,
      full_name: 'Test user 4',
      email: 'TU4@gmail.com',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
  ]
}

function makeProfilesArray(users) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      username: 'First test username!',
      bio: 'First test bio!',
      profile_pic: 'First test pic!',
      interests: 'First test interests',
      pronouns: 'First test pronouns!',
      zipcode: 10001
    },
    {
      id: 2,
      user_id: users[1].id,
      username: 'Second test username!',
      bio: 'Second test bio!',
      profile_pic: 'Second test pic!',
      interests: 'Second test interests',
      pronouns: 'Second test pronouns!',
      zipcode: 10002
    },
    {
      id: 3,
      user_id: users[2].id,
      username: 'Third test username!',
      bio: 'Third test bio!',
      profile_pic: 'Third test pic!',
      interests: 'Third test interests',
      pronouns: 'Third test pronouns!',
      zipcode: 10003
    },
    {
      id: 4,
      user_id: users[3].id,
      username: 'Fourth test username!',
      bio: 'Fourth test bio!',
      profile_pic: 'Fourth test pic!',
      interests: 'Fourth test interests',
      pronouns: 'Fourth test pronouns!',
      zipcode: 10004
    },
  ]
}

function makeConversationsArray() {
  return [
    {
      id: 1,
      users: '1, 2',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 2,
      users: '1, 3',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 3,
      users: '1, 2, 3',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 4,
      users: '4, 2',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
  ]
}

function makeMessagesArray(users, conversations) {
  return [
    {
      id: 1,
      conversation_id: conversations[0].id,
      user_id: users[0].id,
      content: 'Hi',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 1,
      conversation_id: conversations[1].id,
      user_id: users[1].id,
      content: 'Hi',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 1,
      conversation_id: conversations[2].id,
      user_id: users[2].id,
      content: 'Hi',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 1,
      conversation_id: conversations[3].id,
      user_id: users[3].id,
      content: 'Hi',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
  ]
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        lgbtq_users,
        lgbtq_profiles,
        lgbtq_conversations,
        lgbtq_messages
      `
    )
  )
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('lgbtq_users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('lgbtq_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seedProfilesTables(db, users, profiles) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('lgbtq_profiles').insert(profiles)
    // update the auto sequence to match the forced id values
    await trx.raw(
      `SELECT setval('lgbtq_profiles_id_seq', ?)`,
      [profiles[profiles.length - 1].id],
    )
  })
}

function seedConversationsTables(db, conversations) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await trx.into('lgbtq_conversations').insert(conversations)
    // update the auto sequence to match the forced id values
    await trx.raw(
      `SELECT setval('lgbtq_profiles_id_seq', ?)`,
      [conversations[conversations.length - 1].id],
    )
  })
}

function seedMessagesTables(db, conversations, messages) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedConversationsTables(trx, conversations)
    await trx.into('lgbtq_messages').insert(messages)
    // update the auto sequence to match the forced id values
    await trx.raw(
      `SELECT setval('lgbtq_messages_id_seq', ?)`,
      [messages[messages.length - 1].id],
    )
  })
}

function makeExpectedProfile(testUser, profile) {
  const userVar = testUser
    .find(user => user.id === profile.user_id)

  return {
    id: profile.id,
    user_id: profile.user_id,
    username: profile.username,
    bio: profile.bio,
    profile_pic: profile.profile_pic,
    interests: profile.interests,
    pronouns: profile.pronouns,
    zipcode: profile.zipcode,
    user: {
      id: userVar.id,
      full_name: userVar.full_name,
      email: userVar.email,
      date_created: userVar.date_created.toISOString(),
    },
  }
}

function makeExpectedConversation(conversation) {
  return {
    id: conversation.id,
    users: conversation.users,
    date_created: conversation.date_created.toISOString(),
  }
}

function makeExpectedMessage(testConversation, message) {
  const conv = testConversation
    .find(conversation => conversation.id === message.conversation_id)

  return {
    id: message.id,
    conversation_id: message.conversation_id,
    user_id: message.user_id,
    content: message.content,
    date_created: message.date_created,
    conversation: {
      id: conv.id,
      users: conv.users,
      date_created: conv.date_created,
    },
  }
}

function makeMaliciousProfile(user) {
  const maliciousProfile = {
    id: 911,
    user_id: user.id,
    username: 'Bad Guy',
    bio: 'mwahahaha',
    profile_pic: 'Naughty naughty very naughty <script>alert("xss");</script>',
    interests: 'hacking',
    pronouns: `Meanie`,
    zipcode: 66666
  }
  const expectedProfile = {
    ...makeExpectedProfile([user], maliciousProfile),
    username: 'Bad Guy',
    bio: `mwahahaha`,
    profile_pic: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    interests: 'hacking',
    pronouns: `Meanie`,
  }
  return {
    maliciousProfile,
    expectedProfile,
  }
}

function makeMaliciousMessage(conversation, user) {
  const maliciousMessage = {
    id: 911,
    conversation_id: conversation.id,
    user_id: user.id,
    content: 'Naughty naughty very naughty <script>alert("xss");</script>',
  }
  const expectedMessage = {
    ...makeExpectedMessage([conversation], maliciousMessage),
    content: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  }
  return {
    maliciousMessage,
    expectedMessage,
  }
}

function seedMaliciousProfile(db, user, profile) {
  return seedUsers(db, [user])
    .then(() =>
      db
        .into('lgbtq_profiles')
        .insert([profile])
    )
}

function seedMaliciousMessage(db, conversation, message) {
  return seedConversationsTables(db, [conversation])
    .then(() =>
      db
        .into('lgbtq_messages')
        .insert([message])
    )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.email,
    algorithm: 'HS256'
  })
  return `Bearer ${token}`
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
    seedProfilesTables,
    makeProfilesArray,
    seedConversationsTables,
    makeExpectedConversation,
    makeMessagesArray,
    makeExpectedMessage,
    makeConversationsArray,
    makeMaliciousMessage,
    seedMaliciousMessage,
    seedMessagesTables,
  }