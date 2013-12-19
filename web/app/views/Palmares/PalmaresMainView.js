// les templates.
templates.palmaresHeaderView = "app/views/Palmares/PalmaresHeaderView.html";
templates.palmaresMainView = "app/views/Palmares/PalmaresMainView.html";
templates.palmaresListView = "app/views/Palmares/PalmaresListView.html";

containerView = "<div id='palmaresView'><div id='viewHeader'></div><div id='viewContent'></div></div>";


window.PalmaresHeaderView = Backbone.View.extend({
    initialize: function(options) {
        this.render();
        this.view = this.$el;
        initImageButtons(this.$el);
    },  
    
    events:{
    //	"click #insolitesButton":"gotoInsolites",
    //	"click #qualitesButton":"gotoQualites",
	//   	"click #topsButton":"gotoTops"
    },
    
    render:function (eventName) {
        var template = templates.palmaresHeaderView;
        this.$el.html(template);
    },
    

});
/**
 * PALMARES MAIN VIEW.
 */
window.PalmaresMainView = BaseView.extend({

    initialize: function(options) {
        this.render();
        this.view = this.$el;
    },  
    
    events:{
    },
    
    render:function (eventName) {
        currentView=this;
    	toggleImageButton($("#palmaresButton img"), "on");
    	this.$el.html(containerView);
    	// header
    	viewHeader = this.$el.find('#viewHeader');
    	this.headerView = new PalmaresHeaderView({el:viewHeader});
    	
    	// content
    	viewContent = this.$el.find('#viewContent');
    	var template = _.template(templates.palmaresMainView);
    
        viewContent.html(template({
        	photosQualite :  appModel.get('photosQualite'),
        	photosInsolite : appModel.get('photosInsolite'),
        	photosTop :      appModel.get('photosTop')
        }));

        var that = this;
        setTimeout( function(){
	        that.qualiteScrollPane = that.$el.find('#photos_qualite').jScrollPane().data('jsp');
	        that.insoliteScrollPane = that.$el.find('#photos_insolite').jScrollPane().data('jsp');
	        that.topScrollPane = that.$el.find('#photos_top').jScrollPane().data('jsp');
        },0);
        
        return this;
    },
    
    addPhotoQualite: function (photo){
    	var elem = currentView.$el.find('#photos_qualite .jspPane');
    	currentView.addPhoto(photo, photo.get('score_qualite'), currentView.qualiteScrollPane, currentView.smallPhoto_template, function(photoId){currentView.headerView.gotoQualites(currentView.el,photoId)});
    },
    
    addPhotoInsolite: function (photo){
    	var elem = currentView.$el.find('#photos_insolite');
    	currentView.addPhoto(photo, photo.get('score_insolite'), currentView.insoliteScrollPane, currentView.smallPhoto_template, function(photoId){currentView.headerView.gotoInsolites(currentView.el,photoId)});
    },
    
    addPhotoTop: function(photo){
    	var elem = currentView.$el.find('#photos_top');
    	currentView.addPhoto(photo, photo.get('score_top'), currentView.topScrollPane, currentView.largePhoto_template,function(photoId){currentView.headerView.gotoTops(currentView.el,photoId)});
    },
    
    addPhoto: function(photo, score, scrollPane, _template, onClickCallback){
    	photo.set('score',score);
    	var template = $(_template({photo:photo}));
    	scrollPane.getContentPane().append(template);
    	scrollPane.reinitialise();
    	template.on("click",function(event){
    		var photo_id = $(event.currentTarget).attr("id");
    		if(onClickCallback)
    			onClickCallback(photo_id);
    	});    	
    },
    
});


window.PalmaresListView = BaseView.extend({

    initialize: function(options) {
    	this.photos = options.photos;
    	this.score_property = options.score_property;
    	if(options.photoId){
    		this.photo = this.photos.findWhere({id:options.photoId});
    	} else {
    		this.photo = this.photos.at(0);
    	}
        // currentView=this;
        this.render();
        this.view = this.$el;
        initImageButtons(this.$el);
    },  
    
    events:{
    	"click .photoButton":"gotoPhoto"
    },    
    render:function (eventName) {
        currentView=this;
    	toggleImageButton($("#palmaresButton img"), "on");
        var template = _.template(templates.palmaresListView);
        this.$el.html(template({photo:this.photo, photos:this.photos,score_property:this.score_property}));
        this.renderBase();
        this.headerView = new PalmaresHeaderView({el:this.$el.find('#viewHeader')});
        this.refreshDetails(this.photo);
        this.$el.find('.scrolltab').jScrollPane()
        return this;
    },
    
    gotoPhoto:function(event){
    	target = event.currentTarget;
    	photoId = target.dataset.photoId;
    	this.photo = this.photos.findWhere({id:photoId});
    	this.refreshDetails(this.photo);
    },
    
    refreshDetails:function(photo){
    	$(".photo-selection").removeClass("selected");
        $('.photo-selection[data-photo-id='+photo.get('id')+']').addClass("selected");
    	$("#bigphoto").attr("src","/imagecache/big/data/images/"+photo.get('filename'));
    	$("#info-auteur").html(photo.get('auteur'));
    	$("#info-site-name").html(photo.get('site_name'));
    	$("#info-position").html();
    	$("#info-score-top").html(photo.get('score_qualite')+photo.get('score_insolite'));
    	$("#info-score-insolite").html(photo.get('score_insolite'));
    	$("#info-score-qualite").html(photo.get('score_qualite'));
    	$("#info-commentaire").html(photo.get('commentaire'));    	
    }
});

