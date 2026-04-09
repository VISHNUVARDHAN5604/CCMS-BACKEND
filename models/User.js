const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: String,
  role: String
});
userSchema.index(
  { role: 1 },
  { unique: true, partialFilterExpression: { role: "admin" } }
);
module.exports = mongoose.model("User", userSchema);
