<?php

class Searchbar extends \Elementor\Widget_Base
{

	public function __construct($data = [], $args = null) {
		parent::__construct($data, $args);
		
		wp_register_script( 'moment_min_js', plugins_url( '/OBPress_SearchBarPlugin/widgets/searchbar/assets/js/vendor/moment.min.js'), array('jquery'), [ 'elementor-frontend' ], '1.0.0', true );
		wp_register_script( 'moment_tz_js', plugins_url( '/OBPress_SearchBarPlugin/widgets/searchbar/assets/js/vendor/moment.tz.js'), array('jquery'), [ 'elementor-frontend' ], '1.0.0', true );

		
		wp_register_script( 'searchbar_js',  plugins_url( '/OBPress_SearchBarPlugin/widgets/searchbar/assets/js/searchbar.js'), array('jquery'), [ 'elementor-frontend' ], '1.0.0', true  );
		wp_register_script( 'zcalendar_js', plugins_url( '/OBPress_SearchBarPlugin/widgets/searchbar/assets/js/zcalendar.js'), array('jquery'), [ 'elementor-frontend' ], '1.0.0', true );

		wp_register_style( 'zcalendar_css', plugins_url( '/OBPress_SearchBarPlugin/widgets/searchbar/assets/css/zcalendar.css') );
		wp_register_style( 'searchbar_css', plugins_url( '/OBPress_SearchBarPlugin/widgets/searchbar/assets/css/searchbar.css') );		

	}
	
	public function get_script_depends()
	{
		return ['moment_min_js, moment_tz_js, searchbar_js, zcalendar_js'];
	}

	public function get_style_depends()
	{
		return ['zcalendar_css, searchbar_css'];
	}

	public function get_name()
	{
		return 'Searchbar';
	}

	public function get_title()
	{
		return __('Searchbar', 'plugin-name');
	}

	public function get_icon()
	{
		return 'fa fa-calendar';
	}

	public function get_categories()
	{
		return ['OBPress'];
	}

