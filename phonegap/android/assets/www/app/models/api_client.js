/**
 * SERVER API CLIENT
 */

/**
 * loads all sites by calling nodejs server.
 */
function loadSites(finalCallback){
	$.getJSON(host+'api/sites', function(data) {
		var sites = appModel.get('sites');
		$.each(data, function(key, val) {
			sites.add(new Site(val));
		});
		if(finalCallback)
			finalCallback();
	});
}


/**
 * loads site photos
 */
function loadSitePhotos(site, callback){
//	if(!site.photos){
//		site.photos = new PhotoCollection; // FIXME : DO NOT DELETE
//		console.log("WARN : site.photo EMPTY");
//	}
	// site.photos.on({"add": photoCallBack});
	$.getJSON(host+'api/site_photos/'+site.id, function(data) {
		var photos = site.get('photos');
		$.each(data, function(key, val) {
			var photo = new Photo(val);
			photos.add(photo);
		});
		if(callback)
			callback();
	});
	
}

/**
 * loads palmares photos
 * @param addCallback appellé à chaque ajout de photo dans la collection.
 */
function loadPhotoQualite(addCallback,finalCallback){
	loadPhoto(host+'api/photos_qualite',appModel.get('photosQualite'), addCallback, finalCallback);
}
function loadPhotoInsolite(addCallback,finalCallback){
	loadPhoto(host+'api/photos_insolite',appModel.get('photosInsolite'), addCallback, finalCallback);
}
function loadPhotoTop(addCallback,finalCallback){
	loadPhoto(host+'api/photos_top',appModel.get('photosTop'), addCallback, finalCallback);
}

/**
 * charges les photos de l'utilisateur et appelle finalCallback qaund le chargement est terminÃ©.
 * @param user
 * @param finalCallback
 */
function loadUserPhotos(user, addCallback, finalCallback){
//	// FIXME : remove next line.
//	if(!user.get('photos')){
//		user.set('photos', new PhotoCollection);
//		console.log("WARN : user.photos EMPTY");
//	}

	loadPhoto(host+'api/user_photos/'+user.get('login'), user.get('photos'), addCallback, 
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
function loadUserVotes(user, finalCallback){
	//var userVotes = new Backbone.Collection;
	//if(addCallback)
	//	userVotes.on({"add": addCallback});
	var userVotes = user.get('votes');
	var uri = host+'api/user_votes';
	var user = appModel.get('currentUser');
	if(user.get('logged')){
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
    if(!networkAvailable()){
        return;
    }
	var login = appModel.get('currentUser').get('login');
	var voteObject = {
			photo_id:photo_id,
			vote_qualite:vote_qualite,
			vote_insolite:vote_insolite,
			login:login
		};
	appModel.get('currentUser').addVote(voteObject);
	$.post(host+'api/vote',voteObject,function(){
		appView.alert('Votre vote est enregistré');
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
    if(!networkAvailable()){
        return;
    }
	appModel.get('currentUser').copy({login:login});
	$.ajax({
		type: "GET",
		url : host+'api/login?login='+login+"&password="+password, 
		dataType: 'json',
		success : function(user){
			if(user){
				user.logged=true;
				appModel.get('currentUser').copy(user);
			}
			if(callback)
				return callback(appModel.get('currentUser'));
		},
		error : function(xhr, type){
			// alert(JSON.parse(xhr.response).message);
			if(callback)
				callback(JSON.parse(xhr.response).message,'error');
		}
	});
}

// enregistre un nouvel utilisateur.
function register (login, password, first_name, last_name, email, callback){
    if(!networkAvailable()){
        return;
    }
	var newUser = {
			login:login, 
			password:password,
			first_name:first_name, 
			last_name:last_name, 
			email:email,
			toto:1
		};
	appModel.get('currentUser').copy(newUser);
	$.ajax({
		url : host+'api/register_user',
		data : newUser, 
		dataType: 'json',
		success : function(user, status) {
			if(user){
				user.logged=true;
				appModel.get('currentUser').copy(user);
			} 
			if(callback)
				callback(appModel.get('currentUser'));
		},
		error : function(xhr, type){
			// alert(JSON.parse(xhr.response).message);
			if(callback)
				callback(JSON.parse(xhr.response).message,'error');
		}
	});
}

function uploadPhoto(photo, okCallback, failedCallback,loadingCallback) {
    if(!networkAvailable()){
        if(failedCallback)
            failedCallback();
        return;
    }
        
	var imageURI = photo.getImageSrc();
    var options = new FileUploadOptions();
    options.fileKey="file";
    options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
    options.mimeType="image/jpeg";

    var params = new Object();
    params.login = appModel.get('currentUser').get('login');
    params.site_id = photo.get('site_id');
    params.commentaire = photo.get('commentaire');
    params.offset = photo.get('offset');
    
    options.params = params;
    options.chunkedMode = false;
    
    function win(r) {
        console.log("Code = " + r.responseCode);
        console.log("Response = " + r.response);
        console.log("Sent = " + r.bytesSent);
        if(okCallback){
        	okCallback();
        }
        
    }

    function fail(error) {
        appView.alert("An error has occurred: Code = " = error.code);
        if(failedCallback){
        	failedCallback();
        }
    }
    var fileTransfer = new FileTransfer();
    var progressPerc = 0;
	if(loadingCallback){
		fileTransfer.onprogress = function(progressEvent) {
		    if (progressEvent.lengthComputable) {
		    	
		    	progressPerc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
		    } else {
		    	
		    	progressPerc++;
		    	if(progressPerc>100)
		    		progressPerc = 50;
		    }
		    loadingCallback(progressPerc);
		};
	};
	fileTransfer.upload(imageURI, host+"api/upload", win, fail, options);
}

function networkAvailable(){
    var networkState = navigator.connection.type;
    if(networkState==Connection.NONE){
        appView.alert("Réseau non disponible");
        return false;
    }
    return true;
}

/**
 * returns the file if cached locally
 * otherwise :
 * - fetch file from remote server
 * - store localy for later use
 * - calls okCallback(cache filepath) on success
 * - calls koCallback() on error
 */
function getFileCache(filePath, okCallback, koCallback){
	var uri = encodeURI(host+filePath);
	var localFilePath = "vuparvous/"+filePath;
	var localRootPath = fileSystem.root.fullPath+"/";
	fileSystem.root.getFile(
		localFilePath,
		{ create: false }, 
		// OK : file present
		function(fileEntry){
			console.log("file in cache:"+fileEntry.fullPath);
			if(okCallback){
				okCallback(fileEntry.fullPath);
			}
			return;
		}, 
		// ERROR : file not present -> cache file
		function(){
			var fileTransfer = new FileTransfer();
			
			fileTransfer.download(
				uri,
				localRootPath+localFilePath,
				// DOWNLOAD OK.
				function(entry) {
					console.log("download complete: " + entry.fullPath);
					if(okCallback){
						okCallback(entry.fullPath)
					}
				},
				// DOWNLOAD ERROR
				function(error) {
					console.log("download error source " + error.source);
					console.log("download error target " + error.target);
					console.log("upload error code" + error.code);
					if(koCallback)
						koCallback(uri);
				},
				false,
				{
					headers: {}
				}
			);
		}
	);
	return localFilePath;
}

