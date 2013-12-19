templates.decouvrirPhotosView = "app/views/Decouvrir/DecouvrirPhotosView.html";

window.DecouvrirPhotosView = BaseView.extend({

    title: "Marseille VuParVous - Decouvrir - Photos",
    screenId:3,

    initialize: function(options) {
        // this.render();
        this.view = this.$el;
    },  
    
    render:function (eventName) {
        var template = _.template(templates.decouvrirPhotosView);
        var sites = appModel.get('sites');
        sites.comparator = function(site) { 
			return new Photo(site.get('photo')).get('score_top');
		};
		sites.sort();
		var model = {
        		imagePath:host+"imagecache/vignette/data/images/",
        		sites:sites,
        	};
        this.$el.html(template(model));
        this.renderBase();
        return this;
    },
    
    postRender: function(){
    	var myScroll = new iScroll("sites");
    }
});