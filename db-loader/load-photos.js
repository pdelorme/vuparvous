var db_name="vuparvous";
var filepath = __dirname+'/data/photos.csv';
var options = {
	  columns: true,
	  delimiter: ',',
	  quote: '"',
	  encoding: 'utf-8'
};


var nano = require('nano')('http://localhost:5984');
var utils = require('./nano-utils');
var db = nano.use(db_name);
utils.init(db);

var csv = require('csv');
var fs = require('fs');

csv()
	.from.path(filepath,options)
	.transform(function(row, index, callback) {
		row._id = 'photo_'+index;
		row.objectType='photo';
		// row.name = row.firstname + ' ' + row.lastname
		utils.insert_doc(row, function(){
			console.log('>>',row,index);
		});
		return row;	
	});

