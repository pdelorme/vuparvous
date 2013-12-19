templates.decouvrirPhotoView = "app/views/Decouvrir/DecouvrirPhotoView.html";
voteActionTemplate = 
	"<% if(voteState=='votez') { %>"+
 		"<div id='votez' class='vote-button'>VOTEZ</div>"+
 	"<% } else if(voteState=='voter') { %>"+
 		"<div id='voter' class='vote-button clickable'>VOTER</div>"+
 	"<% } else if(voteState=='vote-ok') { %>"+
 		"<div id='vote-ok' class='vote-button'>MERCI</div>"+
 	"<% } else { %>"+
 		" KO"+
 	"<% } %>";

window.DecouvrirPhotoView = BaseView.extend({

    title: "Marseille VuParVous - Photo",

    initialize: function(options) {
    	if(options && options.photoId && options.siteId){
    		this.siteId = options.siteId;
    		this.site = getSiteById(options.siteId);
    		this.photo = site.get("photos").where({id:options.photoId})[0];
            this.vote = appModel.get('currentUser').getVote(options.photoId);
    	}
        this.view = this.$el;
        this.voteState = "votez";
    },  
    
    events:{
        "click #voter":"doVote",
        "change #vote-qualite":"activeVote",
        "change #vote-insolite":"activeVote"
    },
    
    render:function (eventName) {
        var template = _.template(templates.decouvrirPhotoView);
        var model = {
        		site:this.site,
        		photo:this.photo,
        		voteState:this.voteState,
        		vote:this.vote,
        	};
        this.$el.html(template(model));
        this.renderBase();
        return this;
    },
    
    postRender: function(){
        that = this;
        this.refreshVote();
        $("#button-info img").on("click",function(event){
        	that.showInfo();
        });
        var myScroll = new iScroll("photoContent");
        var myScroll2 = new iScroll("info");
    },
    
    showInfo:function(){
    	var info = $("#infoWrapper");
    	if(info.hasClass("visible")){
    		info.removeClass("visible");
    	} else {
    		info.addClass("visible");
    		// 
            
    	}
    },
    
    doVote: function(){
    	var photo_id = this.photo.get("photo_id");
    	var vote_qualite = $("#vote-qualite").attr('checked');
    	var vote_insolite = $("#vote-insolite").attr('checked');
    	vote(photo_id, vote_qualite, vote_insolite);
    	
    	this.voteState = "vote-ok";
    	this.refreshVote();
    	
    },
    
    activeVote: function(){
    	this.voteState = "voter";
    	this.refreshVote();
   },
   
   refreshVote: function(){
	   var template = _.template(voteActionTemplate);
	   var model = {
	       		photo:this.photo,
	       		voteState:this.voteState,
	       	};
	   $("#vote-action").html(template(model));
   }
});