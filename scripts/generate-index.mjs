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
  <title>TOK: Human Sciences Hub</title>
  <style>
    :root { --bg: #0b1020; --card: rgba(255,255,255,0.05); --text: #e9ecff; --accent: #9ac6ff; }
    body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 5vw; line-height: 1.6; }
    .container { max-width: 1000px; margin: 0 auto; }
    
    /* Instructions Styling */
    .preamble { background: var(--card); border: 1px solid rgba(255,255,255,0.1); padding: 30px; border-radius: 16px; margin-bottom: 50px; }
    .preamble h2 { margin-top: 0; color: var(--accent); text-transform: none; letter-spacing: normal; font-size: 1.8rem; opacity: 1; border: none; }
    .preamble p { margin-bottom: 1.2rem; font-size: 1.05rem; opacity: 0.9; }
    .preamble ul { display: block; grid-template-columns: none; background: transparent; border: none; padding-left: 20px; }
    .preamble li { background: transparent; border: none; padding: 5px 0; list-style: disc; display: list-item; }
    .important { border-left: 4px solid var(--accent); padding-left: 15px; font-style: italic; margin-top: 20px; }

    /* Links & Gallery */
    a { color: var(--accent); text-decoration: none; font-weight: bold; }
    a:hover { text-decoration: underline; }
    section { margin-bottom: 60px; }
    h2 { opacity: 0.6; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 20px; }
    
    .project-grid { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; }
    .project-grid li { background: var(--card); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); text-align: center; }

    .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
    .gallery img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 12px; cursor: zoom-in; transition: transform 0.2s; border: 1px solid rgba(255,255,255,0.1); }
    .gallery img:hover { transform: scale(1.02); }

    #overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); display: none; align-items: center; justify-content: center; z-index: 1000; cursor: zoom-out; }
    #overlay img { max-width: 95%; max-height: 95%; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>TOK: The Human Sciences</h1>
    
    <div class="preamble">
      <h2>Collaborative Teaching Project</h2>
      <p>You have been divided into 10 groups. Today, your objective is to master a specific concept within the TOK Human Sciences framework and prepare to teach it to your peers.</p>
      
      <strong>Phase 1: Research & Preparation (Today)</strong>
      <ul>
        <li>Access your group's link below, watch the introductory video, and complete the interactive tabs.</li>
        <li>Finalize a slide deck (aim for 10-15 slides) based on the content provided.</li>
        <li><strong>Don't just repeat the slides:</strong> Explain the core concept, share what was interesting, and identify areas where you disagree or found the logic confusing.</li>
        <li>Critique the "hook": If you found a better modern reference or a more engaging video for this topic, include it!</li>
      </ul>

      <strong>Phase 2: Speed Dating (Next Lesson)</strong>
      <p>Next class will be a high-energy teaching session consisting of 5 rounds (20 minutes each). In each round:</p>
      <ul>
        <li><strong>10 Minutes:</strong> You teach your topic to a group that hasn't seen it yet.</li>
        <li><strong>10 Minutes:</strong> They teach their topic to you.</li>
      </ul>

      <div class="important">
        <strong>Digital Accountability:</strong> All materials must be shared digitally within your group. Ensure every member has access to the slides; "the person with the file is absent" is not an excuse. Finish the slides today—next class starts with teaching immediately.
      </div>
    </div>

    <section>
      <h2>Research Topics</h2>
      <ul class="project-grid">${projects}</ul>
    </section>

    <section>
      <h2>Visual Gallery</h2>
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

console.log(`Build complete: ${projects.length} topics and ${images.length} gallery images.`);
