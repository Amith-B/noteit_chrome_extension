const express = require("express");
const router = express.Router();

// models
const Folder = require("../schema/folder");
const Note = require("../schema/notes");

router.get("/:noteId", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { noteId } = req.params;

  const notes = await Note.findOne({
    _id: noteId,
    userId,
  });

  if (!notes) {
    res.status(400).json({ message: "Bad Request, invalid notes" });
    return;
  }

  res.send(JSON.stringify(notes));
});

router.delete("/:noteId", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { noteId } = req.params;

  if (!noteId) {
    res.status(400).json({ message: "Bad Request, note id required" });
    return;
  }

  try {
    const deletedNotes = await Note.findOneAndDelete({
      _id: noteId,
      userId,
    });

    if (!deletedNotes) {
      res.status(400).json({ message: "Bad Request, invalid notes" });
      return;
    }

    await Folder.findByIdAndUpdate(deletedNotes.folderId.toString(), {
      $pull: { noteIds: deletedNotes.id },
    });

    res.send(JSON.stringify(deletedNotes));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error, Unable to delete" });
  }
});

router.post("/:folderId/add", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { title, content } = req.body;
  const { folderId } = req.params;

  const folder = await Folder.findOne({ _id: folderId, userId });

  if (!folder) {
    res.status(400).json({ message: "Bad Request, invalid folder" });
    return;
  }

  const newNote = await new Note({
    title,
    content,
    userId,
    folderId,
  });
  newNote.save();

  try {
    await Folder.findByIdAndUpdate(folderId, {
      $push: { notes: newNote.id },
      $set: { activeNoteId: newNote.id },
    });

    res.send(JSON.stringify(newNote));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error, Unable to add note" });
  }
});

router.patch("/activenote", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { activeNoteId } = req.body;

  if (!activeNoteId) {
    res.status(400).json({ message: "Bad Request, activeNoteId required" });
    return;
  }

  try {
    const note = await Note.findById(activeNoteId);
    const updatedFolder = await Folder.findOneAndUpdate(
      { _id: note.folderId, userId },
      {
        $set: { activeNoteId: note._id },
      }
    );

    if (!updatedFolder) {
      res.status(400).json({ message: "Bad Request, invalid folder" });
      return;
    }

    res.send(JSON.stringify(updatedFolder));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error, Unable to set active note" });
  }
});

router.patch("/:noteId", async (req, res) => {
  const { _id: userId } = res.locals.tokenData;
  const { title, content } = req.body;
  const { noteId } = req.params;

  if (!noteId) {
    res.status(400).json({ message: "Bad Request, note id required" });
    return;
  }

  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId, userId },
      {
        $set: { title, content },
      },
      { new: true }
    );

    if (!updatedNote) {
      res.status(400).json({ message: "Bad Request, invalid notes" });
      return;
    }

    res.send(JSON.stringify(updatedNote));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error, Unable to rename" });
  }
});

module.exports = router;
