const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

// fetch all notes --- GET "/api/notes/fetchallnotes"   login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id })
        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
})

// add new note --- POST "/api/notes/addnote"   login required
router.post('/addnote', fetchuser, [
    body('title', 'Title must have atleast 1 character !').isLength({ min: 1 }),
    body('description', 'Description must have atleast 1 character !').isLength({ min: 1 }),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Notes({
            title, description, tag, user: req.user.id
        })
        const snote = await note.save();
        res.json(snote);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
})

//update a note --- PUT "/api/notes/updatenote/id"   login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };
        let note = await Notes.findById(req.params.id);
        if (note.user.toString() !== req.user.id) { return res.status(401).send("Not allowed"); }
        if (!note) { return res.status(404).send("Not found"); }
        note = await Notes.findByIdAndUpdate(req.params.id, ({ $set: newNote }), { new: true });
        res.json({ note });

    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
})

//delete a note --- DELETE "/api/notes/deletenote"   login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        let note = await Notes.findById(req.params.id);
        if (note.user.toString() !== req.user.id) { return res.status(401).send("Not allowed"); }
        if (!note) { return res.status(404).send("Not found"); }
        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Note has been deleted", note });

    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
})

module.exports = router