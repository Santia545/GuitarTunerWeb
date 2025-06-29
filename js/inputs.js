var previousElement;
var tuningMode = ["AUTOMATIC MODE", "MANUAL MODE", "EAR MODE"];
let sounds = [];
var modalStream = null;
var Ganancia = null;
document.getElementById("mic-gain").oninput = function () {
    Microphone.gain = Number(this.value) / 10;
    if (Ganancia) {
        Ganancia.gain.value = Microphone.gain;
    }
    document.getElementById("mic-gain-text").innerText = "Gain: " + Microphone.gain;
}
document.getElementById("mic-threshold").oninput = function () {
    Microphone.threshold = Number(this.value) / 100;
    document.getElementById("mic-threshold-text").innerText = "Threshold: " + Microphone.threshold + " rms";
}
$("#close-modal").mouseup(() => {
    document.getElementById("modal").style.visibility = "hidden";
    if (GuitarTuner.getTuningMode() == 2 && modalStream) {
        var tracks = modalStream.getTracks();
        tracks.forEach(function (track) {
            track.stop();
        });
        modalStream = null;
        alert("Microphone access removed");
    }
    if (modalStream && !GuitarTuner.mediaStream) {
        var tracks = modalStream.getTracks();
        tracks.forEach(function (track) {
            track.stop();
        });
        modalStream = null;
    }
}
);

$("#mic-settings").mouseup(() => {
    document.getElementById("modal").style.visibility = "visible";
    if (!GuitarTuner.mediaStream) {
        function errorCallback(err) {
            alert("Couldn't access microphone");
        }
        navigator.getMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;
        try {
            if (navigator.getMedia) {
                navigator.getMedia({ audio: true, video: false }, successCallback, errorCallback);
            }
            else {
                alert("Your browser does not support microphone access");
            }
        } catch (e) {
            console.log(" Couldn't get microphone input: " + e);
        }
    } else {
        successCallback(GuitarTuner.mediaStream);
    }
});

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
            alert("Couldnt access microphone");
        }
        var constraints = {
            audio: true,
            video: false
        }
        navigator.getMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;
        try {
            if (navigator.getMedia) {
                navigator.getMedia(constraints, GuitarTuner.successCallback, errorCallback);
            } else {
                alert("Your browser does not support microphone access");
            }
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
const successCallback = (stream) => {
    modalStream = stream;
    const {
        analyser,
        gainNode
    } = Microphone.setupAudioChain(stream);
    Ganancia = gainNode;
    const dataArray = new Float32Array(analyser.fftSize);
    function calculateRMS() {
        analyser.getFloatTimeDomainData(dataArray);
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sumSquares += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);
        document.getElementById("volume-text").innerText = (rms).toFixed(2) + "rms";
        let width = (rms * 100);
        document.getElementById("volume-bar").style.width = width > 100 ? "100%" : width + "%";
        requestAnimationFrame(calculateRMS);
    }
    calculateRMS();
}




