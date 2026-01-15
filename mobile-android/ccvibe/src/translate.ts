/*
 * CCVibe Mobile - Auto-translate Roman Hindi/Urdu to English
 * Translation service with multiple fallbacks
 * Priority: Google Translate → Dictionary (No native module on mobile)
 */

// =============================================================================
// TYPES
// =============================================================================

export interface TranslationResult {
    original: string;
    translated: string;
    sourceLanguage: string;
}

// =============================================================================
// TRANSLATION CACHE
// =============================================================================

const translationCache = new Map<string, TranslationResult>();
const MAX_CACHE_SIZE = 500;

export function clearCache() {
    translationCache.clear();
}

// =============================================================================
// SLANG DICTIONARY - Fallback for profanity/slang that APIs miss
// =============================================================================

const SLANG_DICTIONARY: Record<string, string> = {
    // Profanity/Slang (common)
    "bc": "sister f***er",
    "mc": "mother f***er",
    "bsdk": "born of a sister f***er",
    "bhosdike": "born of a loose woman",
    "bhosdi": "loose woman",
    "madarchod": "mother f***er",
    "behenchod": "sister f***er",
    "chutiya": "idiot/fool",
    "chutiye": "idiots/fools",
    "gandu": "a**hole",
    "gaand": "a**",
    "lodu": "d**khead",
    "lund": "d**k",
    "chod": "f**k",
    "chodna": "to f**k",
    "randi": "prostitute",
    "harami": "bastard",
    "haramkhor": "illegitimate",
    "kamina": "scoundrel",
    "kameena": "scoundrel",
    "kutte": "dog (insult)",
    "kutta": "dog (insult)",
    "suar": "pig (insult)",
    "ullu": "owl (idiot)",
    "gadha": "donkey (idiot)",
    "bakwas": "nonsense",
    "bewakoof": "stupid",
    "pagal": "crazy",
    "saala": "brother-in-law (insult)",
    "saali": "sister-in-law (insult)",

    // Common expressions
    "kya": "what",
    "hai": "is",
    "hain": "are",
    "nahi": "no/not",
    "haan": "yes",
    "acha": "good/okay",
    "accha": "good/okay",
    "theek": "okay/fine",
    "bahut": "very/much",
    "bohot": "very/much",
    "zyada": "more/too much",
    "thoda": "a little",
    "abhi": "now",
    "baad": "after/later",
    "pehle": "before/first",
    "yaar": "friend/dude",
    "bhai": "brother",
    "behen": "sister",

    // Common abbreviations
    "ni": "not",
    "nhi": "no",
    "koi": "someone",
    "masla": "problem",
    "toh": "so",
    "karra": "doing",
    "kara": "doing",
    "krra": "doing",
    "kar rha": "doing",
    "kar raha": "doing",
    "ho rha": "happening",
    "ho raha": "happening",
    "chal rha": "going on",
    "chal raha": "going on",

    // Common phrases
    "koi masla": "any problem",
    "kya chal raha": "what's going on",
    "kya ho raha": "what's happening",
    "kaise ho": "how are you",
    "theek hai": "okay/fine",
    "accha hai": "it's good",
    "bura hai": "it's bad",
    "pata nahi": "don't know",
    "samajh nahi": "don't understand",
    "bol na": "say it",
    "bata na": "tell me",
    "sun be": "listen",
    "dekh be": "look/see",
    "chal be": "come on",
    "haan bhai": "yes brother",
    "nahi yaar": "no dude",
    "kya baat hai": "what's the matter/wow",
    "koi ni": "no problem",
    "koi nahi": "no one/no problem",
};

// =============================================================================
// GOOGLE TRANSLATE (Primary for mobile)
// =============================================================================

