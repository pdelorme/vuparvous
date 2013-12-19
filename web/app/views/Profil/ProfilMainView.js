templates.profileView = "app/views/Profil/ProfilView.html";
templates.loginView = "app/views/Profil/LoginView.html";
templates.registerView = "app/views/Profil/InscriptionView.html";

window.LoginView = BaseView.extend({
    events:{
    	"click #loginButton":"login",
    	"click #logoutButton":"logout",
        "click #registrationButton":"registrationForm",
        "click #registerButton":"register",
        "click #cancelButton":"close"
    },
	
    initialize : function(callback){
    	this.callback = callback;
		_.bindAll(this,"render")
		this.loginTemplate        = _.template(templates.loginView);
		this.registrationTemplate = _.template(templates.registerView);
		this.logoutTemplate       = _.template(templates.profileView);
		this.render().el;
	},
	
	render: function() {
		this.$el = $("<div>popup</div>").dialog({
			autoOpen: true,
			resize: 'auto',
			//height: 260,
			width: 600,
			title:"Login",
			modal: true
		});
		if(appModel.get('currentUser') && appModel.get('currentUser').get("logged")){
			this.logoutForm();
		} else {
			this.loginForm();
		}
		return this;
	},

	loginForm : function(){
		formString = this.loginTemplate(appModel.get('currentUser').toJSON());
		this.$el.html(formString);
		this.$el.dialog('option', 'title', 'Se Connecter');
		this.delegateEvents(this.events)
		return this;
	},
	registrationForm: function(){
		//this.close();
		formString = this.registrationTemplate(appModel.get('currentUser').toJSON());
		this.$el.html(formString);
		this.$el.dialog('option', 'title', 'S\'inscrire');
		this.delegateEvents(this.events)
		return this;
	},
	logoutForm: function(){
		//this.close();
		formString = this.logoutTemplate(appModel.get('currentUser').toJSON());
		this.$el.html(formString);
		this.$el.dialog('option', 'title', 'Se déconnecter');
		this.delegateEvents(this.events)
		return this;
	},
	login: function(){
        var loginString = $("#inputLogin").val();
        var passwordString = $("#inputPassword").val();
        var that = this;
        login(loginString,passwordString, function(object, err){
            if(err)
            	return alert("Login invalide")
        	// console.log("user logged",appModel.get('currentUser').getName());
            that.close();
            if(that.callback)
            	return  that.callback();
            currentView.render();
        });
        // should display waiting watch.
	},
	register: function(){
        var loginString = $("#inputNewLogin").val();
        var passwordString = $("#inputNewPassword").val();
        var firstnameString = $("#inputNewFirstname").val();
        var lastnameString = $("#inputNewLastname").val();
        var emailString = $("#inputNewEmail").val();
        var that = this;
        register(loginString,passwordString, firstnameString, lastnameString, emailString, function(object, err){
            if(err)
            	return alert("Données invalides")
        	console.log("user registered and logged",appModel.get('currentUser').getName());
            that.close();
            if(that.callback)
            	that.callback();
        });
        // should display waiting watch.
	},
	logout: function(){
		logout();
		this.close();
		currentView.render();
		//var view = new HomeView();
        //this.renderView(view);
	},
	close: function(){
		this.$el.dialog( "close" );
		this.$el.html("");
	},
});