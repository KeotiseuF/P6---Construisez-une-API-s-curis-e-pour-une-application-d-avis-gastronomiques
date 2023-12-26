const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv"); // Importe les variables d'environnement.
dotenv.config();
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");

const app = express();
const MY_ID_MANGO_DB = process.env.ID_MANGO_DB; 
const MY_PASSWORD_MANGO_DB = process.env.PASSWORD_MANGO_DB;

// Se connecte à la base de données "Mongo DB".  
mongoose.connect("mongodb+srv://" + MY_ID_MANGO_DB + ":" + MY_PASSWORD_MANGO_DB +"@cluster0.a40ry.mongodb.net/?retryWrites=true&w=majority",
{ useNewUrlParser: true,
useUnifiedTopology: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch((error) => console.log(error));

/*  - Accéde à notre API depuis n'importe quelle origine ( `'*'` ) ;
    - Ajoute les headers mentionnés aux requêtes envoyées vers notre API (`Origin` , `X-Requested-With` , etc.) ;
    - Envoye des requêtes avec les méthodes mentionnées ( `GET` ,`POST` , etc.).*/
app.use((req, res, next) => 
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});


app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);

/*  Indique à Express qu'il faut gérer la ressource images de manière statique (un sous-répertoire de notre répertoire de base, __dirname) 
à chaque fois qu'elle reçoit une requête vers la route /images.*/
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;