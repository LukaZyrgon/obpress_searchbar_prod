<?php
//Require the BeApi class so we can do Api Calls
require_once(WP_CONTENT_DIR . '/plugins/obpress_plugin_manager/BeApi/BeApi.php');


//enqueue all scripts needed
function enqueue_ajax_scripts(){
    wp_enqueue_script('searchbar-script', WP_PLUGIN_DIR . '/OBPress_SearchBarPlugin/widgets/searchbar/assets/js/searchbar.js', array('jquery'), false, true);
    wp_localize_script('searchbar-script', 'searchbarAjax', array(
        'ajaxurl' => admin_url('admin-ajax.php')
    ));

    wp_enqueue_script('zcalendar-script', WP_PLUGIN_DIR . '/OBPress_SearchBarPlugin/widgets/searchbar/assets/js/zcalendar.js', array('jquery'), false, true);
    wp_localize_script('zcalendar-script', 'zcalendarAjax', array(
        'ajaxurl' => admin_url('admin-ajax.php')
    ));
}

add_action('wp_enqueue_scripts', 'enqueue_ajax_scripts');


//Require rest of Ajax Files
require_once(WP_PLUGIN_DIR . '/OBPress_SearchBarPlugin/ajax/searchbar/searchbarAjax.php');
require_once(WP_PLUGIN_DIR . '/OBPress_SearchBarPlugin/ajax/searchbar/zcalendarAjax.php');
