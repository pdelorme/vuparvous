/**
 * local storage
 */
function savePhotoLS(photo){
	if(photo==null){
		return;
	}
	// cette photo existe t-elle ?
	photoId = photo.get("photoId");
	if(!photoId){
		photoId = randomUUID();
	}
	// met de coté la valeur précédente.
	objectTmp = window.localStorage.getItem("photo_"+photoId);

	// copie l'image dans la zone d'applications
	imageURI = photo.get("imageUI");
	if(imageURI){
		alert(imageURI);
		fileEntry = new FileEntry({fullPath:umageURI});
	}
	
	// enregistrer l'objet dans le localStorage
	var photoJSON = JSON.stringify(photo);
	window.localStorage.setItem("photo_"+photo.get("photoId"),photoJSON);

	
	// supprimer image précédente.
	if(objectTmp) {
		JSONObject = JSON.parse(objectTmp);
		alert(JSONObject);
	}
}

function getPhotoLS(photoId){
	storeObject = window.localStorage.getItem("photo_"+photoId);
	return new Photo(JSON.parse(storeObject));
}