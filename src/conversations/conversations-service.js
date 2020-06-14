const ConversationsService = {
    getAllConversations(knex) {
        return knex.select('*').from('lgbtq_conversations')
    },

    getById(knex, id) {
        return knex.from('lgbtq_conversations').select('*').where('id', id).first()
    },
    insertConversation(knex, newConversation) {
        return knex
			.insert(newConversation)
			.into('lgbtq_conversations')
			.returning('*')
			.then(rows => {
				return rows[0]
		})
    },
    serializeConversation(conversation) {
        return {
            id: conversation.id,
            users: conversation.users,
            date_created: new Date(conversation.date_created),
        }
    },
}

module.exports = ConversationsService
