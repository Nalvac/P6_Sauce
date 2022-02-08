const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

//permet de créer un schéma de données pour votre base de données MongoDB
const userSchema = mongoose.Schema({
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true }
});

userSchema.plugin(uniqueValidator);

// la function model transforme ce modèle en un modèle utilisable
module.exports = mongoose.model('User', userSchema);