const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/User");

const MY_APP_SECRET = process.env.APP_SECRET;

exports.signup = (req, res, next) => 
{
    bcrypt.hash(req.body.password, 10)
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

exports.login = (req, res, next) => 
{
   User.findOne({email: req.body.email})
    .then(user => 
    {
        if(!user)
        {
            return res.status(401).json({message: "Paire de login/mot de passe incorrecte"});
        }
        bcrypt.compare(req.body.password, user.password)
        .then(valid => 
        {
            if(!valid)
            {
                return res.status(401).json({message: "Paire de login/mot de passe incorrecte"});
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