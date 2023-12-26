const jwt = require("jsonwebtoken"); // Importe "jsonwebtoken" pour utiliser sa fonction "verify" qui permettra de décoder notre token, voir s'il est valide.
const dotenv = require("dotenv"); // Importe les variables d'environnement.
dotenv.config();
const MY_APP_SECRET = process.env.APP_SECRET;

// Vérifie le token de l'utilisateur s'il est valide sinon renvoi une erreur.
module.exports = (req, res, next) =>
{
    try 
    {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, MY_APP_SECRET);
        const userId = decodedToken.userId;
        req.auth = 
        {
            userId: userId
        }
        next();
    }
    catch(error)
    {
        res.status(401).json({error});
    };
};