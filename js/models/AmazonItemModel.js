var amazonItemModel = Backbone.Model.extend({
	defaults: { 
		asin: -1
	},
	initialize: function(){}
});

var amazonSearchResultsCollection = Backbone.Collection.extend({
	model: amazonItemModel
});