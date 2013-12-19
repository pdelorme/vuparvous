templates.decouvrirSiteView = "app/views/Decouvrir/DecouvrirSiteView.html";

window.DecouvrirSiteView = BaseView.extend({

	siteId:6,
    title: "Marseille VuParVous - Site View",

    initialize: function(options) {
    	$("#activityIndicator").addClass("running");
        if(options && options.siteId){
        	this.siteId = options.siteId;
        }
        this.view = this.$el;
        this.site = getSiteById(this.siteId);
        if(!this.site){
        	appView.alert("site non défini")
        }
        var that = this;
    	loadSitePhotos(this.site, function(){
    		// refresh view after loading.
    		appView.showView(that);
    	});
    },  
    
    events:{
       //"click #backButton":"back"
    },
    
    render:function (eventName) {
    	$("#activityIndicator").removeClass("running");
        var template = _.template(templates.decouvrirSiteView);
 	    
        // this.site = sites.findWhere({id:this.id});
 	    this.title = this.site.get("name") +"::"+this.site.get("id");
 	    
	    var model = {
	    		imagePath:host+"imagecache/vignette/data/images/",
	    		site:this.site,
	    	};
        this.$el.html(template(model));
        // this.renderBase();
        return this;
    },
    
    postRender: function(){
        that = this;
        $("#button-info img").on("click",function(event){
        	that.showInfo();
        });
        var myScroll = new iScroll("photos");
        var myScroll2 = new iScroll("info");
        
    },
    
    showInfo:function(){
    	var info = $("#infoWrapper");
    	if(info.hasClass("visible")){
    		info.removeClass("visible");
    	}else {
    		info.addClass("visible");
    	}
    }

});