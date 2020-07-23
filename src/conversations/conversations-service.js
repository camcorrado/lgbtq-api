const moment = require("moment");

const ConversationsService = {
  getAllConversations(knex) {
    return knex.select("*").from("conversations");
  },
  getById(knex, id) {
    return knex.from("conversations").select("*").where("id", id).first();
  },
  insertConversation(knex, newConversation) {
    return knex
      .insert(newConversation)
      .into("conversations")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  updateConversation(knex, id, newConversationFields) {
    return knex("conversations").where({ id }).update(newConversationFields);
  },
  serializeConversation(conversation) {
    return {
      id: conversation.id,
      users: conversation.users,
      date_created: moment(new Date(conversation.date_created)).format(
        "ddd MMM DD YYYY"
      ),
      new_msg: moment(new Date(conversation.new_msg)).format("ddd MMM DD YYYY"),
    };
  },
  deleteConversation(knex, id) {
    return knex("conversations").where({ id }).delete();
  },
};

module.exports = ConversationsService;
