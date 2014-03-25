var window.amazonItemModel = Backbone.Model.extend({
	defaults: { 
		asin: -1
	},
	initialize: function(){}


});

var window.amazonSearchResultsCollection = Backbone.Collection.extend({
	model: amazonItemModel

	getProducts : function( searchQuery, searchCat, page ) {

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

	// Appends results from ajax call to search result list
	addResults : function( results ) {
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

			});
		}
		console.dir(amazonItemCollection);
	}


});
