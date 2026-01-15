/*
 * CCVibe Mobile - Auto-translate Roman Hindi/Urdu to English
 * Language detection for Romanized Hindi/Urdu
 */

// ============================================================================
// STRONG HINDI/URDU INDICATORS - Words that are DEFINITELY Hindi/Urdu
// ============================================================================

const STRONG_HINDI_WORDS = new Set([
    // Pronouns (unique to Hindi/Urdu)
    "mein", "main", "mei", "mujhe", "mera", "meri", "mere", "humara", "humari", "humare", "hum", "ham",
    "tum", "tumhe", "tumhara", "tumhari", "tumhare", "aap", "aapka", "aapki", "apka", "apki",
    "unka", "unki", "uska", "uski", "isko", "usko", "inhe", "unhe", "inka",
    "yeh", "ye", "woh", "wo", "yehi", "wohi", "yahi", "wahi", "tera", "teri", "tere",

    // Question words (unique)
    "kya", "kaise", "kaisa", "kaisi", "kyun", "kyu", "kiu", "kiun", "kab", "kahan", "kaun", "kon", "kitna", "kitne", "kitni",

    // Verbs (unique conjugations)
    "hai", "hain", "hun", "tha", "thi", "hoga", "hogi", "hona", "hoti", "hota", "honge",
    "karo", "karna", "karta", "karti", "karke", "karunga", "kiya", "kiye", "karenge", "karte", "karega", "karegi",
    "bolo", "bolna", "bolta", "bola", "boli", "bolte", "bolti",
    "batao", "batana", "bataya", "batayi", "batate", "bata",
    "jao", "jana", "jata", "jati", "gaya", "gayi", "jayega", "jaate", "jate", "jaega", "jaana",
    "aao", "aana", "aata", "aaya", "aayi", "aayega", "aate", "ate", "ata", "aati", "aaty",
    "dekho", "dekhna", "dekha", "dekhi", "dekhega", "dekhte", "dekh",
    "suno", "sunna", "suna", "suni", "sunega", "sunte", "sun",
    "chalo", "chalna", "chala", "chali", "chalega", "chalte", "chal",
    "milo", "milna", "mila", "mili", "milega", "milte", "mil", "milti",
    "ruko", "rukna", "ruka", "ruki", "ruk",
    "socho", "sochna", "socha", "sochi", "soch", "sochte",
    "samjho", "samajhna", "samjha", "samjhi", "samajh", "samjhte",
    "rehna", "rehta", "rehti", "rahega", "rahna", "raha", "rahi", "rahe", "rahte",
    "banao", "banna", "bana", "bani", "banega", "bante",
    "khelo", "khelna", "khela", "kheli", "khel", "khelte",
    "padho", "padhna", "padha", "padhi", "padh", "padhte",
    "likho", "likhna", "likha", "likhi", "likh", "likhte",
    "dena", "deta", "deti", "diya", "diye", "dega", "degi", "dete",
    "lena", "leta", "leti", "liya", "liye", "lega", "legi", "lete",
    "sakta", "sakti", "sakte", "chahiye", "chahte", "chahta", "chahe",
    "pata", "maloom", "malum",

    // Negation (unique)
    "nahi", "nahin", "nai", "mat",

    // Adjectives (unique)
    "acha", "accha", "acchi", "acche", "theek", "thik", "sahi", "galat",
    "bahut", "bohot", "boht", "zyada", "jyada", "thoda", "thodi", "thode",
    "bada", "badi", "bade", "bara", "bari", "bare", "chota", "choti", "chote",
    "naya", "nayi", "naye", "purana", "purani", "purane",
    "itna", "itni", "itne", "itny", "utna", "utni", "utne",
    "ganda", "gandi", "gande", "gandey", "gandy",
    "ajeeb", "mazaak", "mazak",

    // Time (unique)
    "abhi", "phir", "fir", "baad", "pehle", "pahle",
    "aaj", "kal", "parso", "subah", "dopahar", "shaam", "raat",

    // Social (unique)
    "yaar", "yar", "bhai", "bhaiya", "behen", "behn", "dost", "beta", "beti", "bacha", "jaan", "jan",
    "amma", "abba", "abbu", "ammi",

    // Common nouns (unique)
    "ghar", "kamra", "jagah", "dukan", "kaam", "paisa", "paise",
    "cheez", "cheezein", "baat", "baatein", "khana", "paani", "chai", "doodh",
    "dimaag", "dimaagh", "dimag", "dil", "ankh", "aankh", "hath", "haath", "pair",
    "duniya", "zindagi", "waqt", "log", "banda", "bande", "bandi",
    "masla", "mushkil", "taklif", "pareshani", "dikkat",

    // Conjunctions/Particles (unique)
    "aur", "lekin", "magar", "kyunki", "kyuki", "isliye", "toh",
    "bhi", "wala", "wali", "wale", "ka", "ki", "ke", "ko", "se", "ne", "par", "pe",

    // Greetings (unique)
    "salam", "namaste", "namaskar", "shukriya", "dhanyavad",
    "alvida", "khudahafiz",

    // Common expressions
    "haan", "han", "ji", "bilkul", "zaroor", "shayad", "bas", "sirf",
    "waise", "aise", "jaise", "wese", "ese",

    // Locations
    "yahan", "wahan", "idhar", "udhar", "paas", "andar", "bahar",

    // Quantifiers
    "kuch", "kuj", "sab", "sabhi", "koi", "har", "hamesha",
]);

