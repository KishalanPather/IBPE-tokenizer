const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Vocabulary = require('./models.js')
const cors = require("cors");
const port = 3000;

//middleware
app.use(express.json({limit: '10mb'}));
app.use(cors());   //gets rid of cross origin errors


//connect to mongoDB database
const mongoDBUsername = "Kishalan";
const mongoDBPassword = "LI2OLGgOGCFeh5qu";
const databaseName = "IBPE-Tokenizer"
const dbURI = `mongodb+srv://${mongoDBUsername}:${mongoDBPassword}@ibpe-tokenizer.rdwqw.mongodb.net/${databaseName}?retryWrites=true&w=majority&appName=IBPE-Tokenizer`;

mongoose.connect(dbURI)
    .then(() => {
        console.log("connected to mongodb");
        app.listen(port, () => {
            console.log(`JS Server is running on http://localhost:${port}`);
        });

    })
    .catch((err) => console.log("could not connect to mongodb, error: ", err));

//default page
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

//adding vocabulary to database
app.post('/add-vocabulary', (req,res) => {

    const vocabulary = new Vocabulary({
        tokenizerName: req.body.tokenizerName,
        vocabulary: req.body.vocabulary,
        tokenizerNumber: req.body.tokenizerNumber,
    })

    vocabulary.save()
        .then(() => console.log("vocabulary added to db."))
        .catch(err => console.log("error saving vocabulary to db:", err));
})

//retrieving vocabularies from database
app.get('/all-vocabularies',(req,res) =>{
    Vocabulary.find()
        .then(result => res.json(result))
        .catch(err => console.log("retrieval from database error occured: ", err));
});


//deleting vocabularies from database
app.delete('/vocabularies/:id',(req,res) => {
    const id = req.params.id;
    
    Vocabulary.findByIdAndDelete(id)
        .then(result => {
            console.log("deleted a vocabulary.");
         //   res.json({redirect: '/'})   //fill this in when you do the routing
        })
        .catch(err => {"deletion error occured: ",err});
})
