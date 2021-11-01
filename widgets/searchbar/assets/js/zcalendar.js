jQuery(window).on("elementor/frontend/init", function () {
  //hook name is 'frontend/element_ready/{widget-name}.{skin} - i dont know how skins work yet, so for now presume it will
  //always be 'default', so for example 'frontend/element_ready/slick-slider.default'
  //$scope is a jquery wrapped parent element
  elementorFrontend.hooks.addAction(
    "frontend/element_ready/SpecialOffer.default",
    function ($scope, $) {

      /*
       *  zyrgon-calendar.js alpha | http://zyrgon.com | (c) 2020
       */

      moment.tz.setDefault("UTC");

      var ZyrgonCalendar = function (options) {
        //initializing the calendar, first run, and default options

        this.element = options.element;

        this.promo = options.promo;

        if (!window.moment) {
          //no moment, no calendar
          return;
        }

        //set the element and field where calendar will be created
        if (options.field != null) {
          this.widget = options.field;
        } else {
          this.widget = document.querySelector(options.element); //if no element #calendar is default
        }
        // this.field = document.querySelector(".zhs-calendar");
        this.field = this.widget;
        if (this.field == null) {
          // console.log("Sorry, i cant find that element");
          return;
        }

        //set moment settings (locale)
        this.locale = jQuery("#lang_curr").data("code");
        moment.locale(this.locale);

        this.openWith = options.openWith;

        //what to show
        this.showMonthsNum = options.showMonthsNum || 1;

        //output fields hidden and visible
        this.outputDateFormat = options.outputDateFormat || "DDMMYYYY";
        this.outputShowFormat = options.outputShowFormat || "DD/MM/YYYY";

        //min max days allowed to pick
        this.daysMin = options.daysMin || 1; //number of min days allowed to select
        this.daysMax = options.daysMax || null; //number of max days allowed to select

        this.width = options.width;

        //today this month ,ADAPTED FOR NEW TASK

        this.startDate = moment(jQuery("#date_from").val(), "DDMMYYYY").add(
          12,
          "hours"
        );

        this.today = this.startDate;
        this.month = this.today.clone().startOf("month").utc().format("X");

        this.realToday = moment().startOf("day").add(12, "hours");

        //initial setup, without picking dates are today and tomorrow
        this.first = this.today.clone().startOf("day").add(12, "hours"); //first pick
        this.second = this.first
          .clone()
          .add(this.daysMin, "days")
          .startOf("day")
          .add(12, "hours"); //second pick

        //default values
        this.start = this.first.clone();
        this.end = this.second.clone();

        if (options.doFetch || options.doFetch == null) {
          this.doFetch = true;
        } else {
          this.doFetch = false;
        }

        this.disablePromoDates = false;

        this.disablePromoDatesAtQ = 0;

        this.allowDisabledDates = $(".zcalendar").data("allow-unavail");

        this.onSelect = options.onSelect || function () {};

        this.data = {};

        this.hover = null; //holds the hover YMD format

        this.isRangeSelected = true;

        this.fresh = true;

        this.promos = [];

        // check if its new promo or normal request
        this.newRequest = false;

        this.drawCalendar();

        this.setOmnibeesDates();

        this.currencies = {
          1: "Lek",
          2: "?",
          3: "AR$",
          4: "ƒ",
          5: "$",
          6: "$",
          7: "$",
          8: "$",
          9: "p",
          10: "B",
          11: "$",
          12: "$b",
          13: "KM",
          14: "P",
          15: "$",
          16: "R$",
          17: "$",
          18: "?",
          19: "$",
          20: "$",
          21: "CL$",
          22: "¥",
          23: "COP",
          24: "¢",
          25: "k",
          26: "?",
          27: "Kc",
          28: "k",
          29: "RD$",
          30: "$",
          31: "£",
          32: "$",
          33: "k",
          34: "€",
          43: "$",
          44: "F",
          46: "₨",
          47: "Rp",
          50: "?",
          52: "¥",
          56: "?",
          59: "L",
          62: "L",
          64: "RM",
          66: "MXN",
          72: "$",
          76: "k",
          82: "?",
          83: "z",
          85: "l",
          86: "?",
          91: "$",
          94: "R",
          97: "k",
          98: "CHF",
          102: "?",
          104: "T",
          108: "£",
          109: "US$",
          117: "DH",
          118: "MZN",
          119: "VEF",
          120: "S/.",
          121: "?.?",
          122: "₫",
        };

        return this;
      };

      ZyrgonCalendar.prototype.createListeners = function () {
        //date listeners
        var dates = this.field.querySelectorAll(".zc-date");

        for (var i = 0; i < dates.length; i++) {
          //date click listener
          dates[i].addEventListener(
            "click",
            function (e) {
              this.selectDate(e);
            }.bind(this)
          );

          //date hover listener
          dates[i].addEventListener(
            "mouseenter",
            function (e) {
              this.onDateHover(e);
            }.bind(this)
          );
        }

        jQuery(document).mouseup(
          function (e) {
            var container = jQuery(this.field);
            if (
              !container.is(e.target) &&
              container.has(e.target).length === 0
            ) {
              this.hide();
            }
          }.bind(this)
        );

        //escape key unselects dates
        this.widget.onkeydown = function (evt) {
          evt = evt || window.event;
          var isEscape = false;
          if ("key" in evt) {
            isEscape = evt.key === "Escape" || evt.key === "Esc";
          } else {
            isEscape = evt.keyCode === 27;
          }
          if (isEscape) {
            this.unselect();
          }
        }.bind(this);

        //on change refill calendar
        jQuery("#hotel_code").change(this.destinationChange.bind(this));
        // document.querySelector("#hotel_code").addEventListener('change', this.destinationChange.bind(this));
        document
          .querySelector("input[name='c']")
          .addEventListener("change", function () {
            this.destinationChange.bind(this).bind(this);
          });

        //month prev next listners
        jQuery(document).on("click", ".zc-close", this.hide.bind(this));
        jQuery(document).on("click", ".zc-btn-prev", this.prevMonth.bind(this));
        jQuery(document).on("click", ".zc-btn-next", this.nextMonth.bind(this));

        if (this.element == ".zcalendar") {
          // when click on book now
          jQuery(document).on(
            "click",
            "#promoton_redirect",
            this.bookNow.bind(this)
          );
        }

        var use = jQuery(document);

        if (jQuery(this.widget).parent().find(this.openWith).length) {
          use = jQuery(this.widget).parent();
        } else {
          if (
            jQuery(this.widget).parent().parent().find(this.openWith).length
          ) {
            use = jQuery(this.widget).parent().parent();
          }
        }

        // CLICK ON DATE INPUT

        use.on(
          "click",
          this.openWith,
          function () {
            if (jQuery(this.widget).is(":visible")) {
              this.hide();
              jQuery(".ob-searchbar-calendar").removeClass("opened");
            } else {
              this.show();
              jQuery(".ob-searchbar-calendar").addClass("opened");
            }
          }.bind(this)
        );
      };

      ZyrgonCalendar.prototype.show = function () {
        jQuery(this.widget).slideDown(200);
        jQuery(".ob-searchbar-calendar").addClass("opened");
      };

      ZyrgonCalendar.prototype.hide = function () {
        jQuery(this.widget).slideUp(200);
        jQuery(".ob-searchbar-calendar").removeClass("opened");
        jQuery(".section1").css("display", "block");
        jQuery(".header-top-spacer").css("display", "block");
      };

      ZyrgonCalendar.prototype.goToSelection = function () {
        //move calendar to selected
      };

      ZyrgonCalendar.prototype.destinationChange = function () {
        var q = this.getQ();
        if (q != this.disablePromoDatesAtQ) {
          this.disablePromoDates = false;
          this.disablePromoDatesAtQ = 0;
        }

        //change form action
        if (q == "" || q == "0") {
  
          $(".searchbar-form").attr("action", "https://book.omnibees.com/chainresults");

        } else {

           $(".searchbar-form").attr("action", "https://book.omnibees.com/hotelresults");

        }

        this.unselect();
        this.fill();

        return this;
      };

      ZyrgonCalendar.prototype.drawCalendar = function (advanced) {
        if (advanced == "advanced") {
          this.startDate = moment("19112020", "DDMMYYYY").add(12, "hours");
        }

        this.field.innerHTML = "";

        // console.log(this.field,'field');

        //button prev
        var leftBtn = document.createElement("button");
        leftBtn.setAttribute("type", "button");
        leftBtn.classList.add("zc-btn");
        leftBtn.classList.add("zc-btn-prev");
        this.field.appendChild(leftBtn);

        //button next
        var rightBtn = document.createElement("button");
        rightBtn.setAttribute("type", "button");
        rightBtn.classList.add("zc-btn");
        rightBtn.classList.add("zc-btn-next");
        this.field.appendChild(rightBtn);
        //create

        //months
        var months = document.createElement("div");
        months.classList.add("zc-months");
        this.field.appendChild(months);

        //month
        var month = document.createElement("div");
        month.classList.add("zc-month");

        //month info
        var monthInfo = document.createElement("div");
        monthInfo.classList.add("zc-month-info");
        month.appendChild(monthInfo);

        var monthName = document.createElement("span");
        monthName.classList.add("zc-month-name");
        monthInfo.appendChild(monthName);

        var monthYear = document.createElement("span");
        monthYear.classList.add("zc-month-year");
        monthInfo.appendChild(monthYear);

        //week days
        var weekDays = document.createElement("div");
        weekDays.classList.add("zc-weekdays");
        month.appendChild(weekDays);

        var weekDay = document.createElement("div");
        weekDay.classList.add("zc-weekday");

        for (var i = 0; i < 7; i++) {
          weekDays.appendChild(weekDay.cloneNode(true));
        }

        //month dates
        var dates = document.createElement("div");
        dates.classList.add("zc-dates");
        month.appendChild(dates);

        var date = document.createElement("div");
        date.classList.add("zc-date");

        var dateInner = document.createElement("div");
        dateInner.classList.add("zc-date-inner");
        date.appendChild(dateInner);

        var dateBox = document.createElement("div");
        dateBox.classList.add("zc-date-box");
        dateInner.appendChild(dateBox);

        var dateDate = document.createElement("div");
        dateDate.classList.add("zc-date-date");
        dateBox.appendChild(dateDate);

        var datePriceBox = document.createElement("div");
        datePriceBox.classList.add("zc-date-price");
        dateBox.appendChild(datePriceBox);

        //make fields for of the month (7 days per week, max 6 weeks = 42)
        for (i = 0; i < 42; i++) {
          dates.appendChild(date.cloneNode(true));
        }

        //duplicate month
        for (i = 0; i < this.showMonthsNum; i++) {
          months.appendChild(month.cloneNode(true));
        }
        if (this.doFetch) {
          var info = document.createElement("div");
          var infoDetailsPrices =
            "" + this.field.getAttribute("data-unavilable");
          var infoDetailsPromo =
            '<span class="zc-info-bar-promo"></span> ' +
            this.field.getAttribute("data-promotional");
          info.innerHTML = infoDetailsPrices + infoDetailsPromo;
          info.classList.add("zc-info-bar");
          this.field.appendChild(info);

          var close = document.createElement("div");
          close.classList.add("zc-close");
          close.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><path id="icon_Xclose" d="M17,6.209,15.791,5,11,9.791,6.209,5,5,6.209,9.791,11,5,15.791,6.209,17,11,12.209,15.791,17,17,15.791,12.209,11Z" transform="translate(-5 -5)" fill="#000"/></svg>';
          this.field.appendChild(close);
        }
        this.fill();
        this.createListeners();

        return this;
      };

      // press on the next button
      ZyrgonCalendar.prototype.nextMonth = function (monthDifference) {
        this.month = moment(this.month, "X").add("1", "M").utc().format("X");
        this.field.querySelector(".zc-btn-prev").disabled = false;
        this.fill();
        return this;
      };

      // press on the prev button (check if its current month, do not allow back)
      ZyrgonCalendar.prototype.prevMonth = function () {
        var monthM = moment(this.month, "X");

        if (moment().isSame(monthM.utc().format("YYYY-MM-DD"), "month")) {
          this.field.querySelector(".zc-btn-prev").disabled = true;
          return this;
        } else {
          this.month = monthM.subtract("1", "M").utc().format("X");
          // console.log(this.month);
        }

        this.fill();
        return this;
      };

      // return month when open advanced search after error
      ZyrgonCalendar.prototype.prevMonthAdv = function (begginingUnix) {
        this.month = begginingUnix;
        this.fill();
        return this;
      };

      ZyrgonCalendar.prototype.gotoDate = function (unix) {
        var monthM = moment(this.month, "X").startOf("month");
        this.month = monthM.utc().format("X");
      };

      ZyrgonCalendar.prototype.unselect = function () {
        var today = moment();
        this.isRangeSelected = true;
        this.fresh = true;
        this.setRange(this.first, this.second);
        this.fill();
      };

      ZyrgonCalendar.prototype.selectDate = function (e) {
        var target = e.target ? e.target : e.srcElement;
        var target = this.getDateElement(target);
        if (target.hasAttribute("data-disabled")) return; // if date is disabled you cant select it

        var day = moment(target.getAttribute("data-unix"), "X");

        if (!day.isValid()) return; // if date doesnt have the unix timestamp you cant select it

        this.fresh = false; //calendar is not fresh any more, someone picked a date

        var dates = this.field.querySelectorAll("." + target.className);
        if (this.isRangeSelected == true) {
          //first date picked

          this.first = day.clone();
          this.second = this.first.clone().add(this.daysMin, "days"); // set second to min days of first
          this.isRangeSelected = false;
          this.setRange(this.first, this.second);
          this.showSingle(this.first); //if single date
        } else {
          //now its a full range
          if (this.first.utc().format("X") == day.utc().format("X")) return; //you cant pick the same date

          this.second = day.clone();
          this.isRangeSelected = true;
          this.setRange(this.first, this.second);
          this.showRange(this.start, this.end);

          this.hide();
        }
        // console.log(this.isRangeSelected);
        this.onSelect();

        this.showDisabled();

        return this;
      };

      ZyrgonCalendar.prototype.setRange = function (first, second) {
        //first, second date
        this.start = this.second.isAfter(this.first)
          ? this.first.clone()
          : this.second.clone();
        this.end = this.second.isAfter(this.first)
          ? this.second.clone()
          : this.first.clone();

        this.setOmnibeesDates(this.start, this.end);
        // this.isRangeSelected = true;
        this.fresh = false;

        this.showRange(this.start, this.end);
      };

      ZyrgonCalendar.prototype.setDateRange = function (first, second) {
        this.first = first.clone().startOf("day").add(12, "hours");
        this.start = first.clone().startOf("day").add(12, "hours");
        this.second = second.clone().startOf("day").add(12, "hours");
        this.end = second.clone().startOf("day").add(12, "hours");
        this.setRange(this.start, this.end);
        // this.showRange(this.start,this.end);
        this.onSelect();
        // this.fill();
      };

      ZyrgonCalendar.prototype.showRange = function (firstM, secondM) {
        var q = this.getQ();

        var dates = this.field.querySelectorAll(".zc-date");
        if (this.fresh == true) {
          //unselect all
          for (i = 0; i < dates.length; i++) {
            this.showDateClean(dates[i]);
          }
          return;
        }

        var start = secondM.isAfter(firstM) ? firstM.clone() : secondM.clone();
        var end = secondM.isAfter(firstM) ? secondM.clone() : firstM.clone();

        var startUnix = Number(start.utc().format("X"));
        var endUnix = Number(end.utc().format("X"));

        var first = this.first.utc().format("X");
        var firstAvailStart = null;
        var firstAvailEnd = null;

        for (i = 0; i < dates.length; i++) {
          this.showDateClean(dates[i]); //clean out the data attributes

          var unix =
            dates[i].getAttribute("data-unix") != null
              ? Number(dates[i].getAttribute("data-unix"))
              : null;

          if (unix == null) continue; //skip if null

          if (unix >= startUnix && unix <= endUnix) {
            dates[i].setAttribute("data-in-range", "true");
          }

          if (unix == startUnix) {
            dates[i].setAttribute("data-start", "true");

            if (this.isRangeSelected == true) {
              dates[i].setAttribute("data-title", "Check In");
            }
          }

          if (unix == endUnix) {
            dates[i].setAttribute("data-end", "true"); //set end
            if (this.isRangeSelected == true) {
              dates[i].setAttribute("data-title", "Check Out");
            }
          }

          var nights = this.getNights(start, end);

          if (
            this.isRangeSelected == false &&
            this.hover != null &&
            unix == this.hover.utc().format("X")
          ) {
            if (nights == 1) {
              dates[i].setAttribute(
                "data-title",
                nights + " " + jQuery("[data-night]").eq(0).data("night")
              );
            } else {
              dates[i].setAttribute(
                "data-title",
                nights + " " + jQuery("[data-nights]").eq(0).data("nights")
              );
            }
          }

          if (
            this.isRangeSelected == true &&
            dates[i].getAttribute("data-title") == null
          ) {
            dates[i].setAttribute("data-title", "Check In");
          }
        }

        return this;
      };

      ZyrgonCalendar.prototype.showSingle = function (firstM) {
        var q = this.getQ();
        var first = firstM.utc().format("X");
        var dates = this.field.querySelectorAll(".zc-date");
        for (i = 0; i < dates.length; i++) {
          this.showDateClean(dates[i]); //clean out the data attributes

          var unix =
            dates[i].getAttribute("data-unix") != null
              ? Number(dates[i].getAttribute("data-unix"))
              : null;

          if (unix == null) continue; //skip if null

          if (unix == first) {
            dates[i].setAttribute("data-first", "true");
          }
        }
        return this;
      };

      ZyrgonCalendar.prototype.showDateClean = function (dateDiv) {
        var q = this.getQ();

        dateDiv.removeAttribute("data-start");
        dateDiv.removeAttribute("data-end");
        dateDiv.removeAttribute("data-in-range");
        dateDiv.removeAttribute("data-first");

        var unix = dateDiv.getAttribute("data-unix");

        if (
          this.data[q] != null &&
          this.data[q].calendar[unix] != null &&
          this.data[q].calendar[unix].promo == true
        ) {
          dateDiv.setAttribute("data-promo", "true");
          dateDiv.setAttribute("data-title", jQuery(this.field).data("promo"));
        } else {
          dateDiv.removeAttribute("data-promo");
        }

        if (this.fresh == false) {
          dateDiv.removeAttribute("data-title");
        }
        return this;
      };

      ZyrgonCalendar.prototype.getQ = function () {
        var qInput = document.querySelector("input[name='q']").value;
        // console.log(qInput,'qInput')
        if (qInput == null) {
          q = 0;
        } else {
          q = Number(qInput);
        }
        return Number(q);
      };

      //display disabled dates
      ZyrgonCalendar.prototype.showDisabled = function () {
        var q = this.getQ();

        var disableBefore = this.first
          .clone()
          .subtract(this.daysMax - 1, "days")
          .format("X");
        var disableAfter = this.first
          .clone()
          .add(this.daysMax - 1, "days")
          .format("X");
        //yesterday unix
        var today = this.realToday.format("X");

        var first = this.first
          .clone()
          .startOf("day")
          .add(12, "hours")
          .format("X");

        //disabled all unavailable dates before
        var prevDisabled = null;
        var nextDisabled = null;

        var dates = this.field.querySelectorAll(".zc-date");

        //find first disabled before the picked time
        if (this.isRangeSelected == false) {
          for (i = 0; i < dates.length; i++) {
            var date = dates[i].getAttribute("data-unix");
            if (date == null) continue;
            var unix = Number(date);
            if (
              this.data[q] != null &&
              this.data[q].calendar[unix] != null &&
              this.data[q].calendar[unix].available == false &&
              unix < first
            ) {
              prevDisabled = unix;
            }
          }
        }

        // ako je promo, uzmi datume i pretvori ih u Unix

        if (this.promo == true) {
          var offerDates = jQuery(".date-range");
          var startPromoDates = [];
          var endPromoDates = [];

          jQuery.each(offerDates, function (index, value) {
            var dataStart = value.getAttribute("data-start");
            var dataEnd = value.getAttribute("data-end");

            var startPromoDateSubstring = dataStart.substring(0, 10);
            var endPromoDateSubstring = dataEnd.substring(0, 10);

            var startPromoDateMoments =
              moment(startPromoDateSubstring).unix() + 43200;

            // end one day to end date, visitor will check out day after last day of promo
            var endPromoDateMoments =
              moment(endPromoDateSubstring).unix() + 43200 + 86400;

            startPromoDates.push(startPromoDateMoments);
            endPromoDates.push(endPromoDateMoments);
          });
        }

        // start of loop
        for (i = 0; i < dates.length; i++) {
          dates[i].removeAttribute("data-disabled");

          dates[i].removeAttribute("data-gray");

          var date = dates[i].getAttribute("data-unix");

          if (date == null) continue; //skip one if null

          // If it is promo calendar and its not offer date, disable that date
          if (this.promo == true) {
            dates[i].setAttribute("data-disabled", "true");

            for (j = 0; j < startPromoDates.length; j++) {
              if (
                Number(dates[i].getAttribute("data-unix")) >=
                  startPromoDates[j] &&
                Number(dates[i].getAttribute("data-unix") <= endPromoDates[j])
              ) {
                dates[i].removeAttribute("data-disabled");
              }
            }
          }

          var unix = Number(date); //unix timestamp

          //disable dates before today
          if (unix < today) {
            dates[i].setAttribute("data-disabled", "true");
            continue;
          }
          if (this.disablePromoDates && this.promos.length > 0) {
            if (this.promos.includes(unix)) {
              dates[i].removeAttribute("data-disabled");
            }
          }

          if (this.isRangeSelected == true) {
            //range is selected

            if (
              this.data[q] != null &&
              this.data[q].calendar[unix] != null &&
              this.data[q].calendar[unix].available == false
            ) {
              dates[i].setAttribute("data-gray", "true");
            }
          } else {
            //first date is selected
            if (
              this.data[q] != null &&
              this.data[q].calendar[unix] != null &&
              this.data[q].calendar[unix].available == false
            ) {
              dates[i].setAttribute("data-gray", "true");
            }

            //disable outside max date range
            if (unix != 0 && (unix < disableBefore || unix > disableAfter)) {
              dates[i].setAttribute("data-disabled", "true");
              continue;
            }

            // keep current disabled dates until picked date
            if (
              unix != 0 &&
              unix < first &&
              this.data[q] != null &&
              this.data[q].calendar[unix] != null &&
              this.data[q].calendar[unix].available == false
            ) {
              if (this.allowDisabledDates == false) {
                dates[i].setAttribute("data-disabled", "true");
              }

              continue;
            }

            // shift dates after picked date by 1
            var dayAfter = Number(
              moment(unix, "X")
                .subtract(1, "days")
                .startOf("day")
                .add(12, "hours")
                .format("X")
            );
            if (
              unix != null &&
              unix > first &&
              this.data[q].calendar[dayAfter] != null &&
              this.data[q].calendar[dayAfter].available == false
            ) {
              if (nextDisabled == null) {
                nextDisabled = unix;
              }

              if (this.allowDisabledDates == false) {
                dates[i].setAttribute("data-disabled", "true"); // novo
              }

              continue;
            }

            //shift disabled promo dates dates
            if (this.disablePromoDates && this.promos.length > 0) {
              var dayBefore = Number(
                moment(unix, "X")
                  .subtract(1, "days")
                  .startOf("day")
                  .add(12, "hours")
                  .format("X")
              );
              // console.log(this.promos, dayBefore);
              if (
                unix != null &&
                unix > first &&
                this.promos.includes(dayBefore)
              ) {
                if (this.allowDisabledDates == false) {
                  dates[i].removeAttribute("data-disabled"); // novo
                }
              }
              continue;
            }

            //disable dates before the first previously disabled date
            if (prevDisabled != null && unix < prevDisabled) {
              if (this.allowDisabledDates == false) {
                dates[i].setAttribute("data-disabled", "true"); // novo
              }

              continue;
            }

            //disable dates after the first next disabled dates
            if (nextDisabled != null && unix >= nextDisabled) {
              if (this.allowDisabledDates == false) {
                dates[i].setAttribute("data-disabled", "true"); //novo
              }
            }
          }

          // Gray out the day after last promo date
          if (this.promo == true) {
            for (k = 0; k < startPromoDates.length; k++) {
              if (
                Number(dates[i].getAttribute("data-unix")) >=
                  startPromoDates[k] &&
                Number(dates[i].getAttribute("data-unix") <= endPromoDates[k])
              ) {
                dates[i].removeAttribute("data-gray");
              }
            }
          }
        } // end of loop
      };

      ZyrgonCalendar.prototype.onDateHover = function (e) {
        var target = this.getDateElement(e.target);
        if (target == null) return;
        var unix = target.getAttribute("data-unix");
        if (unix == null) return;

        if (target.getAttribute("data-disabled") != null) return;
        this.hover = moment(unix, "X");

        if (target.hasAttribute("data-disabled")) return;

        if (this.isRangeSelected == false) {
          //on first date picked, on hover makes the start (current date) - end (hovered date) range visible
          if (unix == this.first.format("X")) {
            target.setAttribute("data-first", "true");
            this.showSingle(this.first);
            return;
          } else {
            this.showRange(this.first, this.hover);
          }
        }
      };

      ZyrgonCalendar.prototype.getDateElement = function (el) {
        //on inside date click, sometimes we click on some inner div, and it doesnt contain date data, so we need to go into parents div
        for (var i = 0; i < 4; i++) {
          // go only 3 times
          if (el.className == "zc-date") {
            return el;
          }
          el = el.parentElement;
        }
        return null;
      };

      //nights between 2 moments
      ZyrgonCalendar.prototype.getNights = function (first, second) {
        return Math.abs(first.diff(second, "days"));
      };

      //setters
      ZyrgonCalendar.prototype.setStart = function (moment) {
        this.start = moment;
      };
      ZyrgonCalendar.prototype.setEnd = function (moment) {
        this.end = moment;
      };

      ZyrgonCalendar.prototype.setOmnibeesDates = function () {
        //set checkin and checkout
      };

      //fill in the design
      ZyrgonCalendar.prototype.fill = function () {
        this.fillMonths(); //fill dates and all

        //fetch 2 month intervals for dates on screen
        this.fetchDates();

        this.showRange(this.start, this.end);
        this.showDisabled();

        return this;
      };

      //fill in the design
      ZyrgonCalendar.prototype.fillAdvanced = function (
        firstAvailStartAdvanced
      ) {
        this.startDate = firstAvailStartAdvanced;

        this.fillMonths(); //fill dates and all

        this.doFetch = true;

        this.openAdvancedWithError = true;

        //fetch 2 month intervals for dates on screen
        this.fetchDates();

        this.showRange(this.start, this.end);
        this.showDisabled();

        return this;
      };

      //draw all months
      ZyrgonCalendar.prototype.fillMonths = function () {
        for (var i = 0; i < this.showMonthsNum; i++) {
          this.fillMonth(i);
        }
        return this;
      };

      ZyrgonCalendar.prototype.fillMonth = function (i) {
        var q = this.getQ();

        var month = moment(this.month, "X").clone().add(i, "months"); //first month that is picked

        var first = month.clone().startOf("month"); //first day of the month
        var last = month.clone().endOf("month"); //last day of the month

        if (this.data[q] == null) {
          this.data[q] = {};
          this.data[q].calendar = {};
        }

        var monthDiv = this.field.querySelectorAll(".zc-month")[i];
        monthDiv.querySelector(".zc-month-name").innerHTML =
          month.format("MMMM") + ",";
        monthDiv.querySelector(".zc-month-year").innerHTML =
          month.format("YYYY");

        var week = first.clone().startOf("week");

        var weekDays = [];
        var weekFields = monthDiv.querySelectorAll(".zc-weekday");
        for (var i = 0; i < 7; i++) {
          weekFields[i].innerHTML = week.format("ddd").substring(0, 2);
          week.add("1", "days");
        }

        var calendar = [];

        for (i = 0; i < first.weekday(); i++) {
          calendar.push(null);
        }

        var day = first.clone().startOf("day").add(12, "hours");

        while (!day.isAfter(last, "day")) {
          calendar.push(day);
          day = day.clone().add(1, "days").startOf("day").add(12, "hours");
        }

        var lang = Number(jQuery("#lang_curr").attr("data-lang"));

        var dates = monthDiv.querySelectorAll(".zc-date");
        var firstNonFetched = null;

        for (i = 0; i < 42; i++) {
          dates[i].querySelector(".zc-date-price").innerHTML = "";

          if (calendar[i] != null) {
            var unix = Number(calendar[i].format("X"));

            dates[i].setAttribute("data-unix", unix);
            dates[i].querySelector(".zc-date-date").innerHTML =
              calendar[i].format("D");

            if (this.data[q].calendar[unix] != null) {
              if (this.data[q].calendar[unix].available == false) {
                dates[i].setAttribute("data-disabled", "true");
              } else {
                //price in front or back depends on the language
                var currency = this.data[q].calendar[unix].currency;
                currency = this.currencies[currency];
                var value = this.data[q].calendar[unix].price.toFixed(2);
                var price = value + currency;

                if (lang != 1 && currency != "COP") {
                  var vp = value.split(".");
                  value = vp[0];
                }

                if (lang == 1 || lang == 8) {
                  price = currency + value;
                } else {
                  price = value + currency;
                }

                if (currency == "COP") {
                  var valuta = " mil";

                  if (lang == 1 || lang == 2) {
                    var valuta = " k";
                  }

                  price = Math.floor(value / 1000) + valuta;
                }

                dates[i].querySelector(".zc-date-price").innerHTML = price;
                dates[i].setAttribute("data-title", "Check In");
              }
            }
          } else {
            //non day
            dates[i].removeAttribute("data-closed");
            dates[i].querySelector(".zc-date-date").innerHTML = "";
            dates[i].querySelector(".zc-date-price").innerHTML = "";
            dates[i].removeAttribute("data-title");
            dates[i].removeAttribute("data-unix");
          }
        }

        return this;
      };

      //this.addDate(q, x, avail, price, currency, promo, open);
      ZyrgonCalendar.prototype.hasDate = function (q, unix) {
        if (!this.data.hasOwnProperty(q)) {
          this.data[q] = {};
          this.data[q].calendar = {};
        }
        if (this.data[q].calendar.hasOwnProperty(unix)) {
          return true;
        }
        return false;
      };

      //this.addDate(q, x, avail, price, currency, promo, open);
      ZyrgonCalendar.prototype.addDate = function (
        q,
        unix,
        avail,
        price,
        currency,
        promo,
        open
      ) {
        if (!this.data.hasOwnProperty(q)) {
          this.data[q] = {};
          this.data[q].calendar = {};
        }

        this.data[q].calendar[unix] = {};
        this.data[q].calendar[unix].available = avail;
        this.data[q].calendar[unix].price = price;
        this.data[q].calendar[unix].currency = currency;
        this.data[q].calendar[unix].promo = promo;
        this.data[q].calendar[unix].open = open;
      };

      ZyrgonCalendar.prototype.fetchDates = function () {
        if (this.doFetch == false) return;

        var q = this.getQ(); //get hotel id, if its 0 it is chain

        var c = null;

        if (q === 0) {
          // it is chain
          c = Number(document.querySelector("input[name='c']").value);
        }

        // GET FOLDER, IF ITS CLICKED ,FIND IS THERE ONLY ONE HOTEL IN IT AND SELECT IT

        var hotelFolder = jQuery("#hotel_folder").val();

        if (hotelFolder !== "") {
          var folderChildren = jQuery(
            "form .hotels_hotel[data-parent-id='" + hotelFolder + "']"
          );

          var folderChildrenNumber = folderChildren.length;

          if (folderChildrenNumber == 1) {
            q = folderChildren.attr("data-id");
            c = null;
            //$("#hotel_code").val(q);
            //$("#hotel_folder").val("");
          }
        }

        // IF MORE THAN ONE HOTEL IS SELECTED, DONT SEND REQUEST, LEAVE DATES EMPTY

        if (q === 0) return;

        var datesDivs = this.field.querySelectorAll(".zc-date[data-unix]");

        if (datesDivs.length == 0) return; //nothing to do

        var firstUnix = Number(datesDivs[0].getAttribute("data-unix"));
        var lastUnix = Number(
          datesDivs[datesDivs.length - 1].getAttribute("data-unix")
        );

        //first and last date are fetched, nothing to do here, ne dopusta da se pokrene ako je popunjen kalendar

        // ALI AKO JE PROMO A POSLAT JE OBICAN, ILI OBRNUTO, PUSTI GA DALJE

        if (
          this.hasDate(q, lastUnix) &&
          this.hasDate(q, firstUnix) &&
          this.newRequest == false
        )
          return;

        this.newRequest = false;

        //find first non checked and go 2 months from that one
        var unix = firstUnix;
        for (var i = 0; i < datesDivs.length; i++) {
          unix = Number(datesDivs[i].getAttribute("data-unix"));
          if (!this.hasDate(q, unix)) {
            break;
          }
        }

        //save all dates
        var firstM = moment(unix, "X").startOf("day").add(12, "hours");
        var first = firstM.format("YYYY-MM-DD");

        var secondM = firstM
          .clone()
          .add(1, "months")
          .endOf("month")
          .startOf("day")
          .add(12, "hours");
        var second = secondM.format("YYYY-MM-DD");

        //save all days into an array, because the api is responding only with a list of available days
        //later we compare this list with the available days to get unavailable days
        var dates = [];
        var day = firstM;
        while (!day.isAfter(secondM, "day")) {
          dates.push(Number(day.format("X")));
          day = day.clone().add(1, "days").startOf("day").add(12, "hours");
        }

        var xhr = new XMLHttpRequest();

        xhr.onload = function () {
          if (xhr.status == 500) {
            //try again, wait 5ms
            setTimeout(
              function () {
                this.fill();
              }.bind(this),
              5
            );
          }
          if (xhr.status >= 200 && xhr.status < 300) {
            var available = []; //temp to save avail dates
            var res = xhr.response ? xhr.response : xhr.responseText;

            // res = JSON.stringify(res);

            var arr = JSON.parse(res);

            for (var i = 0; i < arr.length; i++) {
              var x = Number(
                moment(arr[i].date).startOf("day").add(12, "hours").format("X")
              );

              var open = false;
              if (arr[i].status == "Open") {
                open = true;
              }

              var avail = true;
              var price = arr[i].price;
              var currency = arr[i].currency;
              var promo = arr[i].promo;
              var fetched = true;

              this.addDate(q, x, avail, price, currency, promo, open);
              available.push(x);
            }

            //compare available days with all days to get unavailable days (disabled)
            for (var i = 0; i < dates.length; i++) {
              if (!available.includes(dates[i])) {
                this.addDate(q, dates[i], false, 0, 0, false, false);
              }
            }

            this.fill();
          } else {
            // console.log("error, cant fetch, try again ");
          }
        }.bind(this);

        var currencyId = jQuery("#occupancy_dropdown").attr(
          "data-default-currency"
        );

        if (this.promo == true) {
          var packageId = jQuery(".section3").attr("data-packageid");

          var languageId = jQuery("#lang_curr").attr("data-lang");

          xhr.open(
            "GET",
            "/availability/offer/" +
              q +
              "/" +
              currencyId +
              "/" +
              packageId +
              "/" +
              languageId,
            true
          );
        } else if (c == null && this.promo !== true) {
          var action = "get_hotel_availability";
          // xhr.open('GET', searchbarAjax.ajaxurl+'?'+q+'/'+currencyId+'/'+first+'/'+ second, true);

          xhr.open(
            "GET",
            searchbarAjax.ajaxurl +
              "?q=" +
              q +
              "&currency_id=" +
              currencyId +
              "&first=" +
              first +
              "&second=" +
              second +
              "&action=" +
              action,
            true
          );
        } else {
          var action = "get_chain_availability";

          var chain = jQuery("input[name='c']").attr("value");
          xhr.open(
            "GET",
            searchbarAjax.ajaxurl +
              "?chain=" +
              chain +
              "&currency_id=" +
              currencyId +
              "&first=" +
              first +
              "&second=" +
              second +
              "&action=" +
              action,
            true
          );
        }

        xhr.setRequestHeader(
          "Content-type",
          "application/x-www-form-urlencoded"
        );

        xhr.send();

        return this;
      };

      // PROMO CALENDAR

      ZyrgonCalendar.prototype.bookNow = function () {
        // pick hotel
        var hotel_id = jQuery("#hotel").attr("data-hotel-id");

        jQuery("#hotel_code").val(hotel_id); //set hotel id

        jQuery("#as-hotel-id").val(hotel_id); //set hotel id

        jQuery("#hotel_code").trigger("change");

        jQuery("#hotels").val(
          jQuery(".hotels_hotel[data-id=" + hotel_id + "]")
            .eq(0)
            .text()
        ); //set hotel name

        //create input
        if (jQuery("#promotion_id").val() != null) {
          var promotion_id = jQuery("#promotion_id").val();
          var prid = document.createElement("input");
          prid.setAttribute("type", "hidden");
          prid.setAttribute("name", "prid");
          prid.value = promotion_id;
          jQuery(".search").eq(0).prepend(prid);
        }

        //replace to go to step2
        var action = jQuery("#hotel_search").attr("action");
        action = action.replace(/chainresults/g, "hotelresults");
        jQuery("#hotel_search").attr("action", action);

        if (width < 992) {
          jQuery(".menu_icon").attr("data-active", "false");

          if (jQuery(".header-search-bar").is(":visible")) {
            jQuery(".header-search-bar").hide();
          } else {
            jQuery(".menu_icon").attr("data-active", "false");
            jQuery(".mobile_search").attr("data-active", "true");
            jQuery(".mob-menu-toggle").hide();
            jQuery(".header-search-bar").show();
          }

          jQuery("#hotel_search").slideToggle(50, function () {
            if (jQuery(this).is(":visible")) {
              jQuery(this).css("display", "block");
            }
          });

          jQuery(".section1").css("display", "none");
          jQuery(".header-top-spacer").css("display", "none");
        }

        if (jQuery(".zcalendar").is(":visible")) {
          jQuery(".zcalendar").slideUp(200);
        } else {
          jQuery(".zcalendar").slideDown(200);
        }

        // find promo dates from data attribute, and set it in inputs

        var offerDates = jQuery(".date-range");

        var startPromoDates = [];

        var endPromoDates = [];

        var startPromoDatesSlash = [];

        var endPromoDatesSlash = [];

        jQuery.each(offerDates, function (index, value) {
          var dataStart = value.getAttribute("data-start");
          var dataEnd = value.getAttribute("data-end");

          var startPromoDateSubstring = dataStart.substring(0, 10);
          var endPromoDateSubstring = dataEnd.substring(0, 10);

          var startPromoDateMoment = moment(startPromoDateSubstring).format(
            "DDMMYYYY"
          );
          var endPromoDateMoment = moment(endPromoDateSubstring).format(
            "DDMMYYYY"
          );

          var startPromoDateMomentSlash = moment(
            startPromoDateSubstring
          ).format("DD/MM/YYYY");
          var endPromoDateMomentSlash = moment(endPromoDateSubstring).format(
            "DD/MM/YYYY"
          );

          startPromoDates.push(startPromoDateMoment);
          endPromoDates.push(endPromoDateMoment);

          startPromoDatesSlash.push(startPromoDateMomentSlash);
          endPromoDatesSlash.push(endPromoDateMomentSlash);
        });

        // ako nema datum, izadji
        if (startPromoDates.length == 0) return;

        // change dates in hidden input
        jQuery("#date_from").val(startPromoDates[0]);

        jQuery("#date_to").val(endPromoDates[0]);

        // change dates in dates input

        jQuery("#calendar_dates").val(
          startPromoDatesSlash[0] + " - " + endPromoDatesSlash[0]
        );

        //FIND DATE IN CHECK IN INPUT, AND SET IT AS START DATE IN CALENDAR

        this.startDate = moment(jQuery("#date_from").val(), "DDMMYYYY").add(
          12,
          "hours"
        );

        this.today = this.startDate;

        this.month = this.today.clone().startOf("month").utc().format("X");

        this.realToday = moment().startOf("day").add(12, "hours");

        // if click on date, promo is on and request is new, fill normal dates
        if (this.promo == false) {
          this.promo = true;
          this.newRequest = true;
          this.fill();
        }

        return this;
      };

      // get language number
      var lang_number = jQuery("#lang_curr").attr("data-lang");

      var widget = new ZyrgonCalendar({
        element: ".zcalendar",
        openWith: "#calendar_dates",
        showMonthsNum: 4 /* min days to pick */,
        daysMax: 91 /* max days allowed to pick */,
        doFetch: true,
        promo: false,
        onSelect: function () {
          document.querySelector("input[name='CheckIn']").value =
            this.start.format(this.outputDateFormat);
          document.querySelector("input[name='CheckOut']").value =
            this.end.format(this.outputDateFormat);

          if (jQuery("#as-date-from").length) {
            document.querySelector("#as-date-from").value = this.first.format(
              this.outputDateFormat
            );
            document.querySelector("#as-date-to").value = this.end.format(
              this.outputDateFormat
            );
          }

          //set dates to be shown

          var range = this.start.format(this.outputShowFormat);

          if (lang_number == 1) {
            range = moment(range, "DD/MM/YYYY").format("MM/DD/YYYY");
          }

          // .innerHTML = this.start.format(this.outputShowFormat);
          if (this.isRangeSelected == true) {
            // if second date is good

            if (lang_number != 1) {
              range = range + " - " + this.end.format(this.outputShowFormat);
            }

            if (lang_number == 1) {
              var end_date = this.end.format(this.outputShowFormat);
              range =
                range +
                " - " +
                moment(end_date, "DD/MM/YYYY").format("MM/DD/YYYY");
            }

            jQuery("input[name='CheckOut']").trigger("change");
          } else {
            range = range + " - " + " . . . ";
          }
          document.querySelector("#calendar_dates").value = range;
          // document.querySelector("#as-date-from").value = this.start.format(this.outputDateFormat);
          // document.querySelector("#as-date-to").value = this.end.format(this.outputDateFormat);
        },
      });

      // SHOW SELECTED DATES IN STEP 2

      this.startDate =
        moment(jQuery("#date_from").val(), "DDMMYYYY").unix() + 43200;

      var endDate = moment(jQuery("#date_to").val(), "DDMMYYYY").unix() + 43200;
      // console.log(endDate);
      jQuery(".zc-dates")
        .find("div[data-unix=" + this.startDate + "]")
        .click();

      jQuery(".zc-dates")
        .find("div[data-unix=" + endDate + "]")
        .click();

      jQuery(window).on("elementor/frontend/init", function () {
        //hook name is 'frontend/element_ready/{widget-name}.{skin} - i dont know how skins work yet, so for now presume it will
        //always be 'default', so for example 'frontend/element_ready/slick-slider.default'
        //$scope is a jquery wrapped parent element
        elementorFrontend.hooks.addAction(
          "frontend/element_ready/Searchbar.default",
          function ($scope, $) {
            /* getting url params */

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
                cloned.css("padding-left", (level + 1) * 10 + 10 + "px");
                hotels_div.append(cloned);
                getFolderChildren(folders[i].PropertyFolderUID, level + 1);
              }
              //list hotels
              for (var j = 0; j < hotels.length; j++) {
                var hotelName = hotels[j].Property_Name;
                var cloned = hotels_hotel_div.clone(true);
                cloned.removeAttr("hidden");
                cloned.text(hotelName);
                cloned.css("padding-left", (level + 1) * 10 + 10 + "px");
                cloned.attr("data-id", hotels[j].Property_UID);
                cloned.attr("data-parent-id", UID);
                hotels_div.append(cloned);
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

            jQuery(" .hotels_all, .hotels_hotel, .hotels_folder ").click(
              function () {
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

                var action = jQuery("#hotel_code")
                  .closest("form")
                  .attr("action");

                if (
                  jQuery("#hotel_code").val() == "" ||
                  jQuery("#hotel_code").val() == "0"
                ) {
                  action = action.replace(/hotelresults/g, "chainresults");
                  jQuery("#hotel_code").val("");
                  jQuery("#occupancy_dropdown .pl-2").show();
                  // check if kids allowed
                  //   childrenAllowedChain();
                } else {
                  action = action.replace(/chainresults/g, "hotelresults");
                  // check if kids allowed
                  //   childrenAllowed();
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

                var action = jQuery("#hotel_code")
                  .closest("form")
                  .attr("action");

                if (
                  jQuery("#hotel_code").val() == "" ||
                  jQuery("#hotel_code").val() == "0"
                ) {
                  action = action.replace(/hotelresults/g, "chainresults");
                  jQuery("#hotel_code").val("");
                  jQuery("#occupancy_dropdown .pl-2").show();
                  // check if kids allowed
                  //   childrenAllowedChain();
                } else {
                  action = action.replace(/chainresults/g, "hotelresults");
                  // check if kids allowed
                  //   childrenAllowed();
                }

                jQuery("#hotel_code").closest("form").attr("action", action);
                setTimeout(function () {
                  jQuery("#hotel_code").trigger("change");
                }, 0);
              }
            );

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
              var divs = jQuery(this)
                .parent()
                .find(".hotels_dropdown")
                .children();
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
                      "[data-folder-id='" +
                        divs.eq(i).attr("data-parent-id") +
                        "']"
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
                    clonedRoom
                      .find(".select-button-plus")
                      .prop("disabled", false);
                    clonedRoom
                      .find(".select-button-minus")
                      .prop("disabled", true);

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
                      jQuery(".select-adult-minus")
                        .eq(i)
                        .prop("disabled", false);
                    }

                    if (guests[i].adult == 1) {
                      jQuery(".select-adult-minus")
                        .eq(i)
                        .prop("disabled", true);
                    }

                    if (guests[i].adult == 10) {
                      jQuery(".select-adult-plus").eq(i).prop("disabled", true);
                    }

                    if (guests[i].adult < 10) {
                      jQuery(".select-adult-plus")
                        .eq(i)
                        .prop("disabled", false);
                    }
                  }

                  //Update adults input field
                  adultsInput.attr("value", adultsParam);
                }

                //If Url comes with a children param
                if (
                  typeof childrenParam != "undefined" ||
                  childrenParam != null
                ) {
                  //Split the children param by , and turn the strings it returns in to numbers
                  var childrenParamArray = childrenParam.split(",");
                  var childrenParamArrayNumbers =
                    childrenParamArray.map(Number);

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
                    jQuery(".select-child-value")
                      .eq(i)
                      .text(guests[i].children);

                    if (guests[i].children > 0) {
                      jQuery(".select-child-minus")
                        .eq(i)
                        .prop("disabled", false);
                    }

                    if (guests[i].children == 0) {
                      jQuery(".select-child-minus")
                        .eq(i)
                        .prop("disabled", true);
                    }

                    if (guests[i].children == 10) {
                      jQuery(".select-child-plus").eq(i).prop("disabled", true);
                    }

                    if (guests[i].children < 10) {
                      jQuery(".select-child-plus")
                        .eq(i)
                        .prop("disabled", false);
                    }
                  }

                  //Update Children input fild
                  childrenInput.attr("value", childrenParam);
                }

                // If no child ages for childs, set 0
                var childrenAgesParam = getUrlParam("ag");

                if (
                  (typeof childrenParam != "undefined" ||
                    childrenParam != null) &&
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
                      childAge.appendTo(
                        jQuery(".select-child-ages-holder").eq(i)
                      );

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
                  guestNumber =
                    guestNumber + guests[i].adult + guests[i].children;
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
                jQuery(".select-occupancy-apply-info-rooms").text(
                  numberOfRoomsParam
                );

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

              if (
                typeof childrenParam != "undefined" ||
                childrenParam != null
              ) {
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
                (typeof childrenParam != "undefined" ||
                  childrenParam != null) &&
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

                    var childAge = jQuery(".select-child-ages-clone")
                      .clone()
                      .last();

                    //Removes the clone class and adds the real class
                    childAge.removeClass("select-child-ages-clone");
                    childAge.addClass("select-child-ages");

                    //Appends the child age clone to the div its supposed to be in
                    childAge.appendTo(
                      jQuery(".select-child-ages-holder").eq(i)
                    );

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
                guestNumber =
                  guestNumber + guests[i].adult + guests[i].children;
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
              jQuery(".select-occupancy-apply-info-rooms").text(
                numberOfRoomsParam
              );
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
                  "background-image",
                  "url(/icons/icons_GreyDark/iconGreyDark_ArrowDown.svg)"
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
                      jQuery(".add-room-holder").css("display", "inline-block");
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
                jQuery(".select-adult-minus")
                  .eq(roomCounter)
                  .prop("disabled", false);
              }

              //Change the string in the apply button on each + click
              var applyButtonGuests =
                parseInt(
                  jQuery(".select-occupancy-apply-info-guests").attr(
                    "data-guests"
                  )
                ) + 1;
              jQuery(".select-occupancy-apply-info-guests").attr(
                "data-guests",
                applyButtonGuests
              );
              jQuery(".select-occupancy-apply-info-guests").text(
                applyButtonGuests
              );
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
                jQuery(".select-adult-plus")
                  .eq(roomCounter)
                  .prop("disabled", false);
              }

              //Change the string in the apply button on each - click
              var applyButtonGuests =
                parseInt(
                  jQuery(".select-occupancy-apply-info-guests").attr(
                    "data-guests"
                  )
                ) - 1;
              jQuery(".select-occupancy-apply-info-guests").attr(
                "data-guests",
                applyButtonGuests
              );
              jQuery(".select-occupancy-apply-info-guests").text(
                applyButtonGuests
              );
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
                var childAge = jQuery(".select-child-ages-clone")
                  .clone()
                  .last();

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
                    jQuery(".select-occupancy-apply-info-guests").attr(
                      "data-guests"
                    )
                  ) + 1;
                jQuery(".select-occupancy-apply-info-guests").attr(
                  "data-guests",
                  applyButtonGuests
                );
                jQuery(".select-occupancy-apply-info-guests").text(
                  applyButtonGuests
                );
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
                jQuery(".select-child-minus")
                  .eq(roomCounter)
                  .prop("disabled", false);
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
                jQuery(".select-child-plus")
                  .eq(roomCounter)
                  .prop("disabled", false);
              }

              //Change the string in the apply button on each - click
              var applyButtonGuests =
                parseInt(
                  jQuery(".select-occupancy-apply-info-guests").attr(
                    "data-guests"
                  )
                ) - 1;
              jQuery(".select-occupancy-apply-info-guests").attr(
                "data-guests",
                applyButtonGuests
              );
              jQuery(".select-occupancy-apply-info-guests").text(
                applyButtonGuests
              );
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
              jQuery(".select-room")
                .eq(0)
                .clone()
                .appendTo(".select-room-holder");

              // Stores the cloned room in a variable and pushes the default settings for the room
              var clonedRoom = jQuery(".select-room").last();

              var defaultRoomSettings = {
                adult: 1,
                children: 0,
                childrenAges: [],
              };
              guests.push(defaultRoomSettings);

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
                .text(defaultRoomSettings.adult);
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
                  jQuery(".select-occupancy-apply-info-guests").attr(
                    "data-guests"
                  )
                ) + 1;

              jQuery(".select-occupancy-apply-info-guests").attr(
                "data-guests",
                applyButtonGuests
              );
              jQuery(".select-occupancy-apply-info-guests").text(
                applyButtonGuests
              );
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
                  jQuery(".select-occupancy-apply-info-rooms").attr(
                    "data-rooms"
                  )
                ) + 1;
              jQuery(".select-occupancy-apply-info-rooms").attr(
                "data-rooms",
                applyButtonRooms
              );

              jQuery(".select-occupancy-apply-info-rooms").text(
                applyButtonRooms
              );
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
              jQuery(".select-occupancy-apply-info-guests").text(
                applyButtonGuests
              );
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
                parseInt(
                  $(".select-occupancy-apply-info-rooms").attr("data-rooms")
                ) - 1;
              jQuery(".select-occupancy-apply-info-rooms").attr(
                "data-rooms",
                applyButtonRooms
              );
              jQuery(".select-occupancy-apply-info-rooms").text(
                applyButtonRooms
              );
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
            jQuery(document).on(
              "click",
              ".age-picker-options div",
              function () {
                var age = $(this).data("age");

                $(this).parent().parent().find(".age-picker-value").text(age);

                var selectInput = $(this).parent().next();

                selectInput.children().removeAttr("selected");

                selectInput
                  .find("[data-value='" + age + "']")
                  .attr("selected", "");
              }
            );

            //Apply Button
            jQuery(document).on(
              "click",
              ".select-occupancy-apply",
              function () {
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
                  guestNumber =
                    guestNumber + guests[i].adult + guests[i].children;

                  //Loop through all the ages in the current room iteration, and push it to the childrenAges
                  for (
                    j = 0;
                    j <
                    childAgeHolder.eq(i).find(".select-child-ages-input")
                      .length;
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
                jQuery(".select-occupancy-apply-info-rooms").text(
                  numberOfRooms
                );
                jQuery(".select-occupancy-apply-info-rooms-string").text(
                  roomString
                );

                jQuery(".select-occupancy-apply-info-guests").attr(
                  "data-guests",
                  guestNumber
                );
                jQuery(".select-occupancy-apply-info-guests").text(guestNumber);
                jQuery(".select-occupancy-apply-info-guests-string").text(
                  guestString
                );

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
              }
            );

            // disable submit if children are choosen on hotels which dont allow them

            // function childrenAllowed() {
            //   //jQuery(".ob-searchbar-submit").prop('disabled', true);
            // }

            // function childrenAllowedChain() {
            //   //jQuery(".ob-searchbar-submit").prop('disabled', false);
            // }
          }
        );
      });
    }
  );
});
