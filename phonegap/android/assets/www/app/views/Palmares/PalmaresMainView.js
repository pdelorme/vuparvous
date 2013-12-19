templates.palmaresMainView = "app/views/Palmares/PalmaresMainView.html";

var userPhoto=null;

window.PalmaresMainView = BaseView.extend({

    title: "Marseille VuParVous - Palmares",

    initialize: function(options) {
        // this.render();
        this.view = this.$el;
    },  
    
    events:{
    },
    
    render:function (eventName) {

        var template = _.template(templates.palmaresMainView);
        var model = {
        		user:appModel.get('currentUser'),
        		photos:appModel.get('currentUser').get('photos'),
        		sites:appModel.get('currentUser').get('sites')
        	};
        this.$el.html(template(model));
        this.renderBase();
        return this;
    },
    
    postRender:function(){
    	var myScroll = new iScroll("photos");
    },
});