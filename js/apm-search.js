jQuery( function($){
	var nonce = $('#apm-search').find('[name="nonce"]').val();
	var page = 1;

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

	var doAPMSearch = function(e){
		e.preventDefault();
				console.log('got here.');
		getProducts( $(this).parent().find('#apm-search-query').val(), $(this).parent().find('#apm-search-cat').val() , 1 );
	}

	var $productSearchBox = $('#apm-search-form');
	$productSearchBox.find('.search').on('click', doAPMSearch);

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

	var getProducts = function(searchQuery, searchCat, page) {

		fetchingPosts = true;

		if(!page) {
			page = 1;
		}

		var data = {
			nonce: nonce,
			action: 'apm_get_products',
			category: searchCat,
			page: page
		};

		if(searchQuery){
			data.s = searchQuery;
			console.log(searchQuery);
		}

		$.post(ajaxurl, data, function(results){
			console.dir(results);
			if(page == 1){
				showResults(results);
			} else {
				addResults(results);
			}
		}, 'json');

	}

});

