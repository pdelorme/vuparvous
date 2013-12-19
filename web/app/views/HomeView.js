// templates.homeView = "app/views/HomeView.html";
var homeView = $("#pageContainer").html();

window.HomeView = BaseView.extend({
    
    initialize: function(options) {
        this.render();
        this.view = this.$el;
    },  
    
    events:{
    },
    
    render:function (eventName) {
        var template = _.template(homeView);
        // var model = {};
        // template(model);
        this.$el.html(template);        
        return this;
    }
    
});