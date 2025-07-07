class Crepe {
    modelURL = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
    static #instance = null;

    constructor(audioContext, stream, onReady) {
        if (Crepe.#instance) {
            throw new Error("Use Crepe.getInstance() instead.");
        }
        const snackbar = document.createElement("div");
        snackbar.id = "snackbar";
        snackbar.style.position = "fixed";
        snackbar.style.bottom = "20px";
        snackbar.style.right = "20px";
        snackbar.style.color = "#ffff";
        snackbar.style.backgroundColor = "gray";
        snackbar.style.padding = "15px";
        snackbar.style.borderRadius = "3px";
        snackbar.style.zIndex = "1000";
        document.body.appendChild(snackbar);
        snackbar.textContent = "Loading Crepe model...";
        Crepe.#instance = ml5.pitchDetection(this.modelURL, audioContext, stream, () => {
            document.body.removeChild(snackbar);
            onReady();
        });
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