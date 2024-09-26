(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

module.exports = function ($) {

    var jQ = $;

    var customEn = {
        settings: {
            bodyClasses: {
                'getLocal': 'lookup',
                'supporter/unsubscribe': 'unsubscribe',
                'profile': 'profile',
                'blastContent': 'blasts',
                '/letter': 'letter-to-editor',
                '/event/': 'event',
                '/my/': 'my-salsa',
                '/shop': 'shop',
                '/signup': 'signup',
                '/tellafriend': 'tellafriend',
                '/thank_you_page': 'thankyou',
                '/questionnaire/': 'questionnaire',
                '/action': 'action',
                '/petition': 'petition',
                '/viewCart.jsp': 'shop-cart',
                '/item.jsp': 'shop-item',
                '/checkOut.jsp': 'shop-checkout',
                '/donate/': 'donate',
                '/subscriptions': 'subscriptions'
            }
        },
        urlParams: null,
        getURLParams: function getURLParams() {

            function readURLParams() {
                var match,
                    pl = /\+/g,

                // Regex for replacing addition symbol with a space
                search = /([^&=]+)=?([^&]*)/g,
                    decode = function decode(s) {
                    return decodeURIComponent(s.replace(pl, " "));
                },
                    query = window.location.search.substring(1);

                customEn.urlParams = {};
                while (match = search.exec(query)) {
                    customEn.urlParams[decode(match[1])] = decode(match[2]);
                }
            }

            if (typeof window.onpopstate !== 'undefined') {
                window.onpopstate = readURLParams();
            } else {
                window.onhashchange = readURLParams();
            }

            return customEn.urlParams;
        },
        /**
         * Adds a class to the body element based on the Salsa page type
         */
        addBodyClass: function addBodyClass(classes, append) {
            var page = window.location.pathname,
                addedClass = null,
                $body = jQ('body');

            if (append !== true) {
                classes = typeof classes !== 'undefined' ? classes : customEn.settings.bodyClasses;
            } else if (append === true) {
                if (typeof Array.isArray === 'function' && Array.isArray(classes)) {
                    var appendClasses = '';
                    var separator = ' ';
                    jQ.each(classes, function (index, value) {
                        if (index == classes.length - 1) {
                            separator = '';
                        }
                        appendClasses += value + separator;
                    });

                    $body.addClass(appendClasses);
                } else if (typeof classes === 'string') {
                    $body.addClass(classes);
                }
                // @todo: Add a test case to see if the "classes" argument is an object literal http://stackoverflow.com/questions/1173549/how-to-determine-if-an-object-is-an-object-literal-in-javascript

                classes = customEn.settings.bodyClasses;
            }

            // loop thru and add to body
            // stop once we've hit one, as a page shouldn't be multiple
            jQ.each(classes, function (test, className) {
                if (page.indexOf(test) > 1) {
                    $body.addClass(className);
                    addedClass = className;
                    // if we're on a "shop" page, we can have multiple classes
                    if (!page.indexOf('shop') > 1) {
                        return false;
                    }
                }
            });

            if ($('.en__ecarditems__list').length) {
                $body.addClass('ecard');
            }
        }, // END addBodyClass()
        fieldPosition: function fieldPosition() {
            /* get the position of fields on the page and use there position to determine certain things about them */
            var $fields = $('.en__component--formblock > .en__field');

            $.map($fields, function (element, index) {
                var $element = $(element);
                var $nextElement = $element.next();
                $element.addClass(index.toString());

                if ($nextElement.length > 0) {
                    var $is_next_element_a_input = $nextElement.find('input,textarea,select,button');

                    if ($is_next_element_a_input.length > 0) {
                        // get all of the classes for this element since jQuery doesn't support classList
                        var classList = $nextElement.attr('class').split(/\s+/);
                        /*
                        add the type of field that the next field is.
                         Engaging Networks has the field type as the third class listed for an element.
                         */
                        if (classList[3] !== undefined) {
                            $element.addClass('next-' + classList[3]);
                        }
                    }
                }
            });
        },
        nextElementType: function nextElementType() {
            // get the element that appears immediately after each field

        },
        petition: {},
        donation: {
            magicSetCCtype: function magicSetCCtype($ccNum, setElement) {

                var tests = {
                    'VI': /^4\d{15}$/,
                    'MC': /^5[1-5]\d{14}$/,
                    'AX': /^3[47][0-9]{13}$/,
                    'DI': /^6(?:011\d\d|5\d{4}|4[4-9]\d{3}|22(?:1(?:2[6-9]|[3-9]\d)|[2-8]\d\d|9(?:[01]\d|2[0-5])))\d{10}$/
                },
                    returnVal = false,
                    ccNum = (typeof $ccNum === 'undefined' ? 'undefined' : _typeof($ccNum)) === 'object' ? $ccNum.val() : jQ('[name="transaction.ccnumber"]').val();

                var setElement = typeof setElement === 'string' ? setElement : '[name="transaction.paymenttype"]';

                if (setElement !== '[name="transaction.paymenttype"]' && jQ(setElement).length == 0) {
                    setElement = '[name="transaction.paymenttype"]';
                }

                jQ.each(tests, function (key, value) {
                    if (ccNum.match(value) !== null) {
                        returnVal = key;

                        // if the element we pass is a radio button or checkbox, then update the checked property instead of making every radio button or checkbox value equal to the cc type
                        if (jQ(setElement).attr('type') == 'radio' || jQ(setElement).attr('type') == 'checkbox') {
                            var elements = jQ(setElement);

                            jQ.map(elements, function (node, index) {
                                var node = jQ(node);

                                if (node.val() == key) {
                                    node.prop('checked', true);
                                    return true;
                                } else {
                                    node.prop('checked', false);
                                }
                            });
                        } else {
                            jQ(setElement).val(key);
                        }
                        return false;
                    }
                });
                customEn.donation.cc_type = returnVal;

                return returnVal;
            }, // END donation.magicSetCCtype

            /**
             * Perform the Luhn algorithm to verify a credit card number
             */
            isValidLuhn: function isValidLuhn(value) {

                var arr = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
                value = typeof value !== 'string' ? value : jQ('[name="transaction.ccnumber"]').val();

                return function () {
                    var len = value.length,
                        bit = 1,
                        sum = 0,
                        val;

                    while (len) {
                        val = parseInt(value.charAt(--len), 10);
                        sum += (bit ^= 1) ? arr[val] : val;
                    }

                    return sum && sum % 10 === 0;
                };
            }, // END donation.luhnCheck

            /**
             * function to test if a given value (string/int) passes a basic ABA routing number checksum
             */
            isValidABA: function isValidABA(value) {
                var numericRegex = /^\d{9}$/,
                    total = null;

                // just in cases
                value = value.toString();

                // make sure it's numeric and of length 9
                if (!numericRegex.test(value)) {
                    return false;
                }

                // compute checksum
                for (var i = 0; i < 9; i += 3) {
                    total += parseInt(value.charAt(i), 10) * 3 + parseInt(value.charAt(i + 1), 10) * 7 + parseInt(value.charAt(i + 2), 10);
                }
                if (total !== 0 && total % 10 === 0) {
                    return true;
                }

                // still here? That's not good.
                return false;
            },

            /**
             * Does a Luhn check but also tests for validity against defined card type and CVV
             * Not much point in using in combination with magicSetCCtype, but not *totally* redundant due to CVV check
             * @param ccNumber string | integer The user-provided CC number
             * @param cvv string | integer The user-provided CVV value
             * @param type string The credit card type
             *
             * @return object properties: isValid (boolean), errors[ { value, message }, ... ]
             */
            isValidCC: function isValidCC($ccNumber, $cvv, $type) {

                var ccType = $type.val(),
                    ccTest = /^\d+$/,
                    cvvTest = /^\d{3}$/,
                    returnObj = { errors: [], isValid: true };

                if ('undefined' === typeof ccType) {
                    $type = custom.salsa.donation.cc_type;
                }

                switch (ccType) {
                    case "VI":
                        ccTest = /^4\d{15}$/;
                        break;
                    case "MC":
                        ccTest = /^5[1-5]\d{14}$/;
                        break;
                    case "DI":
                        ccTest = /^6(?:011\d\d|5\d{4}|4[4-9]\d{3}|22(?:1(?:2[6-9]|[3-9]\d)|[2-8]\d\d|9(?:[01]\d|2[0-5])))\d{10}$/;
                        break;
                    case "AX":
                        ccTest = /^3[47][0-9]{13}$/;
                        cvvTest = /^\d{4}$/;
                        break;
                }

                if (!ccTest.test($ccNumber.val()) || !this.isValidLuhn($ccNumber.val())) {
                    returnObj.isValid = false;
                    returnObj.errors.push({
                        value: $ccNumber.val(),
                        element: $ccNumber,
                        message: 'A valid credit card number is required.'
                    });
                }

                //check CVV is numeric and matches length
                if (!cvvTest.test($cvv.val())) {
                    returnObj.isValid = false;
                    returnObj.errors.push({
                        value: $cvv.val(),
                        element: $cvv,
                        message: 'Invalid security code (CVV) number.'
                    });
                }

                return returnObj;
            },
            setCCType: function setCCType() {

                jQ('[name="transaction.ccnumber"]').on('blur', function () {
                    customEn.donation.magicSetCCtype();
                });
            },
            getDonationAmount: function getDonationAmount() {
                var donation = $('form *[name="transaction.donationAmt"]:checked').val();

                if (undefined === donation || !$.isNumeric(donation)) {
                    donation = $('form .en__field__input--other').val();
                }

                return donation !== 0 && undefined !== donation ? donation : 0;
            },
            isLastDonationPage: function isLastDonationPage() {
                if (window.pageJson && window.pageJson.pageCount && window.pageJson.pageCount && window.pageJson.pageNumber) {
                    if (jQ('form.en__component').length > 0) {
                        var form_action_page_num = jQ('form.en__component').prop('action').match(/\d+$/);

                        if (null !== form_action_page_num) {
                            if (window.pageJson.pageNumber === parseInt(form_action_page_num[0]) - 1 || window.pageJson.pageNumber === parseInt(form_action_page_num[0])) {
                                return true;
                            }
                        }
                    }
                }

                return false;
            },
            buildStepLinks: function buildStepLinks(stepArray) {
                var html = '<div class="steps">';
                stepArray.forEach(function (item, index) {
                    var link = window.location.origin + window.location.pathname.slice(0, -1) + (index + 1);
                    var isCurrentPage = '';

                    if (link === window.location.origin + window.location.pathname) {
                        isCurrentPage = ' current-page';
                        link = '#';
                    }

                    html += '<div class="step step-' + (index + 1) + isCurrentPage + '"><a href="#" data-step="' + (index + 1) + '" data-link="' + link + '"><span class="step-number">' + (index + 1) + '</span><span class="step-text">' + stepArray[index] + '</span></a></div>';
                });

                html += '</div>';

                return html;
            }
        }
    };

    customEn.addBodyClass();
    customEn.fieldPosition();
    customEn.donation.setCCType();

    return customEn;
};

},{}],2:[function(require,module,exports){
'use strict';

var customEn = require('./customen');
require('matchmedia-polyfill');
require('matchmedia-polyfill/matchMedia.addListener');
var debounce = require('debounce');

jQuery(document).ready(function ($) {
    var en = customEn($);
    // Move the form errors into the form itself
    var hasErrors = $('.en__errorHeader');
    if (hasErrors) {
        var errors = $('.en__errorList');
        hasErrors.appendTo('.step-description');
        errors.appendTo('.step-description');
    }

    if ($('body').hasClass('donate')) {

        // functionality that deals with tracking the donation amount and doing certain actions
        // based on the donation type
        var donationAmountTracking = function donationAmountTracking() {
            var $amounts = $('input[name="transaction.donationAmt"]');

            // Hide the "other" donation amount field by default until it is selected
            if ($('input[name="transaction.donationAmt"]:checked').val() == 'Other') {
                $('.en__field__item--other').removeClass('en__field__item--hidden');
            }

            // each time a donation button is clicked, track if that button is the "Other" donation button and focus
            // on field when the button is clicked
            $amounts.on('change', function (event) {
                var $this = $(this);
                if ($this.is(':checked') && $this.val() == 'Other') {
                    // Focus on the other amount and wait until after
                    // it's no longer hiding to focus on input
                    setTimeout(function () {
                        $('input[name="transaction.donationAmt.other"]').focus();
                    }, 200);
                }
            }).trigger('change');

            // store the donation amount when a user selects a donation amount
            if ($amounts.length) {
                $('.en__component').on('submit', function () {
                    sessionStorage.setItem('donation-amount', en.donation.getDonationAmount());
                });
            }

            // Get the donation amount and display it on the last submit button
            if ($('input[name="transaction.ccnumber"]').length > 0 && sessionStorage.getItem('donation-amount')) {
                // Update the submit button with the donation amount
                $('.en__submit button').html('Submit $' + sessionStorage.getItem('donation-amount') + ' Now »');
            }
        };

        // Add the current page number as a class to the donate form
        var addPageNumber = function addPageNumber() {
            if (window.pageJson.pageNumber) {
                $('body').addClass('page-' + window.pageJson.pageNumber);
            }

            if (window.pageJson.pageNumber == window.pageJson.pageCount) {
                $('body').addClass('page-last-page');
            }
        };

        // Change to the donation buttons with icons if the user is donating monthly
        var watchDonationRecurrence = function watchDonationRecurrence() {
            $('body').addClass('donation-background-swap');

            fit_text();

            if ($('.en__field--gftrsn').length) {
                $('body').addClass('tribute-gift');
            }

            if (sessionStorage.getItem('donation-type')) {
                if ('monthly' === sessionStorage.getItem('donation-type')) {
                    donationSidebars(true);
                    updateLogo(true);
                } else if ('one-time' === sessionStorage.getItem('donation-type')) {
                    donationSidebars(false);
                    updateLogo(false);
                }
            }

            // Add a class to the first row on the page since this Row more than likely contains our
            // full page image with the donation form being on the right hand side
            $('.en__component--row').first().addClass('donation-row-with-image-sidebar');

            var $recurrence = $('input[name="transaction.recurrpay"]');

            if ($recurrence.length) {
                donationRecurrenceSwitch();
                var value = $recurrence.val();
                $('input[name="transaction.recurrpay"][value="' + value + '"]:checked').click();
            }

            $recurrence.on('change', function (event) {
                donationRecurrenceSwitch();
            });
        };

        // Change the background image and the donation icons depending on of the is a one-time or monthly donation
        var donationRecurrenceSwitch = function donationRecurrenceSwitch() {
            var $recurrence = $('input[name="transaction.recurrpay"]:checked');
            var value = $recurrence.val();
            // if this is a recurring donation
            if ('Y' == value) {
                iconDonations();
                donationSidebars(true);
                updateLogo(true);
                $('.one-time-image-wrapper').hide();
                $('.monthly-image-wrapper').show();
            } else {
                $('.en__field--donationAmt').removeClass('icon-donations');
                donationSidebars(false);
                updateLogo(false);
                $('.one-time-image-wrapper').show();
                $('.monthly-image-wrapper').hide();
            }
        };

        var updateLogo = function updateLogo(monthly) {
            var image = 'https://acb0a5d73b67fccd4bbe-c2d8138f0ea10a18dd4c43ec3aa4240a.ssl.cf5.rackcdn.com/10044/WFPOneTime_LOGO-png.png?v=1591640232000';

            if (monthly) {
                image = 'https://acb0a5d73b67fccd4bbe-c2d8138f0ea10a18dd4c43ec3aa4240a.ssl.cf5.rackcdn.com/10044/WFPMonthly_Club6_Logo_PNG.png?v=1591640232000';
            }

            var image_div = '<div id="logo" class="logo-' + (monthly ? 'monthly' : 'one-time') + '"><img src="' + image + '"/></div>';

            if ($('#logo').length) {
                $('#logo').remove();
                $('.donate-sidebar-background-image').append(image_div);
            } else if (window.pageJson.pageNumber == window.pageJson.pageCount && $('.thank-you-text').length) {
                $('.thank-you-text').append(image_div);
            } else {
                $('.donate-sidebar-background-image').append(image_div);
            }
        };

        // add a icon to the monthly donation amounts


        var iconDonations = function iconDonations() {
            // if the monthly donation buttons have images, then re-add the icon donations class
            if ($('.en__field--donationAmt img').length) {
                $('.en__field--donationAmt').addClass('icon-donations');
            }

            setTimeout(function () {
                var donation_amts = document.querySelectorAll('.en__field--donationAmt .en__field__label--item');

                var $donation_amts = $(donation_amts);

                $.each($donation_amts, function (index, label) {
                    var $label = $(label);
                    var text = $label.text();
                    var link = urlify(text);
                    if (Array.isArray(link)) {
                        $label.addClass('icon-donation');
                        $('.en__field--donationAmt').addClass('icon-donations');
                        $label.html('<span class="icon-image-wrapper"><img src="' + link[0] + '" class="icon-image"/></span><span class="icon-radio-button"></span><span class="icon-label-text">' + link[1] + '</span>');
                    }
                });

                setTimeout(function () {

                    $('.icon-image').matchHeight({
                        byRow: false,
                        property: 'height',
                        target: null,
                        remove: false
                    });

                    $('.icon-image-wrapper').matchHeight({
                        byRow: false,
                        property: 'width',
                        target: null,
                        remove: false
                    });
                }, 300);
            }, 100);
        };

        var urlify = function urlify(text) {
            var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
            var found = text.match(urlRegex);

            if (Array.isArray(found)) {
                found.push(text.replace(urlRegex, '').trim());
                return found;
            }

            return text;
        };

        var donationSidebars = function donationSidebars(monthly) {
            var one_time_image = $('img.one-time');
            var monthly_image = $('img.monthly');

            var one_time_text = $('.one-time-text');
            var monthly_text = $('.monthly-text');

            if (true !== monthly) {
                sessionStorage.setItem('donation-type', 'one-time');
                monthly_image.hide();
                monthly_text.hide();

                $('.en__component--row > .en__component--column').first().css('background-image', 'url("' + one_time_image.attr('src') + '"').addClass('donate-sidebar-background-image');
                one_time_image.show().parent().addClass('one-time-image-wrapper');
                one_time_text.show();
            } else {
                sessionStorage.setItem('donation-type', 'monthly');
                one_time_image.hide();
                one_time_text.hide();

                $('.en__component--row > .en__component--column').first().css('background-image', 'url("' + monthly_image.attr('src') + '"').addClass('donate-sidebar-background-image');
                monthly_image.show().parent().addClass('monthly-image-wrapper');
                monthly_text.show();
            }
        };

        $('.page-image').each(function (index, element) {
            var $this = $(element);
            try {
                $this.closest('.en__component--column').addClass('step-image').closest('.en__component--row').addClass('stretch-row');
                $this.parent().addClass('featured-image');
            } catch (e) {}
        });

        $('.logo').wrap('<a class="logo-link" href="https://www.waterforpeople.org" target="_blank" rel="noopener"></a>').closest('.en__component--imageblock').addClass('logo-wrap');

        // Enable a Honor Memorial Gift target when both fields are present
        if ($('.honory-memorial-gift') && $('.honor-memorial-fields')) {
            $('.honor-memorial-fields').hide();

            // Hide the memorial gift fields when the toggle button is present
            /*$('.honory-memorial-gift').on( 'click', (event) => {
                event.preventDefault();
                $('input[name="transaction.inmem"][value="Y"]').prop('checked', true);
                $('.honor-memorial-fields').toggle('slow', () => {
                    // Hide the other submit button when we show the
                    // Memorial gift fields
                    var $previousSubmitButton = $('.en__submit').first();
                     if ($('.honor-memorial-fields').is(':visible') && !$previousSubmitButton.closest('.en__component--formblock').hasClass('honor-memorial-fields')) {
                        $previousSubmitButton.hide();
                    } else {
                        $previousSubmitButton.show();
                    }
                });
            } );*/
        }

        var steps = ['Donation', 'Billing', 'Payment', 'Completion'];
        // don't add step tracking to last page
        if (window.pageJson.pageNumber !== window.pageJson.pageCount) {
            var getMandatoryFields = $('.en__mandatory').find('input,textarea,select');
            $('.en__component--formblock').first().prepend(en.donation.buildStepLinks(steps));
            if ($.fn.garlic) {
                $('form.en__component').garlic();
            }
            // prevent remembering the Credit card information
            $('[name="transaction.ccnumber"],[name="transaction.ccvv"],[name="transaction.ccexpire"]').removeClass('garlic-auto-save');

            // prevent user from navigating across steps unless they fill out the current step
            $('.steps .step a').on('click', function (event) {
                event.preventDefault();
                var $this = $(event.currentTarget);
                var newStep = parseInt($this.attr('data-step'));
                // don't let the user navigate to the next page unless all required fields are filled out
                if (window.pageJson.pageNumber < newStep) {
                    var checkedValueAlready = [];
                    var anyEmpty = getMandatoryFields.filter(function () {
                        var fieldName = this.name;
                        var inputType = this.type;

                        if (undefined === $('[name="' + fieldName + '"]').val()) {
                            return true;
                        }

                        if ('radio' === inputType || 'checkbox' === inputType) {
                            if (undefined === $('[name="' + fieldName + '"]:checked').val()) {
                                return true;
                            } else {
                                $('[name="' + fieldName + '"]:checked').val().trim() === '';
                            }
                        }

                        return $('[name="' + fieldName + '"]').val().trim() === '';
                    });

                    if (anyEmpty.length) {
                        if (!$('#step-next-page-error').length) {
                            $('.steps').before('<div id="step-next-page-error">Missing required fields. Please fill out required fields</div>');
                        }
                    } else {
                        $('#step-next-page-error').remove();
                        window.location = $this.attr('data-link');
                    }
                } else {
                    // let the user navigate to steps that are lower than the current page (this assumes the user has submitted all the required fields from the previous step)
                    window.location = $this.attr('data-link');
                }
            });
        }

        // hide and show the eCard instructions when the user selects to "Send/Email a ECard"
        if ($('input[value="eCard"]').length) {
            var name = $('input[value="eCard"]').prop('name');
            $('input[name="' + name + '"]').on('change', function (event) {
                var $this = $(event.currentTarget);
                if ('eCard' === $this.val()) {
                    $('.ecard-instructions').show();
                } else {
                    $('.ecard-instructions').hide();
                }
            }).trigger('change');
        }

        donationAmountTracking();

        addPageNumber();

        watchDonationRecurrence();
    }

    function fit_text() {
        var $monthly = $('.monthly-text');
        var $one_time = $('.one-time-text');

        if ($monthly.length) {
            // fitty( $monthly.eq( 0 ) );
        }
    }

    if ($('body').hasClass('ecard')) {
        // Move the recipients above the eCard image selection
        $('.en__ecardrecipients').prependTo('.en__component--ecardblock');
        // Move the preview button below the message textarea
        $('.en__ecarditems__action').insertAfter('.en__ecardmessage');

        // Add wrapper to the "Add recipients" button
        $('.en__ecarditems__addrecipient').wrap('<div class="add-ecard-recipient"/>');

        // Move the instructions to instruct users how the add recipents button works
        $('.add-recipients').insertBefore('.en__ecardrecipients__detail');

        // Remove the preselected card when the ecard section loads
        $('.en__ecarditems__thumb.thumb--active').removeClass('thumb--active');
    }
});

},{"./customen":1,"debounce":3,"matchmedia-polyfill":5,"matchmedia-polyfill/matchMedia.addListener":4}],3:[function(require,module,exports){
/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing. The function also has a property 'clear' 
 * that is a function which will clear the timer to prevent previously scheduled executions. 
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */
function debounce(func, wait, immediate){
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        context = args = null;
      }
    }
  };

  var debounced = function(){
    context = this;
    args = arguments;
    timestamp = Date.now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };

  debounced.clear = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  debounced.flush = function() {
    if (timeout) {
      result = func.apply(context, args);
      context = args = null;
      
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
};

// Adds compatibility for ES modules
debounce.debounce = debounce;

module.exports = debounce;

},{}],4:[function(require,module,exports){
/*! matchMedia() polyfill addListener/removeListener extension. Author & copyright (c) 2012: Scott Jehl. MIT license */
(function(){
    // Bail out for browsers that have addListener support
    if (window.matchMedia && window.matchMedia('all').addListener) {
        return false;
    }

    var localMatchMedia = window.matchMedia,
        hasMediaQueries = localMatchMedia('only all').matches,
        isListening     = false,
        timeoutID       = 0,    // setTimeout for debouncing 'handleChange'
        queries         = [],   // Contains each 'mql' and associated 'listeners' if 'addListener' is used
        handleChange    = function(evt) {
            // Debounce
            clearTimeout(timeoutID);

            timeoutID = setTimeout(function() {
                for (var i = 0, il = queries.length; i < il; i++) {
                    var mql         = queries[i].mql,
                        listeners   = queries[i].listeners || [],
                        matches     = localMatchMedia(mql.media).matches;

                    // Update mql.matches value and call listeners
                    // Fire listeners only if transitioning to or from matched state
                    if (matches !== mql.matches) {
                        mql.matches = matches;

                        for (var j = 0, jl = listeners.length; j < jl; j++) {
                            listeners[j].call(window, mql);
                        }
                    }
                }
            }, 30);
        };

    window.matchMedia = function(media) {
        var mql         = localMatchMedia(media),
            listeners   = [],
            index       = 0;

        mql.addListener = function(listener) {
            // Changes would not occur to css media type so return now (Affects IE <= 8)
            if (!hasMediaQueries) {
                return;
            }

            // Set up 'resize' listener for browsers that support CSS3 media queries (Not for IE <= 8)
            // There should only ever be 1 resize listener running for performance
            if (!isListening) {
                isListening = true;
                window.addEventListener('resize', handleChange, true);
            }

            // Push object only if it has not been pushed already
            if (index === 0) {
                index = queries.push({
                    mql         : mql,
                    listeners   : listeners
                });
            }

            listeners.push(listener);
        };

        mql.removeListener = function(listener) {
            for (var i = 0, il = listeners.length; i < il; i++){
                if (listeners[i] === listener){
                    listeners.splice(i, 1);
                }
            }
        };

        return mql;
    };
}());

},{}],5:[function(require,module,exports){
/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. MIT license */

window.matchMedia || (window.matchMedia = function() {
    "use strict";

    // For browsers that support matchMedium api such as IE 9 and webkit
    var styleMedia = (window.styleMedia || window.media);

    // For those that don't support matchMedium
    if (!styleMedia) {
        var style       = document.createElement('style'),
            script      = document.getElementsByTagName('script')[0],
            info        = null;

        style.type  = 'text/css';
        style.id    = 'matchmediajs-test';

        if (!script) {
          document.head.appendChild(style);
        } else {
          script.parentNode.insertBefore(style, script);
        }

        // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
        info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

        styleMedia = {
            matchMedium: function(media) {
                var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

                // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
                if (style.styleSheet) {
                    style.styleSheet.cssText = text;
                } else {
                    style.textContent = text;
                }

                // Test if media query is true or false
                return info.width === '1px';
            }
        };
    }

    return function(media) {
        return {
            matches: styleMedia.matchMedium(media || 'all'),
            media: media || 'all'
        };
    };
}());

},{}]},{},[2]);
