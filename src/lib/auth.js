module.exports = {

    isLoggedIn(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        return res.redirect('/signin');
    },
    
    isNotLoggedIn(req, res, next){
        console.log(req.isAuthenticated());
        if(!req.isAuthenticated()){
            console.log("entra aca")
            return next();
        }
        return res.redirect('/');
    }
}