	protected function _register_controls()
	{

		$this->start_controls_section(
			'content_section',
			[
				'label' => __( 'Content', 'plugin-name' ),
				'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'obpress_searchbar_promo_show',
			[
				'label' => __( 'Toggle Promo Code Field', 'OBPress_SearchBarPlugin' ),
				'type' => \Elementor\Controls_Manager::SWITCHER,
				'label_on' => __( 'Show', 'OBPress_SearchBarPlugin' ),
				'label_off' => __( 'Hide', 'OBPress_SearchBarPlugin' ),
				'return_value' => 'yes',
				'default' => 'yes',
			]
		);		

		$this->end_controls_section();
		

		$this->start_controls_section(
			'layout_section',
			[
				'label' => __( 'Layout', 'plugin-name' ),
				'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'obpress_searchbar_vertical_view',
			[
				'label' => __( 'Toggle Vertical View', 'OBPress_SearchBarPlugin' ),
				'type' => \Elementor\Controls_Manager::SWITCHER,
				'label_on' => __( 'On', 'OBPress_SearchBarPlugin' ),
				'label_off' => __( 'Off', 'OBPress_SearchBarPlugin' ),
				'return_value' => 'yes',
				'default' => 'no',
			]
		);

		$this->add_responsive_control(
			'obpress_searchbar_width',
			[
				'label' => __( 'Searchbar Width', 'OBPress_SearchBarPlugin' ),
				'type' => \Elementor\Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%' ],
				'range' => [
					'px' => [
						'min' => 500,
						'max' => 1600,
						'step' => 10,
					],
					'%' => [
						'min' => 31,
						'max' => 100,
					],
				],
				'default' => [
					'unit' => 'px',
					'size' => 1254,
				],
				'selectors' => [
					'.ob-searchbar' => 'width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'obpress_searchbar_alignment',
			[
				'label' => __( 'Searchbar Alignment', 'OBPress_SearchBarPlugin' ),
				'type' => \Elementor\Controls_Manager::SELECT,
				'default' => 'left',
				'options' => [
					'left'  => __( 'Left', 'plugin-domain' ),
					'center' => __( 'Center', 'plugin-domain' ),
					'right' => __( 'Right', 'plugin-domain' ),
				],
			]
		);

		$this->add_responsive_control(
			'obpress_searchbar_padding',
			[
				'label' => __( 'Searchbar Padding', 'OBPress_SearchBarPlugin' ),
				'type' => \Elementor\Controls_Manager::DIMENSIONS,
				'default' => [
					'top' => '0',
					'right' => '30',
					'bottom' => '0',
					'left' => '30',
					'isLinked' => false
				],
				'size_units' => [ 'px', '%', 'em' ],
				'selectors' => [
					'.ob-searchbar' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'obpress_searchbar_input_padding',
			[
				'label' => __( 'Input Field Padding', 'OBPress_SearchBarPlugin' ),
				'type' => \Elementor\Controls_Manager::DIMENSIONS,
				'default' => [
					'top' => '9',
					'right' => '10',
					'bottom' => '9',
					'left' => '10',
					'isLinked' => false
				],
				'size_units' => [ 'px', '%', 'em' ],
				'selectors' => [
					'.ob-searchbar-hotel, .ob-searchbar-calendar, .ob-searchbar-guests, .ob-searchbar-promo' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'obpress_searchbar_submit_button_padding',
			[
				'label' => __( 'Submit Button Padding', 'OBPress_SearchBarPlugin' ),
				'type' => \Elementor\Controls_Manager::DIMENSIONS,
				'default' => [
					'top' => '30',
					'right' => '10',
					'bottom' => '30',
					'left' => '10',
					'isLinked' => false
				],
				'size_units' => [ 'px', '%', 'em' ],
				'selectors' => [
					'.ob-searchbar-button' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'obpress_searchbar_button_width',
			[
				'label' => __( 'Searchbar Button Width', 'OBPress_SearchBarPlugin' ),
				'type' => \Elementor\Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1600,
						'step' => 10,
					],
					'%' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'default' => [
					'unit' => 'px',
					'size' => 148,
				],
				'selectors' => [
					'.ob-searchbar-submit' => 'width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'color_section',
			[
				'label' => __('Colors', 'OBPress_SearchBarPlugin'),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'obpress_searchbar_background_color',
			[
				'label' => __('Background Color', 'OBPress_SearchBarPlugin'),
				'type' => \Elementor\Controls_Manager::COLOR,
				'input_type' => 'color',
				'default' => '#fff',
				'selectors' => [
					'.ob-searchbar' => 'background-color: {{obpress_searchbar_background_color}}'
				],
			]
		);

		$this->add_control(
			'obpress_searchbar_input_background_color',
			[
				'label' => __('Input Background Color', 'OBPress_SearchBarPlugin'),
				'type' => \Elementor\Controls_Manager::COLOR,
				'input_type' => 'color',
				'default' => '#fff',
				'selectors' => [
					'.ob-searchbar-hotel input, .ob-searchbar-calendar input, .ob-searchbar-guests input, .ob-searchbar-promo input, #promo_code_dropdown input , .opened #hotels , .opened #calendar_dates , .opened #guests , .opened #promo_code' => 'background-color: {{obpress_searchbar_input_background_color}}'
				],
			]
		);

		$this->add_control(
			'obpress_searchbar_input_title_color',
			[
				'label' => __('Input Title Color', 'OBPress_SearchBarPlugin'),
				'type' => \Elementor\Controls_Manager::COLOR,
				'input_type' => 'color',
				'default' => '#000',
				'selectors' => [
					'.ob-searchbar-hotel > p, .ob-searchbar-calendar > p, .ob-searchbar-guests > p, .ob-searchbar-promo > p' => 'color: {{obpress_searchbar_input_title_color}}'
				],
			]
		);

		$this->add_control(
			'obpress_searchbar_input_placeholder_color',
			[
				'label' => __('Input Placeholder Color', 'OBPress_SearchBarPlugin'),
				'type' => \Elementor\Controls_Manager::COLOR,
				'input_type' => 'color',
				'default' => '#000',
				'selectors' => [
					'.ob-searchbar-hotel input, .ob-searchbar-calendar input, .ob-searchbar-guests input, .ob-searchbar-promo input' => 'color: {{obpress_searchbar_input_placeholder_color}}'
				],
			]
		);

		$this->add_control(
			'obpress_searchbar_dropdown_background_color',
			[
				'label' => __('Dropdowns Background Color', 'OBPress_SearchBarPlugin'),
				'type' => \Elementor\Controls_Manager::COLOR,
				'input_type' => 'color',
				'selectors' => [
					'.ob-searchbar-hotel.opened, .hotels_all, .hotels_folder, .hotels_hotel, .ob-searchbar-guests.opened, #occupancy_dropdown, .ob-searchbar-promo.opened, #promo_code_dropdown' => 'background-color: {{obpress_searchbar_dropdown_background_color}}'
				],
			]
		);

		$this->add_control(
			'obpress_searchbar_dropdown_text_color',
			[
				'label' => __('Dropdowns Text Color', 'OBPress_SearchBarPlugin'),
				'type' => \Elementor\Controls_Manager::COLOR,
				'input_type' => 'color',
				'selectors' => [
					'.hotels_all, .hotels_folder, .hotels_hotel, #occupancy_dropdown, #promo_code_dropdown' => 'color: {{obpress_searchbar_dropdown_text_color}}'
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'typography_section',
			[
				'label' => __('Typography', 'OBPress_SearchBarPlugin'),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			[
				'name' => 'title_typography',
				'label' => __( 'Input Title', 'OBPress_SearchBarPlugin' ),
				'selector' => '.ob-searchbar-hotel > p, .ob-searchbar-calendar > p, .ob-searchbar-guests > p, .ob-searchbar-promo > p',
			]
		);

		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			[
				'name' => 'input_typography',
				'label' => __( 'Input Field', 'OBPress_SearchBarPlugin' ),
				'selector' => '.ob-searchbar-calendar input, .ob-searchbar-guests input, .ob-searchbar-promo input, .ob-searchbar-hotel input',
			]
		);
		
		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			[
				'name' => 'dropdowns_typography',
				'label' => __( 'Dropdowns', 'OBPress_SearchBarPlugin' ),
				'selector' => '.hotels_dropdown, #occupancy_dropdown, #promo_code_dropdown',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'buttons_section',
			[
				'label' => __('Buttons', 'OBPress_SearchBarPlugin'),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'obpress_searchbar_button_background_color',
			[
				'label' => __('Button Background Color', 'OBPress_SearchBarPlugin'),
				'type' => \Elementor\Controls_Manager::COLOR,
				'input_type' => 'color',
				'default' => '#000',
				'selectors' => [
					'.ob-searchbar-submit, .select-occupancy-apply, .select-button:not(disabled), #promo_code_apply' => 'background-color: {{obpress_searchbar_button_background_color}}'
				],				
			]
		);

		$this->add_control(
			'obpress_searchbar_button_text_color',
			[
				'label' => __('Button Text Color', 'OBPress_SearchBarPlugin'),
				'type' => \Elementor\Controls_Manager::COLOR,
				'input_type' => 'color',
				'default' => '#fff',
				'selectors' => [
					'.ob-searchbar-submit, .select-occupancy-apply, .select-button:not(disabled), #promo_code_apply' => 'color: {{obpress_searchbar_button_text_color}}'
				],				
			]
		);

		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			[
				'name' => 'buttons_typography',
				'label' => __( 'Typography', 'OBPress_SearchBarPlugin' ),
				'selector' => '.ob-searchbar-submit, .select-occupancy-apply, #promo_code_apply',
			]
		);

		$this->add_group_control(
			\Elementor\Group_Control_Border::get_type(),
			[
				'name' => 'border',
				'label' => __( 'Border', 'OBPress_SearchBarPlugin' ),
				'selector' => '.ob-searchbar-submit',
			]
		);


		$this->end_controls_section();

		$this->start_controls_section(
			'calendar_section',
			[
				'label' => __('Calendar', 'OBPress_SearchBarPlugin'),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'obpress_searchbar_calendar_background_color',
			[
				'label' => __('Calendar Background Color', 'OBPress_SearchBarPlugin'),
				'type' => \Elementor\Controls_Manager::COLOR,
				'input_type' => 'color',
				'default' => '#fff',
				'selectors' => [
					'.ob-searchbar-calendar.opened, .zcalendar' => 'background-color: {{obpress_searchbar_calendar_background_color}}'
				],				
			]
		);

		$this->add_control(
			'obpress_searchbar_calendar_text_color',
			[
				'label' => __('Calendar Text Color', 'OBPress_SearchBarPlugin'),
				'type' => \Elementor\Controls_Manager::COLOR,
				'input_type' => 'color',
				'default' => '#000',
				'selectors' => [
					'.zcalendar' => 'color: {{obpress_searchbar_calendar_background_color}}'
				],				
			]
		);

		$this->add_control(
			'obpress_searchbar_calendar_in_range_background',
			[
				'label' => __('Selected Dates Range Background', 'OBPress_SearchBarPlugin'),
				'type' => \Elementor\Controls_Manager::COLOR,
				'input_type' => 'color',
				'default' => '#d9d1c1',
				'selectors' => [
					'.zc-date[data-in-range] .zc-date-inner, .zc-date[data-start] .zc-date-inner:after, .zc-date[data-end] .zc-date-inner:after, .zc-date[data-in-range]:not([data-start]):not([data-end]):hover .zc-date-inner:after ' => 'background-color: {{obpress_searchbar_calendar_in_range_background}}'
				],				
			]
		);

		$this->add_control(
			'obpress_searchbar_calendar_dates_background',
			[
				'label' => __('Selected Dates Background', 'OBPress_SearchBarPlugin'),
				'type' => \Elementor\Controls_Manager::COLOR,
				'input_type' => 'color',
				'default' => '#BEAD8E',
				'selectors' => [
					'.zc-date[data-start] .zc-date-inner, .zc-date[data-end] .zc-date-inner, .zc-date[data-unix]:not([data-disabled]):hover .zc-date-inner' => 'background-color: {{obpress_searchbar_calendar_background_color}}'
				],				
			]
		);

		$this->add_control(
			'obpress_searchbar_calendar_show_tooltip',
			[
				'label' => __( 'Toggle Calendar Tooltip', 'OBPress_SearchBarPlugin' ),
				'type' => \Elementor\Controls_Manager::SWITCHER,
				'label_on' => __( 'Show', 'OBPress_SearchBarPlugin' ),
				'label_off' => __( 'Hide', 'OBPress_SearchBarPlugin' ),
				'return_value' => 'yes',
				'default' => 'yes',
			]
		);

		$this->add_control(
			'obpress_searchbar_calendar_tooltip_background_color',
			[
				'label' => __('Tooltip Background Color', 'OBPress_SearchBarPlugin'),
				'type' => \Elementor\Controls_Manager::COLOR,
				'input_type' => 'color',
				'default' => '#eee',
				'selectors' => [
					'.zcalendar [data-title]:after' => 'background-color: {{obpress_searchbar_calendar_tooltip_background_color}}'
				],				
			]
		);

		$this->add_control(
			'obpress_searchbar_calendar_tooltip_text_color',
			[
				'label' => __('Tooltip Text Color', 'OBPress_SearchBarPlugin'),
				'type' => \Elementor\Controls_Manager::COLOR,
				'input_type' => 'color',
				'default' => '#3c3c3c',
				'selectors' => [
					'.zcalendar [data-title]:after' => 'color: {{obpress_searchbar_calendar_tooltip_background_color}}'
				],				
			]
		);

		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			[
				'name' => 'calendar_typography',
				'label' => __( 'Calendar Typography', 'OBPress_SearchBarPlugin' ),
				'selector' => '.zcalendar',
			]
		);

		$this->end_controls_section();

	}

	protected function render()
	{
		$settings_searchbar = $this->get_settings_for_display();

		require_once(WP_CONTENT_DIR . '/plugins/obpress_plugin_manager/BeApi/BeApi.php');

		$chainId = get_option('chain_id');

		$removedHotels = json_decode(get_option('removed_hotels'));


		// $hotelFolders = BeApi::getClientPropertyFolders($chainId)->Result;
        $hotelFolders = BeApi::ApiCache('hotel_folders_'.$chainId, BeApi::$cache_time['hotel_folders'], function() use ($chainId){
            return BeApi::getClientPropertyFolders($chainId)->Result;
        });

		$counter_for_hotel = 0;

		foreach ($hotelFolders as $hotel_in_folder_key => $hotel_in_folder) {
			if ($hotel_in_folder->IsPropertyFolder == false) {
				$counter_for_hotel++;
			}
			if(isset($removedHotels) && $removedHotels != null) {
				foreach ($removedHotels as $removedHotel) {
					if (isset($hotel_in_folder->Property_UID) && $hotel_in_folder->Property_UID != null) {
						if ($hotel_in_folder->Property_UID == $removedHotel) {
							unset($hotelFolders[$hotel_in_folder_key]);
						}
					}
				}
			}
		}





		// if its sinle hotel, get max child age
		if ($counter_for_hotel == 1) {

				$hotelId = get_option('hotel_id');

				// call getChildTerms API call, use cached if its cached

				$childrenTerms = BeApi::ApiCache('child_terms_'.$hotelId , BeApi::$cache_time['child_terms'], function() use ($hotelId){
		            return BeApi::getChildTerms($hotelId);
		        });


				$childrenTerms =  $childrenTerms->Result ;

				if ($childrenTerms != null) {

	            $childrenMaxAge = 0;

	            //SEARCH FOR CHILDREN LIMIT WITH CODE 1 WHICH MEANS CHILDREN
	            foreach ($childrenTerms as $childrenTerm) {
	                if ($childrenTerm->ChargeAs == 1 && $childrenTerm->MaxAge > $childrenMaxAge) {
	                    $childrenMaxAge = $childrenTerm->MaxAge;
	                }
	            }

	            //IF DON'T EXIST CHILDREN LIMITS WITH CODE 1 THEN SEARCH FOR CHILDREN WITH CODE 3 WHCIH MEANS FREE CHILDREN
	            if ($childrenMaxAge == 0) {
	                foreach ($childrenTerms as $childrenTerm) {
	                    if($childrenTerm->ChargeAs == 3 && $childrenTerm->MaxAge > $childrenMaxAge) {
	                        $childrenMaxAge = $childrenTerm->MaxAge;
	                    } 
	                }
	            }

	            //IF DON'T EXIST ANY INFORMATION ABOUT CHILDREN THAN LIMIT TO THE 17 YEARS
	            if ($childrenMaxAge == 0) {
	                $childrenMaxAge = 17;
	            } 

	        	}  else {
		            $childrenMaxAge = 17;
		        }


 
		} else {

			 	$childrenMaxAge = 17;

		}


		$hotelFolders = array_values($hotelFolders);

		//if set, if today or later
		$todayDateTime = new \DateTime('today');

		$start_date = \DateTime::createFromFormat('dmY', $_GET['CheckIn']);
		//if set, valid datetime, and not in past
		if (isset($_GET['CheckIn']) && $start_date && !$todayDateTime->diff($start_date)->invert) {
			$CheckIn = $start_date->format('dmY');
			$CheckInShow = $start_date->format('d/m/Y');
			$tomorrow = $start_date->modify('+1 day');
		} else {
			$CheckIn = $todayDateTime->format('dmY');
			$CheckInShow = $todayDateTime->format('d/m/Y');
			$tomorrow = $todayDateTime->modify('+1 day');
		}

		$end_date = \DateTime::createFromFormat('dmY', $_GET['CheckOut']);

		if (isset($_GET['CheckOut']) && $end_date && !$tomorrow->diff($end_date)->invert) {
			$CheckOut = $end_date->format('dmY');
			$CheckOutShow = $end_date->format('d/m/Y');
		} else {
			$CheckOut = $tomorrow->format('dmY');
			$CheckOutShow = $tomorrow->format('d/m/Y');
		}

		if ($_GET['ad'] && intval($_GET['ad']) > 0) {
			$adults = intval($_GET['ad']);
		}

		if ($_GET['ch'] && intval($_GET['ch']) >= 0) {
			$children = intval($_GET['ch']);
		}

		if ($settings_searchbar['obpress_searchbar_calendar_show_tooltip'] !== 'yes') {
			?>
				<style>
					.zcalendar [data-title]:not([data-disabled]):hover:after, .zcalendar [data-title]:not([data-disabled]):hover:before {
						opacity: 0;
					}
				</style>
			<?php
		}

		require_once(WP_PLUGIN_DIR . '/OBPress_SearchBarPlugin/widgets/searchbar/assets/templates/searchbar.php');
	}
}
