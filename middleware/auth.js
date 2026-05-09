module.exports = {
    ensureAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        // This will only work now that you added app.use(flash()) in server.js
        req.flash('error_msg', 'Please log in to write a blog.');
        res.redirect('/login');
    },

    // Changed from isAdmin to isadmin to match your route import:
    // const { ensureAuthenticated, isadmin } = require("../middleware/auth");
    isadmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user.role === 'admin') {
            return next();
        }
        req.flash('error_msg', 'Unauthorized access. Admins only.');
        res.redirect('/dashboard');
    }
};