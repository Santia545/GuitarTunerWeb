class Microphone {

    static gain = 1;
    static threshold = 0.01;

    static setupAudioChain(stream) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        const microphoneNode = audioContext.createMediaStreamSource(stream);

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 8192;

        const gainNode = audioContext.createGain();
        gainNode.gain.value = this.gain;

        const lowPassFilter1 = audioContext.createBiquadFilter();
        lowPassFilter1.Q.value = 0;
        lowPassFilter1.frequency.value = 4200;
        lowPassFilter1.type = "lowpass";

        const lowPassFilter2 = audioContext.createBiquadFilter();
        lowPassFilter2.Q.value = 0;
        lowPassFilter2.frequency.value = 4200;
        lowPassFilter2.type = "lowpass";

        const highPassFilter1 = audioContext.createBiquadFilter();
        highPassFilter1.Q.value = 0;
        highPassFilter1.frequency.value = 46;
        highPassFilter1.type = "highpass";

        const highPassFilter2 = audioContext.createBiquadFilter();
        highPassFilter2.Q.value = 0;
        highPassFilter2.frequency.value = 46;
        highPassFilter2.type = "highpass";

        microphoneNode.connect(lowPassFilter1);
        lowPassFilter1.connect(lowPassFilter2);
        lowPassFilter2.connect(highPassFilter1);
        highPassFilter1.connect(highPassFilter2);
        highPassFilter2.connect(gainNode);
        gainNode.connect(analyser);

        return {
            audioContext,
            microphoneNode,
            analyser,
            gainNode,
            lowPassFilter1,
            lowPassFilter2,
            highPassFilter1,
            highPassFilter2
        };
    }
}