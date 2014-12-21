<?php
/*
Plugin Name: Amazon Product Manager
Plugin Author: Bradley Jacobs
*/

class Amazon_Product_Manager {

	// Create Singleton instance of plugin
	private static $instance = false;

	public static function instance(){
		if ( ! self::$instance ){
			self::$instance = new Amazon_Product_Manager;
		}
		return self::$instance;
	}

	function __construct(){
		add_action( 'init',                      array( $this, 'action_create_product_post_type' ) );
		add_action( 'admin_enqueue_scripts',     array( $this, 'apm_admin_scripts' ), 10, 1 );
		add_action( 'add_meta_boxes',            array( $this, 'apm_add_meta_box' ) , 10, 2 );
		add_action( 'wp_ajax_apm_get_products',  array( $this, 'apm_ajax_get_products' ) );
		add_action( 'wp_ajax_apm_get_item_info', array( $this, 'apm_ajax_get_item_info' ) );
		add_action( 'admin_menu',                array( $this, 'apm_add_options_page' ) );
		add_action( 'admin_init',                array( $this, 'apm_register_plugin_options' ) );
	}

	/**
	 * Create new custom post type
	 *
	 */
	function action_create_product_post_type() {

		$labels = array(
			'name'				=> 'Amazon Products',
			'singular-name'		=> 'Amazon Product',
		);
		$supports = array(
			'title',
			'author',
			'thumbnail',
		);
		//	$taxonomies = array();

		//	$rewrite = array(
		//		'slug'			=> 'edition'
		//	);
		$args = array(
			'labels' 				=> $labels,
			'public' 				=> true,
			'exclude_from_search'	=> true,
			'publicly_queryable' 	=> false,
			'show_ui' 				=> true,
			'show_in_menu'			=> true,
			'show_in_admin_bar' 	=> true,
			'menu_position'			=> 20,
			'hierarchical'			=> false,
			'supports'				=> $supports,
			'rewrite'				=> false,
			'query_var'				=> true,
			'can_export'			=> true,
			'has_archive'			=> false,
		);
		register_post_type( 'apm_products', $args );

	}


	/**
	 * Enqueue scripts on the post editor screens.
	 *
	 * @param string $hook_suffix
	 */
	function apm_admin_scripts( $hook_suffix ) {

		//if(!in_array($hook_suffix, array('post.php', 'post-new.php'))) return;
		if ( ! in_array( $hook_suffix, array( 'post-new.php' ) ) ) return;


		$post_type = isset($_GET['post_type']) ? $_GET['post_type'] : 'none' ;

		if ( ! ( $post_type === 'apm_products' ) ) return;


		wp_enqueue_script( 'apm-search-selector', plugins_url( '/js/apm-search.js', __FILE__ ), array( 'jquery-ui-dialog', 'jquery' ),       '1.0', true );
		wp_enqueue_script( 'apm-model-item',      plugins_url( '/js/apm-app.js', __FILE__ ),    array( 'backbone', 'underscore', 'jquery' ), '1.0', true );
		wp_enqueue_style( 'apm-search-selector',  plugins_url( '/css/apm-search-selector.css',  __FILE__ ) );
		wp_enqueue_style( 'wp-jquery-ui-dialog' );
		wp_enqueue_style( 'apm-jquery-custom-ui', plugins_url( '/css/smoothness/jquery-ui-1.8.14.custom.css' , __FILE__ ) );
		wp_localize_script( 'apm-search-selector', 'apm_search', array( 'apm_image_path' => plugins_url( '/img/', __FILE__ ) ) );
		add_action( 'admin_footer', array( $this, 'apm_search_selector_admin_footer' ) );

	}


	/**
	 * Markup for the search dialog
	 *
	 **/
	function apm_search_selector_admin_footer() {
		include('interface/apm-search.php');
		include('tpl/SearchResultItem.html');
	}



	function apm_add_meta_box( $post_type, $post ) {
		add_meta_box( 'apm-product', 'Product Information', array( $this, 'apm_meta_box' ), 'apm_products', 'normal', 'high' );
	}

	


	/**
	 * Create meta-box for product info
	 * @param object $post
	 * @param array $box (unused)
	 */
	function apm_meta_box( $post, $box ) {
		include('interface/meta-box.php');
	}

