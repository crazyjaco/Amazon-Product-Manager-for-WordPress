jQuery( function($){

	$('#apm-search').dialog({
		autoOpen: true,
		height: 400,
		width: 640,
		modal: true,
		title: 'Select Product',
		open: function() {
			//$(this).scrollTop(0);
			//$('#bu_post_search_query').focus();
			//getPosts();
		},
		buttons: {
			Cancel: function() {
				$(this).dialog("close");
			}
		},
		close: function() {
			$activeSelector = null;
		}
	});

});

