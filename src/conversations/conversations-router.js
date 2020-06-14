const express = require('express')
const path = require('path')
const ConversationsService = require('./conversations-service')
const { requireAuth } = require('../middleware/jwt-auth')

const conversationsRouter = express.Router()

conversationsRouter
	.route('/')
	.get((req, res, next) => {
		ConversationsService.getAllConversations(req.app.get('db'))
			.then(conversations => {
				res.json(conversations.map(ConversationsService.serializeConversation))
			})
			.catch(next)
	})
  .post(requireAuth, (req, res, next) => {
		const { users } = req.body
		const newConversation = { users }
		console.log(newConversation)
		for (const [key, value] of Object.entries(newConversation))
			if (value == null)
				return res.status(400).json({
					error: `Missing '${key}' in request body`
				})

		ConversationsService.insertConversation(
			req.app.get('db'),
			newConversation
		)
			.then(conversation => {
				res
					.status(201)
					.location(path.posix.join(req.originalUrl, `/${conversation.id}`))
					.json(ConversationsService.serializeConversation(conversation))
			})
			.catch(next)
    })

	conversationsRouter
		.route('/:conversation_id')
		.all(checkConversationExists)
		.get((req, res) => {
			res.json(ConversationsService.serializeConversation(res.conversation))
	})

async function checkConversationExists(req, res, next) {
	try {
		const conversation = await ConversationsService.getById(
			req.app.get('db'),
			req.params.conversation_id
		)

		if (!conversation)
			return res.status(404).json({
				error: `Conversation doesn't exist`
			})

		res.conversation = conversation
		next()
	} catch (error) {
		next(error)
	}
}

module.exports = conversationsRouter
