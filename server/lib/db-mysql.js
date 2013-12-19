var mysql = require('mysql');
var fs    = require('fs');
var xml2js = require('xml2js');

module.exports = {
  init_db : function(host, database, user, password){
	  init_db(host, database, user, password);
  },
  loadXMLQueries : function(filename, callback){
	  loadXMLQueries(filename, callback);
  },
  select: function (sql, param, callback) {
	  select(sql, param, callback);
  },
  list: function (sql, param, callback, options) {
	  list(sql, param, callback, options);
  },
  insert: function (sql, object, callback) {
	  insert(sql, object, callback);
  },
  update: function (sql, object, callback) {
	  update(sql, object, callback);
  },
  insert_site: function (site, callback) {
	  insert_site(site, callback);
  },
  insert_photo: function (photo, callback) {
	  insert_photo(photo, callback);
  },
  terminate : function(){
	  terminate();
  }
};

var pool;

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
		  password : password
	});
	return pool;
}
/**
 * terminates database pool
 */
function terminate(){
	pool.end();
}

var sqlQueries = { };

/**
 * loading xmlFile into queries array.
 * @param xmlFile
 */
function loadXMLQueries(xmlFile, callback){
	var parser = new xml2js.Parser();
	fs.readFile(xmlFile, function(err, data) {
		parser.parseString(data, function (err, result) {
			if(err) {
				console.log(err);
				return;
			}
			for (var query in result.queries) { 
				sqlQueries[query] = result.queries[query]; 
			}
			// console.log("xmlFile loaded",xmlFile);
			// console.log(sqlQueries);
			if(callback)
				callback();
		});
	});
}

/**
 * returns the SQL associated with that key
 * @param sqlKey
 * @returns
 */
function getQuery(sqlKey){
	return sqlQueries[sqlKey];
}

/**
 * updates or inserts if no rows where updated.
 * ATTENTION updateQuery doit inclure la clause WHERE.
 * @param updateQuery the update SQL
 * @param insertQuery the insert SQL
 * @param object the object to be escaped and injected into queries.
 * @param callback callback once update or insert is finished.
 */
function update_or_insert(updateQuery, insertQuery, object, callback){
	pool.getConnection(function(err, connection) {
		// Use the connections
		connection.query( updateQuery, object, function(err, result) {
			// console.log(err,result);
			if (err) throw err;
			if(result.affectedRows>0){
				console.log("object updated :", object);
				connection.end();
				if(callback) 
					callback();
				return;
			}
				
			// And done with the connection.
			connection.query(insertQuery, object, function(err, result) {
				if (err) throw err;
				console.log("object inserted :",object);
				// And done with the connection.
				connection.end();
				if(callback)
					callback();
			});
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
		site_id : row._id,
		site_name : row['Raison Sociale'],
		description_fr : row['TEXTE FRANÇAIS'],
		description_en : row['TEXTE ANGLAIS'],
		latitude : row['Latitude'],
		longitude : row['Longitude']
	};
	update_or_insert('UPDATE sites set ? where site_id = \''+site.site_id+'\'', 'INSERT INTO sites set ?', site, function(){
		console.log("added",site.site_id);
	});
}
/**
 * insert or update a photo.
 * @param mydoc
 * @param callback
 * @param tried
 */
function insert_photo(row, callback) {
	var photo = {
			photo_id : row._id,
			site_id : row.site_id,
			filename : row.filename,
			auteur : row. auteur,
			commentaire: row.commentaire,
			// date : row.date,
			score_qualite: row.score_qualite,
			score_insolite:row.score_insolite
	}
	update_or_insert('UPDATE photos set ? where photo_id = \''+photo.photo_id+'\'', 'INSERT INTO photos set ?', photo, function(){
		console.log("added",photo.photo_id);
	});
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
 * executes a query with params.
 * @param queryKey
 * @param params
 */
function list(queryKey, params, callback, options) {
	var queryString = getQuery(queryKey)[0];
	if(!queryString){
		console.log('Could not find sqlString',queryKey);
		var err = 'Could not find sqlString'+queryKey;
		if(callback)
			callback(err,null);
		return;
	}
	queryString = prepare(queryString,params);
	console.log('queryString : ',queryString);
	if(!options)
		options={};
	options.sql = queryString;
	pool.getConnection(function(err, connection) {
		connection.query( options, function(err, rows) {
		    // And done with the connection.
		    connection.end();
		    if(callback)
		    	callback(err,rows);
		    // Don't use the connection here, it has been returned to the pool.
		});
	});
};

/**
 * returns zero or one value from select.
 * throws error otherwise.
 * @param queryKey
 * @param params
 * @param callback
 */
function select(queryKey, params, callback){
	list(queryKey,params, function(err,rows){
		if(err)
			return callback(err,rows);
		if(rows && rows.length>1)
			return callback('single value not found',rows);
		if(rows && rows.length==1)
			return callback(err,rows[0]);
		return callback();
	});
}

/**
 * insert objet.
 * @param insertKey
 * @param object
 * @param callback
 */
function insert(insertKey, object, callback){
	var insertString = getQuery(insertKey)[0];
	if(!insertString){
		console.log('Could not find sqlString',insertKey);
		var err = 'Could not find sqlString'+insertKey;
		if(callback)
			callback(err,null);
		return;
	}
	pool.getConnection(function(err, connection) {
		// Use the connections
		connection.query(insertString, object, function(err, result) {
			if (err) throw err;
			//console.log("object inserted :",object);
			connection.end();
			if(callback)
				callback(err, result);
		});
	});
}

/**
 * update value.
 * @param insertKey
 * @param object
 * @param callback
 */
function update(updateKey, params, callback){
	var updateString = getQuery(updateKey)[0];
	if(!updateString){
		console.log('Could not find sqlString',updateKey);
		var err = 'Could not find sqlString'+updateKey;
		if(callback)
			callback(err,null);
		return;
	}
	updateString = prepare(updateString,params);
	console.log(updateString);
	pool.getConnection(function(err, connection) {
		// Use the connections
		connection.query(updateString, function(err, result) {
			if (err) throw err;
			//console.log("object inserted :",object);
			connection.end();
			if(callback)
				callback(err, result);
		});
	});
}

