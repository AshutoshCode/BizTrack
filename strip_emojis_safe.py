import re, shutil, pathlib

FILE = pathlib.Path("lib/frontend.html")
text = FILE.read_text(encoding="utf-8")

# Matches the full Unicode emoji range, including variation selectors,
# zero-width joiners, skin-tone modifiers, and enclosing keycaps
EMOJI_RE = re.compile(
    "["
    "\U0001F300-\U0001FAFF"   # Misc symbols, emoticons, transport, flags …
    "\U00002600-\U000027BF"   # Misc symbols (☀ ✨ ⚙ …)
    "\U0000FE00-\U0000FE0F"   # Variation selectors (️ suffix)
    "\U0001F1E0-\U0001F1FF"   # Regional indicator letters (flag pairs)
    "\U0000200D"              # Zero-width joiner
    "\U00002702-\U000027B0"   # Dingbats
    "\u23F1"                  # Timer clock
    "\u23F3"                  # Hourglass
    "\u2192"                  # Right arrow
    "]+",
    flags=re.UNICODE,
)

cleaned = EMOJI_RE.sub("", text)

FILE.write_text(cleaned, encoding="utf-8")
print(f"Done safely.")
