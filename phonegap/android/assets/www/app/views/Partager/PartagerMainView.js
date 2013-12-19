templates.partagerMainView = "app/views/Partager/PartagerMainView.html";

window.PartagerMainView = BaseView.extend({

    title: "Marseille VuParVous - Les Goudes",
    
    initialize: function(options) {
    	if(userPhoto==null){
    		userPhoto = new Photo({
    			commentaire:"",
    			userPhoto:false,
    			localFile:true,
    		});
    	}
    	if(options && options.siteId){
    		userPhoto.set('site_id',options.siteId);
    		userPhoto.set('site',getSiteById(options.siteId));
    	}
        // this.render();
        this.view = this.$el;
    },  
    
    events:{
    	"click #cameraButton":"shootPicture",
    	"click #filmButton":"selectPicture",
	   	// "click #locateButton":"gotoLocate",
        "click #sendButton":"post",
        //"change #commentaire" : "changeComment"
    },
    
    render:function (eventName) {

        var template = _.template(templates.partagerMainView);
        var model = {photo:userPhoto};
        this.$el.html(template(model));
        this.renderBase();
        
        
        return this;
    },
    
    postRender:function(){
        var myScroll = new iScroll("viewContent");
//        this.photoScroll = new iScroll("photo");
//        $("#photo").bind({
//        	'mousedown': function(e){ e.stopPropagation(); },
//        	'mousewheel':function(e){ e.stopPropagation(); },
//        	'DOMMouseScroll':function(e){ e.stopPropagation(); },
//        });
    },
    
    shootPicture: function (){
    	var that = this;
    	navigator.camera.getPicture(onSuccessShootURI, onFailShoot, { 
    		quality: 50,
    		destinationType: Camera.DestinationType.FILE_URI
    		//destinationType: Camera.DestinationType.DATA_URL
    	 }); 

    	function onSuccessShootData(imageData) {
    		console.log("imageData");
    		
    		var image = document.getElementById('partagerPhoto');
    	    image.src = "data:image/jpeg;base64," + imageData;
    	    
    	    userPhoto.set('shared',false);
    	    userPhoto.set('userPhoto',true);
    	    
    	    var site = userPhoto.get("siteId");
    	    if(site==null){
    			appRouter.gotoLocate();	
    		} else {
    			appView.showView(that);
    		}
    	}

    	function onSuccessShootURI(imageURI) {
    		console.log("imageURI:",imageURI);

    		userPhoto.set("path","");
    		userPhoto.set("filename",imageURI);
    		
    		userPhoto.set('shared',false);
    	    userPhoto.set('userPhoto',true);
    	    
    	    var site = userPhoto.get("siteId");
    	    if(site==null){
    			appRouter.gotoLocate();	
    		} else {
    			appView.showView(that);
    		}
    	}
    	
    	function onFailShoot(message) {
    	    console.log('FailedShoot: ' + message);
    		userPhoto.set('shared',false);
    	    userPhoto.set('userPhoto',false);
    		appView.showView(that);
    	}
    },
    
    selectPicture: function (){
    	var that = this;
    	navigator.camera.getPicture(onSuccessSelect, onFailSelect, { 
    		quality: 50,
    	    destinationType: Camera.DestinationType.FILE_URI,
    	    sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM
    	 }); 

    	function onSuccessSelect(imageURI) {
    		console.log('successURI: ', imageURI);
    		
    		userPhoto.set("path","");
    		userPhoto.set("filename",imageURI);
    		
    		userPhoto.set('shared',false);
    	    userPhoto.set('userPhoto',true);
    	    
    	    var site = userPhoto.get("siteId");
    	    if(site==null){
    			appRouter.gotoLocate();	
    		} else {
    			appView.showView(that);
    		}
    	}

    	function onFailSelect(message) {
    		console.log("select failed :" + message);
    		
    		userPhoto.set('shared',false);
    	    userPhoto.set('userPhoto',false);
    		appView.showView(that);
    	}    	
    },
    
    gotoLocate : function(){
        var view = new PartagerMapView({el:$("#contentView")});
        // window.viewNavigator.pushView( view );
    },
    
    changeComment : function (event){
    	console.log($("#commentaire").val());
    },
    
    post : function(){
    	userPhoto.set('commentaire',$("#commentaire").val());
    	if(!appModel.get('currentUser').get('logged')){
    		appView.alert("vous devez vous connecter pour partager une photo");
    		appRouter.gotoLogin();
    		return;
    	}
    	if(!userPhoto.get('site_id')){
    		appView.alert("vous devez selectionner un site");
    		return;
    	}
    	$("#loadingMeter").addClass("running");
    	var photoWidth = $('#partagerPhoto').attr('naturalWidth');
    	var viewWidth = $('#partagerPhoto').attr('width');
//    	var offset = this.photoScroll.y * (photoWidth/viewWidth);
//    	userPhoto.set('offset',offset);
    	uploadPhoto(userPhoto, 
			function(){
	    		// appView.alert("votre photo est maintenant partagée");
	    		$("#shared-icon").addClass("active");
	    		$('#sendButton').removeClass('active');
	    		$("#loadingMeter").removeClass("running");
	    		userPhoto.set("shared",true);
	    	},
	    	function(){
	    		appView.alert("erreur lors du partage");
	    		$("#loadingMeter").removeClass("running");
	    	},
	    	function(loadingPerc){
	    		console.log(loadingPerc);
	    		$("#loadingValue").width(""+loadingPerc+"%");
	    	}
    	);
    },
    
    reset : function(){
    	$("#commentaire").val("");
    	$("#shared-icon").removeClass("active");
		$('#sendButton').removeClass('active');
		$("#partagerPhoto").attr("src","img/partager/emplacement-photo.png");
    }

});