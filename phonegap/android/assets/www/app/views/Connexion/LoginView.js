templates.loginView = "app/views/Connexion/LoginView.html";

window.LoginView = BaseView.extend({

    title: "Login",
    screenId:1,
    
    initialize: function(options) {
        // this.render();
        this.view = this.$el;
    },  
    
    events:{
        "click #logoutButton":"userLogout",
        "click #doLoginButton":"userLogin"
   },
    
    render:function (eventName) {
        var template = _.template(templates.loginView);
        var model = {currentUser:appModel.get('currentUser')};
        this.$el.html(template(model));
        this.renderBase();
        return this;
    },

    userLogin:function () {
        var loginString = $("#inputLogin").val();
        var passwordString = $("#inputPassword").val();
        var cguChecked= $("#cgu").is(":checked");
        if(!loginString || loginString.lenght==0){
        	appView.alert("Veuillez saisir votre identifiant");
        	return;
        }
        if(!passwordString || passwordString.lenght==0){
        	appView.alert("Veuillez saisir votre mot de passe");
        	return;
        }
        if(!cguChecked){
        	appView.alert("Les CGU doivent etre acceptées");
        	return;
        }
        var that = this;
        $("#activityIndicator").addClass("running");
        login(loginString,passwordString, function(object, err){
        	$("#activityIndicator").removeClass("running");
        	if(err)
        		appView.alert(object);
        	appView.showView(that);
        });
        
        
    },
    
    userLogout:function () {
    	appModel.get('currentUser').logout();
    	appView.showView(this);
    },
});