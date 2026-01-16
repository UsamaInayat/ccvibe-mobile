/*
 * CCVibe Mobile - Auto-translate Roman Hindi/Urdu to English
 * Vendetta/Bunny/Revenge Plugin for Discord Mobile
 */

// Store patches for cleanup
const patches: (() => void)[] = [];

// Translation cache
const translationCache = new Map<string, string>();

// =============================================================================
// HINDI/URDU DETECTION (inline to avoid import issues)
// =============================================================================

const HINDI_WORDS = new Set([
    "kya", "hai", "hain", "nahi", "nhi", "acha", "accha", "theek", "thik",
    "kaise", "kaisa", "kyun", "kyu", "kab", "kahan", "kaun", "kon",
    "mein", "main", "mujhe", "mera", "meri", "tum", "tumhara", "aap",
    "yeh", "ye", "woh", "wo", "koi", "kuch", "sab", "bahut", "bohot",
    "aur", "lekin", "par", "toh", "bhi", "hi", "na", "mat",
    "kar", "karo", "karna", "bolo", "bol", "dekho", "dekh", "suno", "sun",
    "chalo", "chal", "jao", "ja", "aao", "aa", "lo", "le", "do", "de",
    "yaar", "bhai", "behen", "dost", "log", "ghar", "kaam",
    "pata", "maloom", "samajh", "soch", "baat", "cheez",
    "abhi", "baad", "pehle", "kal", "aaj", "raat", "subah",
    "accha", "bura", "sahi", "galat", "zyada", "thoda",
    "haan", "han", "ji", "bilkul", "zaroor", "shayad",
    "masla", "mushkil", "pareshani", "dikkat", "taklif",
    "karra", "krra", "horra", "rha", "rhi", "ho", "hy"
]);

function isHindiUrdu(text: string): boolean {
    if (!text || text.length < 3) return false;
    const words = text.toLowerCase().split(/\s+/);
    let hindiCount = 0;
    for (const word of words) {
        const clean = word.replace(/[^a-z]/g, "");
        if (HINDI_WORDS.has(clean)) hindiCount++;
    }
    return hindiCount >= 2;
}

// =============================================================================
// TRANSLATION (inline Google Translate)
// =============================================================================

async function translate(text: string): Promise<string> {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        if (!res.ok) return text;
        const data = await res.json();
        if (data?.[0]) {
            const translated = data[0]
                .filter((x: any) => x?.[0])
                .map((x: any) => x[0])
                .join("");
            if (translated && translated.toLowerCase() !== text.toLowerCase()) {
                return translated;
            }
        }
    } catch (e) {
        console.log("[CCVibe] Translation error:", e);
    }
    return text;
}

// =============================================================================
// PLUGIN LIFECYCLE
// =============================================================================

export const onLoad = () => {
    console.log("[CCVibe] Plugin loading...");

    // Dynamically require modules to avoid load-time errors
    let vendetta: any;
    try {
        vendetta = (window as any).vendetta || (window as any).bunny || (window as any).revenge;
    } catch (e) {
        console.log("[CCVibe] No global vendetta object");
    }

    // Try to get FluxDispatcher
    let FluxDispatcher: any;
    try {
        const metro = require("@vendetta/metro/common");
        FluxDispatcher = metro?.FluxDispatcher;
    } catch (e) {
        console.log("[CCVibe] Could not load metro/common:", e);
    }

    // Try alternative ways to get FluxDispatcher
    if (!FluxDispatcher) {
        try {
            const { findByProps } = require("@vendetta/metro");
            FluxDispatcher = findByProps("dispatch", "subscribe");
        } catch (e) {
            console.log("[CCVibe] Could not find FluxDispatcher via findByProps");
        }
    }

    // Hook into message events
    if (FluxDispatcher?.subscribe) {
        console.log("[CCVibe] Found FluxDispatcher, subscribing to MESSAGE_CREATE");

        const messageHandler = async (event: any) => {
            try {
                const message = event?.message;
                if (!message?.content || typeof message.content !== "string") return;

                if (isHindiUrdu(message.content)) {
                    console.log("[CCVibe] Detected Hindi:", message.content);

                    // Check cache
                    const cached = translationCache.get(message.content);
                    if (cached) {
                        message.content = cached;
                        return;
                    }

                    // Translate
                    const translated = await translate(message.content);
                    if (translated !== message.content) {
                        const final = `${translated} [${message.content}]`;
                        translationCache.set(message.content, final);
                        message.content = final;
                        console.log("[CCVibe] Translated to:", translated);
                    }
                }
            } catch (e) {
                console.log("[CCVibe] Error in handler:", e);
            }
        };

        FluxDispatcher.subscribe("MESSAGE_CREATE", messageHandler);
        patches.push(() => FluxDispatcher.unsubscribe("MESSAGE_CREATE", messageHandler));
        console.log("[CCVibe] Subscribed to MESSAGE_CREATE");
    } else {
        console.log("[CCVibe] FluxDispatcher not available");
    }

    // Also try patching if patcher is available
    try {
        const { before } = require("@vendetta/patcher");
        const { findByProps } = require("@vendetta/metro");

        if (FluxDispatcher && before) {
            const unpatch = before("dispatch", FluxDispatcher, (args: any[]) => {
                const event = args[0];
                if (event?.type === "MESSAGE_CREATE" && event?.message?.content) {
                    if (isHindiUrdu(event.message.content)) {
                        console.log("[CCVibe] Intercepted via dispatch:", event.message.content);
                    }
                }
                return args;
            });
            patches.push(unpatch);
            console.log("[CCVibe] Patched FluxDispatcher.dispatch");
        }
    } catch (e) {
        console.log("[CCVibe] Could not set up patcher:", e);
    }

    console.log("[CCVibe] Plugin loaded with", patches.length, "hooks");
};

export const onUnload = () => {
    console.log("[CCVibe] Unloading...");
    for (const unpatch of patches) {
        try { unpatch(); } catch (e) { }
    }
    patches.length = 0;
    translationCache.clear();
    console.log("[CCVibe] Unloaded");
};

// Default export for compatibility
export default { onLoad, onUnload };