async function tryGoogleTranslate(text: string): Promise<string | null> {
    try {
        // Using Google Translate's informal API
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;

        const response = await fetch(url);
        if (!response.ok) {
            console.log(`[CCVibe] Google Translate HTTP error: ${response.status}`);
            return null;
        }

        const data = await response.json();

        // Extract translation from response
        if (data && data[0] && Array.isArray(data[0])) {
            const translation = data[0]
                .filter((item: unknown) => item && Array.isArray(item) && item[0])
                .map((item: unknown[]) => item[0])
                .join("");

            if (translation && isRealTranslation(text, translation)) {
                return translation;
            }
        }

        return null;
    } catch (error) {
        console.error("[CCVibe] Google Translate error:", error);
        return null;
    }
}

// =============================================================================
// DICTIONARY TRANSLATE (Fallback)
// =============================================================================

function dictionaryTranslate(text: string): string | null {
    const lowerText = text.toLowerCase().trim();

    // Direct match for full text (without punctuation)
    const cleanText = lowerText.replace(/[?!.,]/g, "").trim();
    if (SLANG_DICTIONARY[cleanText]) {
        return SLANG_DICTIONARY[cleanText];
    }

    // Try to match multi-word phrases first
    let result = lowerText;
    let hasTranslation = false;

    // Sort dictionary entries by length (longer phrases first)
    const sortedPhrases = Object.entries(SLANG_DICTIONARY)
        .filter(([key]) => key.includes(" "))
        .sort((a, b) => b[0].length - a[0].length);

    for (const [phrase, translation] of sortedPhrases) {
        if (result.includes(phrase)) {
            result = result.replace(new RegExp(phrase, "gi"), translation);
            hasTranslation = true;
        }
    }

    // Word-by-word for remaining words
    const words = result.split(/\s+/);
    const translated = words.map(word => {
        // Remove punctuation for lookup but preserve it
        const cleanWord = word.replace(/[?!.,]/g, "").toLowerCase();
        const punctuation = word.match(/[?!.,]+$/)?.[0] || "";

        if (SLANG_DICTIONARY[cleanWord]) {
            hasTranslation = true;
            return SLANG_DICTIONARY[cleanWord] + punctuation;
        }
        return word;
    });

    if (hasTranslation) {
        const finalResult = translated.join(" ");
        console.log(`[CCVibe] Dictionary translating: "${text}" → "${finalResult}"`);
        return finalResult;
    }

    return null;
}

function isRealTranslation(original: string, translated: string): boolean {
    if (!translated) return false;
    const normOriginal = original.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normTranslated = translated.toLowerCase().replace(/[^a-z0-9]/g, "");
    return normOriginal !== normTranslated;
}

// =============================================================================
// MAIN TRANSLATION FUNCTION
// Priority: Google → Dictionary (No Groq on mobile due to CSP)
// =============================================================================

export async function translateToEnglish(text: string): Promise<TranslationResult> {
    // Check cache first
    const cached = translationCache.get(text);
    if (cached) return cached;

    const cacheAndReturn = (translated: string, source: string): TranslationResult => {
        const result: TranslationResult = { original: text, translated, sourceLanguage: source };
        if (translationCache.size >= MAX_CACHE_SIZE) {
            const firstKey = translationCache.keys().next().value;
            if (firstKey) translationCache.delete(firstKey);
        }
        translationCache.set(text, result);
        return result;
    };

    const startTime = Date.now();

    try {
        // 1st: Try Google Translate (primary on mobile)
        const googleResult = await tryGoogleTranslate(text);
        if (googleResult) {
            console.log(`[CCVibe] Google (${Date.now() - startTime}ms): "${text}" → "${googleResult}"`);
            return cacheAndReturn(googleResult, "google");
        }

        // 2nd: Try Dictionary (for profanity/slang)
        const dictResult = dictionaryTranslate(text);
        if (dictResult) {
            console.log(`[CCVibe] Dictionary (${Date.now() - startTime}ms): "${text}" → "${dictResult}"`);
            return cacheAndReturn(dictResult, "dictionary");
        }

        // Nothing worked
        console.log(`[CCVibe] No translation found for: "${text}"`);
        return { original: text, translated: text, sourceLanguage: "unchanged" };

    } catch (error) {
        console.error("[CCVibe] Translation error:", error);
        return { original: text, translated: text, sourceLanguage: "error" };
    }
}
