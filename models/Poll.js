const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const optionSchema = new Schema({
  text: {
    type: String,
    required: true,
  },

  votes: {
    type: Number,
    default: 0,
  },

});

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },

  pollType: {
    type: String,
    enum: ["multiple", "yesno", "truefalse"],
    default: "multiple"
  },

  options: [optionSchema],

  timer: {
    type: Number,
    required: true,
  },

  expiresAt: {
    type: Date,
  },

  status: {
    type: String,
    enum: ["live", "ended"],
    default: "live",
  },

  chartType: {
    type: String,
    enum: ["bar", "pie", "doughnut"],
    default: "bar",
  },

  totalVotes: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Poll = mongoose.model("Poll",pollSchema);

module.exports = Poll;
