window.HeaderView = BaseView.extend({
    
    initialize: function(options) {
        this.render();
        appModel.get('currentUser').on("change:logged", this.renderUser);
    },  
    
    events:{
        "click #profileButton":"gotoProfile"
    },
    
    render:function (eventName) {
    	getUser();
    	this.renderUser();
    	return this;
    },

    renderUser: function(eventName){
    	// alert("renderUser:"+eventName);
    	if(appModel.get('currentUser') && appModel.get('currentUser').get("logged")){
    		$("#userInfo").html(appModel.get('currentUser').getName());
    		toggleImageButton($("#profileButton img"), "on");
    	} else {
       		$("#userInfo").html("");
    		toggleImageButton($("#profileButton img"), "off");
    	}
    },
    
	gotoProfile:function (event) {
		var loginView = new LoginView();
    },
    
    resetButtons:function(){
    	that=this;
		toggleImageButton(this.$el,'off');
    }
});