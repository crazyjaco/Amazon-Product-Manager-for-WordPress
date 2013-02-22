jQuery( function($){

	$('#apm-search').dialog({
		autoOpen: true,
		height: 400,
		width: 640,
		modal: true,
		title: 'Select Product',
		open: function() {
			$(this).scrollTop(0);
			$('#apm_search_query').focus();
			//getPosts();
		},
		buttons: {
			Cancel: function() {
				$(this).dialog("close");
			}
		},
		close: function() {
			//$activeSelector = null;
		}
	});

	var openAPMSearch = function(e){
		e.preventDefault();
		$('#apm-search-query').val('Enter ASIN, ISBN, or Search Term');
		$('#apm-search').dialog('open');
	}

	var $postSelectors = $('#apm-search');
	$postSelectors.find('.replace').on('click', openAPMSearch);


});

