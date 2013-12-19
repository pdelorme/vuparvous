DROP	VIEW vuparvous.photos_score;
DROP	TABLE vuparvous.sites;
DROP	TABLE vuparvous.photos;
DROP	TABLE vuparvous.users;
DROP	TABLE vuparvous.votes;
DROP	TABLE vuparvous.visits;



CREATE  TABLE vuparvous.sites (
	site_id INT NOT NULL AUTO_INCREMENT,
	site_name VARCHAR(100) NULL ,
	description_fr LONGTEXT NULL ,
	description_en LONGTEXT NULL ,
	latitude DOUBLE NULL ,
	longitude DOUBLE NULL ,
	category VARCHAR(4) NULL,
	PRIMARY KEY (site_id) 
);

CREATE  TABLE vuparvous.photos (
	photo_id INT NOT NULL AUTO_INCREMENT,
	site_id INT NULL ,
	filename VARCHAR(128) NULL ,
	score_insolite INT NULL ,
	score_qualite INT NULL ,
	commentaire VARCHAR(1000) NULL ,
	auteur VARCHAR(45) NULL ,
	PRIMARY KEY (photo_id) 
);

CREATE  TABLE vuparvous.users (
	user_id INT NOT NULL AUTO_INCREMENT,
	login VARCHAR(15) NOT NULL ,
	password VARCHAR(45) NULL ,
	first_name VARCHAR(45) NULL ,
	last_name VARCHAR(45) NULL ,
	email VARCHAR(45) NULL ,
	PRIMARY KEY (user_id) ,
	UNIQUE INDEX login_UNIQUE (login ASC) 
);

CREATE  TABLE vuparvous.votes (
	user_login VARCHAR(15) NOT NULL,
	photo_id INT NOT NULL,
	vote_insolite INT NULL,
	vote_qualite INT NULL,
	vote_date DATETIME NOT NULL,
	PRIMARY KEY (user_login,photo_id)
);

CREATE  TABLE vuparvous.visits (
	user_login VARCHAR(15) NOT NULL,
	site_id INT NOT NULL,
	visit_date DATETIME,
	PRIMARY KEY (user_login,site_id)
);


CREATE VIEW vuparvous.photos_score AS
SELECT photos.photo_id, photos.filename,photos.auteur,photos.commentaire, 
       sites.site_id, sites.site_name, 
       photos.score_insolite + coalesce(sum(votes.vote_insolite),0) as score_insolite,
       photos.score_qualite + coalesce(sum(votes.vote_qualite),0) as score_qualite
  FROM vuparvous.photos
  LEFT JOIN vuparvous.votes ON votes.photo_id = photos.photo_id,
       vuparvous.sites
 WHERE photos.site_id = sites.site_id
 GROUP BY photos.photo_id, photos.filename,photos.auteur,photos.commentaire,
          sites.site_id, sites.site_name, 
          photos.score_qualite, photos.score_insolite
