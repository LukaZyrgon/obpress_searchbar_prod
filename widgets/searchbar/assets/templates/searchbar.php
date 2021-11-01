<form type="POST" action="https://book.omnibees.com/chainresults" class="searchbar-form">
    <div class="ob-searchbar container<?php if ($settings_searchbar['obpress_searchbar_vertical_view'] == "yes") echo ' ob-searchbar-vertical'; ?><?php if ($settings_searchbar['obpress_searchbar_alignment'] == "left") echo ' ob-mr-auto'; ?><?php if ($settings_searchbar['obpress_searchbar_alignment'] == "center") echo ' ob-m-auto'; ?><?php if ($settings_searchbar['obpress_searchbar_alignment'] == "right") echo ' ob-ml-auto'; ?>" id="index" data-hotel-folders="<?php echo htmlspecialchars(json_encode($hotelFolders), ENT_QUOTES, 'UTF-8'); ?>">
        <div class="ob-searchbar-hotel">
            <p>
            <?php
                printf(
                    _n(
                        'Hotel',
                        'Destination or Hotel',
                        $counter_for_hotel,
                        'obpress'
                    ),
                    number_format_i18n( $counter_for_hotel )
                );                
            ?>
            </p>
            <input type="text" value="" placeholder="<?php
             if (empty(get_option('hotel_id'))) { 
                    _e('All Hotels', 'obpress');
                } 
                ?>" 
            id="hotels" class="<?php
            if (!empty(get_option('hotel_id'))) {
                echo 'single-hotel';
            } ?>" spellcheck="false" autocomplete="off">
            <input type="hidden" name="c" value="<?php echo get_option('chain_id') ?>">
            <input type="hidden" name="q" id="hotel_code" value="<?php ($_GET['q'] ?? '') ?>">
            <input type="hidden" name="currencyId" value="<?= (isset($_GET['currencyId'])) ? $_GET['currencyId'] : get_option('default_currency_id') ?>">
            <input type="hidden" name="lang" value="<?= (isset($_GET['lang'])) ? $_GET['lang'] : get_option('default_language_id') ?>">
            <input type="hidden" name="hotel_folder" id="hotel_folder">
            <input type="hidden" name="NRooms" id="NRooms" value="<?php echo $_GET['NRooms'] ?>">
            <div class="hotels_dropdown">
                <div class="hotels_all custom-bg custom-text" data-id="0"><?php _e('All Hotels', 'obpress'); ?></div>
                <div class="hotels_folder custom-bg custom-text" hidden></div>
                <div class="hotels_hotel custom-bg custom-text" data-id="" hidden></div>
            </div>

        </div>
        <div class="ob-searchbar-calendar">
            <p><?php _e('DATES OF STAY', 'obpress'); ?></p>
            <input class="calendarToggle" type="text" id="calendar_dates" value="<?php echo $CheckInShow ?? date("d/m/Y") ?> - <?php echo $CheckOutShow ?? date("d/m/Y", strtotime("+1 day")) ?>"  readonly>
            <input class="calendarToggle" type="hidden" id="date_from" name="CheckIn" value="<?php echo $CheckIn ?? date("dmY") ?>">
            <input class="calendarToggle" type="hidden" id="date_to" name="CheckOut" value="<?php echo $CheckOut ?? date("dmy", strtotime("+1 day")) ?>">            
        </div>
        <div class="ob-searchbar-guests">
            <p><?php _e('ROOMS AND GUESTS', 'obpress'); ?></p>
            <input type="text" id="guests" data-room="<?php _e('Room', 'obpress'); ?>" data-rooms="<?php _e('Rooms', 'obpress'); ?>" data-guest="<?php _e('Guest', 'obpress'); ?>" data-guests="<?php _e('Guests', 'obpress'); ?>" data-remove-room="<?php _e('Remove room', 'obpress'); ?>" readonly>
            <input type="hidden" id="ad" name="ad" value="1">
            <input type="hidden" id="ch" name="ch" value="">
            <input type="hidden" id="ag" name="ag" value="">

            <div id="occupancy_dropdown" class="position-absolute custom-bg custom-text" data-default-currency="<?= (isset($_GET['currencyId'])) ? $_GET['currencyId'] : get_option('default_currency_id') ?>">
                <div class="add-room-holder">
                    <p class="add-room-title select-room-title custom-text"><?php _e('NUMBER OF ROOMS', 'obpress') ?></p>
                    <div class="select-room-buttons">
                        <button class="select-button select-button-minus select-room-minus" type="button" disabled>

                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-minus"><line x1="5" y1="12" x2="19" y2="12"></line>
                             </svg>
                            
                        </button>
                        <span class="select-value select-room-value">1</span>
                        <button class="select-button select-button-plus select-room-plus" type="button">

                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            
                        </button>
                    </div>
                </div>

                <div class="select-room-holder">
                    <div class="select-room" data-room-counter="0">
                        <p class="select-room-title custom-text"><?php _e('Room', 'obpress');?> <span class="select-room-counter">1</span></p>
                        <div class="select-guests-holder">
                            <div class="select-adults-holder">
                                <div class="select-adults-title"><?php _e('Adults', 'obpress'); ?></div>
                                <div class="select-adults-buttons">
                                    <button class="select-button select-button-minus select-adult-minus" type="button" disabled>
                                        
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-minus"><line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>

                                    </button>
                                    <span class="select-value select-adults-value">1</span>
                                    <button class="select-button select-button-plus select-adult-plus" type="button">

                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>

                                    </button>
                                </div>
                            </div>
                            <div class="select-child-holder">
                                <div class="select-child-title">
                                    <span><?php _e('Children', 'obpress') ?></span>
                                    <span class="select-child-title-max-age">
                                        0 <?php 
                                         _e('to the', 'obpress') ; 
                                         echo " " ; 
                                         ?>
                                         <span class='child-max-age'> <?php echo $childrenMaxAge ; ?> </span>
                                    </span> 
                                </div>
                                <div class="select-child-buttons">
                                    <button class="select-button select-button-minus select-child-minus" type="button" disabled>
                                        
                                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-minus"><line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>

                                    </button>
                                    <span class="select-value select-child-value">0</span>
                                    <button class="select-button select-button-plus select-child-plus" type="button">

                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                        
                                    </button>
                                </div>
                            </div>
                            <div class="select-child-ages-holder">
                                <div class="select-child-ages-clone">


                                    <p class="select-child-ages-title custom-text"><?php _e('Age', 'obpress'); ?> <span class="select-child-ages-number"></span></p>

                                    <div class="age-picker"> 
                                        <span class="age-picker-value">0</span> 


                                        <div class="age-picker-options">
                                            <?php for ($i = 0; $i < $childrenMaxAge + 1; $i++) : ?>
                                                 <div data-age="<?= $i; ?>"> <?= $i; ?> anos de idade</div>
                                            <?php endfor; ?>

                                        </div>

                                        <select class="select-child-ages-input-clone">
                                                <?php for ($i = 0; $i < $childrenMaxAge + 1; $i++) : ?>
                                                    <option data-value="<?= $i; ?>" <?php if ($i == 0) { echo "selected";} ?>><?= $i; ?></option>
                                                <?php endfor; ?>
                                        </select>

                                    </div>

                                   

                                    <div class="child-ages-input">
                                        
                                    </div>

                                    <p class="incorect-age custom-text"><?php _e('Incorrect Age', 'obpress') ?></p>

                                </div>
                            </div>
                            <hr class="select-room-divider">
                        </div>
                    </div>
                </div>

                <button class="btn-ic custom-action-bg custom-action-border custom-action-text select-occupancy-apply" type="button">
                        <?php _e('Apply', 'obpress') ?>

                        <span class="select-occupancy-apply-info">
                                <span class="select-occupancy-apply-info-rooms" data-rooms="1">1</span>
                                <span class="select-occupancy-apply-info-rooms-string">Room</span>
                                ,
                                <span class="select-occupancy-apply-info-guests" data-guests="1">1</span>
                                <span class="select-occupancy-apply-info-guests-string">Guest</span>
                        </span>
                </button>

            </div>
        </div>
        <?php if($settings_searchbar['obpress_searchbar_promo_show'] === 'yes'): ?>
            <div class="ob-searchbar-promo">
                <p><?php _e('I HAVE A CODE', 'obpress'); ?></p>
                <input type="text" id="promo_code" value="" placeholder="Escolha o tipo" readonly>
                <div id="promo_code_dropdown" class="position-absolute custom-bg custom-text">
                    <div class="mb-3 mt-2">
                        <p class="input-title"><?php _e('GROUP CODE', 'obpress') ?></p>
                        <input type="text" id="group_code" name="group_code" placeholder="Digite seu código">
                    </div>

                    <div class="mb-3">
                        <p class="input-title"><?php _e('PROMO CODE', 'obpress'); ?></p>
                        <input type="text" id="Code" name="Code" placeholder="Digite seu código">
                    </div>

                    <div class="mb-3">
                        <p class="input-title"><?php _e('LOYALTY CODE', 'obpress') ?></p>
                        <input type="text" id="loyalty_code" name="loyalty_code" placeholder="Digite seu código">
                    </div>

                    <div class="text-right">
                        <button id="promo_code_apply" class="custom-action-bg custom-action-text custom-action-border btn-ic"><?php _e('Apply', 'obpress'); ?></button>
                    </div>
                </div>
            </div>
        <?php endif; ?>
        <div class="ob-searchbar-button">
            <button class="ob-searchbar-submit" type="submit"><?php _e('Search', 'obpress'); ?></button>
        </div>       
    </div>
    <div class="zcalendar-wrap">
			<div class="zcalendar<?php if ($settings_searchbar['obpress_searchbar_vertical_view'] == "yes") echo ' zcalendar-vertical'; ?>" data-allow-unavail="<?= get_option('allow_unavail_dates') ?>" data-promotional="<?php _e('Offers for you', 'obpress'); ?>" data-promo="<?php _e('Special Offer', 'obpress'); ?>" data-unavilable="<?php _e('*Price for 1 adult / 1 night', 'obpress') ?>" data-lang="{{$lang->Code}}"  data-night="<?php _e('Night', 'obpress') ?>" data-nights="<?php _e('Nights', 'obpress') ?>"></div>
		</div>     
</form>