var SessionStore = require('./Session.js');
const uuidv4 = require('uuid/v4');

function getOriginIp(req) {
    var ip = (req.headers['x-forwarded-for'] || '').split(',').pop() || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket.remoteAddress;
    return ip;
}

function createNewSession(req, res) {
    var session = new SessionStore();
    session.originIp = getOriginIp(req);
    session.sessionkey = Buffer.from('' + uuidv4() + uuidv4(), 'binary').toString('base64');
    session.valid = true;
    session.expires = new Date().getTime() + 60000; // 10 min
    session.save(function (err) {
        if (err)
          res.send(err);
        else
          res.send(session);
      })
}

module.exports = {
    authenticate : function(user, pass, req, res) {
        if (user === process.env.CMR_USER && pass === process.env.CMR_PASSWD) {
            createNewSession(req, res);
            return true;
        }
        return false;
    },

    validateSession(key, exec, req, res) {
        SessionStore.findOne({ "sessionkey": key}, function (err, session) {
            if (session.valid === true && session.expires > new Date().getTime()) {
                exec(req, res);
            }
        });
    },

    invalidateSession(key, res) {
        SessionStore.findOneAndRemove({ "sessionkey": key}, function (err, level) {
            if (err)
              res.send(err);
            res.json({ message: 'Successfully logout' });
        });
    },

    
}