	/**
	 * Ajax call to Amazon API
	 *
	 */
	function apm_ajax_get_products() {
		if ( WP_DEBUG ) {
			error_log( 'ajax call made!' );
		}
		//global $post;
		$options = get_option( 'apm_options' );

		define( 'AWS_API_KEY' , $options['apm_aws_api_key'] );
		define( 'AWS_API_SECRET_KEY', $options['apm_aws_api_secret_key'] );
		define( 'AWS_LANGUAGE', $options['apm_aws_language'] );
		define( 'AWS_ASSOCIATE_TAG', $options['apm_aws_associate_tag'] );

		require_once 'lib/AmazonECS.class.php';

		$search_query = isset( $_GET['s'] ) ? trim( strip_tags( $_GET['s'] ) ) : '';
		$search_cat   = isset( $_GET['category'] ) ? $_GET['category'] : 'All';
		$search_page  = isset( $_GET['page'] ) ? $_GET['page'] : 1;

		if ( WP_DEBUG ) {
			error_log( 'query:' . $search_query );
			error_log( 'cat: ' . $search_cat );
			error_log( 'page: ' . $search_page );
		}

		$amazonEcs = new AmazonECS( AWS_API_KEY, AWS_API_SECRET_KEY, AWS_LANGUAGE, AWS_ASSOCIATE_TAG );

		$amazonEcs->returnType( AmazonECS::RETURN_TYPE_ARRAY );
		try {
			$response = $amazonEcs->category( $search_cat )->responseGroup( 'Small,Images' )->page( $search_page )->search( $search_query );
			error_log( print_r( $response , true ) );
			header( 'Content-type: application/json' );
			echo json_encode( $response );
		} catch (Exception $err) {
			error_log( $err->getMessage() );
		}
		die();

	}

	// TODO: Combine ajax calls. Too much duplication of work
	function apm_ajax_get_item_info() {
		//global $post;
		$options = get_option( 'apm_options' );

		define( 'AWS_API_KEY' , $options['apm_aws_api_key'] );
		define( 'AWS_API_SECRET_KEY', $options['apm_aws_api_secret_key'] );
		define( 'AWS_LANGUAGE', $options['apm_aws_language'] );
		define( 'AWS_ASSOCIATE_TAG', $options['apm_aws_associate_tag'] );

		require_once 'lib/AmazonECS.class.php';

		$search_asin = isset( $_POST['asin'] ) ? trim( strip_tags( $_POST['asin'] ) ) : '';

		$amazonEcs = new AmazonECS( AWS_API_KEY, AWS_API_SECRET_KEY, AWS_LANGUAGE, AWS_ASSOCIATE_TAG );

		$amazonEcs->returnType( AmazonECS::RETURN_TYPE_ARRAY );
		try {
			$response = $amazonEcs->responseGroup( 'Large,Images' )->lookup( $search_asin );
			header( 'Content-type: application/json' );
			echo json_encode( $response );
		} catch (Exception $err) {
			error_log( $err->getMessage() );
		}
		die();

	}


	/*****
	 *
	 * Add to Settings menu in Admin panel to get to plugin's options
	 *
	 *****/
	function apm_add_options_page(){
		// @params ('new page title', 'admin menu text', 'capabilities', 'unique plugin id for querystring', 'callback to content of page')
		add_options_page( 'Amazon Product Manager Options', 'Amazon Product Manager', 'manage_options', 'amazon-product-manager', array( $this, 'apm_create_options_page' ) );
	}