// Common abbreviations used in texting
const HINDI_ABBREVIATIONS = new Set([
    "tm", "ap", "nhi", "ni", "hy", "hen", "kro", "kra",
    "rha", "rhi", "rhe", "kr", "sy", "mje", "mjhe",
    "karra", "krra", "krrha", "krrahi", "horra", "horrha",
]);

// ============================================================================
// COMMON ENGLISH WORDS - To avoid false positives
// ============================================================================

const COMMON_ENGLISH_WORDS = new Set([
    // Articles & Prepositions
    "the", "a", "an", "in", "on", "at", "to", "for", "of", "with",
    "from", "by", "about", "into", "through", "during", "before",
    "after", "above", "below", "between", "under", "over",

    // Pronouns
    "i", "you", "he", "she", "it", "we", "they", "me", "him", "her",
    "us", "them", "my", "your", "his", "its", "our", "their",
    "this", "that", "these", "those", "who", "whom", "whose",
    "which", "what", "where", "when", "why", "how",

    // Verbs (common)
    "is", "am", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "must", "shall", "can",
    "get", "got", "getting", "make", "made", "making",
    "go", "going", "went", "gone", "come", "coming", "came",
    "see", "saw", "seen", "seeing", "know", "knew", "known",
    "think", "thought", "thinking", "want", "wanted", "wanting",
    "take", "took", "taken", "taking", "give", "gave", "given",
    "find", "found", "finding", "tell", "told", "telling",
    "say", "said", "saying", "ask", "asked", "asking",
    "use", "used", "using", "try", "tried", "trying",
    "need", "needed", "needing", "feel", "felt", "feeling",
    "become", "became", "becoming", "leave", "left", "leaving",
    "put", "putting", "mean", "meant", "meaning",
    "keep", "kept", "keeping", "let", "begin", "began", "begun",
    "seem", "seemed", "seeming", "help", "helped", "helping",
    "show", "showed", "shown", "showing", "hear", "heard",
    "play", "played", "playing", "run", "ran", "running",
    "move", "moved", "moving", "live", "lived", "living",
    "believe", "believed", "work", "worked", "working",
    "proud", "happy", "sad", "angry", "excited",

    // Adjectives
    "good", "bad", "new", "old", "great", "big", "small", "little",
    "long", "short", "high", "low", "young", "right", "wrong",
    "best", "better", "worst", "worse", "same", "different",

    // Adverbs
    "just", "also", "very", "really", "actually", "basically",
    "now", "then", "here", "there", "always", "never", "often",
    "still", "already", "yet", "soon", "again", "ever", "even",
    "well", "much", "more", "most", "less", "least", "only",

    // Conjunctions
    "and", "but", "or", "so", "because", "although", "though",
    "however", "therefore", "since", "while", "unless", "until",
    "if", "whether", "as", "than",

    // Internet/Tech slang (English)
    "lol", "lmao", "omg", "wtf", "idk", "btw", "tbh", "imo", "fyi",
    "brb", "gtg", "nvm", "smh", "ikr", "rn", "af", "ngl", "fr",
    "lowkey", "highkey", "vibe", "vibes", "mood", "flex", "cap",
    "sus", "slay", "bet", "lit", "fire", "based", "cringe",
    "dude", "bro", "bruh", "man", "guys", "fam", "homie",
    "gg", "ayo", "yo", "yoo", "damn", "dang", "wow",

    // Common online words
    "like", "post", "share", "comment", "follow", "subscribe",
    "video", "photo", "image", "link", "chat", "message", "dm",
    "online", "offline", "website", "app", "account", "profile",
]);

