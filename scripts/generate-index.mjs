import fs from "fs";
import path from "path";

const DIST = path.join(process.cwd(), "dist");
const PROJECTS_DIR = path.join(process.cwd(), "projects");
const PICTURES_DIR = path.join(process.cwd(), "pictures");

// 1. Setup Folders
fs.rmSync(DIST, { recursive: true, force: true });
[DIST, path.join(DIST, "projects"), path.join(DIST, "pictures")].forEach(p => fs.mkdirSync(p, { recursive: true }));

// 2. Copy Assets
if (fs.existsSync(PROJECTS_DIR)) fs.cpSync(PROJECTS_DIR, path.join(DIST, "projects"), { recursive: true });
if (fs.existsSync(PICTURES_DIR)) fs.cpSync(PICTURES_DIR, path.join(DIST, "pictures"), { recursive: true });

// 3. Process Projects
const projects = fs.existsSync(PROJECTS_DIR) ? fs.readdirSync(PROJECTS_DIR).filter(f => fs.existsSync(path.join(PROJECTS_DIR, f, "index.html"))).map(folder => {
  const html = fs.readFileSync(path.join(PROJECTS_DIR, folder, "index.html"), "utf8");
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1].trim() || folder.replace(/-/g, " ");
  return `<li><a href="./projects/${folder}/index.html">${title}</a></li>`;
}).sort().join("") : "<li>No projects found.</li>";

// 4. Process Gallery Images
const imgExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
const images = fs.existsSync(PICTURES_DIR) ? fs.readdirSync(PICTURES_DIR)
  .filter(file => imgExts.includes(path.extname(file).toLowerCase()))
  .map(img => `<img src="./pictures/${img}" onclick="zoom(this)" alt="Gallery Image" role="button">`)
  .join("") : "<p>No images found.</p>";

// 5. Generate HTML
const fullHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Project Hub</title>
  <style>
    :root { --bg: #0b1020; --card: rgba(255,255,255,0.05); --text: #e9ecff; --accent: #9ac6ff; }
    body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 5vw; line-height: 1.6; }
    .container { max-width: 1100px; margin: 0 auto; }
    a { color: var(--accent); text-decoration: none; font-size: 1.2rem; font-weight: 500; }
    a:hover { text-decoration: underline; }
    
    section { margin-bottom: 60px; }
    h2 { opacity: 0.6; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 20px; }
    ul { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
    li { background: var(--card); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); }

    /* Gallery - Larger Images */
    .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .gallery img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 12px; cursor: zoom-in; transition: transform 0.2s; border: 1px solid rgba(255,255,255,0.1); }
    .gallery img:hover { transform: scale(1.02); }

    /* Zoom Overlay */
    #overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: none; align-items: center; justify-content: center; z-index: 1000; cursor: zoom-out; }
    #overlay img { max-width: 90%; max-height: 90%; border-radius: 4px; box-shadow: 0 0 30px rgba(0,0,0,0.5); }
  </style>
</head>
<body>
  <div class="container">
    <h1>Dashboard</h1>
    
    <section>
      <h2>Projects</h2>
      <ul>${projects}</ul>
    </section>

    <section>
      <h2>Gallery</h2>
      <div class="gallery">${images}</div>
    </section>
  </div>

  <div id="overlay" onclick="this.style.display='none'">
    <img id="overlay-img">
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

console.log(`Build complete.`);
