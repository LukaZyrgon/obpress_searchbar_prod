<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


final class OBPress_Widget {
    
	/**
	 * Plugin Version
	 *
	 * @since 1.0.0
	 *
	 * @var string The plugin version.
	 */
	const VERSION = '1.0.0';

	/**
	 * Minimum Elementor Version
	 *
	 * @since 1.0.0
	 *
	 * @var string Minimum Elementor version required to run the plugin.
	 */
	const MINIMUM_ELEMENTOR_VERSION = '2.0.0';

	/**
	 * Minimum PHP Version
	 *
	 * @since 1.0.0
	 *
	 * @var string Minimum PHP version required to run the plugin.
	 */
	const MINIMUM_PHP_VERSION = '7.0';
    
    

    private static $_instance = null;
    
	public static function instance() {

		if ( is_null( self::$_instance ) ) {
			self::$_instance = new self();
		}
		return self::$_instance;

	}
    
	public function __construct() {

		add_action( 'plugins_loaded', [ $this, 'on_plugins_loaded' ] );

	}

    public function i18n() {

		load_plugin_textdomain( 'obpress-widget' );

	}
    
	public function on_plugins_loaded() {

		if ( $this->is_compatible() ) {
			add_action( 'elementor/init', [ $this, 'init' ] );
		}

	}

	public function is_compatible() {

		// Check if Elementor installed and activated
		if ( ! did_action( 'elementor/loaded' ) ) {
			add_action( 'admin_notices', [ $this, 'admin_notice_missing_main_plugin' ] );
			return false;
		}

		// Check for required Elementor version
		if ( ! version_compare( ELEMENTOR_VERSION, self::MINIMUM_ELEMENTOR_VERSION, '>=' ) ) {
			add_action( 'admin_notices', [ $this, 'admin_notice_minimum_elementor_version' ] );
			return false;
		}

		// Check for required PHP version
		if ( version_compare( PHP_VERSION, self::MINIMUM_PHP_VERSION, '<' ) ) {
			add_action( 'admin_notices', [ $this, 'admin_notice_minimum_php_version' ] );
			return false;
		}

		return true;

	}

	public function init() {
	
		$this->i18n();
        
        add_action('elementor/widgets/widgets_registered', [ $this, 'init_widgets']);

        add_action('elementor/frontend/after_enqueue_styles', [ $this, 'widget_styles']);

		add_action( 'elementor/frontend/after_register_scripts', [ $this, 'widget_scripts' ] );

        add_action('elementor/elements/categories_registered', [ $this, 'add_elementor_widget_categories']);
        
		// add_action( 'elementor/controls/controls_registered', [ $this, 'init_controls' ] );

	}

	public function init_widgets() {

		// Include Widget files
		require_once(WP_PLUGIN_DIR . '/OBPress_SearchBarPlugin/widgets/searchbar/index.php');

		// Register widget
		\Elementor\Plugin::instance()->widgets_manager->register_widget_type( new \Searchbar() );
		

	}

	public function widget_scripts() {
		wp_register_script( 'jquery_js',  plugins_url( '/OBPress_SearchBarPlugin/widgets/searchbar/assets/js/vendor/jquery.min.js') );
		wp_register_script( 'moment_min_js', plugins_url( '/OBPress_SearchBarPlugin/widgets/searchbar/assets/js/vendor/moment.min.js'));
		wp_register_script( 'moment_tz_js', plugins_url( '/OBPress_SearchBarPlugin/widgets/searchbar/assets/js/vendor/moment.tz.js'));

		
		wp_register_script( 'searchbar_js',  plugins_url( '/OBPress_SearchBarPlugin/widgets/searchbar/assets/js/searchbar.js') );
		wp_register_script( 'zcalendar_js', plugins_url( '/OBPress_SearchBarPlugin/widgets/searchbar/assets/js/zcalendar.js'));


		wp_enqueue_script('jquery_js');
		wp_enqueue_script('moment_min_js');
		wp_enqueue_script('moment_tz_js');

		wp_enqueue_script('searchbar_js');
		wp_enqueue_script('zcalendar_js');
	}

	public function widget_styles() {
		wp_register_style( 'zcalendar', plugins_url( '/OBPress_SearchBarPlugin/widgets/searchbar/assets/css/zcalendar.css') );
		wp_register_style( 'searchbar', plugins_url( '/OBPress_SearchBarPlugin/widgets/searchbar/assets/css/searchbar.css') );
        
        wp_enqueue_style('zcalendar');
        wp_enqueue_style('searchbar');
	}

    function add_elementor_widget_categories( $elements_manager ) {
        $elements_manager->add_category(
          'OBPress',
          [
            'title' => __( 'OBPress', 'elementor' ),
            'icon' => 'fa fa-calendar',
          ]
        );
      }

	public function admin_notice_missing_main_plugin() {

		if ( isset( $_GET['activate'] ) ) unset( $_GET['activate'] );

		$message = sprintf(
			/* translators: 1: Plugin name 2: Elementor */
			esc_html__( '"%1$s" requires "%2$s" to be installed and activated.', 'obpress-widget' ),
			'<strong>' . esc_html__( 'Elementor Test Extension', 'obpress-widget' ) . '</strong>',
			'<strong>' . esc_html__( 'Elementor', 'obpress-widget' ) . '</strong>'
		);

		printf( '<div class="notice notice-warning is-dismissible"><p>%1$s</p></div>', $message );

	}

	public function admin_notice_minimum_elementor_version() {

		if ( isset( $_GET['activate'] ) ) unset( $_GET['activate'] );

		$message = sprintf(
			/* translators: 1: Plugin name 2: Elementor 3: Required Elementor version */
			esc_html__( '"%1$s" requires "%2$s" version %3$s or greater.', 'obpress-widget' ),
			'<strong>' . esc_html__( 'Elementor Test Extension', 'obpress-widget' ) . '</strong>',
			'<strong>' . esc_html__( 'Elementor', 'obpress-widget' ) . '</strong>',
			 self::MINIMUM_ELEMENTOR_VERSION
		);

		printf( '<div class="notice notice-warning is-dismissible"><p>%1$s</p></div>', $message );

	}
    
	public function admin_notice_minimum_php_version() {

		if ( isset( $_GET['activate'] ) ) unset( $_GET['activate'] );

		$message = sprintf(
			/* translators: 1: Plugin name 2: PHP 3: Required PHP version */
			esc_html__( '"%1$s" requires "%2$s" version %3$s or greater.', 'obpress-widget' ),
			'<strong>' . esc_html__( 'Elementor Test Extension', 'obpress-widget' ) . '</strong>',
			'<strong>' . esc_html__( 'PHP', 'obpress-widget' ) . '</strong>',
			 self::MINIMUM_PHP_VERSION
		);

		printf( '<div class="notice notice-warning is-dismissible"><p>%1$s</p></div>', $message );

	}    

}

OBPress_Widget::instance();