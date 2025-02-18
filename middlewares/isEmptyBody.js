const {HttpError} = require ('../helpers/index');

const isEmptyBody = (req, res, next) => {
    if (!Object.keys(req.body).length){
        return next (HttpError (400, 'missing required name field'));
    }
    next ();
}

module.exports = isEmptyBody;