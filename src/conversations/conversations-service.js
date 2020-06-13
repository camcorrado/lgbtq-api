const ConversationsService = {
  getAllConversations(db) {
    return db
      .from('lgbtq_conversations AS conversation')
      .select(
        'conversation.id',
        'conversation.users',
        'conversation.date_created',
      )
  },

  getById(db, id) {
    return ConversationsService.getAllConversations(db)
      .where('conversation.id', id)
      .first()
  },
/*
  insertConversation(db, newConversation) {
    return db
      .insert(newConversation)
      .into('lgbtq_conversations')
      .returning('*')
      .then(([conversation]) => conversation)
      .then(conversation =>
        ConversationsService.getById(db, conversation.id)
      )
  },
*/
  serializeConversation(conversation) {
    return {
      id: conversation.id,
      users: conversation.users,
      date_created: new Date(conversation.date_created),
    }
  },
}

module.exports = ConversationsService
