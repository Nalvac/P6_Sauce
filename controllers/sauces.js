const Sauce = require('../models/sauces');
const fs = require('fs');


// Requête pour l'ajout d'une nouvelle sauce
exports.creatSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json(error))

};
// Requête pour récupérer toutes les sauce depuis MongoDb
exports.getAllSauce = (req, res, next) => {

    Sauce.find()
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json(error))

};

// Réquête pour récuperer une sauce spécifique grâce à son id
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            res.status(200).json(sauce)
        })
        .catch((error) => res.status(500).json({ error }));
}

// Requête après qu'une sauce est modifié
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.thing),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body };
    Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch(error => res.status(400).json({ error }));
};

// Requête pour la suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};
// Ajout des likes et dislikes pour chaque sauce
exports.likeSauce = (req, res) => {
    // Si le client Like cette sauce 
    if (req.body.like === 1) {
        Sauce.findOneAndUpdate({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } })
            .then(() => res.status(200).json({ message: "Like ajouté !" }))
            .catch((error) => res.status(400).json({ error }));

        // Si le client disike cette sauce 
    } else if (req.body.like === -1) {
        Sauce.findOneAndUpdate({ _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } })
            .then(() => res.status(200).json({ message: "Dislike ajouté !" }))
            .catch((error) => res.status(400).json({ error }));

        // Si le client annule son choix
    } else {
        Sauce.findOne({ _id: req.params.id }).then((resultat) => {
            if (resultat.usersLiked.includes(req.body.userId)) {
                Sauce.findOneAndUpdate({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } })
                    .then(() => res.status(200).json({ message: "like retiré !" }))
                    .catch((error) => res.status(400).json({ error }));
            } else if (resultat.usersDisliked.includes(req.body.userId)) {
                Sauce.findOneAndUpdate({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } })
                    .then(() => res.status(200).json({ message: "dislike retiré !" }))
                    .catch((error) => res.status(400).json({ error }));
            }
        });
    }
};