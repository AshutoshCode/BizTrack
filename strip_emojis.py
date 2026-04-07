import re, shutil, pathlib

FILE = pathlib.Path("lib/frontend.html")

# Back up first
shutil.copy(FILE, FILE.with_suffix(".html.bak"))

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
    "]+",
    flags=re.UNICODE,
)

cleaned = EMOJI_RE.sub("", text)

# Collapse any double-spaces left behind (e.g. "🏠 Dashboard" → " Dashboard")
cleaned = re.sub(r"  +", " ", cleaned)
# Trim spaces that are now the only content between tags e.g. > ⚙️ < → >
cleaned = re.sub(r">\s{2,}<", "><", cleaned)

FILE.write_text(cleaned, encoding="utf-8")
print(f"Done. Original saved to {FILE.with_suffix('.html.bak')}")
