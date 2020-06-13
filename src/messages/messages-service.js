const xss = require('xss')

const MessagesService = {
  getAllMessages(db) {
    return db
      .from('lgbtq_messages AS message')
      .select(
        'message.id',
        'message.conversation_id',
        'message.user_id',
        'message.content',
        'message.date_created',
        db.raw(
          `json_strip_nulls(
            json_build_object(
              'id', conv.id,
              'users', conv.full_name,
              'date_created', conv.date_created
            )
          ) AS "conversation"`
        ),
      )
      .leftJoin(
        'lgbtq_conversations AS conv',
        'message.conversation_id',
        'conv.id',
      )
      .groupBy('message.id', 'conv.id')
  },

  getById(db, id) {
    return MessagesService.getAllMessages(db)
      .where('messages.id', id)
      .first()
  },

  getMessageForConversation(db, message_id) {
    return db
      .from('lgbtq_messages AS message')
      .select(
        'message.id',
        'message.conversation_id',
        'message.user_id',
        'message.content',
        'message.date_created',
        db.raw(
            `json_strip_nulls(
              json_build_object(
                'id', conv.id,
                'users', conv.full_name,
                'date_created', conv.date_created
              )
            ) AS "conversation"`
          )
      )
      .where('message.conversation_id', message_id)
      .leftJoin(
        'lgbtq_conversations AS conv',
        'message.conversation_id',
        'conv.id',
      )
      .groupBy('message.id', 'conv.id')
  },

  insertMessage(db, newMessage) {
    return db
      .insert(newMessage)
      .into('lgbtq_messages')
      .returning('*')
      .then(([message]) => message)
      .then(message =>
        MessagesService.getById(db, message.id)
      )
  },

  serializeMessage(message) {
    const { conversation } = message
    return {
      id: message.id,
      conversation_id: message.conversation_id,
      user_id: message.user_id,
      content: xss(message.content),
      date_created: message.date_created,
      conversation: {
        id: conversation.id,
        users: conversation.users,
        date_created: new Date(user.date_created),
      },
    }
  },
}

module.exports = MessagesService
