const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Note = require('../models/Note');

// @route   GET api/notes
// @desc    Get all notes for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/notes
// @desc    Create a new note
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, content } = req.body;
  try {
    const newNote = new Note({ title, content, user: req.user.id });
    const note = await newNote.save();
    res.json(note);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/notes/:id
// @desc    Update an existing note
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, content } = req.body;
  try {
    let note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ msg: 'Note not found' });
    if (note.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
    
    note.title = title || note.title;
    note.content = content || note.content;
    note = await note.save();
    res.json(note);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ msg: 'Note not found' });
    if (note.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await Note.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Note removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
