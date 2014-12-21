<div id="apm-search" style="display: none;">
	<div id="inner wrap">
		<form id="apm-search-form">
			<fieldset>
				<?php wp_nonce_field( 'apm_ajax_product_search', 'nonce' ); ?>
				<input type="text" id="apm-search-query" name="apm-search-query" value="Enter ASIN, ISBN, or Search Term"/>
				<select name="apm-search-cat">
					<option value="">All</option>
				</select>
				<button class="submit search">Submit</button>
			</fieldset>
		</form>
		<div id="apm-search-list-container"></div>
	</div>
</div> 

<script type="text/template" id="apm-search-result-list-template" class="template">
	<ul id="apm-search-results" class="apm-search-results"></ul>
</script>

<script type="text/template" id="apm-search-result-template" class="template">
	<li data-asin="<%= ASIN %>">
		<span class="item-thumbnail"><img src="<%= SmallImage.URL %>"/></span>
		<span class="item-title"><%= ItemAttributes.Title %></span>
		<span class="item-info"><%= ItemAttributes.ProductGroup %></span>
	</li>
</script>