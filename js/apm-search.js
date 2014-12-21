jQuery( function($){
	var nonce = $('#apm-search').find('[name="nonce"]').val();
	var page = 1;
	var noImageURL = apm_search.apm_image_path + "noImage.gif";

	// Instantiate Collection of Models
	var searchResultsCollection = new AmazonProductManager.Collections.SearchResults();
	var searchResultListView = new AmazonProductManager.Views.SearchResultList( { 'collection': searchResultsCollection } );

	$('#apm-search').dialog({
		autoOpen: true,
		height: 400,
		width: 640,
		modal: false,
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
		var searchQuery;
		var searchCat;
		searchQuery = $(this).parent().find('#apm-search-query').val()
		searchCat 	= $(this).parent().find('#apm-search-cat').val()

		e.preventDefault();
		searchResultsCollection.getProducts( searchQuery, searchCat , 1 );
	}

	var $productSearchBox = $('#apm-search-form');
	$productSearchBox.find('.search').on('click', doAPMSearch);

	var addToPost = function( results ) {
		jQuery( '#title' ).val( results.Items.Item.ItemAttributes.Title );
		$('#apm-search').dialog('close');
	}

});

