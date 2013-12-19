templates.registerView = "app/views/Connexion/RegisterView.html";

window.RegisterView = BaseView.extend({

    title: "Register",
    backLabel: "Retour",
    screenId:1,
    
    initialize: function(options) {
        // this.render();
        this.view = this.$el;
    },  
    
    events:{
        "click #doRegisterButton":"doRegister",
   },
    
    render:function (eventName) {
        var template = _.template(templates.registerView);
        var model = {currentUser:appModel.get('currentUser')};
        this.$el.html(template(model));
        this.renderBase();
        return this;
    },

	doRegister:function () {
		var loginString = $("#inputNewLogin").val();
        var passwordString = $("#inputNewPassword").val();
        var firstnameString = $("#inputNewFirstname").val();
        var lastnameString = $("#inputNewLastname").val();
        var emailString = $("#inputNewEmail").val();
        var currentUser = appModel.get('currentUser');
        currentUser.set("login",loginString);
        currentUser.set("first_name",firstnameString);
        currentUser.set("last_name",lastnameString);
        currentUser.set("email",emailString);
        
        var cguChecked= $("#cgu").is(":checked");
        if(!cguChecked){
        	appView.alert("Les CGU doivent etre acceptées");
        	return;
        }
        
        var that = this;
        $("#activityIndicator").addClass("running");
        register(loginString,passwordString, firstnameString, lastnameString, emailString, function(object, err){
        	$("#activityIndicator").removeClass("running");
        	if(err)
            	return appView.alert("Données invalides :"+object)
        	console.log("user registered and logged",appModel.get('currentUser').getName());
            appRouter.navigate('login', {trigger: true}); 
        });
    }
});