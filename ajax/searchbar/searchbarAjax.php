<?php
add_action('wp_ajax_get_max_rooms', 'get_max_rooms_callback');
add_action('wp_ajax_nopriv_get_max_rooms', 'get_max_rooms_callback');

function get_max_rooms_callback() {
    $property = json_decode($_POST['hotel_id'], true);
    $currency = json_decode($_POST['currency_id'], true);

    $style =  BeApi::getPropertyStyle($property, $currency);

    if(!empty(get_option('changed_max_rooms'))) {
        $maxRoomsArr = get_option('changed_max_rooms');

        foreach($maxRoomsArr as $room) {
            if($property == $room['hotelId']) {
                echo $room['newMaxRooms'];
                die();
            }
        }

    }

    echo json_encode($style->Result->MaxRooms);

    die();
}

/* get children avail */

add_action('wp_ajax_get_children_availability', 'getChildrenAvailability');
add_action('wp_ajax_nopriv_get_children_availability', 'getChildrenAvailability');

function getChildrenAvailability() {

    $property = $_GET['q'];  

    $currency = $_GET['currencyId'];

    $style = BeApi::childrenAllowed($property, $currency);

    echo json_encode($style); 

    die();


}