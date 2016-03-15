// ==UserScript==
// @name           SE Chat custom notification sound
// @author         Lekensteyn lekensteyn@gmail.com
// @version        1.0.0.1
// @namespace      lekensteyn@gmail.com
// @description    Customize the notification sound played in the StackExchange chat
// @include        http://chat.stackexchange.com/*
// @license        MIT/X11
// @website        http://stackapps.com/q/2479/6969
// ==/UserScript==

(function (func) {
    // helper for injecting the script into the page
    var script = document.createElement("script");
    // insert a script element...
    script.appendChild(
        // with a function which is called on document ready
        document.createTextNode("$(" + func.toString() + ")")
    );
    // run the script after other scripts
    document.body.appendChild(script);
})(function () {
    
    // an element containing the audio player
    var player = $("#jplayer");
    var player_element = $(player[0]);

    // holds the initial sound file
    var original_sound;
    // holds the current sound file
    var sound_file;

    // retrieves the customized audio file from a cookie
    var get_preferred_file = function () {
        return $.cookie("notify_sound");
    };
    var set_preferred_file = function (file) {
        sound_file = file;
        
        var save_data = file;
        // do not waste space on saving the default sound
        if (save_data == original_sound) {
            save_data = "";
        }
        // save the sound file
        $.cookie("notify_sound", save_data, {
            path: "/",
            expires: 90
        });
        // and use the sound file
        player.jPlayer("setMedia", {"mp3": file});
    };

    // modifies the audio file if necessary
    var set_custom_file = function (event, mp3_file, /*unused*/ ogg_file) {
        sound_file = mp3_file;

        if (!original_sound) {
            original_sound = sound_file;
        }

        var preferred_file = get_preferred_file();
        // if we have a custom sound file, mark it for use
        
        if (preferred_file && mp3_file != preferred_file) {
            player.jPlayer("setMedia", {"mp3": preferred_file});
        }
    };

    // catch requests to modify the audio file
    player_element.bind("jPlayer.setMedia", set_custom_file);

    var customize_button = $("<div>");

    // an image created from \u266b in GIMP (Ubuntu Font) crushed with
    // http://tools.dynamicdrive.com/imageoptimizer/index.php
    var button_image = "data:image/gif;base64,R0lGODlhEAAQAPMMAAAAAA0NDSMjIz" +
        "w8PEdHR0xMTFZWVm9vb4eHh52dnbCwsNDQ0P////39/fT09ODg4CH5BAAAAAAALAAAA" +
        "AAQABAAAAQ+kMnJmqV4HuWyB+CALN40JEUAEKXEMo7yljNTZ/WN5a1N6b9g5jHiZQQg" +
        "gxBzCAhITUOhJ0ECDlQGUZFtRQAAOw==";

    // stylize the button
    customize_button.css({
        "float": "left",
        "margin-right": "5px",
        "cursor": "pointer",
        "height": "16px",
        "width": "16px",
        "background-image": "url(" + button_image + ")"
    });

    customize_button.attr("title", "set audio notification file");

    customize_button.click(function (event) {
        // prevent the popup from disappearing
        event.stopPropagation();

        // Create a popup at mouse position
        var popup = popUp(event.pageX, event.pageY);
        // enlarge the popup for the input field
        popup.width(330);

        $("<h2>").text("Sound URL").appendTo(popup);

        var url_input = $("<input>").width(320).appendTo(popup);

        // save and set the file name
        var save_url = function () {
            var new_sound = url_input.val();

            // use the new sound URL if it's not empty
            if (new_sound) {
                set_preferred_file(new_sound);
                popup.close();
            } else { // if the new sound URL is empty, restore the original one
                restore_url();
            }
        };
        var save_and_play_sound = function () {
            save_url();
            player.jPlayer("play");
        };
        // provides a function for setting a URL
        var url_chooser = function (url) {
            return function () {
                url_input.val(url);
                save_and_play_sound();
            };
        };

        url_input.val(sound_file);

        $("<button>").text("Set sound").click(save_url).appendTo(popup);

        $("<button>").text("Save and play")
            .click(save_and_play_sound).appendTo(popup);

        // URLs found with cURL magic
        var preset_urls = [
            ["//cdn-chat.sstatic.net/chat/se.mp3", "SE"],
            ["//cdn-chat.sstatic.net/chat/sf.mp3", "SF"],
            ["//cdn-chat.sstatic.net/chat/so.mp3", "SO"],
            ["//cdn-chat.sstatic.net/chat/su.mp3", "SU"],
            ["//cdn-chat.sstatic.net/chat/ubuntu.mp3", "AU"]
        ];
        var presets = $("<div>").css("margin-top", "5px").appendTo(popup);
        presets.text("Instead of entering a URL, " +
                     "you can also choose a preset from below. After " +
                     "selecting a preset, it will be played immediately.");
        $("<br>").appendTo(presets);
        
		if (!original_sound) {
			original_sound = player.data().jPlayer.status.media.mp3;
		}
        
        for (var i=0; i<preset_urls.length; i++) {
            var url = preset_urls[i][0];

            // create a butto for choosing presets
            var button = $("<button>")
                .click(url_chooser(url))
                .appendTo(presets);

            // determine the button text
            var button_prefixes = [];
            if (url == sound_file) {
                button_prefixes.push("selected");
                // highlight a selected preset
                button.css("font-weight", "bold");
            }
            if (url == original_sound) {
                button_prefixes.push("original");
            }
            
            var button_prefix = button_prefixes.length
                    ? " (" + button_prefixes.join(", ") + ")"
                    : "";
            button.text(preset_urls[i][1] + button_prefix)
        }

        event.preventDefault();
        // end of the function called on pressing the customize button
    });

    // insert the button next to "set audio notification level"
    $("#sound").after(customize_button);
});
