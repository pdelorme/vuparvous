templates.palmaresPhotoView = "app/views/Palmares/PalmaresPhotoView.html";

window.PalmaresPhotoView = BaseView.extend({

    title: "Marseille VuParVous - Photo",

    initialize: function(options) {
    	if(options && options.photoId){
    		var user = appModel.get('currentUser');
    		this.photo = user.get('photos').where({id:options.photoId})[0];
    	}
        //this.render();
        this.view = this.$el;
    },  
    
    events:{
       // "click #homeButton":"gotoHome",
       // "click #backButton":"back"
    },
    
    render:function (eventName) {
        var template = _.template(templates.palmaresPhotoView);
        var model = {
        		site:this.site,
        		photo:this.photo
        	};
        this.$el.html(template(model));
        this.renderBase();
        return this;
    }

});