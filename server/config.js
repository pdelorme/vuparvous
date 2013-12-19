var config_prod = {
	server_port : 3001,
	db_host:"localhost",
	db_database:"vuparvous",
	db_user:"vuparvous",
	db_password:"Oward2013",
	web_root:__dirname+"/../web/"
};

var config_dev_bordeaux = {
		server_port : 3002,
		db_host:"localhost",
		db_database:"vuparvous_bordeaux",
		db_user:"admin",
		db_password:"Deleurence",
		web_root:__dirname+"/../web/"
	};

var config_dev = {
	server_port:3000,
	db_host:"localhost",
	db_database:"vuparvous",
	db_user:"root",
	db_password:"",
	web_root:__dirname+"/../web/"
};

module.exports = config_dev;