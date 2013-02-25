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

	var $productInfoBox = $('#apm-product');
	$productInfoBox.find('.replace').on('click', openAPMSearch);

	var showResults = function(results) {
		$results = $('#apm-search-results');
		if(results == null) {
			$results.find('').html('<li>No Products Found.</li>');
		} else {
			addResults(results);
		}
	}

	var addResults = function(results) {
		$results = $('#apm-search-results');

	}

	var getProducts = function(searchQuery, page) {

		fetchingPosts = true;

		if(!page) {
			page = 1;
		}

		var data = {
			nonce: nonce,
			action: apm_get_products,
			page: page
		};

		$.post(ajaxurl, data, function(results){
			if(page == 1){
				showResults(results);
			} else {
				addResults(results);
			}
		}, 'json');

	}

});

