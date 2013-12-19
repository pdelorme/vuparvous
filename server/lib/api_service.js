var fs     = require('fs');
var crypto = require('crypto');
var db     = require('./db-mysql');
var config = require('../config');

// creates the connection pool.
db.init_db(config.db_host,
		   config.db_database,
		   config.db_user,
		   config.db_password
);

// loads queries.
db.loadXMLQueries(__dirname + '/sql.xml', function(){
	console.log("file LOADED");
});


/**
 * gets all sites.
 */
exports.get_sites = function(req,res){
	db.list('select_sites',null, function(err, data){
		//console.log(">>",err,data);
		var sites = [];
		for (var i=1;i<data.length; i++) { 
			var row = data[i];
			var site = row.sites;
			site.photo = row.photos;
			site.photo.score_insolite = row.site_score.score_insolite;
			site.photo.score_qualite  = row.site_score.score_qualite;
			sites.push(site);
		}
		return res.send(sites);
	},{nestTables: true});
}

/**
 * gets all sites.
 */
exports.get_site_photos = function(req,res){
	console.log(req.params);
	db.list('select_site_photos',req.params, function(err, data){
		return res.send(data);
	});
}

/**
 * gets les photos insolite dans l'ordre.
 */
exports.get_photos_insolite = function f(req,res){
	console.log(req.params);
	db.list('select_photos_insolite',req.params, function(err, data){
		return res.send(data);
	});
}

/**
 * gets les photos qualite dans l'ordre.
 */
exports.get_photos_qualite = function f(req,res){
	console.log(req.params);
	db.list('select_photos_qualite',req.params, function(err, data){
		return res.send(data);
	});
}

/**
 * gets les photos top dans l'ordre.
 */
exports.get_photos_top = function f(req,res){
	console.log(req.params);
	db.list('select_photos_top',req.params, function(err, data){
		return res.send(data);
	});
}
/**
 * USER BUISNESS
 */

/**
 * registering new user.
 */
exports.register_user = function f(req,res){
	var params = req.query;
	console.log("register_user params",params);
	if(!params.login || ! params.password){
		return res.respond('login and password must be provided',400);
	}
	var dbObject = {
		login      : params.login,
		password   : password(params.password), // password hash.
		first_name : params.first_name,
		last_name  : params.last_name,
		email      : params.email
	}
	
	db.select('select_user',dbObject, function(err, data){
		console.log(">>user:",err,data);
		if(err)
			return res.respond(err,400);
		if(data){
			if(data.password!=dbObject.password){
				// user already exists.
				return res.respond('invalid login or password',400);
			}
			// updates data values from params
			for (var key in dbObject) { 
				if(data[key]){
					data[key] = dbObject[key];
				}
			}
			if(params.newPassword){
				console.log("new PASSWORD.");
				dbObject.password = password(params.newPassword);
			}
			// reinjects data with updated values.
			db.update('update_user', dbObject, function(err,data){
				dbObject.password=undefined;
				return res.respond(dbObject,200);
			});
		} else {
			db.insert('insert_user',dbObject, function(err,data){
				dbObject.password=undefined;
				return res.respond(dbObject,200);
			});
		}
	});
}

/**
 * checking user/password.
 * @return user.
 */
exports.login = function f(req,res){
	var params = req.query;
	console.log("login params",params);
	if(!params.login || ! params.password){
		return res.respond('login and password must be provided',400);
	}

	params.password = password(params.password);
	db.select('select_user',params, function(err, data){
		// console.log("data",data);
		if(!err && data && data.password==params.password){
			data.password = undefined;
			req.session = {};
			req.session.login = params.login;
			return res.send(data);
		}
		return res.respond('invalid login or password',400);
	});
	
}

exports.logout = function f(req,res){
	req.session = null;
	return res.respond('OK',200);
}

function password(password){
	if(!password)
		return;
	var shasum = crypto.createHash('sha1');
	shasum.update(password);
	return shasum.digest('hex');
}
/**
 * gets user info
 */
exports.get_user_info = function f(req,res){
	if(!req.params.login){
		req.params.login = req.session.login;
	}
	db.select('select_user',req.params, function(err, data){
		if(!data)
			return res.respond('no user found',400);
		var user_info = {
				login      : data.login,
				first_name : data.first_name,
				last_name  : data.last_name
		};
		
		return res.send(user_info);
	});
}

/**
 * gets user photos.
 */
exports.get_user_photos = function f(req,res){
	db.list('select_user_photos',req.params, function(err, data){
		return res.send(data);
	});	
}

/**
 * returns all user votes.
 * @param req
 * @param res
 */
exports.get_user_votes = function f(req,res){
	var params = req.params;
	var queryObject = {
		login:params.login?params.login:req.connection.remoteAddress,
	}
	db.list('select_user_votes',queryObject, function(err, data){
		return res.send(data);
	});	
}

/**
 * changes the user vote
 * @param req
 * @param res
 */
exports.set_vote = function f(req,res){
	var params = req.body;
	console.log(params);
	console.log('ip:',req.connection.remoteAddress)
	var dbObject = {
		login      : params.login?params.login:req.connection.remoteAddress,
		photo_id   : params.photo_id,
		vote_insolite : params.vote_insolite?1:0,
		vote_qualite : params.vote_qualite?1:0,
	}
	db.update('update_user_vote', dbObject, function(err,data){
		return res.respond(dbObject,200);
	});
}

exports.upload = function f(req,res){
	// console.log(req);
	var file = req.files.file;
	var params = req.body;
	
	if(file){
		var fileSpliter = file.path.split(/(.+)?\//);
		var filename = fileSpliter[2];
		var uploadFile = 'uploads/'+filename;
		var targetFile = config.web_root+"data/images/"+uploadFile;
		console.log(file.path, targetFile);
		fs.renameSync(file.path, targetFile);
		var dbObject = {
			auteur      : params.login?params.login:req.connection.remoteAddress,
		    site_id     : params.site_id,
		    filename    : uploadFile,
		    score_insolite:0,
		    score_qualite :0,
		    commentaire :params.commentaire
		};
		db.update('insert_photo', dbObject, function(err,data){
			return res.respond(dbObject,200);
		});

	}
}