// ============================================================================
// DETECTION FUNCTIONS
// ============================================================================

interface DetectionResult {
    isHindiUrdu: boolean;
    confidence: number;
    hindiWordCount: number;
    englishWordCount: number;
    totalWords: number;
    reason: string;
}

function analyzeText(text: string): DetectionResult {
    const cleanText = text.toLowerCase().trim();
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    const totalWords = words.length;

    if (totalWords === 0) {
        return { isHindiUrdu: false, confidence: 0, hindiWordCount: 0, englishWordCount: 0, totalWords: 0, reason: "empty" };
    }

    let hindiWordCount = 0;
    let englishWordCount = 0;

    for (const word of words) {
        const cleanWord = word.replace(/[^a-z0-9]/g, "");
        if (!cleanWord) continue;

        if (STRONG_HINDI_WORDS.has(cleanWord) || HINDI_ABBREVIATIONS.has(cleanWord)) {
            hindiWordCount++;
        } else if (COMMON_ENGLISH_WORDS.has(cleanWord)) {
            englishWordCount++;
        }
    }

    let isHindiUrdu = false;
    let confidence = 0;
    let reason = "";

    // Decision logic - require at least 2 Hindi words OR 1 Hindi word with no English
    if (hindiWordCount === 0) {
        isHindiUrdu = false;
        confidence = 100;
        reason = "no Hindi/Urdu words found";
    } else if (hindiWordCount >= 2) {
        isHindiUrdu = true;
        confidence = Math.min(95, 50 + hindiWordCount * 10);
        reason = `${hindiWordCount} Hindi/Urdu words detected`;
    } else if (hindiWordCount === 1 && englishWordCount === 0) {
        isHindiUrdu = true;
        confidence = 60;
        reason = "1 Hindi word, no English";
    } else if (hindiWordCount === 1 && englishWordCount <= 1 && totalWords <= 4) {
        isHindiUrdu = true;
        confidence = 55;
        reason = "Hindi word in short message";
    } else {
        isHindiUrdu = false;
        confidence = 80;
        reason = `${englishWordCount} English vs ${hindiWordCount} Hindi`;
    }

    return {
        isHindiUrdu,
        confidence,
        hindiWordCount,
        englishWordCount,
        totalWords,
        reason
    };
}

export function isLikelyHindiUrdu(text: string): boolean {
    if (text.length < 3) return false;

    // Skip URLs, commands, code blocks
    if (/^https?:\/\//.test(text)) return false;
    if (/^[\/!\.]\w+/.test(text)) return false;
    if (/^```/.test(text)) return false;
    if (/^<[@#]/.test(text)) return false;

    const result = analyzeText(text);

    if (result.hindiWordCount > 0) {
        console.log(`[CCVibe] Detection: "${text.substring(0, 50)}${text.length > 50 ? "..." : ""}" → ${result.isHindiUrdu ? "HINDI" : "ENGLISH"} (${result.confidence}% - ${result.reason})`);
    }

    return result.isHindiUrdu && result.confidence >= 50;
}
