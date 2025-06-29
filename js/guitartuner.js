class GuitarTuner {
    static tuningMode = 0;

    static tuningString = 0;

    static STANDAR_TUNING_FREQ = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63, 440];

    static stringArray = this.STANDAR_TUNING_FREQ;
    static mediaStream = null;
    static playSound(frequency, volume, duration) {
        var audio = new (window.AudioContext || window.webkitAudioContext)()
        var halfPeriod = 1 / frequency / 2
        if (duration > halfPeriod) duration -= duration % halfPeriod
        else duration = halfPeriod

        var g = audio.createGain()
        var o = audio.createOscillator()
        o.connect(g)
        g.connect(audio.destination) // so you actually hear the output

        o.frequency.value = frequency
        g.gain.value = volume
        o.start(0)
        o.stop(audio.currentTime + duration)
        return o;
    }
    static successCallback(stream) {
        GuitarTuner.mediaStream = stream;
        console.log("Estoy en el callback");
        const {
            audioContext,
            analyser
        } = Microphone.setupAudioChain(stream);

        var sampleRate = audioContext.sampleRate;
        var data = new Float32Array(analyser.fftSize);
        function step() {
            requestAnimationFrame(step);
            analyser.getFloatTimeDomainData(data);

            let sumSquares = 0;
            for (let i = 0; i < data.length; i++) {
                sumSquares += data[i] * data[i];
            }
            let rms = Math.sqrt(sumSquares / data.length);

            if (rms < Microphone.threshold) {
                return;
            }

            var pitchInHz = window.yin(data, sampleRate);

            if (Number(pitchInHz) > 1000 || Number(pitchInHz) < 47 || !pitchInHz) {
                console.log(pitchInHz);
                return;
            }
            console.log(pitchInHz);
            var stringIndex;
            if (GuitarTuner.getTuningMode() == 0) {
                stringIndex = GuitarTuner.getClosestString(pitchInHz);
                GuitarTuner.setTuningString(stringIndex, GuitarTuner.getCentsOff(pitchInHz, GuitarTuner.stringArray[stringIndex]));
            } else if (GuitarTuner.getTuningMode() == 1) {
                stringIndex = GuitarTuner.getSelectedString();
                GuitarTuner.setTuningString(stringIndex, GuitarTuner.getCentsOff(pitchInHz, GuitarTuner.stringArray[stringIndex]));
            }
        }
        requestAnimationFrame(step);
    }
    static getClosestString(frequency) {
        var index = 0;
        var minDiff = Number.MAX_VALUE;
        for (var i = 0; i < this.stringArray.length - 1; i++) {
            var diff = Math.abs(this.stringArray[i] - frequency);
            if (diff < minDiff) {
                minDiff = diff;
                index = i;
            }
        }
        return index;
    }
    static getTuningMode() {
        return this.tuningMode;
    }
    static getSelectedString() {
        return this.tuningString;
    }
    static setTuningString(tuningString, cents) {
        this.tuningString = tuningString;
        let color;
        let text;
        $('#cents-off').text(Number(cents).toFixed(2) + " cents");
        if (Math.abs(cents) > 10) {
            color = "red";
        } else if (Math.abs(cents) > 5) {
            color = "yellow";
        } else {
            color = "green";
        }
        $(".marker").css('background-color', color);
        let margin = GuitarTuner.map(cents);
        let direction;
        let cleanDirection;
        if (cents > 0) {
            text = "Too sharp, Loose the string";
            cleanDirection = "margin-right";
            direction = "margin-left";
        } else {
            cleanDirection = "margin-left";
            text = "Too flat, Tighten the string";
            direction = "margin-right";
        }
        $('#string-indicator').text(color === "green" ? "Ok" : text);
        $(".circular-button-clicked").toggleClass("circular-button-clicked");
        let currentStringButton = $('div[name="string-' + tuningString + '"]');
        currentStringButton.css('border-color', color);
        currentStringButton.toggleClass("circular-button-clicked");
        $("#indicator").css(cleanDirection, '');
        $("#indicator").css(direction, margin + '%');
    }

    static getCentsOff(pitchInHz, expectedFrequency) {
        //Math.log(2.0) = 0.6931471805599453;
        //12*100
        return 1200 * Math.log(pitchInHz / expectedFrequency) / 0.6931471805599453;
    }
    static map(mCentsDiff) {
        mCentsDiff = Math.abs(mCentsDiff);
        var borders = 0;
        if (mCentsDiff > 50 || mCentsDiff < -50) {
            return 100;
        }
        var input_end = 50;
        var input_start = 0;
        var output_end = 100;
        var input_range = input_end - input_start;
        var output_range = output_end - borders;
        var output = (mCentsDiff - input_start) * output_range / input_range + borders;
        return output;
    }

}