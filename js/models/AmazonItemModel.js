var amazonItemModel = Backbone.Model.extend({
	defaults: { 
		asin: -1
	},
	initialize: function(){}


});

var amazonSearchResultsCollection = Backbone.Collection.extend({
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


});
