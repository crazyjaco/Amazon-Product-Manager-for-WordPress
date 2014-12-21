window.AmazonProductManager = window.APM = {
	Models: {},
	Collections: {},
	Views: {}
}

AmazonProductManager.Models.amazonItem = Backbone.Model.extend({
	defaults: { 
		'ASIN': -1,
		'DetailPageURL': '',
		'SmallImage': { 'URL': apm_search.apm_image_path + "noImage.gif" },
		'MediumImage': { 'URL': apm_search.apm_image_path + "noImage.gif" },
		'LargeImage': { 'URL': apm_search.apm_image_path + "noImage.gif" },
	}
});

AmazonProductManager.Collections.SearchResults = Backbone.Collection.extend({
	model: APM.Models.amazonItem,
	url: ajaxurl,
	
	parse: function( response ) {
		var totalPages   = response.Items.TotalPages;
		var totalResults = response.Items.TotalResults;
		var isValidRequest = response.Items.Request.IsValid;

		// Add Populated Models to Collection
		for (var i = response.Items.Item.length - 1; i >= 0; i--) {
			this.push( response.Items.Item[i] );
		};

		return this.models;
	},

	getProducts: function( searchQuery, searchCat, page ) {

		fetchingPosts = true;

		if(!page) {
			page = 1;
		}

		var params = {
			'nonce': nonce.value,
			'action': 'apm_get_products',
			'category': searchCat,
			'page': page
		};

		if(searchQuery){
			params.s = searchQuery;
			console.log("Search Query: ", searchQuery);
		}

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

AmazonProductManager.Views.SearchResultList = Backbone.View.extend({
	template: jQuery( '#apm-search-result-list-template.template' ).html(),
	el: '#apm-search-list-container',
	initialize: function() {
		this.render();
		this.listenTo( this.collection, 'add', this.renderResult );
	},
	renderResult: function( model, collection, options ) {
		var searchItemView = new AmazonProductManager.Views.SearchResultItem( {'collection': collection, 'model': model } );
	},
	render: function(){
		this.$el.html( this.template );
		return;
	}
});

AmazonProductManager.Views.SearchResultItem = Backbone.View.extend({
	template: _.template( jQuery('#apm-search-result-template').html() ),
	el: '.apm-search-results',
	initialize: function() {
		this.render();
	},
	render: function() {
		this.$el.append( this.template( this.model.toJSON() ) );
		return this;
	}
});