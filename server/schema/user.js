const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  picture: String,
  folderIds: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: [] },
  ],
  activeFolderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
