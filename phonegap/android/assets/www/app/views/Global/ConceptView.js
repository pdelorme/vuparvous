templates.conceptView = "app/views/Global/ConceptView.html";

window.ConceptView = BaseView.extend({

    title: "Marseille VuParVous - Concept",

    initialize: function(options) {
        this.view = this.$el;
    },  
        
    render:function (eventName) {
        var template = _.template(templates.conceptView);
        this.$el.html(template);
        this.renderBase();
        
        return this;
    },
    
    postRender:function(){
    	var myScroll = new iScroll("concept");
    },

});