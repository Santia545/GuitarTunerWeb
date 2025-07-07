class Crepe {
    modelURL = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
    static #instance = null;

    constructor(audioContext, stream, onReady) {
        if (Crepe.#instance) {
            throw new Error("Use Crepe.getInstance() instead.");
        }
        Crepe.#instance = ml5.pitchDetection(this.modelURL, audioContext, stream, onReady);
    }

    static getInstance() {
        if (!Crepe.#instance) {
            throw new Error("Crepe instance not created. Use Crepe.getInstance(modelURL, audioContext, stream, onReady) to create it.");
        }
        return Crepe.#instance;
    }
    static getInstance(audioContext, stream, onReady) {
        if (!Crepe.#instance) {
            new Crepe(audioContext, stream, onReady);
        }
        return Crepe.#instance;
    }
}