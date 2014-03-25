jQuery( function($){
	var nonce = $('#apm-search').find('[name="nonce"]').val();
	var page = 1;
	var noImageURL = apm_search.apm_image_path + "noImage.gif";

	$('#apm-search').dialog({
		autoOpen: true,
		height: 400,
		width: 640,
		modal: false,
		title: 'Select Product',
		open: function() {
			console.log('opening dialog...');
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
		$results.empty();
		if(results == null) {
			$results.find('').html('<li>No Products Found.</li>');
		} else {
			addResults(results);
		}
	}

	// Apply event handler for clicking on search result
	jQuery( "ul#apm-search-results" ).on( "click", "li", function( event ){
		event.preventDefault();
		console.log( this.dataset.asin );

		fetchingPosts = true;

		var data = {
			nonce: nonce,
			asin: this.dataset.asin,
			action: 'apm_get_item_info',
		};

		$.post(ajaxurl, data, function(results){
			console.dir(results);
			addToPost(results);

		}, 'json');

	} );

	var addToPost = function( results ) {
		jQuery( '#title' ).val( results.Items.Item.ItemAttributes.Title );
		$('#apm-search').dialog('close');
	}

});

