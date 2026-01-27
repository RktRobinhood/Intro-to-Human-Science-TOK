import fs from "fs";
import path from "path";

// Paths relative to the repo root
const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const PROJECTS_DIR = path.join(ROOT, "projects");
const GALLERY_DIR = path.join(ROOT, "gallery"); // Unified folder for images/videos
const TOOLS_DIR = path.join(ROOT, "tools");     // Folder for utility HTML tools

// 1. Setup Dist (Clean and Recreate)
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, "projects"), { recursive: true });
fs.mkdirSync(path.join(DIST, "gallery"), { recursive: true });
fs.mkdirSync(path.join(DIST, "tools"), { recursive: true });

// 2. Copy Assets
if (fs.existsSync(PROJECTS_DIR)) fs.cpSync(PROJECTS_DIR, path.join(DIST, "projects"), { recursive: true });
if (fs.existsSync(GALLERY_DIR)) fs.cpSync(GALLERY_DIR, path.join(DIST, "gallery"), { recursive: true });
if (fs.existsSync(TOOLS_DIR)) fs.cpSync(TOOLS_DIR, path.join(DIST, "tools"), { recursive: true });

// Helper to process folder-based HTML lists (Projects & Tools)
function getHtmlList(directory, distName) {
  if (!fs.existsSync(directory)) return "<li>None found.</li>";
  
  const list = fs.readdirSync(directory)
    .filter(f => fs.existsSync(path.join(directory, f, "index.html")))
    .map(folder => {
      const html = fs.readFileSync(path.join(directory, folder, "index.html"), "utf8");
      const title = html.match(/<title>([^<]+)<\/title>/i)?.[1].trim() || folder;
      return { title, folder };
    })
    .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }));

  if (list.length === 0) return "<li>None found.</li>";
  return list.map(p => `<li><a href="./${distName}/${p.folder}/index.html">${p.title}</a></li>`).join("");
}

// 3. Process Projects & Tools
const projectsHTML = getHtmlList(PROJECTS_DIR, "projects");
const toolsHTML = getHtmlList(TOOLS_DIR, "tools");

// 4. Process Unified Gallery (Images + Videos)
const imgExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
const vidExts = ['.mp4', '.webm', '.ogg'];
let galleryHTML = "<p>No media found in /gallery.</p>";

if (fs.existsSync(GALLERY_DIR)) {
  const files = fs.readdirSync(GALLERY_DIR).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  
  const items = files.map(file => {
    const ext = path.extname(file).toLowerCase();
    if (imgExts.includes(ext)) {
      return `<img src="./gallery/${file}" onclick="zoom(this)" alt="Gallery Image" role="button">`;
    } else if (vidExts.includes(ext)) {
      return `<video src="./gallery/${file}" controls preload="metadata"></video>`;
    }
    return null;
  }).filter(Boolean);

  if (items.length > 0) galleryHTML = items.join("");
}

// 5. Build the Final Page
const fullHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>TOK: Human Sciences Hub</title>
  <style>
    :root { --bg: #0b1020; --card: rgba(255,255,255,0.05); --text: #e9ecff; --accent: #9ac6ff; }
    body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 5vw; line-height: 1.6; }
    .container { max-width: 1000px; margin: 0 auto; }
    
    .preamble { background: var(--card); border: 1px solid rgba(255,255,255,0.1); padding: 30px; border-radius: 16px; margin-bottom: 50px; }
    .preamble h2 { margin-top: 0; color: var(--accent); font-size: 1.8rem; border: none; opacity: 1; text-transform: none; letter-spacing: normal; }
    .preamble p { margin-bottom: 1.2rem; font-size: 1.05rem; opacity: 0.9; }
    .preamble ul { display: block; padding-left: 20px; margin: 10px 0; }
    .preamble li { background: transparent; border: none; padding: 5px 0; list-style: disc; display: list-item; text-align: left; }
    .important { border-left: 4px solid var(--accent); padding-left: 15px; font-style: italic; margin-top: 20px; }

    a { color: var(--accent); text-decoration: none; font-weight: bold; }
    a:hover { text-decoration: underline; }
    section { margin-bottom: 60px; }
    h2 { opacity: 0.6; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 20px; }
    
    .grid { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; }
    .grid li { background: var(--card); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); text-align: center; }

    .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
    .gallery img, .gallery video { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 12px; transition: transform 0.2s; border: 1px solid rgba(255,255,255,0.1); background: #000; }
    .gallery img { cursor: zoom-in; }
    .gallery img:hover { transform: scale(1.02); }

    #overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); display: none; align-items: center; justify-content: center; z-index: 1000; cursor: zoom-out; }
    #overlay img { max-width: 95%; max-height: 95%; border-radius: 4px; box-shadow: 0 0 40px black; }
  </style>
</head>
<body>
  <div class="container">
    <h1>TOK: The Human Sciences</h1>
    
    <div class="preamble">
      <h2>Collaborative Teaching Project</h2>
      <p>You will be put into groups. Each group needs to watch their video and complete the tabs underneath that elaborate or extend the topic.</p>
      
      <strong>Phase 1: Research & Preparation (Today)</strong>
      <ul>
        <li>Finalize a slide deck (10-15 slides) based on the content and your own extensions.</li>
        <li><strong>Don't just read your slides:</strong> Try to explain the concept, what was interesting, and what did not make sense or what you disagree with.</li>
        <li>If you did not like the hook video or follow-up, suggest what might you use instead. Is there a better modern reference?</li>
        <li>This lesson must be used to learn the topic and finalize slides; we jump straight into teaching next class.</li>
      </ul>

      <strong>Phase 2: Speed Dating (Next Lessons)</strong>
      <p>Next two classes will be set up as speed dating with 5 rounds in total (20 minutes each):</p>
      <ul>
        <li><strong>10 Minutes:</strong> You teach them your topic based on your produced slides.</li>
        <li><strong>10 Minutes:</strong> They teach you their topic.</li>
      </ul>

      <div class="important">
        <strong>Digital Accountability:</strong> This material needs to be shared digitally among your group. There is no excuse if one group member is missing next time—ensure everyone has the file.
      </div>
    </div>

    <section>
      <h2>Research Topics</h2>
      <ul class="grid">${projectsHTML}</ul>
    </section>

    <section>
      <h2>Visual Gallery</h2>
      <div class="gallery">${galleryHTML}</div>
    </section>

    <section>
      <h2>Utility Tools</h2>
      <ul class="grid">${toolsHTML}</ul>
    </section>
  </div>

  <div id="overlay" onclick="this.style.display='none'">
    <img id="overlay-img" src="">
  </div>

  <script>
    function zoom(el) {
      document.getElementById('overlay-img').src = el.src;
      document.getElementById('overlay').style.display = 'flex';
    }
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(DIST, "index.html"), fullHtml);
fs.writeFileSync(path.join(DIST, ".nojekyll"), "");
console.log("Build Complete: /dist generated with unified gallery and footer tools.");