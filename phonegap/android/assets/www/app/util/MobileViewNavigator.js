var MobileViewNavigator = function( headerTarget, bodyTarget, footerTarget ){
	
	this.history = [];

	this.header = $( headerTarget );
	this.body   = $( bodyTarget );
	this.footer = $( footerTarget );	
	this.headerView = null; // le header en cours.
} 

MobileViewNavigator.prototype.replaceView = function( viewDescriptor ) {
	
}

MobileViewNavigator.prototype.pushView = function( viewDescriptor ) {
	this.history.push( viewDescriptor );
	this.updateView( viewDescriptor );	
}

MobileViewNavigator.prototype.popView = function() {
	// si l'historique est vide : on ignore.
	if (this.history.length < 1 )
		return;
	
	// récupère la vue courante.
	var currentViewDescriptor = this.history[ this.history.length-1];
	
	// appelle la methode backCallback() de la vue courante. 
	if ( currentViewDescriptor.backCallback ) {
		currentViewDescriptor.backCallback();
	}
		
	// jette la vue courante.
	var currentViewDescriptor2 = this.history.pop();	
	
	// charge la vue précédente
	var viewDescriptor = this.history[ this.history.length-1 ];
	this.updateView( viewDescriptor );

}

//added by patrice to clear history.
MobileViewNavigator.prototype.clearHistory = function() {
	this.history=[];
}

MobileViewNavigator.prototype.updateView = function( viewDescriptor ) {
	// rafraichi le header
	if(viewDescriptor.headerView!=null && viewDescriptor.headerView!=this.headerView){
		this.headerView = headerView;
	}
	if(this.headerView==null){
		this.headerView = new HeaderView();
	}
	
	this.header.empty();
	this.header.append(this.headerView.view);
	
	this.body.empty();
	this.body.append( viewDescriptor.view );
	// show/hide back button.
	if(this.history.length<=1){
		$("#backButton").hide();
	} else {
		$("#backButton").show();
	}
	var myScroll = new iScroll(this.body.attr('id'));
	this.resizeContent();
}

MobileViewNavigator.prototype.resizeContent = function(event) {

}