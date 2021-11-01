jQuery(window).on("elementor/frontend/init", function () {
  //hook name is 'frontend/element_ready/{widget-name}.{skin} - i dont know how skins work yet, so for now presume it will
  //always be 'default', so for example 'frontend/element_ready/slick-slider.default'
  //$scope is a jquery wrapped parent element
  elementorFrontend.hooks.addAction(
    "frontend/element_ready/Searchbar.default",
    function ($scope, $) {
      /* getting url params */
      console.log("asd");
      hotelFolders = JSON.parse(
        jQuery(".ob-searchbar").attr("data-hotel-folders")
      );

      function getUrlParam(param) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split("&");
        var sParameterName;

        for (var i = 0; i < sURLVariables.length; i++) {
          sParameterName = sURLVariables[i].split("=");

          if (sParameterName[0] === param) {
            return sParameterName[1] === undefined
              ? true
              : decodeURIComponent(sParameterName[1]);
          }
        }
      }

      /* add or update parameters in url */
      function updateUrlParam(key, value, url) {
        if (!url) url = window.location.href;
        var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
          hash;

        if (re.test(url)) {
          if (typeof value !== "undefined" && value !== null) {
            return url.replace(re, "$1" + key + "=" + value + "$2$3");
          } else {
            hash = url.split("#");
            url = hash[0].replace(re, "$1$3").replace(/(&|\?)$/, "");
            if (typeof hash[1] !== "undefined" && hash[1] !== null) {
              url += "#" + hash[1];
            }
            return url;
          }
        } else {
          if (typeof value !== "undefined" && value !== null) {
            var separator = url.indexOf("?") !== -1 ? "&" : "?";
            hash = url.split("#");
            url = hash[0] + separator + key + "=" + value;
            if (typeof hash[1] !== "undefined" && hash[1] !== null) {
              url += "#" + hash[1];
            }
            return url;
          } else {
            return url;
          }
        }
      }

      function sortBySequence() {
        //buble sort
        var swapp;
        var n = hotelFolders.length - 1;
        var x = hotelFolders;
        do {
          swapp = false;
          for (var i = 0; i < n; i++) {
            if (x[i].IsPropertyFolder) {
              comparei = x[i].Sequence;
            } else {
              comparei = x[i].PropertySequence;
            }

            if (x[i + 1].IsPropertyFolder) {
              comparej = x[i + 1].Sequence;
            } else {
              comparej = x[i + 1].PropertySequence;
            }

            if (comparei > comparej) {
              var temp = x[i];
              x[i] = x[i + 1];
              x[i + 1] = temp;
              swapp = true;
            }
          }
          n--;
        } while (swapp);
        return x;
      }

      var sortedHotels = sortBySequence();

      //separate already sorted hotels and folders
      var onlyHotels = [];
      var onlyFolders = [];
      for (var i = 0; i < sortedHotels.length; i++) {
        if (sortedHotels[i].IsPropertyFolder) {
          onlyFolders.push(sortedHotels[i]);
        } else {
          onlyHotels.push(sortedHotels[i]);
        }
      }

      function getHotelsForFolder(UID) {
        var hotels = [];
        for (var i = 0; i < onlyHotels.length; i++) {
          if (onlyHotels[i].PropertyFolderUID == UID) {
            hotels.push(onlyHotels[i]);
          }
        }
        return hotels;
      }

      function getFoldersForFolder(UID) {
        var folders = [];
        for (var i = 0; i < onlyFolders.length; i++) {
          if (
            onlyFolders[i].ParentFolderUID != null &&
            onlyFolders[i].ParentFolderUID == UID
          ) {
            folders.push(onlyFolders[i]);
          }
        }
        return folders;
      }

      function getFoldersWithoutParents() {
        var folders = [];
        for (var i = 0; i < onlyFolders.length; i++) {
          if (
            onlyFolders[i].ParentFolderUID == null ||
            onlyFolders[i].ParentFolderUID == -1
          ) {
            folders.push(onlyFolders[i]);
          }
        }
        return folders;
      }

      function getHotelsWithoutParents() {
        var hotels = [];
        for (var i = 0; i < onlyHotels.length; i++) {
          if (onlyHotels[i].PropertyFolderUID == -1) {
            hotels.push(onlyHotels[i]);
          }
        }
        return hotels;
      }

      var hotels_div = jQuery(".hotels_dropdown");
      var hotels_folder_div = jQuery(".hotels_dropdown")
        .find(".hotels_folder")
        .eq(0);
      var hotels_hotel_div = jQuery(".hotels_dropdown")
        .find(".hotels_hotel")
        .eq(0);

      function getFolderChildren(UID, level) {
        if (UID == null) {
          UID = -1;
        }

        //CHANGE BECAUSE OF NOT REDIRECTING TO HOTELRESULT PAGE, UID WAS NOT -1
        if (onlyHotels.length == 1) {
          UID = onlyHotels[0].PropertyFolderUID;
        }

        var folders = [];
        if (UID == -1) {
          //starting
          folders = getFoldersWithoutParents();
        } else {
          folders = getFoldersForFolder(UID);
        }

        var hotels = getHotelsForFolder(UID);

        //list folders
        for (var i = 0; i < folders.length; i++) {
          //go through all folders and find the ones where uid is missing or -1
          if (!hasSubHotels(folders[i].PropertyFolderUID, 0)) continue;
          var folderName = folders[i].PropertyFolderName;
          var cloned = hotels_folder_div.clone();
          // cloned.attr("data-folder-id",folders[i].PropertyFolderUID);
          cloned.attr("data-folder-id", folders[i].PropertyFolderName);
          cloned.removeAttr("hidden");
          cloned.text(folderName);
          cloned.css("padding-left", (level + 1) * 10 + 35 + "px");
          hotels_div.append(cloned);
          getFolderChildren(folders[i].PropertyFolderUID, level + 1);
        }
        //list hotels
        for (var j = 0; j < hotels.length; j++) {
          var hotelName = hotels[j].Property_Name;
          var cloned = hotels_hotel_div.clone(true);
          cloned.removeAttr("hidden");
          cloned.text(hotelName);
          cloned.css("padding-left", (level + 1) * 10 + 50 + "px");
          cloned.attr("data-id", hotels[j].Property_UID);
          cloned.attr("data-parent-id", UID);
          hotels_div.append(cloned);
          if (jQuery(".hotels_folder").length > 1) {
            jQuery(".hotels_hotel").css("background-position-x", "42px");
          } else {
            jQuery(".hotels_hotel").css("background-position-x", "32px");
          }
        }
      }

      function hasSubHotels(UID, num) {
        if (UID == null) {
          UID = -1;
        }
        var folders = [];

        if (UID == -1) {
          //starting
          folders = getFoldersWithoutParents();
        } else {
          folders = getFoldersForFolder(UID);
        }
        var hotels = getHotelsForFolder(UID);

        num = num + hotels.length;

        //list hotels
        for (var i = 0; i < folders.length; i++) {
          //go through all folders and find the ones where uid is missing or -1
          return num + hasSubHotels(folders[i].PropertyFolderUID, num);
        }
        return hotels.length;
      }

      getFolderChildren(null, 0);

      //if single only one hotel exists lock the input
      if (onlyHotels.length == 1) {
        var name = onlyHotels[0].Property_Name;
        var id = onlyHotels[0].Property_UID;
        jQuery("#hotel_code,#as-hotel-id").val(id);
        jQuery("#hotels,.as-destination-input").val(name);
        // $("#as-destination").hide();
        jQuery("#hotels").trigger("change");
        jQuery(".hotels_hotel[data-id=" + id + "]").trigger("click");
        jQuery("#hotels,.as-destination-input").off();
        jQuery("#hotels,.as-destination-input").attr("readonly", true);
      }

      jQuery(" .hotels_all, .hotels_hotel, .hotels_folder ").click(function () {
        // disable folders in advanced search

        // if ($(this).hasClass("hotels_folder") == true &&  $(this).parent().parent().attr('id')  == "as-destination"){
        //     $("#select-hotel").modal("show");
        //     return;
        // }

        jQuery(".hotels_dropdown").slideUp();
        jQuery(".ob-searchbar-hotel").removeClass("opened");
        //set fields
        hotel_code = jQuery(this).attr("data-id");
        hotel_folder = jQuery(this).attr("data-folder-id");
        hotel_name = jQuery(this).text();

        jQuery("#hotels").val(hotel_name);
        jQuery("#hotel_code").val(hotel_code);

        if (hotel_code != 0 || hotel_code != null) {
          jQuery(".as-destination-input").val(hotel_name);
          jQuery("#as-hotel-id").val(hotel_code);
        }

        if (hotel_folder != 0 && hotel_folder != null) {
          jQuery("#hotel_code").val("0");
          jQuery("#hotel_folder").val(hotel_folder);
          jQuery("#hotels").val(hotel_name);

          jQuery(".as-destination-input").val(hotel_name);
        } else {
          jQuery("#hotel_folder").val(null);
        }

        var action = jQuery("#hotel_code").closest("form").attr("action");

        if (
          jQuery("#hotel_code").val() == "" ||
          jQuery("#hotel_code").val() == "0"
        ) {
          // action = action.replace(/hotelresults/g, "/chainresults");
          action = 'https://book.omnibees.com/chainresults';
          console.log('asd');
          jQuery("#hotel_code").val("");
          jQuery("#occupancy_dropdown .pl-2").show();
          // check if kids allowed
          childrenAllowedChain();
        } else {
          // action = action.replace(/chainresults/g, "/hotelresults");
          action = 'https://book.omnibees.com/hotelresults'

          // check if kids allowed
          childrenAllowed();
        }

        jQuery("#hotel_code").closest("form").attr("action", action);
        setTimeout(function () {
          jQuery("#hotel_code").trigger("change");
        }, 0);

        if (hotel_folder != 0 && hotel_folder != null) {
          jQuery("#hotel_code").val("0");
          jQuery("#hotel_folder").val(hotel_folder);
          jQuery("#hotels").val(hotel_name);

          jQuery(".as-destination-input").val(hotel_name);
        } else {
          jQuery("#hotel_folder").val(null);
        }

        var action = jQuery("#hotel_code").closest("form").attr("action");
        console.log(action);
        if (
          jQuery("#hotel_code").val() == "" ||
          jQuery("#hotel_code").val() == "0"
        ) {
          // action = action.replace(/hotelresults/g, "chainresults");
          action = 'https://book.omnibees.com/chainresults';

          jQuery("#hotel_code").val("");
          jQuery("#occupancy_dropdown .pl-2").show();
          // check if kids allowed
          //   childrenAllowedChain();
        } else {
          // action = action.replace(/chainresults/g, "hotelresults");
          action = 'https://book.omnibees.com/hotelresults'
          // check if kids allowed
          //   childrenAllowed();
        }

        jQuery("#hotel_code").closest("form").attr("action", action);
        setTimeout(function () {
          jQuery("#hotel_code").trigger("change");
        }, 0);
      });

      jQuery("#hotels,.as-destination-input").click(function () {
        var dropdown = jQuery(this).parent().find(".hotels_dropdown");
        if (dropdown.css("display") == "none") {
          dropdown.find("*").removeClass("d-none");
          dropdown.slideDown(200);
          jQuery(".ob-searchbar-hotel").addClass("opened");
        }
        //$(this).parent().find(".hotels_dropdown")
        //$(this).parent().find(".hotels_dropdown")
      });

      jQuery(document).mouseup(function (e) {
        var box = jQuery(".hotels_dropdown");
        if (!box.is(e.target) && box.has(e.target).length === 0) {
          box.slideUp(200);
          jQuery(".ob-searchbar-hotel").removeClass("opened");
        }
      });

      jQuery("#hotels").keyup(function () {
        jQuery(this).parent().find(".hotels_dropdown").slideDown(200);
        var folder_id = 0;
        var query = jQuery(this).val();
        var divs = jQuery(this).parent().find(".hotels_dropdown").children();
        for (var i = 0; i < divs.length; i++) {
          var text = divs.eq(i).text();
          if (
            text.toLowerCase().indexOf(query.toLowerCase()) >= 0 ||
            query == ""
          ) {
            divs.eq(i).removeClass("d-none");
            //if its a folder all children should be left also
            if (divs.eq(i).attr("data-folder-id") != null) {
              folder_id = divs.eq(i).attr("data-folder-id");
            }
            //if it has a folder show the folder of it
            if (divs.eq(i).attr("data-parent-id") != null) {
              jQuery(
                "[data-folder-id='" + divs.eq(i).attr("data-parent-id") + "']"
              ).removeClass("d-none");
            }
          } else {
            divs.eq(i).addClass("d-none");
            if (divs.eq(i).attr("data-parent-id") != null) {
              //make children of a parent visible
              var parent_id = divs.eq(i).attr("data-parent-id");
              if (parent_id == folder_id) {
                divs.eq(i).removeClass("d-none");
              }
            }
          }
        }
      });

      //Promo Code Js

      jQuery("#promo_code").click(function () {
        if (jQuery("#promo_code_dropdown").css("display") == "none") {
          jQuery("#promo_code_dropdown").slideDown(200);
          promoCodeDisabler();
          jQuery(".ob-searchbar-promo").addClass("opened");
        }
      });

      jQuery("#promo_code_apply").click(function () {
        jQuery("#promo_code_dropdown").slideUp(200);
        jQuery(".ob-searchbar-promo").removeClass("opened");
      });

      jQuery(document).mousedown(function (e) {
        var promo_code_dropdown = jQuery("#promo_code_dropdown");

        // if the target of the click isn't the container nor a descendant of the container
        if (
          !promo_code_dropdown.is(e.target) &&
          promo_code_dropdown.has(e.target).length === 0
        ) {
          promo_code_dropdown.slideUp(200);
          jQuery(".ob-searchbar-promo").removeClass("opened");
        }
      });

      jQuery("#promo_code_apply").click(function (e) {
        e.preventDefault();

        if (
          jQuery("#group_code").val() != null &&
          jQuery("#group_code").val() != ""
        ) {
          jQuery("#promo_code").val(jQuery("#group_code").val());
        } else if (
          jQuery("#Code").val() != null &&
          jQuery("#Code").val() != ""
        ) {
          jQuery("#promo_code").val(jQuery("#Code").val());
        } else if (
          jQuery("#loyalty_code").val() != null &&
          jQuery("#loyalty_code").val() != ""
        ) {
          jQuery("#promo_code").val(jQuery("#loyalty_code").val());
        } else {
          jQuery("#promo_code").val("");
        }

        jQuery("#promo_code_dropdown").slideUp(200);
        jQuery(".ob-searchbar-promo").removeClass("opened");
        //togglePromoCodeDropdown();
        promoCodeDisabler();
      });

      jQuery("#group_code,#Code,#loyalty_code").keyup(promoCodeDisabler);

      function promoCodeDisabler() {
        //enable all
        jQuery("#group_code").prop("disabled", false);
        jQuery("#Code").prop("disabled", false);
        jQuery("#loyalty_code").prop("disabled", false);

        //disable empty
        if (jQuery("#group_code").val().length > 0) {
          jQuery("#Code").prop("disabled", true);
          jQuery("#loyalty_code").prop("disabled", true);
        } else if (jQuery("#Code").val().length > 0) {
          jQuery("#group_code").prop("disabled", true);
          jQuery("#loyalty_code").prop("disabled", true);
        } else if (jQuery("#loyalty_code").val().length > 0) {
          jQuery("#group_code").prop("disabled", true);
          jQuery("#Code").prop("disabled", true);
        }
      }

      //Occupancy Javascript
      var adultsInput = jQuery("#ad");
      var childrenInput = jQuery("#ch");

      //Default Number of Rooms
      var maxRooms = 10;

      // Array of Objects that holds information for every room
      var guests = [
        {
          adult: 1,
          children: 0,
          childrenAges: [],
        },
      ];

      //All of the Url Parameters
      var adultsParam = getUrlParam("ad");

      var childrenParam = getUrlParam("ch");

      var childrenAgesParam = getUrlParam("ag");

      var numberOfRoomsParam = parseInt(getUrlParam("NRooms"));

      if (isNaN(numberOfRoomsParam)) {
        numberOfRoomsParam = 1;
      }

      if (numberOfRoomsParam == 0) {
        numberOfRoomsParam = 1;
      }

      if (
        jQuery("#hotel_code").val() != "" &&
        jQuery("#hotel_code").val() != "0"
      ) {
        // childrenAllowed();

        var hotel_id = parseInt(jQuery("#hotel_code").val());
        var currency_id = parseInt(
          jQuery("#occupancy_dropdown").attr("data-default-currency")
        );

        //TODO!!! Figure out how to get max rooms

        var action = "get_max_rooms";
        var data = {};
        data.hotel_id = JSON.stringify(hotel_id);
        data.currency_id = JSON.stringify(currency_id);
        data.action = action;

        jQuery.post(searchbarAjax.ajaxurl, data, function (response) {
          maxRooms = response;
          if (maxRooms > 1) {
            // $('.select-room-add').css('display', 'block');
            jQuery(".select-room-plus").prop("disabled", false);
          }

          //If a url comes with more rooms than max rooms
          if (numberOfRoomsParam > maxRooms) {
            numberOfRoomsParam = maxRooms;
          }

          //If Url comes with a NRooms param
          if (
            typeof numberOfRoomsParam != "undefined" ||
            numberOfRoomsParam != null
          ) {
            //Clone the first room to as much rooms needed
            for (i = 1; i < numberOfRoomsParam; i++) {
              jQuery(".select-room")
                .eq(0)
                .clone()
                .appendTo(".select-room-holder");

              // Stores the cloned room in a variable and pushes the default settings for the room
              var clonedRoom = jQuery(".select-room").last();
              var defaultGuestValues = {
                adult: 1,
                children: 0,
                childrenAges: [],
              };

              guests.push(defaultGuestValues);
              //Sets the appropriate room counter for the cloned room, and shows it next to the Room String
              clonedRoom.attr(
                "data-room-counter",
                jQuery(".select-room").length - 1
              );
              clonedRoom
                .find(".select-room-counter")
                .text(parseInt(clonedRoom.attr("data-room-counter")) + 1);

              //Sets the string value of adults and children to the default value
              clonedRoom
                .find(".select-adults-value")
                .text(defaultGuestValues.adult);
              clonedRoom
                .find(".select-child-value")
                .text(defaultGuestValues.children);

              //Enables the + and disables the - just in case
              clonedRoom.find(".select-button-plus").prop("disabled", false);
              clonedRoom.find(".select-button-minus").prop("disabled", true);

              //Removes all the child ages input fields if the 1st room contains any
              clonedRoom.find(".select-child-ages").remove();

              //If Room is added show the divider line
              jQuery(".select-room-divider").css("display", "block");

              // var removeRoomStringAttribute = $('#guests').attr('data-remove-room');
              // //Add a button to be able to remove the added room
              // var removeRoomString = '<p class="select-remove-room custom-text">'+removeRoomStringAttribute+'</p>'
              // $(removeRoomString).insertBefore('.select-room:last hr');
            }

            //If maximum number of rooms is selected disable adding rooms
            if (jQuery(".select-room").length == maxRooms) {
              jQuery(".select-room-plus").prop("disabled", true);
            }

            if (jQuery(".select-room").length < maxRooms) {
              jQuery(".select-room-plus").prop("disabled", false);
            }

            if (jQuery(".select-room").length == 1) {
              jQuery(".select-room-minus").prop("disabled", true);
            }

            if (jQuery(".select-room").length > 1) {
              jQuery(".select-room-minus").prop("disabled", false);
            }
          }

          //If Url comes with a adults param
          if (typeof adultsParam != "undefined" || adultsParam != null) {
            //Split the adults param by , and turn the strings it returns in to numbers
            var adultsParamArray = adultsParam.split(",");
            var arrayParamArrayNumbers = adultsParamArray.map(Number);

            //If NRooms is 1 but there are more than 1 adults in the param
            if (numberOfRoomsParam == 1) {
              arrayParamArrayNumbers.length = 1;
            }

            //Set number of adults for each room
            for (i = 0; i < numberOfRoomsParam; i++) {
              //If there are more than 10 adults, set number of adults for that room to 1
              if (arrayParamArrayNumbers[i] > 10) {
                arrayParamArrayNumbers[i] = 1;
              }

              //If adult param is invalid set it to 1
              if (isNaN(arrayParamArrayNumbers[i])) {
                arrayParamArrayNumbers[i] = 1;
              }

              //Get number of adults for current room, and put it in the span representing the value,also check if buttons should be disabled
              guests[i].adult = parseInt(arrayParamArrayNumbers[i]);
              jQuery(".select-adults-value").eq(i).text(guests[i].adult);

              if (guests[i].adult > 1) {
                jQuery(".select-adult-minus").eq(i).prop("disabled", false);
              }

              if (guests[i].adult == 1) {
                jQuery(".select-adult-minus").eq(i).prop("disabled", true);
              }

              if (guests[i].adult == 10) {
                jQuery(".select-adult-plus").eq(i).prop("disabled", true);
              }

              if (guests[i].adult < 10) {
                jQuery(".select-adult-plus").eq(i).prop("disabled", false);
              }
            }

            //Update adults input field
            adultsInput.attr("value", adultsParam);
          }

          //If Url comes with a children param
          if (typeof childrenParam != "undefined" || childrenParam != null) {
            //Split the children param by , and turn the strings it returns in to numbers
            var childrenParamArray = childrenParam.split(",");
            var childrenParamArrayNumbers = childrenParamArray.map(Number);

            //If NRooms is 1 but there are more than 1 children in the param
            if (numberOfRoomsParam == 1) {
              childrenParamArrayNumbers.length = 1;
            }

            //Set number of children for each room
            for (i = 0; i < numberOfRoomsParam; i++) {
              if (childrenParamArrayNumbers[i] > 10) {
                childrenParamArrayNumbers[i] = 1;
              }

              //If children param is invalid set it to 1
              if (isNaN(childrenParamArrayNumbers[i])) {
                childrenParamArrayNumbers[i] = 0;
              }

              //Get number of children for current room, and put it in the span representing the value,also check if buttons should be disabled
              guests[i].children = parseInt(childrenParamArrayNumbers[i]);
              jQuery(".select-child-value").eq(i).text(guests[i].children);

              if (guests[i].children > 0) {
                jQuery(".select-child-minus").eq(i).prop("disabled", false);
              }

              if (guests[i].children == 0) {
                jQuery(".select-child-minus").eq(i).prop("disabled", true);
              }

              if (guests[i].children == 10) {
                jQuery(".select-child-plus").eq(i).prop("disabled", true);
              }

              if (guests[i].children < 10) {
                jQuery(".select-child-plus").eq(i).prop("disabled", false);
              }
            }

            //Update Children input fild
            childrenInput.attr("value", childrenParam);
          }

          // If no child ages for childs, set 0
          var childrenAgesParam = getUrlParam("ag");

          if (
            (typeof childrenParam != "undefined" || childrenParam != null) &&
            (typeof childrenAgesParam == "undefined" ||
              childrenAgesParam == null)
          ) {
            var childrenAgesParam = "";

            for (i = 0; i < childrenParamArray.length; i++) {
              var numberOfKidsPerRoom = Number(childrenParamArray[i]);

              for (k = 0; k < numberOfKidsPerRoom; k++) {
                childrenAgesParam += "99";

                if (k != numberOfKidsPerRoom - 1) {
                  childrenAgesParam += ";";
                }
              }

              if (i != childrenParamArray.length - 1) {
                childrenAgesParam += ",";
              }
            }
          }

          //If Url comes with a children ages param
          if (
            typeof childrenAgesParam != "undefined" ||
            childrenAgesParam != null
          ) {
            var childrenAgesParamArray = childrenAgesParam.split(",");
            for (i = 0; i < numberOfRoomsParam; i++) {
              //Split children ages in current room iteration
              guests[i].childrenAges = childrenAgesParamArray[i];
              var childrenAges = guests[i].childrenAges.split(";");

              // loop childs
              for (j = 0; j < guests[i].children; j++) {
                // Clones the first child age div and stores it in a variable
                jQuery(".select-child-ages-clone").clone();

                var childAge = jQuery(".select-child-ages-clone")
                  .clone()
                  .last();

                //Removes the clone class and adds the real class
                childAge.removeClass("select-child-ages-clone");
                childAge.addClass("select-child-ages");

                //Appends the child age clone to the div its supposed to be in
                childAge.appendTo(jQuery(".select-child-ages-holder").eq(i));

                //Appends the apropriate number next to 'Child' eg. Child 1, Child 2, Child 3
                childAge.find(".select-child-ages-number").text(j + 1);

                //Removes the clone class from the input select field and adds the real class
                childAge
                  .find(".select-child-ages-input-clone")
                  .addClass("select-child-ages-input");
                childAge
                  .find(".select-child-ages-input-clone")
                  .removeClass("select-child-ages-input-clone");

                childAge
                  .find(".select-child-ages-input")
                  .find("option[data-value=" + childrenAges[j] + "]")
                  .attr("selected", "selected");
              }
            }
            jQuery("#ag").attr("value", childrenAgesParam);
          }

          // Update the string in the #guests input field and on the button with current number of Guests and Rooms
          var guestNumber = 0;

          for (i = 0; i < guests.length; i++) {
            guestNumber = guestNumber + guests[i].adult + guests[i].children;
          }

          var roomString = "";
          if (numberOfRoomsParam > 1) {
            roomString = jQuery("#guests").attr("data-rooms");
          } else {
            roomString = jQuery("#guests").attr("data-room");
          }

          var guestString = "";
          if (guestNumber > 1) {
            guestString = jQuery("#guests").attr("data-guests");
          } else {
            guestString = jQuery("#guests").attr("data-guest");
          }

          //Set the whole string
          var guestsInputString =
            numberOfRoomsParam +
            " " +
            roomString +
            ", " +
            guestNumber +
            " " +
            guestString;

          jQuery("#guests").attr("value", guestsInputString);

          jQuery(".select-occupancy-apply-info-rooms").attr(
            "data-rooms",
            numberOfRoomsParam
          );
          jQuery(".select-occupancy-apply-info-rooms").text(numberOfRoomsParam);

          jQuery(".select-room-value").text(numberOfRoomsParam);
          if (numberOfRoomsParam > 1) {
            jQuery(".select-occupancy-apply-info-rooms-string").text(
              jQuery("#guests").attr("data-rooms")
            );
          } else {
            jQuery(".select-occupancy-apply-info-rooms-string").text(
              jQuery("#guests").attr("data-room")
            );
          }

          jQuery(".select-occupancy-apply-info-guests").attr(
            "data-guests",
            guestNumber
          );
          jQuery(".select-occupancy-apply-info-guests").text(guestNumber);
          if (guestNumber > 1) {
            jQuery(".select-occupancy-apply-info-guests-string").text(
              jQuery("#guests").attr("data-guests")
            );
          } else {
            jQuery(".select-occupancy-apply-info-guests-string").text(
              jQuery("#guests").attr("data-guest")
            );
          }
        });
      }
      //Same logic applied as in hotels, just for chain, because chain can only have 1 room
      else {
        jQuery(".add-room-holder").css("display", "none");

        // childrenAllowedChain();

        if (
          typeof numberOfRoomsParam != "undefined" ||
          numberOfRoomsParam != null
        ) {
          numberOfRoomsParam = 1;
        }

        if (typeof adultsParam != "undefined" || adultsParam != null) {
          var adultsParamArray = adultsParam.split(",");

          var arrayParamArrayNumbers = adultsParamArray.map(Number);

          arrayParamArrayNumbers.length = 1;

          if (arrayParamArrayNumbers[0] > 10) {
            arrayParamArrayNumbers[0] = 1;
          }

          guests[0].adult = parseInt(arrayParamArrayNumbers[0]);
          jQuery(".select-adults-value").text(guests[0].adult);

          if (guests[0].adult > 1) {
            jQuery(".select-adult-minus").prop("disabled", false);
          }

          if (guests[0].adult == 1) {
            jQuery(".select-adult-minus").prop("disabled", true);
          }

          if (guests[0].adult == 10) {
            jQuery(".select-adult-plus").prop("disabled", true);
          }

          if (guests[0].adult < 10) {
            jQuery(".select-adult-plus").prop("disabled", false);
          }

          adultsInput.attr("value", adultsParam);
        }

        if (typeof childrenParam != "undefined" || childrenParam != null) {
          var childrenParamArray = childrenParam.split(",");
          var childrenParamArrayNumbers = childrenParamArray.map(Number);

          childrenParamArrayNumbers.length = 1;

          if (childrenParamArrayNumbers[0] > 10) {
            childrenParamArrayNumbers[0] = 1;
          }
          guests[0].children = parseInt(childrenParamArrayNumbers[0]);
          jQuery(".select-child-value").text(guests[0].children);

          if (guests[0].children > 0) {
            jQuery(".select-child-minus").prop("disabled", false);
          }

          if (guests[0].children == 0) {
            jQuery(".select-child-minus").prop("disabled", true);
          }

          if (guests[0].children == 10) {
            jQuery(".select-child-plus").prop("disabled", true);
          }

          if (guests[0].children < 10) {
            jQuery(".select-child-plus").prop("disabled", false);
          }

          childrenInput.attr("value", childrenParam);
        }

        // If no child ages for childs, set 0
        var childrenAgesParam = getUrlParam("ag");

        if (
          (typeof childrenParam != "undefined" || childrenParam != null) &&
          (typeof childrenAgesParam == "undefined" || childrenAgesParam == null)
        ) {
          var childrenAgesParam = "";

          for (i = 0; i < childrenParamArray.length; i++) {
            var numberOfKidsPerRoom = Number(childrenParamArray[i]);

            for (k = 0; k < numberOfKidsPerRoom; k++) {
              childrenAgesParam += "99";

              if (k != numberOfKidsPerRoom - 1) {
                childrenAgesParam += ";";
              }
            }

            if (i != childrenParamArray.length - 1) {
              childrenAgesParam += ",";
            }
          }
        }

        if (
          typeof childrenAgesParam != "undefined" ||
          childrenAgesParam != null
        ) {
          var childrenAgesParamArray = childrenAgesParam.split(",");

          // loop every room
          for (i = 0; i < numberOfRoomsParam; i++) {
            guests[i].childrenAges = childrenAgesParamArray[i];
            var childrenAges = guests[i].childrenAges.split(";");

            // loop childs
            for (j = 0; j < guests[i].children; j++) {
              // Clones the first child age div and stores it in a variable
              jQuery(".select-child-ages-clone").clone();

              var childAge = jQuery(".select-child-ages-clone").clone().last();

              //Removes the clone class and adds the real class
              childAge.removeClass("select-child-ages-clone");
              childAge.addClass("select-child-ages");

              //Appends the child age clone to the div its supposed to be in
              childAge.appendTo(jQuery(".select-child-ages-holder").eq(i));

              //Appends the apropriate number next to 'Child' eg. Child 1, Child 2, Child 3
              childAge.find(".select-child-ages-number").text(j + 1);

              //Removes the clone class from the input select field and adds the real class
              childAge
                .find(".select-child-ages-input-clone")
                .addClass("select-child-ages-input");
              childAge
                .find(".select-child-ages-input-clone")
                .removeClass("select-child-ages-input-clone");

              childAge
                .find(".select-child-ages-input")
                .find("option[data-value=" + childrenAges[j] + "]")
                .attr("selected", "selected");
            }
          }
          jQuery("#ag").attr("value", childrenAgesParam);
        }

        var guestNumber = 0;

        for (i = 0; i < guests.length; i++) {
          guestNumber = guestNumber + guests[i].adult + guests[i].children;
        }

        var roomString = "";
        if (numberOfRoomsParam > 1) {
          roomString = jQuery("#guests").attr("data-rooms");
        } else {
          roomString = jQuery("#guests").attr("data-room");
        }

        var guestString = "";
        if (guestNumber > 1) {
          guestString = jQuery("#guests").attr("data-guests");
        } else {
          guestString = jQuery("#guests").attr("data-guest");
        }

        //Set the whole string
        var guestsInputString =
          numberOfRoomsParam +
          " " +
          roomString +
          ", " +
          guestNumber +
          " " +
          guestString;

        jQuery("#guests").attr("value", guestsInputString);

        jQuery(".select-occupancy-apply-info-rooms").attr(
          "data-rooms",
          numberOfRoomsParam
        );
        jQuery(".select-occupancy-apply-info-rooms").text(numberOfRoomsParam);
        if (numberOfRoomsParam > 1) {
          jQuery(".select-occupancy-apply-info-rooms-string").text(
            jQuery("#guests").attr("data-rooms")
          );
        } else {
          jQuery(".select-occupancy-apply-info-rooms-string").text(
            jQuery("#guests").attr("data-room")
          );
        }

        jQuery(".select-occupancy-apply-info-guests").attr(
          "data-guests",
          guestNumber
        );
        jQuery(".select-occupancy-apply-info-guests").text(guestNumber);
        if (guestNumber > 1) {
          jQuery(".select-occupancy-apply-info-guests-string").text(
            jQuery("#guests").attr("data-guests")
          );
        } else {
          jQuery(".select-occupancy-apply-info-guests-string").text(
            jQuery("#guests").attr("data-guest")
          );
        }
      }

      //If anything is clicked outside the occupancy div, slide it up
      jQuery(document).mousedown(function (e) {
        var occupancy_dropdown = jQuery("#occupancy_dropdown");

        if (
          !occupancy_dropdown.is(e.target) &&
          occupancy_dropdown.has(e.target).length === 0
        ) {
          occupancy_dropdown.slideUp(200);
          jQuery(".ob-searchbar-guests").removeClass("opened");
        }
      });

      // If it's not a single hotel, disable the option to add multiple rooms, else allow it
      if (
        jQuery("#hotel_code").val() == "" ||
        jQuery("#hotel_code").val() == "0"
      ) {
        // $('.select-room-add').css('display', 'none');
        jQuery(".add-room-holder").css("display", "none");
      } else {
        // $('.select-room-add').css('display', 'block');
        jQuery(".add-room-holder").css("display", "inline-block");
      }

      jQuery("#guests").on("click", function () {
        var occupancyDropdown = jQuery("#occupancy_dropdown");

        //Slide down occupancy dropdown and swap the arrow if it isnt visible
        if (occupancyDropdown.css("display") == "none") {
          occupancyDropdown.slideDown(200);

          jQuery(".ob-searchbar-guests").addClass("opened");
        }

        //Slide up occupancy dropdown and swap the arrow if it is visible
        else {
          occupancyDropdown.slideUp(200);
          jQuery(this).css(
            "background-image"
            // "url(/icons/icons_GreyDark/iconGreyDark_ArrowDown.svg)"
          );
          jQuery(".ob-searchbar-guests").removeClass("opened");
        }
      });

      //Function that runs when input guest input field is clicked

      //Event listener for select single hotel,all hotels or area in the search bar
      jQuery(".hotels_all, .hotels_hotel, .hotels_folder").on(
        "click",
        function () {
          //Remove all rooms if different hotel is selected
          if (jQuery(".select-room").length > 1) {
            jQuery(".select-room").not(":first").remove();
            jQuery(".select-room-divider").css("display", "none");
            //Remove all the rooms from the guests array
            guests.length = 1;
            jQuery("#NRooms").attr("value", 1);
            //Trigger a click on apply, so it would update input fields, update guests array properly and update the strings in apply button and #guests input
            jQuery(".select-occupancy-apply").trigger("click");
            jQuery('.select-room-value').text('1');
            jQuery('.select-room-minus').prop('disabled', true);
          }

          //If it's all hotels or area disable the option to add other rooms
          //Else get the hotel id and currency, and send an AJAX request to check the maximal number of rooms for that hotel
          if (
            jQuery("#hotel_code").val() == "" ||
            jQuery("#hotel_code").val() == "0"
          ) {
            // $('.select-room-add').css('display', 'none');
            jQuery(".add-room-holder").css("display", "none");
          } else {
            //TODO!!! Figure out how to get max rooms
            var hotel_id = parseInt($("#hotel_code").val());
            var currency_id = parseInt(
              jQuery("#occupancy_dropdown").attr("data-default-currency")
            );

            var action = "get_max_rooms";
            var data = {};
            data.hotel_id = JSON.stringify(hotel_id);
            data.currency_id = JSON.stringify(currency_id);
            data.action = action;
            jQuery.post(searchbarAjax.ajaxurl, data, function (response) {
              maxRooms = response;
              if (maxRooms > 1) {
                jQuery(".add-room-holder").css("display", "flex");
                jQuery(".select-room-plus").prop("disabled", false);
              }
            });
          }
        }
      );

      // Adult Buttons

      // Add Adults button
      jQuery(document).on("click", ".select-adult-plus", function () {
        var roomCounter = jQuery(this)
          .closest(".select-room")
          .attr("data-room-counter");

        //Increment value of adults input only if number of adults are bellow limit
        if (guests[roomCounter].adult < 10) {
          guests[roomCounter].adult = guests[roomCounter].adult + 1;
          jQuery(".select-adults-value")
            .eq(roomCounter)
            .text(guests[roomCounter].adult);
        }

        //Disable + button otherwise
        if (guests[roomCounter].adult == 10) {
          jQuery(this).prop("disabled", true);
        }

        //If number of adults is above the minimum enable the - button
        if (guests[roomCounter].adult > 1) {
          jQuery(".select-adult-minus").eq(roomCounter).prop("disabled", false);
        }

        //Change the string in the apply button on each + click
        var applyButtonGuests =
          parseInt(
            jQuery(".select-occupancy-apply-info-guests").attr("data-guests")
          ) + 1;
        jQuery(".select-occupancy-apply-info-guests").attr(
          "data-guests",
          applyButtonGuests
        );
        jQuery(".select-occupancy-apply-info-guests").text(applyButtonGuests);
        if (applyButtonGuests > 1) {
          jQuery(".select-occupancy-apply-info-guests-string").text(
            jQuery("#guests").attr("data-guests")
          );
        } else {
          jQuery(".select-occupancy-apply-info-guests-string").text(
            jQuery("#guests").attr("data-guest")
          );
        }
      });

      //Remove Adults button
      jQuery(document).on("click", ".select-adult-minus", function () {
        var roomCounter = jQuery(this)
          .closest(".select-room")
          .attr("data-room-counter");

        //Reduce value of adults input only if number of adults are above minimum
        if (guests[roomCounter].adult > 1) {
          guests[roomCounter].adult = guests[roomCounter].adult - 1;
          jQuery(".select-adults-value")
            .eq(roomCounter)
            .text(guests[roomCounter].adult);
        }

        // Disable - button otherwise
        if (guests[roomCounter].adult == 1) {
          jQuery(this).prop("disabled", true);
        }

        //If number of adults is bellow the limit enable the + button
        if (guests[roomCounter].adult < 10) {
          jQuery(".select-adult-plus").eq(roomCounter).prop("disabled", false);
        }

        //Change the string in the apply button on each - click
        var applyButtonGuests =
          parseInt(
            jQuery(".select-occupancy-apply-info-guests").attr("data-guests")
          ) - 1;
        jQuery(".select-occupancy-apply-info-guests").attr(
          "data-guests",
          applyButtonGuests
        );
        jQuery(".select-occupancy-apply-info-guests").text(applyButtonGuests);
        if (applyButtonGuests > 1) {
          jQuery(".select-occupancy-apply-info-guests-string").text(
            jQuery("#guests").attr("data-guests")
          );
        } else {
          jQuery(".select-occupancy-apply-info-guests-string").text(
            jQuery("#guests").attr("data-guest")
          );
        }
      });

      // Children Buttons

      // Add Children button
      jQuery(document).on("click", ".select-child-plus", function () {
        var roomCounter = jQuery(this)
          .closest(".select-room")
          .attr("data-room-counter");

        //Increment value of children input only if number of children are bellow limit
        if (guests[roomCounter].children < 10) {
          guests[roomCounter].children = guests[roomCounter].children + 1;
          jQuery(".select-child-value")
            .eq(roomCounter)
            .text(guests[roomCounter].children);

          // Clones the first child age div and stores it in a variable
          jQuery(".select-child-ages-clone").clone();
          var childAge = jQuery(".select-child-ages-clone").clone().last();

          //Removes the clone class and adds the real class
          childAge.removeClass("select-child-ages-clone");
          childAge.addClass("select-child-ages");

          //Appends the child age clone to the div its supposed to be in
          childAge.appendTo(
            jQuery(".select-child-ages-holder").eq(roomCounter)
          );

          //Appends the apropriate number next to 'Child' eg. Child 1, Child 2, Child 3
          childAge
            .find(".select-child-ages-number")
            .text(guests[roomCounter].children);

          //Removes the clone class from the input select field and adds the real class
          childAge
            .find(".select-child-ages-input-clone")
            .addClass("select-child-ages-input");
          childAge
            .find(".select-child-ages-input-clone")
            .removeClass("select-child-ages-input-clone");

          //Change the string in the apply button on each + click
          var applyButtonGuests =
            parseInt(
              jQuery(".select-occupancy-apply-info-guests").attr("data-guests")
            ) + 1;
          jQuery(".select-occupancy-apply-info-guests").attr(
            "data-guests",
            applyButtonGuests
          );
          jQuery(".select-occupancy-apply-info-guests").text(applyButtonGuests);
          if (applyButtonGuests > 1) {
            jQuery(".select-occupancy-apply-info-guests-string").text(
              jQuery("#guests").attr("data-guests")
            );
          } else {
            jQuery(".select-occupancy-apply-info-guests-string").text(
              jQuery("#guests").attr("data-guest")
            );
          }
        }

        //Disable + button otherwise
        if (guests[roomCounter].children == 10) {
          jQuery(this).prop("disabled", true);
        }

        //If number of adults is above the minimum enable the - button
        if (guests[roomCounter].children > 0) {
          jQuery(".select-child-minus").eq(roomCounter).prop("disabled", false);
        }
      });

      //Remove Children button
      jQuery(document).on("click", ".select-child-minus", function () {
        var roomCounter = jQuery(this)
          .closest(".select-room")
          .attr("data-room-counter");

        //Decreases child number if child number is above the minimum, updates the text value between the buttons and removes child select field
        if (guests[roomCounter].children > 0) {
          guests[roomCounter].children = guests[roomCounter].children - 1;
          jQuery(".select-child-value")
            .eq(roomCounter)
            .text(guests[roomCounter].children);

          jQuery(".select-child-ages-holder")
            .eq(roomCounter)
            .find(".select-child-ages")
            .last()
            .remove();
        }

        //Disables the - button if child minimum is reached
        if (guests[roomCounter].children == 0) {
          jQuery(this).prop("disabled", true);
        }

        //Enables the + button if children number is bellow the limit
        if (guests[roomCounter].children < 10) {
          jQuery(".select-child-plus").eq(roomCounter).prop("disabled", false);
        }

        //Change the string in the apply button on each - click
        var applyButtonGuests =
          parseInt(
            jQuery(".select-occupancy-apply-info-guests").attr("data-guests")
          ) - 1;
        jQuery(".select-occupancy-apply-info-guests").attr(
          "data-guests",
          applyButtonGuests
        );
        jQuery(".select-occupancy-apply-info-guests").text(applyButtonGuests);
        if (applyButtonGuests > 1) {
          jQuery(".select-occupancy-apply-info-guests-string").text(
            jQuery("#guests").attr("data-guests")
          );
        } else {
          jQuery(".select-occupancy-apply-info-guests-string").text(
            jQuery("#guests").attr("data-guest")
          );
        }
      });

      jQuery(document).on("click", ".select-room-plus", function () {
        //Clones the first room and appends it to the room holder div
        jQuery(".select-room").eq(0).clone().appendTo(".select-room-holder");

        // Stores the cloned room in a variable and pushes the default settings for the room
        var clonedRoom = jQuery(".select-room").last();

        var defaultRoomSettings = {
          adult: 1,
          children: 0,
          childrenAges: [],
        };
        guests.push(defaultRoomSettings);

        //Sets the appropriate room counter for the cloned room, and shows it next to the Room String
        clonedRoom.attr("data-room-counter", jQuery(".select-room").length - 1);
        clonedRoom
          .find(".select-room-counter")
          .text(parseInt(clonedRoom.attr("data-room-counter")) + 1);

        //Sets the string value of adults and children to the default value
        clonedRoom.find(".select-adults-value").text(defaultRoomSettings.adult);
        clonedRoom
          .find(".select-child-value")
          .text(defaultRoomSettings.children);

        //Enables the + and disables the - just in case
        clonedRoom.find(".select-button-plus").prop("disabled", false);
        clonedRoom.find(".select-button-minus").prop("disabled", true);

        //Removes all the child ages input fields if the 1st room contains any
        clonedRoom.find(".select-child-ages").remove();

        //If Room is added show the divider line
        // jQuery(".select-room-divider").css("display", "block");

        if (maxRooms == jQuery(".select-room").length) {
          jQuery(this).prop("disabled", true);
        }

        var applyButtonGuests =
          parseInt(
            jQuery(".select-occupancy-apply-info-guests").attr("data-guests")
          ) + 1;

        jQuery(".select-occupancy-apply-info-guests").attr(
          "data-guests",
          applyButtonGuests
        );
        jQuery(".select-occupancy-apply-info-guests").text(applyButtonGuests);
        if (applyButtonGuests > 1) {
          jQuery(".select-occupancy-apply-info-guests-string").text(
            jQuery("#guests").attr("data-guests")
          );
        } else {
          jQuery(".select-occupancy-apply-info-guests-string").text(
            jQuery("#guests").attr("data-guest")
          );
        }

        //Change the string in the apply button on each room added
        var applyButtonRooms =
          parseInt(
            jQuery(".select-occupancy-apply-info-rooms").attr("data-rooms")
          ) + 1;
        jQuery(".select-occupancy-apply-info-rooms").attr(
          "data-rooms",
          applyButtonRooms
        );

        jQuery(".select-occupancy-apply-info-rooms").text(applyButtonRooms);
        jQuery(".select-room-value").text(applyButtonRooms);
        if (applyButtonRooms > 1) {
          jQuery(".select-occupancy-apply-info-rooms-string").text(
            jQuery("#guests").attr("data-rooms")
          );
        } else {
          jQuery(".select-occupancy-apply-info-rooms-string").text(
            jQuery("#guests").attr("data-room")
          );
        }

        //Enable - if number of rooms is bigger than minimum
        if (jQuery(".select-room").length > 1) {
          jQuery(".select-room-minus").prop("disabled", false);
        }
      });

      // Remove a Room button

      jQuery(document).on("click", ".select-room-minus", function () {
        var roomCounter = jQuery(".select-room")
          .last()
          .attr("data-room-counter");

        var applyButtonGuests =
          parseInt(
            $(".select-occupancy-apply-info-guests").attr("data-guests")
          ) -
          guests[roomCounter].adult -
          guests[roomCounter].children;
        jQuery(".select-occupancy-apply-info-guests").attr(
          "data-guests",
          applyButtonGuests
        );
        jQuery(".select-occupancy-apply-info-guests").text(applyButtonGuests);
        if (applyButtonGuests > 1) {
          jQuery(".select-occupancy-apply-info-guests-string").text(
            jQuery("#guests").attr("data-guests")
          );
        } else {
          jQuery(".select-occupancy-apply-info-guests-string").text(
            jQuery("#guests").attr("data-guest")
          );
        }

        var applyButtonRooms =
          parseInt($(".select-occupancy-apply-info-rooms").attr("data-rooms")) -
          1;
        jQuery(".select-occupancy-apply-info-rooms").attr(
          "data-rooms",
          applyButtonRooms
        );
        jQuery(".select-occupancy-apply-info-rooms").text(applyButtonRooms);
        jQuery(".select-room-value").text(applyButtonRooms);

        if (jQuery(".select-room").length > 1) {
          jQuery(".select-occupancy-apply-info-rooms-string").text(
            jQuery("#guests").attr("data-rooms")
          );
        } else {
          jQuery(".select-occupancy-apply-info-rooms-string").text(
            jQuery("#guests").attr("data-room")
          );
        }

        guests.splice(roomCounter, 1);

        jQuery(".select-room").last().remove();

        if (maxRooms > jQuery(".select-room").length) {
          jQuery(".select-room-plus").prop("disabled", false);
        }

        if (jQuery(".select-room").length == 1) {
          jQuery(".select-room-minus").prop("disabled", true);
        }
      });

      // show and hide child age
      jQuery(document).on("click", ".age-picker", function () {
        if ($(this).find(".age-picker-options").is(":visible")) {
          $(".age-picker-options").hide();

          $(this).find(".age-picker-options").hide();
        } else {
          $(".age-picker-options").hide();

          $(this).find(".age-picker-options").show();
        }
      });

      // choose age
      jQuery(document).on("click", ".age-picker-options div", function () {
        var age = $(this).data("age");

        $(this).parent().parent().find(".age-picker-value").text(age);

        var selectInput = $(this).parent().next();

        selectInput.children().removeAttr("selected");

        selectInput.find("[data-value='" + age + "']").attr("selected", "");
      });

      //Apply Button
      jQuery(document).on("click", ".select-occupancy-apply", function () {
        var childAgeHolder = jQuery(".select-child-ages-holder");

        var adultsInput = jQuery("#ad");
        var adultsArray = [];

        var childrenInput = jQuery("#ch");
        var childrenArray = [];

        var childrenAgesInput = jQuery("#ag");
        var childrenAgesString = "";

        var numberOfRoomsInput = jQuery("#NRooms");
        var numberOfRooms = jQuery(".select-room").length;

        var guestNumber = 0;

        var roomsAreSame = false;

        for (i = 1; i < numberOfRooms; i++) {
          if (
            guests[0].adult == guests[i].adult &&
            guests[0].children == guests[i].children
          ) {
            roomsAreSame = true;
          } else {
            roomsAreSame = false;
            break;
          }
        }

        //Set all the input values to 0
        adultsInput.attr("value", 0);
        childrenInput.attr("value", 0);
        childrenAgesInput.attr("value", 0);

        //Loop through all the rooms
        for (i = 0; i < jQuery(".select-room").length; i++) {
          //Always reset the children ages array, so it doesen't keep adding values to it if you click apply more than once
          guests[i].childrenAges = [];

          //Get all guest value for the #guests input field
          guestNumber = guestNumber + guests[i].adult + guests[i].children;

          //Loop through all the ages in the current room iteration, and push it to the childrenAges
          for (
            j = 0;
            j < childAgeHolder.eq(i).find(".select-child-ages-input").length;
            j++
          ) {
            guests[i].childrenAges.push(
              childAgeHolder
                .eq(i)
                .find(".select-child-ages-input")
                .eq(j)
                .find("option:selected")
                .attr("data-value")
            );
          }

          //Make a string out of the array, and add ; at the end to separate arrays by room
          childrenAgesString += guests[i].childrenAges.join(";") + ",";

          //Push number of adults and children in to each rooms array
          adultsArray.push(guests[i].adult);
          childrenArray.push(guests[i].children);
        }

        //If there is only 1 room, replace all the commas, with the semicolon
        if (numberOfRooms == 1) {
          childrenAgesString = childrenAgesString.replace(/,/g, ";");
        }

        //Remove last char from the children ages String
        childrenAgesString = childrenAgesString.slice(0, -1);

        //Make a string out of adults and children Array
        var adultsString = adultsArray.join();
        var childrenString = childrenArray.join();

        //Set the input values
        adultsInput.attr("value", adultsString);
        childrenInput.attr("value", childrenString);
        childrenAgesInput.attr("value", childrenAgesString);

        if (roomsAreSame == true) {
          adultsStringTrim = adultsString.split(",");
          adultsInput.attr("value", adultsStringTrim[0]);

          childrenStringTrim = childrenString.split(",");
          childrenInput.attr("value", childrenStringTrim[0]);

          childrenAgesTrim = childrenAgesString.split(",");
          childrenAgesInput.attr("value", childrenAgesTrim[0]);

          numberOfRoomsInput.attr("value", "1");
        } else {
          numberOfRoomsInput.attr("value", numberOfRooms);
        }

        //Getting the strings for #guests input in the search bar, checking if it should be singular, plural
        var roomString = "";
        if (numberOfRooms > 1) {
          roomString = jQuery("#guests").attr("data-rooms");
        } else {
          roomString = jQuery("#guests").attr("data-room");
        }

        var guestString = "";
        if (guestNumber > 1) {
          guestString = jQuery("#guests").attr("data-guests");
        } else {
          guestString = jQuery("#guests").attr("data-guest");
        }

        //Set the whole string
        var guestsInputString =
          numberOfRooms +
          " " +
          roomString +
          ", " +
          guestNumber +
          " " +
          guestString;

        jQuery(".select-occupancy-apply-info-rooms").attr(
          "data-rooms",
          numberOfRooms
        );
        jQuery(".select-occupancy-apply-info-rooms").text(numberOfRooms);
        jQuery(".select-occupancy-apply-info-rooms-string").text(roomString);

        jQuery(".select-occupancy-apply-info-guests").attr(
          "data-guests",
          guestNumber
        );
        jQuery(".select-occupancy-apply-info-guests").text(guestNumber);
        jQuery(".select-occupancy-apply-info-guests-string").text(guestString);

        jQuery("#guests").attr("value", guestsInputString);

        // Check if kids have age

        if (childrenAgesString.includes("/")) {
          jQuery(".search-button, #btn-search").prop("disabled", true);

          jQuery(".select-child-ages-input").each(function (index) {
            if (jQuery(this).val() == "/") {
              jQuery(this).next().show();
            } else {
              jQuery(this).next().hide();
            }
          });
        } else {
          //Close the occupancy dropdown
          jQuery(".incorect-age").hide();
          jQuery(".search-button, #btn-search").prop("disabled", false);
          jQuery("#occupancy_dropdown").slideUp(200);
          jQuery(".ob-searchbar-guests").removeClass("opened");
        }

        // Check if children are allowed

        if (jQuery("#hotel_code").val() != "") {
          childrenAllowed();
        } else {
          childrenAllowedChain();
        }
      });

      // disable submit if children are choosen on hotels which dont allow them

      function childrenAllowed(load) {
        var currencyId = $(".obpress-currencies-select")
          .find(":selected")
          .attr("data-curr");
        var hotelCode = $("#hotel_code").val();
        var selectedChildren = Number($("#ch").val());

        $(".age-picker-options div").hide();

        // prepare ajax request for children availability and max age

        jQuery.get(
          searchbarAjax.ajaxurl +
            "?q=" +
            hotelCode +
            "&currencyId=" +
            currencyId +
            "&action=get_children_availability",
          function (response) {
            var allowed = JSON.parse(response);

            var max_age = allowed[1];

            $(".child-max-age").text(max_age);

            $(".age-picker-options").each(function () {
              for (i = 0; i <= max_age; i++) {
                $(this)
                  .find("div:eq(" + i + ")")
                  .show();
              }
            });

            if (selectedChildren > 0) {
              if (allowed[0] == false) {
                $(".ob-searchbar-submit").attr("disabled", "disabled");

                $("#children-not-allowed-phone").text(response[1]);

                $("#children-not-allowed-email").text(response[2]);

                if (load == "load") {
                  $(".ob-searchbar-submit").trigger("click");
                }
              } else {
                $(".ob-searchbar-submit").removeAttr("disabled");
              }
            } else {
              $(".ob-searchbar-submit").removeAttr("disabled");
            }
          }
        );

        // end of request
      }

      function childrenAllowedChain() {
        $(".child-max-age").text("17");

        $(".age-picker-options div").show();

        $(".ob-searchbar-submit").removeAttr("disabled");
      }
    }
  );
});
