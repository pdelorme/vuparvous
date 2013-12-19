
/**
 * Gestion des boutons images.
 * clic -> src = data-on
 * in & !active -> src = data-over
 * out & !active -> src = data-off
 * src = data-off
 */
function initImageButtons (elem){
	if(elem){
		elem.find(".image-button").each(function(){
			initImageButton($(this));
		});
	} else {
		$(".image-button").each(function(){
			initImageButton($(this));
		});
	}
}

function initImageButton(imageButton){
	if(!imageButton.attr('data-toggle-manual')){
		imageButton.click(function(event){
			toggleImageButton($(event.target),'on');
		});
	}
	imageButton.mouseenter(function(event){
		toggleImageButton($(event.target),'in');
	});
	imageButton.mouseleave(function(event){
		toggleImageButton($(event.target),'out');
	});
	toggleImageButton(imageButton,'off');	
}


function toggleImageButton(imageButton, mode){
	var src;
	if(mode=='on'){
		// désactive tous les bottons du groupe.
		var buttonGroup = imageButton.attr('data-group');
		if(!buttonGroup){
			$('.image-button').each(function (){
				toggleImageButton($(this),'off');
			});
		} else if( buttonGroup!='none'){
			$('.image-button[data-group='+buttonGroup+']').each(function (){
				toggleImageButton($(this),'off');
			});
		}
		src = imageButton.attr('data-on');
		// imageButton.removeClass('active');
		imageButton.addClass('active');
	} 
	if(mode=='off'){
		src = imageButton.attr('data-off');
		imageButton.removeClass('active');
	}
	if(mode=='in'){
		if(imageButton.hasClass('active'))
			return;
		src = imageButton.attr('data-over');
	}
	if(mode=='out'){
		if(imageButton.hasClass('active'))
			return;
		src = imageButton.attr('data-off');
	}
	if(src){
		imageButton.attr('src',src);
	}
}

initImageButtons();
