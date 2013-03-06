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
		//$results = ;
		console.dir(results);
		console.log('results.Items.Request.IsValid :' + results.Items.Request.IsValid );
		//$('#apm-search-results').append();
		// Check for falsey return value
		if( false == results.Items.Request.IsValid ) {
			console.log('Error: ' + results.Items.Request.Errors[0].message);
		} else {
			console.log('Else: ' + results);
			$(results.Items.Item).each( function(index, value) {
				//var thumb = this.ImageSets.ImageSet.ThumbnailImage.URL ? this.ImageSets.ImageSet.ThumbnailImage.URL : '';
				var thumb = this.SmallImage.URL;
				var itemtitle = this.ItemAttributes.Title;
				var productgroup = this.ItemAttributes.ProductGroup;
				var manufacturer = this.ItemAttributes.Manufacturer;
				
				resultItem = '<li><span class="apm-search-result-thumbnail"><img src="' + thumb + '"/></span>';
				resultItem = resultItem + '<span class="apm-search-results-title">' + itemtitle + '</span>';
				resultItem = resultItem + '<span class="apm-search-result-product-group">' + productgroup + '</span></li>';
				$('#apm-search-results').append(resultItem);
			});
		}

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

