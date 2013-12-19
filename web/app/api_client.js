/**
 * SERVER API CLIENT
 */

/**
 * loads all sites by calling nodejs server.
 */
function loadSites(){
	$.getJSON('api/sites', function(data) {
		var sites = appModel.get('sites');
		$.each(data, function(key, val) {
			sites.add(new Site(val));
		});
	});
}


/**
 * loads site photos
 */
function loadSitePhotos(site,photoCallBack){
	site.photos = new Backbone.Collection;
	site.photos.on({"add": photoCallBack});
	$.getJSON('api/site_photos/'+site.id, function(data) {
		$.each(data, function(key, val) {
			var photo = new Photo(val);
			site.photos.add(photo);
		});
	});
}

/**
 * loads palmares photos
 * @param addCallback appellé à chaque ajout de photo dans la collection.
 */
function loadPhotoQualite(addCallback,finalCallback){
	loadPhoto('api/photos_qualite',appModel.get('photosQualite'), addCallback, finalCallback);
}
function loadPhotoInsolite(addCallback,finalCallback){
	loadPhoto('api/photos_insolite',appModel.get('photosInsolite'), addCallback, finalCallback);
}
function loadPhotoTop(addCallback,finalCallback){
	loadPhoto('api/photos_top',appModel.get('photosTop'), addCallback, finalCallback);
}

/**
 * charges les photos de l'utilisateur et appelle finalCallback qaund le chargement est terminé.
 * @param user
 * @param finalCallback
 */
function loadUserPhotos(user, addCallback, finalCallback){
	// FIXME : remove next line.
	user.set('photos', new Backbone.Collection);
	loadPhoto('api/user_photos/'+user.get('login'), user.get('photos'), addCallback, 
		function(collection){
			user.set('photosLoaded',true);
			if(finalCallback)
				finalCallback(collection);
		}
	);
}

/**
 * loader de photos générique.
 * @param api
 * @param collection
 * @param callback(collection) :
 * @returns
 */
function loadPhoto(api, collection, addCallback, finalCallback){
	collection.reset();
	if(addCallback)
		collection.on({"add": addCallback});
	$.getJSON(api, function(data) {
		$.each(data, function(key, val) {
			var photo = new Photo(val);
			collection.add(photo);
		});
		if(finalCallback)
			finalCallback(collection);
	});
}

/**
 * charges les votes de l'utilisateur et appelle finalCallback qaund le chargement est terminé.
 * @param user
 * @param finalCallback
 */
function loadVotes(addCallback, finalCallback){
	var userVotes = new Backbone.Collection;
	if(addCallback)
		userVotes.on({"add": addCallback});
	appModel.get('currentUser').set('votes', userVotes);
	var uri = 'api/user_votes';
	if(appModel.get('currentUser').get('logged')){
		uri += '/'+user.get('login');
	}
	$.getJSON(uri, function(data) {
		if(data){
			$.each(data, function(key, val) {
				var vote = new Vote(val);
				userVotes.add(vote);
			});
		}
		if(finalCallback)
			finalCallback(collection);
	});
}

function vote(photo_id, vote_qualite, vote_insolite){
	var login = appModel.get('currentUser').get('login');
	var voteObject = {
			photo_id:photo_id,
			vote_qualite:vote_qualite,
			vote_insolite:vote_insolite,
			login:login
		};
	appModel.get('currentUser').addVote(voteObject);
	$.post('api/vote',voteObject,function(){
		alert('Votre vote est enregistré');
	},'json');
}

/**
 * login user based on password and callback.
 * calls callback(object,err) when over.
 * object is logged in user if login succeded
 * or error message if err 
 * @param login
 * @param password
 * @param callback
 * @returns
 */
function login(login,password,callback){
	appModel.get('currentUser').copy({login:login});
	$.getJSON('api/login?login='+login+"&password="+password)
	.done(function(user) {
		if(user){
			user.logged=true;
			appModel.get('currentUser').copy(user);
		}
		if(callback)
			return callback(appModel.get('currentUser'));
	})
	.fail(function(data) { 
		// efface l'utilisateur actuel.
		appModel.get('currentUser').set('logged',false);
		if(callback)
			return callback(appModel.get('currentUser'), 'error');
	})
	.always(function() { console.log( "login complete" ); });
}

function logout(callback){
	$.getJSON('api/logout')
	.done(function() {
		appModel.get('currentUser').set('logged',false);
		if(callback)
			return callback(appModel.get('currentUser'));
	});
}
/**
 * returns session user.
 */
function getUser(callback){
	var user = appModel.get('currentUser');
	if(user.get('logged')){
		if(callback)
			callback(user);
		return user;
	}
	$.getJSON('api/user_info')
	.done(function(user) {
		if(user){
			user.logged=true;
			appModel.get('currentUser').copy(user);
		}
		if(callback)
			return callback(appModel.get('currentUser'));
	})
	.fail(function(data) { 
		// efface l'utilisateur actuel.
		appModel.get('currentUser').set('logged',false);
		if(callback)
			return callback(appModel.get('currentUser'), 'error');
	})
}

// enregistre un nouvel utilisateur.
function register (login, password, first_name, last_name, email, callback){
	var newUser = {
			login:login, 
			password:password,
			first_name:first_name, 
			last_name:last_name, 
			email:email,
			toto:1
		};
	appModel.get('currentUser').copy(newUser);
	$.getJSON('api/register_user',newUser)
	.done(function(user) {
		if(user){
			user.logged=true;
			appModel.get('currentUser').copy(user);
		}
		if(callback)
			callback(appModel.get('currentUser'));
	})
	.fail(function(data) { 
		// efface l'utilisateur actuel.
		appModel.get('currentUser').set('logged',false);
		if(callback)
			callback(appModel.get('currentUser'), 'error');
	})
	.always(function() { console.log( "registration complete" ); });
}
