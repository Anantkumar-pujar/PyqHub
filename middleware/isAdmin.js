function isAdmin(req, res, next) {
    if (req.session && req.session.userId && req.session.role === 'admin') {
        return next();
    }
    res.redirect('/access-denied');
}

module.exports = isAdmin;
