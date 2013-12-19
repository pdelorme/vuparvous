templates.headerView = "app/views/Fragments/HeaderView.html";

window.HeaderView = BaseView.extend({

    title: "Non défini",
    screenId: -1,
    
    initialize: function(options) {
        this.render();
        this.view = this.$el;
    },  
    
    events:{
        "click #homeButton":"gotoHome"
    },
    
    render:function (eventName) {
        var template = _.template(templates.headerView);
        var model = {title:this.title, screenId:this.screenId};
        this.$el.html(template(model));
        return this;
    },
    
    gotoHome: function (event) {
        var view = new HomeView({el:$("#contentView")});
    },

});