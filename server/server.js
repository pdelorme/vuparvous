
/**
 * Module dependencies.
 */

var config      = require('./config'),
	express     = require('express'),
	http        = require('http'),
	path        = require('path'),
	httpProxy   = require('http-proxy'),
	api         = require('./lib/api_service'),
	imagecache  = require('./lib/imagecache'),
	response    = require('./lib/response');

// prevent from crashing.
//process.on('uncaughtException', function (err) {
//	  console.error(err);
//	  console.log("Node NOT Exiting...");
//	});


var app = express();
var proxy = new httpProxy.RoutingProxy();

// all environments
app.set('port', process.env.PORT || config.server_port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({uploadDir: __dirname + '/uploads-tmp'}));
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.cookieSession({secret:'OpenDataAwards',cookie: { maxAge: 60 * 60 * 1000 }}));
app.use(app.router);
app.use('/imagecache/',imagecache(config.web_root));
app.use(express.static(config.web_root));

function errorHandler (options) {
	var log = options.log || console.error
    	, stack = options.stack || false
    return function (err, req, res, next) {
		if (stack && err.stack) log(err.stack);
		var content = err.message;
		if (stack && err.stack) content += '\n' + err.stack;
		res.respond(content, err.code || 500);
	}
};

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler({"stack": false}));
}

app.use(errorHandler({"stack": true}));
app.get('/*',function(req,res,next){
    res.header('Access-Control-Allow-Origin', '*' );
    next(); 
});

app.get('/api/sites', api.get_sites);
app.get('/api/site_photos/:site_id', api.get_site_photos);
app.get('/api/photos_qualite',       api.get_photos_qualite);
app.get('/api/photos_insolite',      api.get_photos_insolite);
app.get('/api/photos_top',           api.get_photos_top);
app.get('/api/user_info/:login',     api.get_user_info);
app.get('/api/user_info',            api.get_user_info);
app.get('/api/user_photos/:login',   api.get_user_photos);
app.get('/api/user_votes/:login',    api.get_user_votes);
app.get('/api/user_votes',    		 api.get_user_votes);
app.post('/api/vote',                api.set_vote);
app.post('/api/upload',              api.upload);
app.get('/api/register_user',        api.register_user);
app.get('/api/login',                api.login);
app.get('/api/logout',               api.logout);


// server startup.
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
