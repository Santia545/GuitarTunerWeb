var previousElement;
var tuningMode = ["AUTOMATIC MODE", "MANUAL MODE", "EAR MODE"];
let sounds = [];
var modalStream = null;
var Ganancia = null;
let currentTuningId = -1;
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
    if (document.getElementById("start-mic").innerText == "Stop Microphone Test") {
        Ganancia.disconnect(Ganancia.context.destination);
        document.getElementById("start-mic").innerText = "Start Microphone Test";
    }
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
    document.getElementById("modal").style.visibility = "hidden";
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
$("#start-mic").mouseup(({ target }) => {
    if (target.innerText == "Start Microphone Test") {
        if (Ganancia) {
            Ganancia.connect(Ganancia.context.destination);
            target.innerText = "Stop Microphone Test";
        }
    } else {
        if (Ganancia) {
            Ganancia.disconnect(Ganancia.context.destination);
            target.innerText = "Start Microphone Test";
        }
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
document.getElementById("switch-tuning").onclick = () => {
    document.getElementById("modal-tunings").style.visibility = "visible";
    let tuningList = document.getElementById("tuning-list");
    tuningList.innerHTML = "";
    tunings.forEach(tuning => {
        let option = document.createElement("option");
        option.value = tuning.tuningId;
        option.textContent = tuning.title;
        tuningList.appendChild(option);
        if (tuning.tuningId == currentTuningId) {
            option.selected = true;
        }
    });

    tuningList.onchange = ({ target }) => {
        const selectedTuning = tunings.find(t => t.tuningId == target.value);
        currentTuningId = selectedTuning.tuningId;
        if (selectedTuning) {
            GuitarTuner.stringArray = JSON.parse(selectedTuning.frequencies.replace(/[a-zA-Z]*#?\s*/g, ""));
            let stringNames = selectedTuning.frequencies.replace(/[\[\]0-9\.\s]/g, "").split(",");
            stringNames.forEach((element, index) => {
                $(`div[name="string-${index}"]`).text(element);
            });

            document.getElementById("modal-tunings").style.visibility = "hidden";
        }
    };
}

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
$("#close-modal-tunings").mouseup(() => {
    document.getElementById("modal-tunings").style.visibility = "hidden";
}
);
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

const tunings = [
    {
        frequencies: "[E 82.41, A 110.00, D 146.83, G 196.00, B 246.94, E 329.63, A 440]",
        title: "E Standard ",
        "tuningId": -1
    },
    {
        frequencies: "[Eb 77.78, Ab 103.83, Db 138.59, Gb 185.00, Bb 233.08, Eb 311.13, A 440]",
        title: "Eb Standard",
        tuningId: -2
    },
    {
        frequencies: "[D 73.42, G 98.00, C 130.81, F 174.61, A 220.00, D 293.66, A 440]",
        title: "D Standard",
        tuningId: -3
    },
    {
        frequencies: "[D 73.42, A 110.00, D 146.83, G 196.00, B 246.94, E 329.63, A 440]",
        title: "Drop D",
        tuningId: -4
    },
    {
        frequencies: "[C# 69.30, Ab 103.83, Db 138.59, Gb 185.00, Bb 233.08, Eb 311.13, A 440]",
        title: "Drop C#",
        tuningId: -5
    },
    {
        frequencies: "[C 65.41, G 98.00, C 130.81, F 174.61, A 220.00, D 293.66, A 440]",
        title: "Drop C",
        tuningId: -6
    }
]


