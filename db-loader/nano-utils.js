var db;

module.exports = {
  init: function(nano_db){
	  db = nano_db;
  },
  insert_doc: function (mydoc, callback) {
    insert_doc(mydoc, callback, 0);
  },
  bar: function () {
    // whatever
  }
};

/**
 * insert or update document.
 * @param mydoc
 * @param callback
 * @param tried
 */
function insert_doc(mydoc, callback, tried ) {
	// console.log("insert_doc ",tried);
	
    db.insert(mydoc, mydoc._id, function (err, http_body, http_header) {
        if (err) {
            if (err.error === 'conflict' && tried < 1) {
            	// console.log('conflict',tried);
                // get record _rev and retry
                return db.get(mydoc._id, function (err, doc) {
                	// console.log('get',doc);
                    mydoc._rev = doc._rev;
                    insert_doc(mydoc, callback, tried + 1);
                });
            }
        } else {
        	// callback
			if(callback)
				callback();
        }
    });
}