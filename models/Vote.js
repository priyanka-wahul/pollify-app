const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const voteSchema = new Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Poll",
  },

  optionId: {
    type: mongoose.Schema.Types.ObjectId,
  },

  fingerprint: {
    type: String,
  },

  responseTime: {
    type: Number,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Vote = mongoose.model("Vote",voteSchema);
module.exports = Vote;
