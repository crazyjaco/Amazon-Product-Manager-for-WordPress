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
		add_action( 'init', 'action_create_product_post_type' );
		add_action( 'admin_enqueue_scripts', array( $this, 'apm_admin_scripts' ), 10, 1 );
		add_action( 'add_meta_boxes', array( $this, 'apm_add_meta_box' ) , 10, 2 );
		add_action( 'wp_ajax_apm_get_products', array( $this, 'apm_ajax_get_products' ) );
		add_action( 'admin_menu', array( $this, 'apm_add_options_page' ) );
		add_action( 'admin_init', array( $this, 'apm_register_plugin_options' ) );
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

		wp_enqueue_script( 'apm-search-selector', plugins_url( '/js/apm-search.js', __FILE__ ), array( 'jquery-ui-dialog' ), '1.0', true );
		
		wp_enqueue_style( 'apm-search-selector', plugins_url( '/css/apm-search-selector.css', __FILE__ ) );
		wp_enqueue_style( 'wp-jquery-ui-dialog' );
		wp_enqueue_style( 'apm-jquery-custom-ui', plugins_url( '/css/smoothness/jquery-ui-1.8.14.custom.css' , __FILE__ ) );
		add_action( 'admin_footer', array( $this, 'apm_search_selector_admin_footer' ) );

	}


	/**
	 * Markup for the search dialog
	 *
	 **/
	function apm_search_selector_admin_footer() {
		include('interface/apm-search.php');
	}



	function apm_add_meta_box( $post_type, $post ) {
		add_meta_box( 'apm-product', 'Product Information', 'apm_meta_box', 'apm_products', 'normal', 'high' );
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
		//global $post;
		$options = get_option( 'apm_options' );

		define( 'AWS_API_KEY' , $options['apm_aws_api_key'] );
		define( 'AWS_API_SECRET_KEY', $options['apm_aws_api_secret_key'] );
		define( 'AWS_LANGUAGE', $options['apm_aws_language'] );
		define( 'AWS_ASSOCIATE_TAG', $options['apm_aws_associate_tag'] );

		require_once 'lib/AmazonECS.class.php';

		$search_query = isset( $_POST['s'] ) ? trim( strip_tags( $_POST['s'] ) ) : '';
		$search_cat   = isset( $_POST['category'] ) ? $_POST['category'] : 'All';
		$search_page  = isset( $_POST['page'] ) ? $_POST['page'] : 1;

		//update_option('apm_test_container', AWS_API_KEY);

		$amazonEcs = new AmazonECS( AWS_API_KEY, AWS_API_SECRET_KEY, AWS_LANGUAGE, AWS_ASSOCIATE_TAG );

		$amazonEcs->returnType( AmazonECS::RETURN_TYPE_ARRAY );
		try {
			$response = $amazonEcs->category( $search_cat )->responseGroup( 'Small,Images' )->page( $search_page )->search( $search_query );

			//update_option('apm_test_container', $response);

			header( 'Content-type: application/json' );
			//echo json_encode($response['Items']);
			echo json_encode( $response );
			//update_option('apm_test_container', json_encode($response['Items']));
		} catch (Exception $err) {
			update_option( 'apm_test_container', $err->getMessage() );
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
		add_options_page( 'Amazon Product Manager Options', 'Amazon Product Manager', 'manage_options', 'amazon-product-manager', 'apm_create_options_page' );
	}



	/*
	 * Register the settings group, section and fields
	 */
	function apm_register_plugin_options(){
		// @params ('group name - must match settings_fields()', 'name to save option under - array name', 'callback for validation')
		register_setting( 'apm_options', 'apm_options' , 'apm_validate_options' );
		// @params ('unique id for section', 'title of section for output', 'callback to create section contents', 'page name - must match do_settings_sections function call')
		add_settings_section( 'apm_aws_section', 'Amazon Web Services Account Information', 'apm_create_aws_section', 'amazon_product_manager' );
		// @params ('unique id for field', 'field title', 'callback to display input element', 'page name - must match do_settings_sections', 'settings section id to place field in')
		add_settings_field( 'apm_aws_api_key', 'AWS API Key', 'create_field_apm_aws_api_key', 'amazon_product_manager', 'apm_aws_section' );
		add_settings_field( 'apm_aws_api_secret_key', 'AWS API Secret Key', 'create_field_apm_aws_api_secret_key', 'amazon_product_manager', 'apm_aws_section' );
		add_settings_field( 'apm_aws_language', 'AWS Language', 'create_field_apm_aws_language', 'amazon_product_manager', 'apm_aws_section' );
		add_settings_field( 'apm_aws_associate_tag', 'AWS Associate Tag', 'create_field_apm_aws_associate_tag', 'amazon_product_manager', 'apm_aws_section' );
	}


	/*
	 * Add field inputs
	 */
	function create_field_apm_aws_api_key() {
		$options = get_option( 'apm_options' );
		echo "<input id='apm_aws_api_key' name='apm_options[apm_aws_api_key]' size='40' type='text' value='{$options['apm_aws_api_key']}' />";
	}

	function create_field_apm_aws_api_secret_key() {
		$options = get_option( 'apm_options' );
		echo "<input id='apm_aws_api_secret_key' name='apm_options[apm_aws_api_secret_key]' size='40' type='text' value='{$options['apm_aws_api_secret_key']}' />";
	}

	function create_field_apm_aws_language() {
		$options  = get_option( 'apm_options' );
		$selected = isset($options['apm_aws_language']) ? $options['apm_aws_language'] : '';
		echo "<select id='apm_aws_language' name='apm_options[apm_aws_language]'>";
		?>
			<option value="de" <?php echo ('de' == $options['apm_aws_language']) ? '"SELECTED"' : '' ?> >DE</option>
			<option value="com" <?php echo ('com' == $options['apm_aws_language']) ? '"SELECTED"' : '' ?> >USA</option>
			<option value="co.uk" <?php echo ('co.uk' == $options['apm_aws_language']) ? '"SELECTED"' : '' ?> >ENG</option>
			<option value="ca" <?php echo ('ca' == $options['apm_aws_language']) ? '"SELECTED"' : '' ?> >CA</option>
			<option value="fr" <?php echo ('fr' == $options['apm_aws_language']) ? '"SELECTED"' : '' ?> >FR</option>
			<option value="co.jp" <?php echo ('co.jp' == $options['apm_aws_language']) ? '"SELECTED"' : '' ?> >JP</option>
			<option value="it" <?php echo ('it' == $options['apm_aws_language']) ? '"SELECTED"' : '' ?> >IT</option>
			<option value="cn" <?php echo ('cn' == $options['apm_aws_language']) ? '"SELECTED"' : '' ?> >CN</option>
			<option value="es" <?php echo ('es' == $options['apm_aws_language']) ? '"SELECTED"' : '' ?> >ES</option>
	    </select>
	    <?php
	}

	function create_field_apm_aws_associate_tag(){
		$options = get_option( 'apm_options' );
		echo "<input id='apm_aws_associate_tag' name='apm_options[apm_aws_associate_tag]' size='40' type='text' value='{$options['apm_aws_associate_tag']}' />";
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