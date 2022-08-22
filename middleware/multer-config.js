const multer = require("multer"); // Permet d'accepter les images des utilisateurs.

// Génère l'extension des fichiers.
const MIME_TYPES = 
{
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
}

// Indique à "multer" l'endroit où les images doivents être enregistrer. 
const storage = multer.diskStorage
({
    // Indique d'enregistrer les fichiers dans le dossier images. 
    destination: (req, file, callback) =>
    {
        callback(null, "images");
    },
    //Indique d'utiliser le nom d'origine, de remplacer les espaces par des underscores et d'ajouter un timestamp Date.now() comme nom de fichier.
    filename: (req, file, callback) => 
    {
        const name = file.originalname.split(" ").join("_");
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + "." + extension);
    },
});

//Export l'élément multer configuré, lui passons notre constante storage et indiquons que nous gérerons uniquement les téléchargements de fichiers image.
module.exports = multer({storage: storage}).single("image");