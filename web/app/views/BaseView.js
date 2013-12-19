window.BaseView = Backbone.View.extend({
    
    renderView: function(view){
    	window.viewManager.updateView( view );
    },
    renderBase: function(){
    	console.log("renderBase");
    }
});