var imagecache  = require('./imagecache');
var fs = require('fs');

var sourceDir = __dirname+"/../android/assets/www/img/";
var targetDir = __dirname+"/../android/assets/www/imagecache/";


processfile(sourceDir, '', targetDir);

function processfile(rootDir, path, targetDir){
	//console.log(">>>>", rootDir, path, targetDir);
	var files = fs.readdirSync(rootDir+path);
	for(var i=0;i<files.length;i++){
		var file = files[i];
		var filePath = rootDir+path+file;
		//console.log(">>",filePath);
		var stats = fs.statSync(filePath);
		if(stats.isDirectory()){
			//console.log(">>>>",rootDir, rootDir.length, file, filePath.substring(rootDir.length ));
			processfile(rootDir, filePath.substring(rootDir.length)+"/", targetDir);
		} else {
			var fileSpliter = file.split(/(.+)?\./);
			var ext = fileSpliter[2];
			if(ext=='jpg' || ext=='png'){
				console.log("filter:",rootDir+"||"+ path+file+"||"+ targetDir);
				imagecache.filter(rootDir, path+file, targetDir, '', 'ldpi', function(){
					imagecache.filter(rootDir, path+'/'+file, targetDir, '', 'mdpi', function(){
						imagecache.filter(rootDir, path+'/'+file, targetDir, '', 'hdpi', function(){
							imagecache.filter(rootDir, path+'/'+file, targetDir, '', 'xhdpi', function(){
								
							});
						});
					});
				});
			}
		}
	}
}
// itère sur tous les fichiers png/jpg de path
//image cache dans 

// function(sourceDir, filePath, cacheDir, filterPath, filterChain, callback)