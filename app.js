const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

const MY_PASSWORD_MANGO_DB = process.env.PASSWORD_MANGO_DB;

mongoose.connect("mongodb+srv://curtis:" + MY_PASSWORD_MANGO_DB +"@cluster0.a40ry.mongodb.net/?retryWrites=true&w=majority",
{ useNewUrlParser: true,
useUnifiedTopology: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res) => 
{
    res.json({message: "good"});
})

module.exports = app;