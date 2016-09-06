jQuery( function($){
	var nonce = $('#apm-search').find('[name="nonce"]').val();
	var page = 1;
	var noImageURL = apm_search.apm_image_path + "noImage.gif";

	// Instantiate Collection of Models.
	var searchResultsCollection = new AmazonProductManager.Collections.SearchResults();
	// Populate Search Results with Collection.
	var searchResultListView = new AmazonProductManager.Views.SearchResultList( { 'collection': searchResultsCollection } );

	// Initialize the search dialog box.
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

	// Event handler for opening the search dialog box.
	var openAPMSearch = function(e){
		e.preventDefault();
		$('#apm-search-query').val('Enter ASIN, ISBN, or Search Term');
		$('#apm-search').dialog('open');
	}

	// Admin Meta Box for product info.
	var $productInfoBox = $('#apm-product');
	// Setup event on 'Search for a different product' button.
	$productInfoBox.find('.replace').on('click', openAPMSearch);

	// Event handler for product search.
	var doAPMSearch = function(e){
		var searchQuery;
		var searchCat;
		searchQuery = $(this).parent().find('#apm-search-query').val()
		searchCat 	= $(this).parent().find('#apm-search-cat').val()

		e.preventDefault();
		searchResultsCollection.getProducts( searchQuery, searchCat , 1 );
	}

	// Search dialog box form.
	var $productSearchBox = $('#apm-search-form');
	// Setup event on Search button.
	$productSearchBox.find('.search').on('click', doAPMSearch);

	// // Select Search Result Item.
	// var addToPost = function( e ) {
	// 	jQuery( '#title' ).val( results.Items.Item.ItemAttributes.Title );
	// 	$('#apm-search').dialog('close');
	// }

	// // Setup event on search result items.
	// jQuery('#apm-search-results').on('click', 'li', addToPost);

});

