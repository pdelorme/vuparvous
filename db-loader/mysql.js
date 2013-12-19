var mysql = require('mysql');

module.exports = {
  init : function(host, user, password){
	  init(host, user, password);
  },
  insert_site: function (site, callback) {
	  insert_site(site, callback);
  },
  insert_photo: function (photo, callback) {
	  insert_photo(photo, callback);
  },
  terminate : function(){
	  terminate();
  },
  truncate : function(callback){
	  truncate(callback);
  }
};

var pool;

init_db(
	  'localhost',
	  'vuparvous',
	  'root',
	  ''
	);


/**
 * init database pool with cusom values.
 * @param host
 * @param user
 * @param password
 */
function init_db(host, database, user, password){
	pool  = mysql.createPool({
		  host     : host,
		  database : database,
		  user     : user,
		  password : password,
		  charset  : 'UTF8'
	});
	console.log(pool);
	return pool;
}
/**
 * terminates database pool
 */
function terminate(){
	pool.end();
}

/**
 * repaces all :xxx par xxx value.
 * @param query
 * @param values
 * @returns
 */
function prepare(query, values) {
	if (!values) 
		return query;
	return query.replace(/\:(\w+)/g, function (txt, key) {
		if (values.hasOwnProperty(key)) {
			return this.escape(values[key]);
		}
		return txt;
	}.bind(this));
};


/**
 * updates or inserts if no rows where updated.
 * ATTENTION updateQuery doit inclure la clause WHERE.
 * @param updateQuery the update SQL
 * @param insertQuery the insert SQL
 * @param object the object to be escaped and injected into queries.
 * @param cb callback once update or insert is finished.
 */
function update_or_insert(updateQuery, insertQuery, object, cb){
	pool.getConnection(function(err, connection) {
		// Use the connections
		//console.log(updateQuery,insertQuery,object);
		//console.log(updateQuery);
		connection.query( updateQuery, object, function(err, result) {
			if (err) throw err;
			if(result.affectedRows>0){
				//console.log("object updated :", object);
				connection.end();
				if (cb) 
					cb(object);
				return;
			}
				
			// And done with the connection.
			var q = connection.query(insertQuery, object, function(err, result) {
				// console.log(err,result);
				if (err) throw err;
				//onsole.log("object inserted :",object);
				// And done with the connection.
				connection.end();
				if (cb)
					cb(object);
			});
			// console.log(q.sql);
		});
	});		
}

/**
 * insert or update a site.
 * @param mydoc
 * @param callback
 */
function insert_site(row, callback) {
	var site = {
		site_id : row.site_id,
		site_name : row['Raison Sociale'],
		description_fr : row['TEXTE FRANÇAIS'],
		description_en : row['TEXTE ANGLAIS'],
		latitude : row['Latitude'],
		longitude : row['Longitude'],
		category:row['category']
	};
	update_or_insert('UPDATE sites set ? where site_id = \''+site.site_id+'\'', 'INSERT INTO sites set ?', site, function(cb_row){
		console.log("added",site.site_id);
		if(callback)
			callback(cb_row);
	});
}
/**
 * insert or update a photo.
 * @param mydoc
 * @param callback
 * @param tried
 */
function insert_photo(photo, callback) {
//	var photo = {
//			photo_id : row.photo_id,
//			site_id : row.site_id,
//			filename : row.filename,
//			auteur : row. auteur,
//			commentaire: row.commentaire,
//			// date : row.date,
//			score_qualite: row.score_qualite,
//			score_insolite:row.score_insolite
//	}
	delete photo.date;
	delete photo._id;
	console.log(photo);
	update_or_insert('UPDATE photos set ? where photo_id = \''+photo.photo_id+'\'', 'INSERT INTO photos set ?', photo, function(cb_row){
		console.log("added",photo.photo_id);
		if(callback)
			callback(cb_row);
	});
}

function truncate(callback){
	pool.getConnection(function(err, connection) {
		// Use the connections
		connection.query( 'truncate photos', null, function(err, result) {
			connection.query( 'truncate sites', null, function(err, result) {
				connection.end();
				if(callback)
					callback();
			});
		});
	});
}