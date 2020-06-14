const xss = require('xss')

const MessagesService = {
    getAllMessages(knex) {
        return knex.select('*').from('lgbtq_messages')
    },
    getById(knex, id) {
        return knex.from('lgbtq_messages').select('*').where('id', id).first()
    },
    insertMessage(knex, newMessage) {
        return knex
			.insert(newMessage)
			.into('lgbtq_messages')
			.returning('*')
			.then(rows => {
				return rows[0]
		})
    },
    serializeMessage(message) {
        return {
            id: message.id,
            conversation_id: message.conversation_id,
            user_id: message.user_id,
            content: xss(message.content),
            date_created: new Date(message.date_created),
        }
    },
}

module.exports = MessagesService
