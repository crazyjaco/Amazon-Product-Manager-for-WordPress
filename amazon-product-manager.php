<?php
/*
Plugin Name: Amazon Product Manager
Plugin Author: Bradley Jacobs
*/


/**
 * Create new custom post type
 *
 */
function create_product_post_type() {

	$labels = array(
		'name'			=> 'Products',
		'singular-name'		=> 'Product',
		''
	);
	$supports = array(
		'title',
		'author',
		'thumbnail'
	);
//	$taxonomies = array();

//	$rewrite = array(
//		'slug'			=> 'edition'
//	);
	$args = array(
		'labels' 		=> $labels,
		'public' 		=> true,
		'exclude_from_search'	=> true,
		'publicly_queryable' 	=> false,
		'show_ui' 		=> true,
		'show_in_menu'		=> true,
		'show_in_admin_bar' => true,
		'menu_position'		=> 20,
		'hierarchical'		=> false,
		'supports'		=> $supports,
//		'taxonomies'		=> $taxonomies,
		'rewrite'		=> false,
		'query_var'		=> true,
		'can_export'		=> true,
		'has_archive'		=> false
	);
	register_post_type('apm_products', $args);

}

add_action( 'init','create_product_post_type' );


/**
 * Enqueue scripts on the post editor screens.
 *
 * @param string $hook_suffix
 */
function apm_admin_scripts($hook_suffix) {

    //if(!in_array($hook_suffix, array('post.php', 'post-new.php'))) return;
	if(!in_array($hook_suffix, array('post-new.php'))) return;


    $post_type = isset($_GET['post_type']) ? $_GET['post_type'] : 'none' ;

    if( !($post_type === "apm_products") ) return;

	wp_enqueue_script('apm-search-selector', plugins_url('/js/apm-search.js', __FILE__), array('jquery-ui-dialog'), '1.0', true);
	
	wp_enqueue_style('apm-search-selector', plugins_url('/css/apm-search-selector.css', __FILE__));
	wp_enqueue_style('wp-jquery-ui-dialog');
	add_action('admin_footer', 'apm_search_selector_admin_footer');

}

add_action('admin_enqueue_scripts', 'apm_admin_scripts', 10, 1);


/**
 * Markup for the search dialog
 *
 **/
function apm_search_selector_admin_footer() {
    include('interface/apm-search.php');
}



function apm_add_meta_box($post_type, $post) {
	add_meta_box('apm-product', "Product Information", 'apm_meta_box', 'apm_products', 'normal', 'high');
}

add_action('add_meta_boxes', 'apm_add_meta_box', 10, 2);


/**
 * Create meta-box for product info
 * @param object $post
 * @param array $box (unused)
 */
function apm_meta_box($post, $box) {
	include('interface/meta-box.php');
}




?>