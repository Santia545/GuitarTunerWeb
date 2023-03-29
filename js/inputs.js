var previousElement;
var tuningMode = ["AUTOMATIC MODE", "MANUAL MODE", "EAR MODE"];
let sounds = [];
$(".circular-button")
    .mouseup(function (e) {
        if (GuitarTuner.getTuningMode() == 0) {
            $('#tuner-mode').text(tuningMode[1]);
            GuitarTuner.tuningMode = 1;
        }
        GuitarTuner.tuningString = Number($(e.target).attr('id'));
        //disables previously clicked string
        $(".circular-button-clicked").toggleClass("circular-button-clicked");
        //aplies style to selected string
        $(e.target).toggleClass("circular-button-clicked");
        previousElement = $(e.target);
        if (GuitarTuner.getTuningMode() == 2) {
            sounds.push(GuitarTuner.playSound(GuitarTuner.stringArray[GuitarTuner.getSelectedString()], Number(1), 4));
        }
    });

document.getElementById("start-tuning").onclick =
    function () {
        var button = $("#start-tuning");
        button.toggleClass("disabled");
        button.prop('disabled', true);
        if (GuitarTuner.mediaStream) {
            return;
        }
        function errorCallback(err) {
            var button = $("#start-tuning");
            button.toggleClass("disabled");
            button.prop('disabled', false);
            alert("Couldnt acces microphone");
        }
        var constraints = {
            audio: true,
            video: false
        }
        try {
            if (navigator.getUserMedia) {
                navigator.getUserMedia(constraints, GuitarTuner.successCallback, errorCallback);
            }
            else
                navigator.mediaDevices.getUserMedia(constraints).then(GuitarTuner.successCallback).catch(errorCallback);
        } catch (e) {
            console.log("DEBUG1: Couldn't get microphone input: " + e)
        }
    };
document.getElementById("switch-tuning").onclick =
    function () {
        $('div[name="string-0"]').text('Eb');
        $('div[name="string-1"]').text('Ab');
        $('div[name="string-2"]').text('Db');
        $('div[name="string-3"]').text('Gb');
        $('div[name="string-4"]').text('Bb');
        $('div[name="string-5"]').text('Eb');
        GuitarTuner.stringArray = [77.78, 103.83, 138.59, 185.00, 233.08, 311.13, 440];
    };
document.getElementById("switch-tuning-mode").onclick =
    function () {
        var index = GuitarTuner.getTuningMode();
        index = (index + 1) % 3;
        $('#tuner-mode').text(tuningMode[index]);
        GuitarTuner.tuningMode = index;
        if (GuitarTuner.getTuningMode() == 2) {
            $('#cents-off').text(" ");
            stopStream();
            var button = $("#start-tuning");
            if (!button.hasClass("disabled")) {
                button.toggleClass("disabled");
                button.prop('disabled', true);
            }
        } else if (GuitarTuner.getTuningMode() == 0) {
            stopPlayingSounds();
            var button = $("#start-tuning");
            if (button.hasClass("disabled")) {
                button.removeClass();
                button.prop('disabled', false);
            }
        }

    };
function stopStream() {
    if (GuitarTuner.mediaStream) {
        // Get the tracks from the stream
        var tracks = GuitarTuner.mediaStream.getTracks();
        // Stop each track
        tracks.forEach(function (track) {
            track.stop();
        });
        // Clear the variable
        GuitarTuner.mediaStream = null;
        alert("Microphone access removed");
    }
}
function stopPlayingSounds() {
    if (sounds.length > 0) {
        for (let index = 0; index < sounds.length; index++) {
            sounds[index].stop();
        }
        sounds = [];
    }
}





