const bcrypt = require("bcrypt"); // Permet de hasher un mot de passe.
const jwt = require("jsonwebtoken"); // Importe "jsonwebtoken" pour utiliser sa fonction "sign" qui permettra de créer un token pour un utiisateur.
const dotenv = require("dotenv"); // Importe les variables d'environnement.
dotenv.config();
const User = require("../models/User");

const MY_APP_SECRET = process.env.APP_SECRET; // Variable d'environnement qui correspond à la clé secrete des tokens.

// Permet à un utilisateur de s'inscrire.
exports.signup = (req, res, next) => 
{
    bcrypt.hash(req.body.password, 10) // Demande de « saler » le mot de passe 10 fois.
    .then(hash => 
    {
        const user = new User
        ({
            email: req.body.email,
            password: hash,
        });
        user.save()
        .then(() => res.status(201).json({message: "Utilisateur créé !"}))
        .catch(error => res.status(400).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};

// Permet à un utilisateur de se connecter.
exports.login = (req, res, next) => 
{
   User.findOne({email: req.body.email})
    .then(user => 
    {
        if(!user)
        {
            return res.status(401).json({error});
        }
        bcrypt.compare(req.body.password, user.password)
        .then(valid => 
        {
            if(!valid)
            {
                return res.status(401).json({error});
            }
            res.status(200).json
            ({
                userId: user._id,
                token: jwt.sign
                (
                    {userId: user._id},
                    MY_APP_SECRET,
                    {expiresIn: "24h"},
                ),
            });
        })
        .catch(error => res.status(500).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};