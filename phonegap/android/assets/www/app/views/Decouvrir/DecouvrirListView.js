templates.decouvrirListView = "app/views/Decouvrir/DecouvrirListView.html";

window.DecouvrirListView = BaseView.extend({

    title: "Marseille VuParVous - Decouvrir - Liste",

    initialize: function(options) {
        // this.render();
        this.view = this.$el;
    },  
        
    render:function (eventName) {
        var template = _.template(templates.decouvrirListView);
        var sites = appModel.get('sites');
        sites.comparator = function(site) { 
			return site.get('site_name')
		};
		sites.sort();
        var model = {
        		sites:sites,
        };
        this.$el.html(template(model));
        this.renderBase();
        
        return this;
    },
    
    postRender:function(){
    	var myScroll = new iScroll("sites");
    },

});