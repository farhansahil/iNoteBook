const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchUser')
const Notes = require('../models/Notes')
const { body, validationResult } = require('express-validator');

//fetch all the notes using GET: '/api/notes/fetchallnotes'
router.get('/fetchallnotes', fetchuser,async (req,res) => {
    try {
        const notes = await Notes.find({user: req.user.id})
        res.json(notes)
    } catch(err){
        console.log(err.message)
        res.status(500).send("Some error occured")
      }
})


//add new notes using POST: '/api/notes/addnote'
router.post('/addnote',[
    body('title').isLength({ min: 3 }),
    body('description').isLength({ min: 5 })
], fetchuser,async (req,res) => {
    try {
        const {title,description,tag} = req.body;

        //if error occurs then it will show the bad requests as well as errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const note = new Notes({
        title,description,tag,user: req.user.id
    })

    const savedNote = await note.save();
    res.json(savedNote)
    } catch(err){
        console.log(err.message)
        res.status(500).send("Some error occured")
      }
})

//update the note using PUT : 'api/notes/updatenote'
router.put('/updatenote/:id', fetchuser,async (req,res) => {
    const {title,description,tag} = req.body;

    const newNote = {};
    if(title) {newNote.title = title};
    if(description) {newNote.description = description};
    if(tag) {newNote.tag = tag};

    //Find the note to be updated and update it

    let note = await Notes.findById(req.params.id);
    if(!note) {return res.status(404).send("Not Found")}

    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not allowed")
    }

    note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
    res.json(note)
})


//delete the note using DELETE : 'api/notes/deletenote'
router.delete('/deletenote/:id', fetchuser,async (req,res) => {
const {title,description,tag} = req.body;


    //Find the note to be updated and update it

    let note = await Notes.findById(req.params.id);
    if(!note) {return res.status(404).send("Not Found")}

    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not allowed")
    }

    note = await Notes.findByIdAndDelete(req.params.id)
    res.json({success: "Note has been deleted"})
})

module.exports = router