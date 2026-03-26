# DRONA-AI — Guru TTS Voice Rebuild Guide (Perfect Male Indian Accent)

This file documents **exactly** how the “perfect” Guru voice is currently achieved, so if it ever drifts again you can hand this file to an agent and they can rebuild the same behavior.

---

## What “perfect voice” means (requirements)

- **Male voice only** (never pick female).
- **Indian accent / en-IN feel** for English responses.
- **Not robotic**: natural delivery settings.
- **Deterministic selection**: not dependent on `speechSynthesis.getVoices()` array order.
- Works in a browser using the **Web Speech API** (`window.speechSynthesis`).

---

## Source of truth (where the logic lives)

All voice-selection behavior is implemented in:

- `frontend/drona-ui/src/App.js`
  - `isFemaleVoice(voiceName)` (global)
  - `isMaleVoice(voiceName)` (global)
  - `getIndianLanguageVoice()` + `getVoiceProvider()` (global helpers)
  - `speak(text, lang)` (the actual TTS selection + speaking)

If the voice ever changes, **only edit `App.js`** first. Do not “fix” it inside individual components.

---

## Critical rules to preserve (do not remove)

### 1) Female blacklist must include these tokens

In `isFemaleVoice` keep these **at minimum**:

- `heera` (Windows India female voice commonly exposed)
- `neerja` (Microsoft India female voice)
- plus the generic female indicators already in the array (zira, hazel, etc.)

### 2) Male whitelist must include these tokens

In `isMaleVoice` keep these **at minimum**:

- `ravi` (Windows India male voice commonly exposed; ideal for “Guru”)
- `prabhat` (Microsoft India male voice)
- plus the other generic male indicators (david, etc.)

### 3) Don’t re-introduce duplicate gender detectors inside `speak()`

There should be only **one** `isFemaleVoice/isMaleVoice` implementation (the global ones).
If another copy appears inside `speak()`, voice selection becomes inconsistent across edits.

---

## The exact “perfect voice” selection strategy

Inside `speak()` the selection must follow this shape:

### A) Build voice pools

- `voices = window.speechSynthesis.getVoices()`
- `notFemale = voices.filter(v => !isFemaleVoice(v.name))`
- `maleVoices = notFemale.filter(v => isMaleVoice(v.name))`

This avoids falling into female voices even when the browser reshuffles the list.

### B) For English (the important part)

For `targetLang === "en-in"` the code must be **male-only** and must prefer:

1. **`Ravi` + `en-IN`** (best)
2. **`Prabhat` + `en-IN`** (next best)
3. **same provider family + male `en-IN`** (keeps accent consistent with Indian reference voice)
4. other male `en-IN`
5. as a last resort, any male `*-IN`

**Important:** do **NOT** fall back to “not-female `en-IN`” for English, because that can still select a female voice that’s not caught by the blacklist.

### C) Provider-family matching (accent consistency)

The code should:

- get `referenceVoice = getIndianLanguageVoice()`
- compute `refProvider = getVoiceProvider(referenceVoice.name)`
- prefer voices where `getVoiceProvider(v.name) === refProvider`

This is what preserves the “same spelling / sweet accent family” effect.

### D) Cache rules (to prevent drift)

- Do **not** cache the chosen voice for `en-IN` (English).  
  Reason: caching can “stick” a robot-like voice if it ever gets selected once.
- Caching is okay for non-English languages **if** you only cache voices already filtered by `maleVoices` or `notFemale`.

---

## One-time debug logs (keep them)

In `speak()` we keep one-time logs via `guruVoiceDebugOnceRef` to quickly diagnose voice drift:

- `🎧 TTS en-IN candidates (not-female): ...`
- `🎧 TTS en-IN male candidates: ...`
- `🎯 Reference voice/provider: ...`
- `🎯 TTS Guru voice: <name> | Lang: <lang> | Target: <targetLang>`

If voice ever changes again, these logs are the first evidence to inspect.

---

## Speech settings (avoid “robot” sound)

Keep these values (or extremely close):

- `utter.rate = 0.95`
- `utter.pitch = 1.0`
- `utter.volume = 1.0`

If the voice sounds robotic again, do **not** “fix” it by switching voices blindly—first confirm which voice is being selected by reading the debug logs.

---

## Rebuild checklist (if voice drifts again)

1. **Restart the React dev server** (hot reload can keep stale voice behavior):
   - stop the `npm start` process
   - start it again
2. Trigger any Guru speech and check console:
   - confirm `🎯 TTS Guru voice: ...` shows the expected male voice
3. If it’s female:
   - add the voice name token to `isFemaleVoice` blacklist
4. If it’s male but robotic:
   - confirm it isn’t an unwanted male voice being cached for `en-IN`
   - ensure en-IN caching is disabled
   - ensure `Ravi`/`Prabhat` en-IN are prioritized
5. Rebuild:
   - run `npm run build`

---

## Notes about system voices (Windows)

On Windows + Edge/Chrome, the exposed voices depend on installed “Speech” language packs.
If you don’t have **any** male `en-IN` voice installed, the app will fall back to other male `*-IN` voices, which may reduce the “sweet” accent quality.

If you ever need to improve the pool of available voices:

- Install Windows “English (India)” speech / voice packages
- Restart the browser after installing

---

## Minimal “what to tell an agent” (copy/paste)

If the voice changes again, paste this:

- “Restore DRONA Guru TTS: male-only, en-IN cascade Ravi → Prabhat → provider-match male en-IN → other male en-IN → male IN. Keep one-time debug logs. Ensure no duplicate gender detectors. Keep rate=0.95 pitch=1.0. Disable en-IN caching.”

