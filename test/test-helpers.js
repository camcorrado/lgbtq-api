const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      full_name: 'Test user 1',
      email: 'TU1@gmail.com',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      bio: 'bio 1',
      profile_pic: 'img 1',
      interests: 'Nightlife',
      pronouns: 'He/Him'
    },
    {
      id: 2,
      username: 'test-user-2',
      full_name: 'Test user 2',
      email: 'TU2@gmail.com',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      bio: 'bio 1',
      profile_pic: 'img 2',
      interests: 'Drag',
      pronouns: 'She/Her'
    },
    {
      id: 3,
      username: 'test-user-3',
      full_name: 'Test user 3',
      email: 'TU3@gmail.com',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      bio: 'bio 1',
      profile_pic: 'img 3',
      interests: 'Gaming',
      pronouns: 'They/Them'
    },
    {
      id: 4,
      username: 'test-user-4',
      full_name: 'Test user 4',
      email: 'TU4@gmail.com',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      bio: 'bio 1',
      profile_pic: 'img 4',
      interests: 'Activism',
      pronouns: 'He/Him'
    },
  ]
}

function makeProfilesFixtures() {
    const testUsers = makeUsersArray()
    return { testUsers }
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        lgbtq_users
      `
    )
    .then(() =>
      Promise.all([
        trx.raw(`ALTER SEQUENCE lgtbq_users_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('lgbtq_users_id_seq', 0)`),
      ])
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

/*
function makeCommentsArray(users, articles) {
  return [
    {
      id: 1,
      text: 'First test comment!',
      article_id: articles[0].id,
      user_id: users[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      text: 'Second test comment!',
      article_id: articles[0].id,
      user_id: users[1].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      text: 'Third test comment!',
      article_id: articles[0].id,
      user_id: users[2].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      text: 'Fourth test comment!',
      article_id: articles[0].id,
      user_id: users[3].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 5,
      text: 'Fifth test comment!',
      article_id: articles[articles.length - 1].id,
      user_id: users[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 6,
      text: 'Sixth test comment!',
      article_id: articles[articles.length - 1].id,
      user_id: users[2].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 7,
      text: 'Seventh test comment!',
      article_id: articles[3].id,
      user_id: users[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ];
}

function makeExpectedArticle(users, article, comments=[]) {
  const author = users
    .find(user => user.id === article.author_id)

  const number_of_comments = comments
    .filter(comment => comment.article_id === article.id)
    .length

  return {
    id: article.id,
    style: article.style,
    title: article.title,
    content: article.content,
    date_created: article.date_created.toISOString(),
    number_of_comments,
    author: {
      id: author.id,
      user_name: author.user_name,
      full_name: author.full_name,
      nickname: author.nickname,
      date_created: author.date_created.toISOString(),
      date_modified: author.date_modified || null,
    },
  }
}

function makeExpectedArticleComments(users, articleId, comments) {
  const expectedComments = comments
    .filter(comment => comment.article_id === articleId)

  return expectedComments.map(comment => {
    const commentUser = users.find(user => user.id === comment.user_id)
    return {
      id: comment.id,
      text: comment.text,
      date_created: comment.date_created.toISOString(),
      user: {
        id: commentUser.id,
        user_name: commentUser.user_name,
        full_name: commentUser.full_name,
        nickname: commentUser.nickname,
        date_created: commentUser.date_created.toISOString(),
        date_modified: commentUser.date_modified || null,
      }
    }
  })
}

function makeMaliciousArticle(user) {
  const maliciousArticle = {
    id: 911,
    style: 'How-to',
    date_created: new Date(),
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    author_id: user.id,
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  }
  const expectedArticle = {
    ...makeExpectedArticle([user], maliciousArticle),
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  }
  return {
    maliciousArticle,
    expectedArticle,
  }
}
*/

/*




function seedArticlesTables(db, users, articles, comments=[]) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('blogful_articles').insert(articles)
    // update the auto sequence to match the forced id values
    await trx.raw(
      `SELECT setval('blogful_articles_id_seq', ?)`,
      [articles[articles.length - 1].id],
    )
    // only insert comments if there are some, also update the sequence counter
    if (comments.length) {
      await trx.into('blogful_comments').insert(comments)
      await trx.raw(
        `SELECT setval('blogful_comments_id_seq', ?)`,
        [comments[comments.length - 1].id],
      )
    }
  })
}

function seedMaliciousArticle(db, user, article) {
  return seedUsers(db, [user])
    .then(() =>
      db
        .into('blogful_articles')
        .insert([article])
    )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256'
  })
  return `Bearer ${token}`
}

module.exports = {
  makeUsersArray,
  makeArticlesArray,
  makeExpectedArticle,
  makeExpectedArticleComments,
  makeMaliciousArticle,
  makeCommentsArray,

  makeArticlesFixtures,
  cleanTables,
  seedArticlesTables,
  seedMaliciousArticle,
  makeAuthHeader,
  seedUsers,
}
*/

module.exports = {
    makeUsersArray,
    makeProfilesFixtures,
    cleanTables,
    seedUsers
  }