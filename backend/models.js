//design of the vocabularies(Tokenizers) that get stored in the mongoDB database

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vocabularySchema = new Schema({
    tokenizerName:{
        type: String,
        required: true
    },
    vocabulary: {
        type: Array,
        required: true
    },
})

const Vocabulary = mongoose.model("Tokenizer-Vocabularies",vocabularySchema); //need to get mongodb to search the tokenizer-Vocabularies collection
module.exports = Vocabulary;