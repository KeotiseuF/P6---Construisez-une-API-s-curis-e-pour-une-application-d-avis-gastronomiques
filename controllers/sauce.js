const Sauce = require("../models/Sauce");
const fs = require("fs"); // Package qui donne accès aux fonctions qui nous permettent de modifier le système de fichiers et de supprimer les fichiers.

// Crée une nouvelle sauce.
exports.newSauce = (req, res, next) =>
{
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce
    ({
        ...sauceObject, // L'opérateur spread "..." permet de recupérer toute les éléments dans "req.body.sauce".
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`, // Créé un path (chemin/route) pour l'image que j'ajoute pour ma sauce.
    });
    sauce.save()
    .then(() => res.status(201).json({message: "Sauce enregistrée"}))
    .catch(error => res.status(400).json({error}));
};

// Permet de modifier une sauce.
exports.modifySauce = (req, res, next) =>
{   
    /* "Req.file" récupére la requête file qui correspond à l'envoi de fichier. "?" ajoute un pamètre qui est une condition dans cette situation, 
    si avec la req.body il y une image à modifier alors la 1er condition est déclenché ":" (sinon) on envoie juste le req.body. */
    const sauceObject = req.file ? { 
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    
    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({error});
            } else {
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                .then(() => 
                {
                    // Lance cette condition si l'image est changé et supprime l'ancienne image du dossier "images" grâce au fs.unlink
                    if (sauceObject.imageUrl) 
                    {
                        const filename = sauce.imageUrl.split("/images/")[1];
                        fs.unlink(`images/${filename}`, () => 
                        {
                            res.status(201).json({message : "Détails sauce et/ou image remplacés !"});
                        });
                    } 
                    
                    else
                    {
                        res.status(201).json({message: "Détails sauce remplacés !"});
                    }
                })
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

// Permet de supprimer une sauce.
exports.deleteSauce = (req, res, next) =>
{
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        if (sauce.userId != req.auth.userId) {
            res.status(403).json({error});
        } else {
            const filename = sauce.imageUrl.split("/images/")[1];
            fs.unlink(`images/${filename}`, () => 
            {
                Sauce.deleteOne({ _id: req.params.id})
                .then(() => res.status(200).json({message : 'Sauce supprimé !'}))
                .catch(error => res.status(401).json({ error }));
            })
        }
    })
    .catch((error) => {
        res.status(400).json({ error });
    });
};

// Renvoi une sauce qu'on a sélectionné.
exports.getOneSauce = (req, res, next) =>
{
    Sauce.findOne({_id: req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({error}));
};

// Renvoi toutes les sauces.
exports.getAllSauces = (req, res, next) =>
{
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({error}));
};

// Permet d'aimer une sauce.
exports.likeSauce = (req, res, next) =>
{
    if(req.body.like === 1)
    {                     
        delete req.body._userId;
        Sauce.findOne({_id: req.params.id})
        .then(() => {            
            const like = 
            { 
                $addToSet: {usersLiked: req.auth.userId}, // L'Opérateur "$addToSet" ajoute l'id de chaque utilisateur qui aime la sauce dans le tableau "usersLiked". 
                $inc: {likes: req.body.like},  // L'Opérateur "$inc" incrémente le like (= 1) à la data "like". 
            };
            Sauce.updateOne({ _id: req.params.id}, like)
            .then(() => res.status(201).json("Like sauce"))
            .catch(error => res.status(401).json({ error }));   
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
    }

    else if(req.body.like === -1) 
    {
        delete req.body._userId;
        Sauce.findOne({_id: req.params.id})
        .then(() => {            
            const dislike = 
            { 
                $addToSet: {usersDisliked: req.auth.userId},
                $inc: {dislikes: 1},
            };
            Sauce.updateOne({ _id: req.params.id}, dislike)
            .then(() => res.status(201).json("Dislike sauce"))
            .catch(error => res.status(401).json({ error }));   
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
    }

    else
    {
       delete req.body._userId;
        Sauce.findOne({_id: req.params.id})
        .then((sauce) => 
        {
            const idDislikes = sauce.usersDisliked.find(id => id == req.auth.userId);
            
            if(idDislikes)
            {
                const dislike = 
                { 
                    $unset: {usersDisliked: req.params.id},
                    $inc: {dislikes: -1},
                };
                Sauce.updateOne({ _id: req.params.id}, dislike)
                .then(() => res.status(201).json("Dislike enlevé"))
                .catch(error => res.status(401).json({ error }));
            }
            
            else 
            {
                const like = 
                { 
                    $unset: {usersLiked: req.params.id},
                    $inc: {likes: -1},
                };
                Sauce.updateOne({ _id: req.params.id}, like)
                .then(() => res.status(201).json("Like enlevé"))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
    };

};