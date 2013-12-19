/**
 * imagecache middleware.
 */
var fs = require('fs');
var gm = require('gm');
var filters = {
	vignette : {
		operation: "resize",
		height:138,
		width:138,
		options:"!",
		unit:"cm"
	},
	sitehead :{
		operation: "resize",
		height:279,
		width:279,
		options:"!"
	},
	big : {
		operation: "resize",
		height:498,
		width:498,
		options:"!"
	},
	ldpi : {
		operation: "density",
		width:120,
		height:120
	},
	mdpi : {
		operation: "density",
		width:160,
		height:160
	},
	hdpi : {
		operation: "density",
		width:240,
		height:240
	},
	xhdpi : {
		operation: "density",
		width:320,
		height:320
	}
	
}
var options;
/**
 * retourne une image retaillé selon
 * params.format = le format souhaité de l'image
 * params.filename = le nom du fichier souhaité.
 */
module.exports = function(root, options) {
	options = options || {};

	// root required
	if (!root) throw new Error('static() root path required');
    
    return function(req, res, next) {
		var uri = req.params[0];
		var uripart = uri.split(/\/(.+)?/);
		var path = uripart[0]; // imagecache
		var uripart = uripart[1].split(/\/(.+)?/);
		var filter_chain = uripart[0]; // filter
		var filepath = uripart[1]; // filepath
    	console.log(0);
		return filter(root, filepath, root+path, '', filter_chain, function(){
			next();
		});
	}
    
}
module.exports = {
		  filter : function(sourceDir, filePath, cacheDir, filterPath, filterChain, callback){
			  return filter(sourceDir, filePath, cacheDir, filterPath, filterChain, callback);
		  }
}

/**
 * transform recursivly the image according to filter_chain.
 * @param sourceDir le dossier du fichier d'origine.
 * @param filepath le chemin relatif du fichier à transformer.
 * @param cacheDir le dossier de stockage des résultat.
 * @param filterPath les filtre déja traité.
 * @param filterChain les filtres à traitrer.
 */
function filter(sourceDir, filePath, cacheDir, filterPath, filterChain, callback){
	// console.log("filter",sourceDir, filePath, cacheDir, "filterPath:",filterPath, "chain:",filterChain);
	
	if(!filterChain || filterChain==='' ){
		return callback(); // end of recursion.
	}
	var sourceFile = sourceDir+filePath;
	
	//var fileSpliter = sourcefile.split(/(.+)?\//);
	//var filename = fileSpliter[2];
	var filterSpliter = filterChain.split(/\+(.+)?/);
	var filterName = filterSpliter[0];
	var filterDef = filters[filterName];
	if(!filterDef) {
		console.log("undefined filter ",filterName);
		return callback();
	}
	// targer file.
	if(filterPath && filterPath!='') {
		filterPath =filterPath+'+'+filterName
	} else {
		filterPath=filterName;
	}
	var targetFile = cacheDir+'/'+filterPath+'/'+filePath;
	if(fs.existsSync(targetFile)){
		// file already generated.
		return filter(cacheDir+'/'+filterPath+'/', filePath, cacheDir, filterPath, filterSpliter[1], callback );
	}
	// create folder if necessary*
	var targetFileSplit = targetFile.split(/(.+)?\//);
	var targetDir = targetFileSplit[1];
	mkdirs(targetDir);
	// checks if sourcefile exists.
	if(!fs.existsSync(sourceFile)) {
		console.log("DOES NOT EXIST ",sourceFile);
		return callback();
	}
	
	// transform file
	if(filterDef.operation=='resize'){
		var width = filterDef.width;
		if(filterDef.unit=='cm'){
			// 1/ quel DPI.
			// 2/ transformer cm en Pixel.
		}
		gm(sourceFile)
		.resize(filterDef.width, filterDef.height, filterDef.options)
		.write(targetFile, function (err) {
		  if (!err) 
				return filter(cacheDir+'/'+filterPath+'/', filePath, cacheDir, filterPath, filterSpliter[1], callback );
		  console.log("ERROR resizing",err);
		});
		return;
	}
	if(filterDef.operation=='resample'){
		gm(sourceFile)
		.resample(filterDef.width, filterDef.height)
		.write(targetFile, function (err) {
		  if (!err) 
				return filter(cacheDir+'/'+filterPath+'/', filePath, cacheDir, filterPath, filterSpliter[1], callback );
		  console.log("ERROR resizing",err);
		});
		return;
	}
	if(filterDef.operation=='density'){
		gm(sourceFile)
		.noProfile()
		.density(filterDef.width, filterDef.height)
		.write(targetFile, function (err) {
		  if (!err) 
				return filter(cacheDir+'/'+filterPath+'/', filePath, cacheDir, filterPath, filterSpliter[1], callback );
		  console.log("ERROR resizing",err);
		});
		return;
	}
	console.log("unknown operation",filterDef.operation);
	return;
}

/**
 * mkdir recursif.
 * @param dir
 */
function mkdirs(dir){
	console.log("mkdirs",dir);
	if(fs.existsSync(dir))
		return;
	var split = dir.split(/(.+)?\//);
	var parentdir = split[1];
	mkdirs(parentdir);
	try {
		fs.mkdirSync(dir);
	} catch (e){
		console.log(e);
	}
	return;
}
