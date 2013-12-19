templates.homeView = "app/views/HomeView.html";

window.HomeView = BaseView.extend({

    title: "Marseille VuParVous",
    screenId:2,
    
    initialize: function(options) {
        this.view = this.$el;
    },
    
    
    render:function (eventName) {
        var template = _.template(templates.homeView);
        var model = {currentUser:appModel.get('currentUser')};
        this.$el.html(template(model));
        this.renderBase();
        
        return this;
    },
    
});