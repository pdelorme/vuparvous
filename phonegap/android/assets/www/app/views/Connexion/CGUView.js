templates.cguView = "app/views/Connexion/CGUView.html";

window.CGUView = BaseView.extend({

    title: "Marseille VuParVous - CGU",

    initialize: function(options) {
        this.view = this.$el;
    },  
        
    render:function (eventName) {
        var template = _.template(templates.cguView);
        var model = {currentUser:appModel.get('currentUser')};
        this.$el.html(template(model));
        this.renderBase();
        
        return this;
    },
    
    postRender:function(){
    	var myScroll = new iScroll("cgu");
    },

});