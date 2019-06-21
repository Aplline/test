define([
    'postmonger'
], function(
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var lastStepEnabled = false;
    var steps = [{ "label": "URL source", "key": "URLsource" }];

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);

    connection.on('clickedNext', onClickedNext);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);

    function onRender() {
        
        connection.trigger('ready');

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');

        // Bouton désactivé si valeur vide

        $('#enter1').change(function() {
            var lien = getURL();
            connection.trigger('updateButton', { button: 'next', enabled: Boolean(lien) });

            $('#lien').html(lien);
        });
    }

    function initialize (data) {

        if (data) {
            payload = data;
        }

        var message;
        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        $.each(inArguments, function(index, inArgument) {
            $.each(inArgument, function(key, val) {
                if (key === 'lien') {
                    lien = val;
                }
            });
        });

        // Bouton suivant ne marche pas si pas de lien rempli

        if (!lien) {
            showStep(null, 1);
            connection.trigger('updateButton', { button: 'next', enabled: false });
            // If there is a message, skip to the summary step
        } else {
            $('#enter1').find('option[value='+ lien +']').attr('selected', 'selected');
            $('#lien').html(lien);
            showStep(null, 3);
        }
    }

    function onGetTokens (tokens) {
        // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
        // console.log(tokens);
    }

    function onGetEndpoints (endpoints) {
        // Response: endpoints = { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
        // console.log(endpoints);
    }

    function onClickedNext () {save();}

    function onClickedBack () {
        connection.trigger('prevStep');
    }

    function onGotoStep (step) {
        showStep(step);
        connection.trigger('ready');
    }


    function save() {
        var name = $('#enter1').find('option:selected').html();
        var value = getURL();

        payload.name = name;

        payload['arguments'].execute.inArguments = [{ "URLlong": value }];

        payload['metaData'].isConfigured = true;

        connection.trigger('updateActivity', payload);
    }

    function getURL() {
        return $('#enter1').find('option:selected').attr('value').trim();
    }

});
