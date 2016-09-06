window.AmazonProductManager = window.APM = {
	Models: {},
	Collections: {},
	Views: {}
}

// Setup Model.
AmazonProductManager.Models.amazonItem = Backbone.Model.extend({
	defaults: { 
		'ASIN': -1,
		'DetailPageURL': '',
		'SmallImage': { 'URL': apm_search.apm_image_path + "noImage.gif" },
		'MediumImage': { 'URL': apm_search.apm_image_path + "noImage.gif" },
		'LargeImage': { 'URL': apm_search.apm_image_path + "noImage.gif" },
	}
});

// Setup Collection.
AmazonProductManager.Collections.SearchResults = Backbone.Collection.extend({
	model: APM.Models.amazonItem,
	url: ajaxurl,
	// Intercept ajax response and handle data.
	parse: function( response ) {
		var totalPages   = response.Items.TotalPages;
		var totalResults = response.Items.TotalResults;
		var isValidRequest = response.Items.Request.IsValid;

		// Add Populated Models to Collection
		for (var i = 0; i < response.Items.Item.length - 1; i++) {
			this.push( response.Items.Item[i] );
		};

		return this.models;
	},

	getProducts: function( searchQuery, searchCat, page ) {
		// Current Status.
		fetchingPosts = true;

		// Are we paging results? If not, set to 1.
		if(!page) {
			page = 1;
		}

		// Ajax call parameters.
		var params = {
			'nonce': nonce.value,
			'action': 'apm_get_products',
			'category': searchCat,
			'page': page
		};

		// Add search string to Ajax call parameters.
		if(searchQuery){
			params.s = searchQuery;
			console.log("Search Query: ", searchQuery);
		}

		// Fire the ajax call.
		this.fetch( 
			{
				data: {
					action: 'apm_get_products',
					nonce: params.nonce,
					s: params.s,
					category: params.category,
					page: params.page
				},
				url: ajaxurl,
				success: function( collection, response, options ) {
					console.log('success!');
				},
				error: function( collection, response, options ) {
					console.log('error!');
				}
		 	}
		);

	}

});

// Setup List View.
AmazonProductManager.Views.SearchResultList = Backbone.View.extend({
	template: jQuery( '#apm-search-result-list-template.template' ).html(),
	el: '#apm-search-list-container',
	initialize: function() {
		this.render();
		this.listenTo( this.collection, 'add', this.renderResult );
	},
	renderResult: function( model, collection, options ) {
		//console.log('Im being added! ', model);
		var searchItemView = new AmazonProductManager.Views.SearchResultItem( {'collection': collection, 'model': model } );
		this.$('#apm-search-results').append( searchItemView.$el );
		///console.log( searchItemView.$el );
		//console.log( 'apm-search-results: ', this.$('#apm-search-results') )
	},
	render: function(){
		this.$el.html( this.template );
		return;
	}
});

// Setup Item View.
AmazonProductManager.Views.SearchResultItem = Backbone.View.extend({
	template: _.template( jQuery('#apm-search-result-template').html() ),
	tagName: 'li',
	className: 'apm-search-result',
	initialize: function() {
		this.render();
	},
	render: function() {
		// Append the template to this View's element (li.apm-search-result) and return.
		return this.$el.append( this.template( this.model.toJSON() ) );
	},
	events: {
		// TODO: MAKE THIS WORK.
		'click .apm-search-result': 'addToPost'
	},
	addToPost: function(e) {
		console.log( 'I have been clicked!', this.model.toJSON() );
	}
});