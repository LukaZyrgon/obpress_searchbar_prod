<?php
add_action('wp_ajax_get_hotel_availability', 'getPropertyAvailAndPrice');
add_action('wp_ajax_nopriv_get_hotel_availability', 'getPropertyAvailAndPrice');


function getPropertyAvailAndPrice(){
    // $property,$currency,$date_from,$date_to;

    $property = $_GET['q'];
    $currency = $_GET['currency_id'];
    $date_from = $_GET['first'];
    $date_to = $_GET['second'];

    // return ApiDataController::getPriceAndUnavil(null, $property, $currency, $date_from, $date_to);
    $hotelAvailCalendar = BeApi::getHotelAvailCalendar($property, $date_from, $date_to, $currency);

    $result = [];
 
    if(isset($hotelAvailCalendar->HotelStaysType->HotelStays) && $hotelAvailCalendar->HotelStaysType->HotelStays!=null){
        foreach($hotelAvailCalendar->HotelStaysType->HotelStays as $stay){
            $status = $stay->Status;
            if(isset($stay->Price->AmountBeforeTax)){
                $date = $stay->Price->Start;
                $price = $stay->Price->AmountBeforeTax;
                $currency = $stay->Price->CurrencyCode;
                $promo = $stay->TPA_Extensions->IsPackageAvailable;
            }
            // var_dump($stay);
            array_push($result,(object)[
                "status" => $status,
                "promo" => $promo,
                "date" => $date,
                "price" => $price,
                "currency" => $currency
            ]);
        }
    }

    echo json_encode($result);

    die();
}

add_action('wp_ajax_get_chain_availability', 'getChainAvailAndPrice');
add_action('wp_ajax_nopriv_get_chain_availability', 'getChainAvailAndPrice');

function getChainAvailAndPrice($chain,$currency,$date_from,$date_to){

    $chain = $_GET['chain'];
    $currency = $_GET['currency_id'];
    $date_from = $_GET['first'];
    $date_to = $_GET['second'];

    $chainAvailCalendar = BeApi::getChainAvailCalendar($chain, $date_from, $date_to, $currency);

    $result = [];
 
    if(isset($chainAvailCalendar["HotelStaysType"]->HotelStays) &&$chainAvailCalendar["HotelStaysType"]->HotelStays!=null){
        foreach($chainAvailCalendar["HotelStaysType"]->HotelStays as $stay){
            $status = $stay->Status;
            if(isset($stay->Price->AmountBeforeTax)){
                $date = $stay->Price->Start;
                $price = $stay->Price->AmountBeforeTax;
                $currency = $stay->Price->CurrencyCode;
                $promo = $stay->TPA_Extensions->IsPackageAvailable;
            }
            // var_dump($stay);
            array_push($result,(object)[
                "status" => $status,
                "promo" => $promo,
                "date" => $date,
                "price" => $price,
                "currency" => $currency
            ]);
        }
    }
    
    echo json_encode($result);

    die();
}

