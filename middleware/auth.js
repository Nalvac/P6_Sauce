// Une application Express est fondamentalement une série de fonctions appelées middleware.

const jwt = require('jsonwebtoken');

// Vérifions si l'utilisateur est authentifié avant d'autoriser l'envoi de ses requêtes
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, '${process.env.TOKEN}');
        const userId = decodedToken.userId;

        // Vérification de la concordance entre les clés utilisateurs
        if (req.body.userId && req.body.userId !== userId) {
            throw 'User ID non valable !';
        } else {
            next();
        }
    } catch {
        res.status(401).json({
            error: new Error('Invalid request!')
        });
    }
};