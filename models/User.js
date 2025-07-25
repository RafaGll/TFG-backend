const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const CompletedExerciseSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  completed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exercise" }]
});

const UserSchema = new mongoose.Schema({
  googleId:   { type: String, unique: true, sparse: true, required: true },
  email:      { type: String, unique: true, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  completedExercises: { type: [CompletedExerciseSchema], default: [] }
});

// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// UserSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

module.exports = mongoose.model("User", UserSchema);