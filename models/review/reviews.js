const mongoose = require("mongoose");

const Reviews = new mongoose.Schema({
  users: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  ebooks: { type: mongoose.Schema.Types.ObjectId, ref: "ebooks" },
  rating: { type: Number, required: true},
  likes:[{ type: mongoose.Schema.Types.ObjectId, ref: "users", default:null}],
  content: { type: String, trim: true, default: ''},
  deleted: { type: Boolean, default: false },
  createAt: { type: Date, default: Date.now },
  deleteAt: { type: Date, default: null },
  updateAt: { type: Date, default: null },
  
});


module.exports = Reviews;
