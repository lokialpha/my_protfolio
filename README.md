# Aung Aung · Space-Themed Portfolio

Python-served portfolio for Aung Aung, a web developer. Features animated starfield, nebula accents, orbiting visuals, and a dark/light theme switch.

## Run locally

1. Ensure Python 3 is available.
2. Start the built-in server from the project root (binds to localhost by default):
   ```bash
   python3 app.py
   ```
   - Optional: set a port or host: `PORT=9000 HOST=127.0.0.1 python3 app.py`
3. Open `http://127.0.0.1:8000` (or your chosen host:port) in your browser.

## What is inside

- `index.html` — home hero, section previews, and links to the dedicated pages (projects load details from GitHub repos `letsphuket`, `my_media_project`, and `pos_project` for user `lokialpha` at runtime; experience pulls GitHub profile + latest repo details).
- `styles.css` — space-inspired theme, animations, layout, and responsive tweaks.
- `script.js` — starfield canvas animation, GitHub project loader, and dark/light theme toggle with persistence.
- `pages/` — standalone pages for About, Skills, Projects, Experience, and Contact.
- `assets/aung-aung.jpg` — place your portrait here (referenced by the hero photo frame).
- `app.py` — minimal Python HTTP server (no external dependencies).

Feel free to edit the content, project entries, or styling to fit your story.
