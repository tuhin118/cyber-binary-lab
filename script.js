const textInput = document.getElementById("textInput");
const binaryInput = document.getElementById("binaryInput");

const encodeBtn = document.getElementById("encodeBtn");
const decodeBtn = document.getElementById("decodeBtn");

const clearTextBtn = document.getElementById("clearTextBtn");
const clearBinaryBtn = document.getElementById("clearBinaryBtn");

const copyBtn = document.getElementById("copyBtn");
const swapBtn = document.getElementById("swapBtn");

const soundToggle = document.getElementById("soundToggle");

const textStats = document.getElementById("textStats");
const binaryStats = document.getElementById("binaryStats");
const status = document.getElementById("status");


// ============================
// SOUND SYSTEM
// ============================

let soundEnabled = false;
let audioContext = null;

function playSound(type = "click") {

    if (!soundEnabled) return;

    if (!audioContext) {
        audioContext = new (
            window.AudioContext ||
            window.webkitAudioContext
        )();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    let frequency = 500;
    let duration = 0.07;

    if (type === "success") {
        frequency = 800;
        duration = 0.12;
    }

    if (type === "error") {
        frequency = 180;
        duration = 0.18;
    }

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gain.gain.setValueAtTime(
        0.0001,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.05,
        audioContext.currentTime + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + duration
    );

    oscillator.start();
    oscillator.stop(
        audioContext.currentTime + duration
    );
}


// ============================
// STATUS
// ============================

function setStatus(message, type = "normal") {

    status.innerHTML = "";

    const dot = document.createElement("span");
    dot.className = "status-dot";

    status.appendChild(dot);

    status.appendChild(
        document.createTextNode(" " + message)
    );

    if (type === "error") {
        dot.style.background = "#ff405c";
        dot.style.boxShadow = "0 0 12px #ff405c";
    }

    if (type === "success") {
        dot.style.background = "#00ff9d";
        dot.style.boxShadow = "0 0 12px #00ff9d";
    }
}


// ============================
// TEXT → BINARY
// UTF-8 SUPPORT
// ============================

function textToBinary(text) {

    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);

    return Array.from(bytes)
        .map(byte =>
            byte
                .toString(2)
                .padStart(8, "0")
        )
        .join(" ");
}


// ============================
// BINARY → TEXT
// UTF-8 SUPPORT
// ============================

function binaryToText(binary) {

    const cleaned = binary
        .replace(/[^01]/g, " ")
        .trim();

    if (!cleaned) {
        return "";
    }

    const groups = cleaned.split(/\s+/);

    const bytes = [];

    for (const group of groups) {

        if (!/^[01]+$/.test(group)) {
            throw new Error("Invalid binary data.");
        }

        if (group.length !== 8) {
            throw new Error(
                "Each binary group must contain 8 bits."
            );
        }

        bytes.push(parseInt(group, 2));
    }

    const decoder = new TextDecoder(
        "utf-8",
        { fatal: true }
    );

    return decoder.decode(
        new Uint8Array(bytes)
    );
}


// ============================
// UPDATE STATISTICS
// ============================

function updateTextStats() {

    const text = textInput.value;

    const bytes =
        new TextEncoder().encode(text);

    textStats.textContent =
        `${text.length} characters • ${bytes.length} bytes`;
}


function updateBinaryStats() {

    const binary = binaryInput.value;

    const bits =
        binary.replace(/[^01]/g, "");

    const groups =
        bits.length > 0
            ? Math.ceil(bits.length / 8)
            : 0;

    binaryStats.textContent =
        `${bits.length} bits • ${groups} bytes`;
}


// ============================
// TEXT → BINARY BUTTON
// ============================

encodeBtn.addEventListener(
    "click",
    () => {

        playSound("click");

        const text = textInput.value;

        if (!text) {

            setStatus(
                "ENTER TEXT FIRST",
                "error"
            );

            playSound("error");

            return;
        }

        try {

            binaryInput.value =
                textToBinary(text);

            updateBinaryStats();

            setStatus(
                "TEXT SUCCESSFULLY ENCODED",
                "success"
            );

            playSound("success");

        } catch (error) {

            setStatus(
                "ENCODING ERROR",
                "error"
            );

            playSound("error");
        }
    }
);


// ============================
// BINARY → TEXT BUTTON
// ============================

decodeBtn.addEventListener(
    "click",
    () => {

        playSound("click");

        const binary =
            binaryInput.value;

        if (!binary.trim()) {

            setStatus(
                "ENTER BINARY DATA FIRST",
                "error"
            );

            playSound("error");

            return;
        }

        try {

            textInput.value =
                binaryToText(binary);

            updateTextStats();

            setStatus(
                "BINARY SUCCESSFULLY DECODED",
                "success"
            );

            playSound("success");

        } catch (error) {

            setStatus(
                error.message,
                "error"
            );

            playSound("error");
        }
    }
);


// ============================
// CLEAR TEXT
// ============================

clearTextBtn.addEventListener(
    "click",
    () => {

        textInput.value = "";

        updateTextStats();

        setStatus("SYSTEM READY");

        playSound("click");
    }
);


// ============================
// CLEAR BINARY
// ============================

clearBinaryBtn.addEventListener(
    "click",
    () => {

        binaryInput.value = "";

        updateBinaryStats();

        setStatus("SYSTEM READY");

        playSound("click");
    }
);


// ============================
// COPY BINARY
// ============================

copyBtn.addEventListener(
    "click",
    async () => {

        const binary =
            binaryInput.value;

        if (!binary) {

            setStatus(
                "NOTHING TO COPY",
                "error"
            );

            playSound("error");

            return;
        }

        try {

            await navigator.clipboard.writeText(
                binary
            );

            setStatus(
                "BINARY COPIED TO CLIPBOARD",
                "success"
            );

            playSound("success");

        } catch (error) {

            binaryInput.select();

            document.execCommand("copy");

            setStatus(
                "BINARY COPIED",
                "success"
            );

            playSound("success");
        }
    }
);


// ============================
// SWAP
// ============================

swapBtn.addEventListener(
    "click",
    () => {

        const temp =
            textInput.value;

        textInput.value =
            binaryInput.value;

        binaryInput.value =
            temp;

        updateTextStats();
        updateBinaryStats();

        setStatus("INPUTS SWAPPED");

        playSound("click");
    }
);


// ============================
// LIVE COUNTERS
// ============================

textInput.addEventListener(
    "input",
    updateTextStats
);

binaryInput.addEventListener(
    "input",
    updateBinaryStats
);


// ============================
// SOUND TOGGLE
// ============================

soundToggle.addEventListener(
    "click",
    () => {

        soundEnabled =
            !soundEnabled;

        soundToggle.textContent =
            soundEnabled
                ? "🔊"
                : "🔇";

        if (soundEnabled) {

            playSound("success");

            setStatus(
                "SOUND ENABLED",
                "success"
            );

        } else {

            setStatus(
                "SOUND DISABLED"
            );
        }
    }
);


// ============================
// INITIAL STATE
// ============================

updateTextStats();
updateBinaryStats();

setStatus("SYSTEM READY");
