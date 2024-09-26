var customEn = require('./customen');
require('matchmedia-polyfill');
require('matchmedia-polyfill/matchMedia.addListener');
var debounce = require('debounce');

jQuery(document).ready(function($){
    var en = customEn($);
    // Move the form errors into the form itself
    var hasErrors = $('.en__errorHeader');
    if (hasErrors) {
        var errors = $('.en__errorList');
        hasErrors.appendTo('.step-description');
        errors.appendTo('.step-description');
    }

    if ($('body').hasClass('donate')){
        $('.page-image').each((index, element)=> {
            var $this = $( element );
            try{
                $this.closest('.en__component--column').addClass('step-image').closest('.en__component--row').addClass('stretch-row');
                $this.parent().addClass('featured-image');
            }catch(e){}
        });

        $('.logo').wrap( '<a class="logo-link" href="https://www.waterforpeople.org" target="_blank" rel="noopener"></a>').closest('.en__component--imageblock').addClass('logo-wrap');

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

        var steps = ['Donation','Billing','Payment','Completion'];
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
            $('.steps .step a').on('click', (event) => {
                event.preventDefault();
                var $this = $(event.currentTarget);
                var newStep = parseInt($this.attr('data-step'));
                // don't let the user navigate to the next page unless all required fields are filled out
                if (window.pageJson.pageNumber < newStep) {
                    var checkedValueAlready = [];
                    var anyEmpty = getMandatoryFields.filter(function(){
                        var fieldName = this.name;
                        var inputType = this.type;

                        if (undefined === $(`[name="${fieldName}"]`).val()) {
                            return true;
                        }

                        if ('radio' === inputType || 'checkbox' === inputType) {
                            if ( undefined === $(`[name="${fieldName}"]:checked`).val() ) {
                                return true;
                            } else {
                                $(`[name="${fieldName}"]:checked`).val().trim() === '';
                            }
                        }

                        return $(`[name="${fieldName}"]`).val().trim() === '';
                    });

                    if (anyEmpty.length) {
                        if ( !$( '#step-next-page-error').length ) {
                            $('.steps').before('<div id="step-next-page-error">Missing required fields. Please fill out required fields</div>');
                        }
                    } else {
                        $( '#step-next-page-error').remove();
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
            $(`input[name="${name}"]`).on('change', (event) => {
                var $this = $(event.currentTarget);
                if ('eCard' === $this.val()){
                    $('.ecard-instructions').show();
                } else {
                    $('.ecard-instructions').hide();
                }
            }).trigger('change');
        }

        // functionality that deals with tracking the donation amount and doing certain actions
        // based on the donation type
        function donationAmountTracking() {
            var $amounts = $('input[name="transaction.donationAmt"]');

            // Hide the "other" donation amount field by default until it is selected
            if ($('input[name="transaction.donationAmt"]:checked').val() == 'Other') {
                $('.en__field__item--other').removeClass('en__field__item--hidden');
            }


            // each time a donation button is clicked, track if that button is the "Other" donation button and focus
            // on field when the button is clicked
            $amounts.on('change', function( event ) {
                var $this = $( this );
                if ($this.is(':checked') && $this.val() == 'Other'){
                    // Focus on the other amount and wait until after
                    // it's no longer hiding to focus on input
                    setTimeout(function(){
                        $('input[name="transaction.donationAmt.other"]').focus();
                    },200);
                }
            }).trigger('change');

            // store the donation amount when a user selects a donation amount
            if ( $amounts.length ) {
                $('.en__component').on('submit', function(){
                    sessionStorage.setItem('donation-amount', en.donation.getDonationAmount());
                });
            }

            // Get the donation amount and display it on the last submit button
            if ($('input[name="transaction.ccnumber"]').length > 0 && sessionStorage.getItem('donation-amount')) {
                // Update the submit button with the donation amount
                $('.en__submit button').html('Submit $' + sessionStorage.getItem('donation-amount') + ' Now »');
            }

        }

        donationAmountTracking();

        // Add the current page number as a class to the donate form
        function addPageNumber() {
            if ( window.pageJson.pageNumber ) {
                $( 'body' ).addClass( `page-${ window.pageJson.pageNumber }` );
            }

            if ( window.pageJson.pageNumber == window.pageJson.pageCount ) {
                $( 'body' ).addClass( 'page-last-page' );
            }
        }

        addPageNumber();

        // Change to the donation buttons with icons if the user is donating monthly
        function watchDonationRecurrence() {
            $( 'body' ).addClass( 'donation-background-swap' );

            fit_text();

            if ( $( '.en__field--gftrsn' ).length ) {
                $( 'body' ).addClass( 'tribute-gift' );
            }

            if ( sessionStorage.getItem( 'donation-type' ) ) {
                if ( 'monthly' === sessionStorage.getItem( 'donation-type' ) ) {
                    donationSidebars( true );
                    updateLogo( true );
                } else if ( 'one-time' === sessionStorage.getItem( 'donation-type' ) ) {
                    donationSidebars( false );
                    updateLogo( false );
                }
            }

            // Add a class to the first row on the page since this Row more than likely contains our
            // full page image with the donation form being on the right hand side
            $( '.en__component--row' ).first().addClass( 'donation-row-with-image-sidebar' );

            var $recurrence = $( 'input[name="transaction.recurrpay"]' );

            if ( $recurrence.length ) {
                donationRecurrenceSwitch();
                var value = $recurrence.val();
                $( `input[name="transaction.recurrpay"][value="${ value }"]:checked` ).click();
            }

            $recurrence.on( 'change', function( event ) {
                donationRecurrenceSwitch();
            } );
        }

        watchDonationRecurrence();

        // Change the background image and the donation icons depending on of the is a one-time or monthly donation
        function donationRecurrenceSwitch() {
            var $recurrence = $( 'input[name="transaction.recurrpay"]:checked' );
            var value = $recurrence.val();
            // if this is a recurring donation
            if ( 'Y' == value ) {
                iconDonations();
                donationSidebars( true );
                updateLogo( true );
                $( '.one-time-image-wrapper' ).hide();
                $( '.monthly-image-wrapper' ).show();
            } else {
                $( '.en__field--donationAmt' ).removeClass( 'icon-donations' );
                donationSidebars( false );
                updateLogo( false );
                $( '.one-time-image-wrapper' ).show();
                $( '.monthly-image-wrapper' ).hide();
            }
        }

        function updateLogo( monthly ) {
            var image = 'https://acb0a5d73b67fccd4bbe-c2d8138f0ea10a18dd4c43ec3aa4240a.ssl.cf5.rackcdn.com/10044/WFPOneTime_LOGO-png.png?v=1591640232000';

            if ( monthly ) {
                image = 'https://acb0a5d73b67fccd4bbe-c2d8138f0ea10a18dd4c43ec3aa4240a.ssl.cf5.rackcdn.com/10044/WFPMonthly_Club6_Logo_PNG.png?v=1591640232000';
            }

            var image_div =  `<div id="logo" class="logo-${monthly ? 'monthly': 'one-time'}"><img src="${image}"/></div>`;

            if ( $( '#logo' ).length ) {
                $( '#logo' ).remove();
                $( '.donate-sidebar-background-image' ).append( image_div );
            } else if ( window.pageJson.pageNumber == window.pageJson.pageCount && $( '.thank-you-text' ).length ) {
                $( '.thank-you-text' ).append( image_div );
            } else {
                $( '.donate-sidebar-background-image' ).append( image_div );
            }
        }

        // add a icon to the monthly donation amounts
        function iconDonations() {
            // if the monthly donation buttons have images, then re-add the icon donations class
            if ( $( '.en__field--donationAmt img' ).length ) {
                $( '.en__field--donationAmt' ).addClass( 'icon-donations' );
            }

            setTimeout( function() {
                var donation_amts = document.querySelectorAll( '.en__field--donationAmt .en__field__label--item' );

                var $donation_amts = $( donation_amts );

                $.each( $donation_amts, function( index, label ) {
                    var $label = $( label );
                    var text = $label.text();
                    var link = urlify( text );
                    if ( Array.isArray( link ) ) {
                        $label.addClass( 'icon-donation' );
                        $( '.en__field--donationAmt' ).addClass( 'icon-donations' );
                        $label.html( `<span class="icon-image-wrapper"><img src="${ link[0] }" class="icon-image"/></span><span class="icon-radio-button"></span><span class="icon-label-text">${ link[1] }</span>` );
                    }

                } );

                setTimeout( function() {

                    $( '.icon-image' ).matchHeight( {
                        byRow: false,
                        property: 'height',
                        target: null,
                        remove: false
                    } );

                    $( '.icon-image-wrapper' ).matchHeight( {
                        byRow: false,
                        property: 'width',
                        target: null,
                        remove: false
                    } );


                }, 300 );
            }, 100 );
        }



        function urlify(text) {
            var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
            var found = text.match( urlRegex );

            if ( Array.isArray( found ) ) {
                found.push( text.replace( urlRegex,'').trim() );
                return found;
            }

            return text;
        }

        function donationSidebars( monthly ) {
            var one_time_image = $( 'img.one-time' );
            var monthly_image = $( 'img.monthly' );


            var one_time_text = $( '.one-time-text' );
            var monthly_text = $( '.monthly-text' );

            if ( true !== monthly ) {
                sessionStorage.setItem( 'donation-type', 'one-time' );
                monthly_image.hide();
                monthly_text.hide();

                $( '.en__component--row > .en__component--column' ).first().css( 'background-image', `url("${ one_time_image.attr( 'src' ) }"` ).addClass( 'donate-sidebar-background-image' );
                one_time_image.show().parent().addClass( 'one-time-image-wrapper' );
                one_time_text.show();

            } else {
                sessionStorage.setItem( 'donation-type', 'monthly' );
                one_time_image.hide();
                one_time_text.hide();

                $( '.en__component--row > .en__component--column' ).first().css( 'background-image', `url("${ monthly_image.attr( 'src' ) }"` ).addClass( 'donate-sidebar-background-image' );
                monthly_image.show().parent().addClass( 'monthly-image-wrapper' );
                monthly_text.show();
            }
        }
    }

    function fit_text() {
        var $monthly = $( '.monthly-text' );
        var $one_time = $( '.one-time-text' );

        if ( $monthly.length ) {
           // fitty( $monthly.eq( 0 ) );
        }
    }

    if ($('body').hasClass('ecard')){
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