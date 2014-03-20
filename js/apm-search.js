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

	// Appends results from ajax call to search result list
	var addResults = function( results ) {
		//$results = ;
		console.dir(results);
		console.log('results.Items.Request.IsValid :' + results.Items.Request.IsValid );
		//$('#apm-search-results').append();
		// Check for falsey return value
		if( false == results.Items.Request.IsValid ) {
			console.log('Error: ', results.Items.Request.Errors[0].message);
		} else {
			console.log('Else: ', results);
			var amazonItemCollection = new amazonSearchResultsCollection();
			$(results.Items.Item).each( function(index, value) {

				var amazonItem = new amazonItemModel({
					id: 			this.hasOwnProperty('ASIN') ? this.ASIN : '', // This value should always exist.
					asin: 			this.hasOwnProperty('ASIN') ? this.ASIN : '', // This value should always exist.
					title: 			this.ItemAttributes.hasOwnProperty('Title') ? this.ItemAttributes.Title : '',
					productgroup: 	this.ItemAttributes.hasOwnProperty('ProductGroup') ? this.ItemAttributes.ProductGroup : '',
					manufacturer: 	this.ItemAttributes.hasOwnProperty('Manufacturer') ? this.ItemAttributes.Manufacturer : '',
				});

				amazonItemCollection.add( amazonItem );

				//var thumb = this.ImageSets.ImageSet.ThumbnailImage.URL ? this.ImageSets.ImageSet.ThumbnailImage.URL : '';
/*
				var ASIN			= this.hasOwnProperty('ASIN') ? this.ASIN : ''; // This value should always exist.
				var thumb 			= this.hasOwnProperty('SmallImage') ? this.SmallImage.URL : noImageURL;
				var itemtitle 		= this.ItemAttributes.hasOwnProperty('Title') ? this.ItemAttributes.Title : '';
				var productgroup 	= this.ItemAttributes.hasOwnProperty('ProductGroup') ? this.ItemAttributes.ProductGroup : '';
				var manufacturer 	= this.ItemAttributes.hasOwnProperty('Manufacturer') ? this.ItemAttributes.Manufacturer : '';
				
				resultItem = '<li data-asin="' + ASIN + '"><span class="item-thumbnail"><img src="' + thumb + '"/></span>';
				resultItem = resultItem + '<span class="item-title">' + itemtitle + '</span>';
				resultItem = resultItem + '<span class="item-info">' + productgroup + '</span></li>';
				$('#apm-search-results').append(resultItem);
*/
			});
		}

	}

	var addToPost = function( results ) {
		jQuery( '#title' ).val( results.Items.Item.ItemAttributes.Title );
		$('#apm-search').dialog('close');
	}

	var getProducts = function( searchQuery, searchCat, page ) {

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