	/*
	 * Register the settings group, section and fields
	 */
	function apm_register_plugin_options(){
		// @params ('group name - must match settings_fields()', 'name to save option under - array name', 'callback for validation')
		register_setting( 'apm_options', 'apm_options' , array( $this, 'apm_validate_options' ) );
		// @params ('unique id for section', 'title of section for output', 'callback to create section contents', 'page name - must match do_settings_sections function call')
		add_settings_section( 'apm_aws_section', 'Amazon Web Services Account Information', array( $this, 'apm_create_aws_section' ), 'amazon_product_manager' );
		// @params ('unique id for field', 'field title', 'callback to display input element', 'page name - must match do_settings_sections', 'settings section id to place field in')
		add_settings_field( 'apm_aws_api_key', 'AWS API Key', array( $this, 'create_field_apm_aws_api_key' ), 'amazon_product_manager', 'apm_aws_section' );
		add_settings_field( 'apm_aws_api_secret_key', 'AWS API Secret Key', array( $this, 'create_field_apm_aws_api_secret_key' ), 'amazon_product_manager', 'apm_aws_section' );
		add_settings_field( 'apm_aws_language', 'AWS Language', array( $this, 'create_field_apm_aws_language' ), 'amazon_product_manager', 'apm_aws_section' );
		add_settings_field( 'apm_aws_associate_tag', 'AWS Associate Tag', array( $this, 'create_field_apm_aws_associate_tag' ), 'amazon_product_manager', 'apm_aws_section' );
	}


	/*
	 * Add field inputs
	 */
	function create_field_apm_aws_api_key() {
		$options = get_option( 'apm_options' );
		echo "<input id='apm_aws_api_key' name='apm_options[apm_aws_api_key]' size='40' type='text' value='" . esc_attr( $options['apm_aws_api_key'] ) . "' />";
	}

	function create_field_apm_aws_api_secret_key() {
		$options = get_option( 'apm_options' );
		echo "<input id='apm_aws_api_secret_key' name='apm_options[apm_aws_api_secret_key]' size='40' type='text' value='" . esc_attr( $options['apm_aws_api_secret_key'] ) . "' />";
	}

	function create_field_apm_aws_language() {
		$options  = get_option( 'apm_options' );
		error_log( print_r( $options, true ) );
		$selected = isset($options['apm_aws_language']) ? $options['apm_aws_language'] : '';
		echo "<select id='apm_aws_language' name='apm_options[apm_aws_language]'>";
		?>
			<option value="de" <?php echo ('de' == $options['apm_aws_language']) ? 'selected="SELECTED"' : '' ?> >DE</option>
			<option value="com" <?php echo ('com' == $options['apm_aws_language']) ? 'selected="SELECTED"' : '' ?> >USA</option>
			<option value="co.uk" <?php echo ('co.uk' == $options['apm_aws_language']) ? 'selected="SELECTED"' : '' ?> >ENG</option>
			<option value="ca" <?php echo ('ca' == $options['apm_aws_language']) ? 'selected="SELECTED"' : '' ?> >CA</option>
			<option value="fr" <?php echo ('fr' == $options['apm_aws_language']) ? 'selected="SELECTED"' : '' ?> >FR</option>
			<option value="co.jp" <?php echo ('co.jp' == $options['apm_aws_language']) ? 'selected="SELECTED"' : '' ?> >JP</option>
			<option value="it" <?php echo ('it' == $options['apm_aws_language']) ? 'selected="SELECTED"' : '' ?> >IT</option>
			<option value="cn" <?php echo ('cn' == $options['apm_aws_language']) ? 'selected="SELECTED"' : '' ?> >CN</option>
			<option value="es" <?php echo ('es' == $options['apm_aws_language']) ? 'selected="SELECTED"' : '' ?> >ES</option>
	    </select>
	    <?php
	}

	function create_field_apm_aws_associate_tag(){
		$options = get_option( 'apm_options' );
		echo "<input id='apm_aws_associate_tag' name='apm_options[apm_aws_associate_tag]' size='40' type='text' value='" . esc_attr( $options['apm_aws_associate_tag'] ) . "' />";
	}

	/*
	 * Create Settings sections
	 */
	function apm_create_aws_section(){
		echo '<p>Amazon Web Service Account Information</p>';
	}

	/*
	 * Validate the inputs
	 */
	function apm_validate_options( $input ) {
		//$options = get_option('apm-options');
		return $input;

	}

	/*
	 * Add Settings page, itself
	 */
	function apm_create_options_page() {

		?>
		<div>
			<h2>Amazon Product Manager Options</h2>
			<form method="post" action="options.php">

				<?php settings_fields( 'apm_options' ); ?>
				<?php do_settings_sections( 'amazon_product_manager' ); ?>

				<input type="Submit" type="submit" value=<?php esc_attr_e( 'Save Changes' ); ?>" />

			</form>
		</div>

		<?php

	}

} // End Class

Amazon_Product_Manager::instance();