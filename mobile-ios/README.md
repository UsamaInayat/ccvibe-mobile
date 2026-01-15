# CCVibe Mobile (iOS)

Auto-translate Roman Hindi/Urdu messages to English in Discord Mobile.

## Requirements

You need one of these Discord mobile mods installed on your iOS device:
- **Bunny** (Recommended) - Fork of Vendetta
- **Revenge** - Continuation of Bunny
- **Enmity** - Alternative iOS mod

## Installation

### Method 1: Direct URL Install

1. Open your Discord mod (Bunny/Revenge/Enmity)
2. Go to **Settings** → **Plugins**
3. Tap **"+"** or **"Install Plugin"**
4. Paste the plugin URL:
   ```
   https://YOUR_GITHUB_USERNAME.github.io/ccvibe-mobile/ios
   ```

### Method 2: Build Locally & Host

1. Install dependencies:
   ```bash
   cd mobile-ios/ccvibe
   npm install
   ```

2. Build the plugin:
   ```bash
   npm run build
   ```

3. Host the `ccvibe` folder on GitHub Pages or any web server

4. Install via URL in your Discord mod

## Features

- **Auto-detection**: Automatically detects Roman Hindi/Urdu text
- **Smart Translation**: Uses Google Translate API
- **Dictionary Fallback**: Includes slang/profanity translations
- **Show Original**: Option to show original text in brackets

## How It Works

1. When a message is received, CCVibe checks if it contains Hindi/Urdu words
2. If 2+ Hindi words are detected, the message is translated
3. Translation appears inline with optional original text

## Supported Mods

| Mod | Status | Notes |
|-----|--------|-------|
| Bunny | ✅ Supported | Recommended |
| Revenge | ✅ Supported | Latest fork |
| Enmity | ⚠️ May work | Not tested |
| Vendetta | ⚠️ Deprecated | Use Bunny instead |

## Troubleshooting

**Plugin not loading?**
- Make sure you're using a compatible mod version
- Check the console for error messages
- Try reinstalling the plugin

**Translations not showing?**
- Check your internet connection (Google Translate needs internet)
- Some messages may not be detected if they contain too many English words

## Building from Source

```bash
# Install dependencies
npm install

# Build plugin
npm run build

# Watch mode for development
npm run dev
```

## License

MIT License
