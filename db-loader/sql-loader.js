var sites_filepath = __dirname+'/data/sites.csv';
var photos_filepath = __dirname+'/data/photos.csv';
var options = {
		  columns: true,
		  delimiter: ',',
		  quote: '"',
		  encoding: 'utf-8'
	};

var csv = require('csv');
var fs = require('fs');
var mysql = require('./mysql');

function load_sites(filepath) {
	csv()
	.from.path(filepath,options)
	.transform(function(row, index) {
		// row._id = 'site_'+index;
		// row.name = row.firstname + ' ' + row.lastname
		// console.log("READING : ",index, row.site_id);
		if(row.site_id){
			mysql.insert_site(row, function(cb_row){
				console.log('inserted site',cb_row.site_id);
				// console.log(row);
				if(row.PHOTO){
					console.log(">>"+row.PHOTO);
					var photos = row.PHOTO.split(',');
					for (var i=0;i<photos.length;i++){
						var filename = photos[i];
						photo = {
								photo_id : row.site_id*1000+i,
								site_id  : row.site_id ,
								filename : ''+filename ,
								score_insolite : 0 ,
								score_qualite  : 0 ,
								commentaire    : 'chargément auto' ,
								auteur         : 'cyril' ,
						}
						console.log("photo",photo.filename);
						//console.log(photo);
						mysql.insert_photo(photo, function(){
							console.log("photo chargé ",photo.photo_id)
						});
					}
				}
				
			});
		}
		return row;	
	});
}

function load_photos(filepath) {
	csv()
	.from.path(filepath,options)
	.transform(function(row, index, callback) {
		row._id = 'photo_'+index;
		// row.name = row.firstname + ' ' + row.lastname
		mysql.insert_photo(row, function(){
			console.log('>>',row,index);
		});
		return row;	
	});
}

mysql.truncate(function(){
	load_sites(sites_filepath);
	load_photos(photos_filepath);
});












//
//var nano = require('nano')('http://localhost:5984');
//var utils = require('./nano-utils');
//var db = nano.use(db_name);
//utils.init(db);
//
//
//csv()
//	.from.path(filepath,options)
//	.transform(function(row, index, callback) {
//		row._id = 'site_'+index;
//		row.objectType='site';
//		// row.name = row.firstname + ' ' + row.lastname
//		utils.insert_doc(row, function(){
//			console.log('>>',row,index);
//		});
//		return row;	
//	});
//
