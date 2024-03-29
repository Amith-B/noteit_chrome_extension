const express = require("express");
const router = express.Router();

// model
const Folder = require("../schema/folder");
const User = require("../schema/user");
const { decrypt } = require("../utils/encrypt");

router.get("/", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;

  try {
    const folderData = await User.findById(userId)
      .populate("folders")
      .populate({
        path: "activeFolder",
        populate: { path: "notes" },
      })
      .select("folders activeFolder");

    const decryptedData = {
      ...folderData.toJSON(),
    };

    if (decryptedData.activeFolder) {
      decryptedData.activeFolder.notes = decryptedData.activeFolder.notes.map(
        (note) => ({
          ...note,
          content: decrypt(note.content, note.iv),
        })
      );
    }

    res.send(JSON.stringify(decryptedData));
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error, unable to fetch folder" });
  }
});

router.post("/", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { folderName } = req.body;

  if (!folderName) {
    res.status(400).json({ error: "Bad Request, folder name is required" });
    return;
  }

  try {
    const newFolder = await new Folder({
      folderName,
      userId,
    });
    newFolder.save();

    await User.findByIdAndUpdate(userId, {
      $push: { folders: newFolder.id },
    });

    res.send(JSON.stringify(newFolder));
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error, unable to update folder" });
  }
});

router.delete("/:folderId", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { folderId } = req.params;

  if (!folderId) {
    res.status(400).json({ error: "Bad Request, folder id required" });
    return;
  }

  try {
    const deletedFolder = await Folder.findOneAndDelete({
      _id: folderId,
      userId,
    });

    if (!deletedFolder) {
      res.status(400).json({ error: "Bad Request, invalid folder" });
      return;
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { folders: deletedFolder.id },
    });

    res.send(JSON.stringify(deletedFolder));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error, Unable to delete" });
  }
});

router.patch("/activefolder", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { activeFolderId } = req.body;

  if (!activeFolderId) {
    res.status(400).json({ error: "Bad Request, activeFolderId required" });
    return;
  }

  try {
    const folder = await Folder.findOne({
      _id: activeFolderId,
      userId,
    }).populate("notes");

    if (!folder) {
      res.status(400).json({ error: "Bad Request, invalid folder id" });
      return;
    }

    await User.findByIdAndUpdate(userId, {
      $set: { activeFolder: folder._id },
    });

    const decryptedData = {
      ...folder.toJSON(),
    };

    decryptedData.notes = decryptedData.notes.map((note) => ({
      ...note,
      content: decrypt(note.content, note.iv),
    }));

    res.send(JSON.stringify(decryptedData));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error, Unable to set active folder" });
  }
});

router.patch("/:folderId", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { folderName } = req.body;
  const { folderId } = req.params;

  if (!folderId) {
    res.status(400).json({ error: "Bad Request, folder id required" });
    return;
  }

  if (!folderName) {
    res.status(400).json({ error: "Bad Request, new folder name required" });
    return;
  }

  try {
    const updatedFolder = await Folder.findOneAndUpdate(
      { _id: folderId, userId },
      {
        $set: { folderName },
      },
      { new: true }
    );

    if (!updatedFolder) {
      res.status(400).json({ error: "Bad Request, invalid folder" });
      return;
    }

    res.send(JSON.stringify(updatedFolder));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error, Unable to rename" });
  }
});

module.exports = router;
