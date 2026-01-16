/*
 * CCVibe Mobile - Auto-translate Roman Hindi/Urdu to English
 * Vendetta/Bunny/Revenge Plugin for Discord Mobile
 */

// Store patches for cleanup
const patches: (() => void)[] = [];
const translationCache = new Map<string, string>();

// Hindi/Urdu word list
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
    "bura", "sahi", "galat", "zyada", "thoda",
    "haan", "han", "ji", "bilkul", "zaroor", "shayad",
    "masla", "mushkil", "pareshani", "dikkat", "taklif",
    "karra", "krra", "horra", "rha", "rhi", "ho", "hy"
]);

function isHindiUrdu(text: string): boolean {
    if (!text || text.length < 3) return false;
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;
    for (const w of words) {
        if (HINDI_WORDS.has(w.replace(/[^a-z]/g, ""))) count++;
    }
    return count >= 2;
}

async function translate(text: string): Promise<string> {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        if (!res.ok) return text;
        const data = await res.json();
        if (data?.[0]) {
            const result = data[0].filter((x: any) => x?.[0]).map((x: any) => x[0]).join("");
            if (result && result.toLowerCase() !== text.toLowerCase()) return result;
        }
    } catch (e) { }
    return text;
}

// Use React Native Alert for visible feedback
function showAlert(title: string, message: string) {
    try {
        const { Alert } = require("react-native");
        Alert?.alert?.(title, message);
    } catch (e) {
        console.log("[CCVibe]", title, message);
    }
}

export const onLoad = () => {
    console.log("[CCVibe] onLoad called");

    // Show alert so user knows plugin loaded
    showAlert("CCVibe", "Plugin is loading...");

    let FluxDispatcher: any = null;
    let hookCount = 0;

    // Try to get FluxDispatcher from vendetta/metro/common
    try {
        const common = require("@vendetta/metro/common");
        FluxDispatcher = common?.FluxDispatcher;
        if (FluxDispatcher) {
            console.log("[CCVibe] Got FluxDispatcher from metro/common");
        }
    } catch (e) {
        console.log("[CCVibe] metro/common failed:", e);
    }

    // Fallback: try findByProps
    if (!FluxDispatcher) {
        try {
            const { findByProps } = require("@vendetta/metro");
            FluxDispatcher = findByProps("dispatch", "subscribe");
            if (FluxDispatcher) {
                console.log("[CCVibe] Got FluxDispatcher via findByProps");
            }
        } catch (e) {
            console.log("[CCVibe] findByProps failed:", e);
        }
    }

    // Subscribe to MESSAGE_CREATE
    if (FluxDispatcher?.subscribe) {
        const handler = async (data: any) => {
            const msg = data?.message;
            if (!msg?.content || typeof msg.content !== "string") return;

            if (isHindiUrdu(msg.content)) {
                console.log("[CCVibe] Hindi detected:", msg.content);

                const cached = translationCache.get(msg.content);
                if (cached) {
                    msg.content = cached;
                    return;
                }

                const translated = await translate(msg.content);
                if (translated !== msg.content) {
                    const final = `${translated} [${msg.content}]`;
                    translationCache.set(msg.content, final);
                    msg.content = final;
                    console.log("[CCVibe] Translated:", translated);
                }
            }
        };

        FluxDispatcher.subscribe("MESSAGE_CREATE", handler);
        patches.push(() => FluxDispatcher.unsubscribe("MESSAGE_CREATE", handler));
        hookCount++;
        console.log("[CCVibe] Subscribed to MESSAGE_CREATE");
    }

    // Also try dispatch patching
    if (FluxDispatcher?.dispatch) {
        try {
            const { before } = require("@vendetta/patcher");
            const unpatch = before("dispatch", FluxDispatcher, (args: any[]) => {
                const event = args[0];
                if (event?.type === "MESSAGE_CREATE" && event?.message?.content) {
                    if (isHindiUrdu(event.message.content)) {
                        console.log("[CCVibe] Intercepted:", event.message.content);
                    }
                }
                return args;
            });
            patches.push(unpatch);
            hookCount++;
        } catch (e) { }
    }

    // Final status alert
    if (hookCount > 0) {
        showAlert("CCVibe Loaded!", `Successfully set up ${hookCount} hook(s).\n\nSend a Hindi message to test!`);
    } else {
        showAlert("CCVibe Error", "Could not find FluxDispatcher.\nPlugin may not work.");
    }

    console.log("[CCVibe] Loaded with", hookCount, "hooks");
};

export const onUnload = () => {
    console.log("[CCVibe] Unloading");
    for (const unpatch of patches) {
        try { unpatch(); } catch (e) { }
    }
    patches.length = 0;
    translationCache.clear();
    showAlert("CCVibe", "Plugin unloaded");
};

export default { onLoad, onUnload };
