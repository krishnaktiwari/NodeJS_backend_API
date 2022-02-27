const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	name: { type: String, default: null },
	mobile_no: { type: String, default: null },
	email_id: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: { type: String, required: true },
	status: { type: String, required: true },
	created_by: { type: String },
	created_at: { type: String },
});

module.exports = mongoose.model("user", userSchema);
