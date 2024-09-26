module.exports = function($) {

    var jQ = $;

    var customEn = {
        settings: {
            bodyClasses: {
                '/subscriptions' : 'subscriptions',
                '/action'               : 'action',
                '/petition'             : 'petition',
                '/donate/'              : 'donate',
            },
        },
        urlParams: null,
        getURLParams: function () {

            function readURLParams() {
                var match,
                    pl     = /\+/g,  // Regex for replacing addition symbol with a space
                    search = /([^&=]+)=?([^&]*)/g,
                    decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
                    query  = window.location.search.substring(1);

                customEn.urlParams = {};
                while (match = search.exec(query))
                    customEn.urlParams[decode(match[1])] = decode(match[2]);
            }

            if ( typeof window.onpopstate !== 'undefined' ) {
                window.onpopstate = readURLParams();
            } else {
                window.onhashchange = readURLParams();
            }

            return customEn.urlParams;
        },
        /**
         * Adds a class to the body element based on the Engaging Networks page type
         */
        addBodyClass : function( classes, append ) {
            var
                page = window.location.pathname,
                addedClass = null,
                $body = jQ('body');

            if ( append !== true ) {
                classes = typeof classes !== 'undefined' ? classes : customEn.settings.bodyClasses ;
            } else if ( append === true ) {
                if ( typeof Array.isArray === 'function' && Array.isArray(classes) ) {
                    var appendClasses = '';
                    var separator = ' ';
                    jQ.each( classes, function(index, value) {
                        if ( index == classes.length - 1 ) {
                            separator = '';
                        }
                        appendClasses += value + separator;
                    });

                    $body.addClass(appendClasses);

                } else if ( typeof classes === 'string' ) {
                    $body.addClass(classes);
                }
                // @todo: Add a test case to see if the "classes" argument is an object literal http://stackoverflow.com/questions/1173549/how-to-determine-if-an-object-is-an-object-literal-in-javascript

                classes = customEn.settings.bodyClasses;
            }

            // loop thru and add to body
            // stop once we've hit one, as a page shouldn't be multiple
            jQ.each( classes, function( test, className ){
                if ( page.indexOf(test) > 1 ) {
                    $body.addClass(className);
                    addedClass = className;
                    // if we're on a "shop" page, we can have multiple classes
                    if ( !page.indexOf('shop') > 1) {
                        return false;
                    }
                }
            });

            if ($( '.en__ecarditems__list' ).length) {
                $body.addClass('ecard');
            }

        }, // END addBodyClass()
        fieldPosition: function() {
            /* get the position of fields on the page and use there position to determine certain things about them */
            var $fields = $('.en__component--formblock > .en__field');

            $.map($fields, function(element,index){
               var $element = $(element);
               var $nextElement = $element.next();
               $element.addClass(index.toString());

               if ( $nextElement.length > 0 ) {
                   var $is_next_element_a_input = $nextElement.find('input,textarea,select,button');

                   if ( $is_next_element_a_input.length > 0 ) {
                       // get all of the classes for this element since jQuery doesn't support classList
                       var classList = $nextElement.attr('class').split(/\s+/);
                       /*
                       add the type of field that the next field is.

                       Engaging Networks has the field type as the third class listed for an element.
                        */
                       if ( classList[3] !== undefined ) {
                           $element.addClass('next-'+classList[3]);
                       }
                   }
               }
            });
        },
        nextElementType: function() {
            // get the element that appears immediately after each field

        },
        petition: {
        },
        donation: {
            magicSetCCtype : function( $ccNum, setElement ) {

                var
                    tests = {
                        'VI' : /^4\d{15}$/,
                        'MC'	 : /^5[1-5]\d{14}$/,
                        'AX' : /^3[47][0-9]{13}$/,
                        'DI' : /^6(?:011\d\d|5\d{4}|4[4-9]\d{3}|22(?:1(?:2[6-9]|[3-9]\d)|[2-8]\d\d|9(?:[01]\d|2[0-5])))\d{10}$/
                    },
                    returnVal = false,
                    ccNum = typeof $ccNum === 'object' ? $ccNum.val() : jQ('[name="transaction.ccnumber"]').val();

                var setElement = typeof setElement === 'string' ? setElement : '[name="transaction.paymenttype"]';

                if (setElement !== '[name="transaction.paymenttype"]' && jQ(setElement).length == 0) {
                    setElement = '[name="transaction.paymenttype"]';
                }

                jQ.each( tests, function( key, value ) {
                    if ( ccNum.match( value ) !== null ) {
                        returnVal = key;

                        // if the element we pass is a radio button or checkbox, then update the checked property instead of making every radio button or checkbox value equal to the cc type
                        if (jQ(setElement).attr('type') == 'radio' || jQ(setElement).attr('type') == 'checkbox') {
                            var elements = jQ(setElement);

                            jQ.map(elements, function(node, index) {
                                var node = jQ(node);

                                if (node.val() == key) {
                                    node.prop('checked', true);
                                    return true;
                                } else {
                                    node.prop('checked', false);
                                }
                            });
                        } else {
                            jQ(setElement).val( key );
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
            isValidLuhn : function( value ) {

                var arr = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
                value = typeof value !== 'string' ? value : jQ('[name="transaction.ccnumber"]').val();

                return function() {
                    var
                        len = value.length,
                        bit = 1,
                        sum = 0,
                        val;

                    while (len) {
                        val = parseInt( value.charAt(--len), 10 );
                        sum += (bit ^= 1) ? arr[val] : val;
                    }

                    return sum && sum % 10 === 0;
                };
            }, // END donation.luhnCheck

            /**
             * function to test if a given value (string/int) passes a basic ABA routing number checksum
             */
            isValidABA : function( value ) {
                var numericRegex = /^\d{9}$/,
                    total = null;

                // just in cases
                value = value.toString();

                // make sure it's numeric and of length 9
                if ( !numericRegex.test( value ) ) {
                    return false;
                }

                // compute checksum
                for (var i=0; i<9; i += 3) {
                    total += parseInt(value.charAt(i), 10) * 3
                        + parseInt(value.charAt(i + 1), 10) * 7
                        + parseInt(value.charAt(i + 2), 10);
                }
                if (total !== 0 && total % 10 === 0){
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
            isValidCC : function( $ccNumber, $cvv, $type ) {

                var ccType = $type.val(),
                    ccTest = /^\d+$/,
                    cvvTest = /^\d{3}$/,
                    returnObj = { errors: [], isValid : true };

                if ('undefined' === typeof ccType) {
                    $type = customEn.donation.cc_type;
                }

                switch ( ccType ) {
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

                if ( !ccTest.test( $ccNumber.val() ) || ! this.isValidLuhn( $ccNumber.val() ) ) {
                    returnObj.isValid = false;
                    returnObj.errors.push({
                        value: $ccNumber.val(),
                        element: $ccNumber,
                        message: 'A valid credit card number is required.'
                    });
                }

                //check CVV is numeric and matches length
                if ( !cvvTest.test( $cvv.val() ) ) {
                    returnObj.isValid = false;
                    returnObj.errors.push({
                        value: $cvv.val(),
                        element: $cvv,
                        message: 'Invalid security code (CVV) number.'
                    });
                }

                return returnObj;
            },
            setCCType: function() {

                jQ('[name="transaction.ccnumber"]').on('blur', function(){
                    customEn.donation.magicSetCCtype();
                });
            },
            getDonationAmount: function() {
                var donation = $('form *[name="transaction.donationAmt"]:checked').val();

                if (undefined === donation || !$.isNumeric(donation)) {
                    donation = $('form .en__field__input--other').val();
                }

                return donation !== 0 && undefined !== donation ? donation : 0;
            },
            isLastDonationPage: function() {
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
            buildStepLinks(stepArray) {
                var html = '<div class="steps">';
                stepArray.forEach((item,index) => {
                    var link = window.location.origin + window.location.pathname.slice(0,-1) + (index + 1);
                    var isCurrentPage = '';

                    if ( link === (window.location.origin + window.location.pathname) ) {
                        isCurrentPage = ' current-page';
                        link = '#';
                    }

                    html += `<div class="step step-${index + 1}${isCurrentPage}"><a href="#" data-step="${index+1}" data-link="${link}"><span class="step-number">${index + 1}</span><span class="step-text">${stepArray[index]}</span></a></div>`;
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
}