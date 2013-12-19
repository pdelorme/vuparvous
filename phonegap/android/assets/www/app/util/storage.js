/**
 * base de donnée
 */
document.addEventListener("deviceready", onDeviceReadyDB, false);

// Cordova is ready
//
function onDeviceReadyDB() {
	var db = window.openDatabase("vuparvous", "1.0", "VuParVous", 1000000);
	db.transaction(function(tx){
		tx.executeSql('CREATE TABLE IF NOT EXISTS PHOTOS (photoId unique, siteId, name, imageURI, commentaire)');
	}, errorDB, successDB);	
}
/**
 * enregistre la photo en database.
 * @param photo
 */
function savePhotoDB(photo){
	db.transaction(function(tx){
	     tx.executeSql('INSERT INTO PHOTOS (photoId, siteId, name, imageURI, commentaire) VALUES ('+photoId','+siteId+','+name+','+imageURI+','+commentaire+')');		
	}, errorDB, successDB);
}

function errorDB(err) {
    alert("Error processing SQL: "+err.code);
}

function successDB() {
    alert("success!");
}

