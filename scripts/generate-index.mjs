import fs from "fs";
import path from "path";

const DIST = path.join(process.cwd(), "dist");
const PROJECTS_DIR = path.join(process.cwd(), "projects");
const PICTURES_DIR = path.join(process.cwd(), "pictures");

// 1. Clean and Create Dist Folders
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, "projects"), { recursive: true });
fs.mkdirSync(path.join(DIST, "pictures"), { recursive: true });

// 2. Copy Assets
if (fs.existsSync(PROJECTS_DIR)) fs.cpSync(PROJECTS_DIR, path.join(DIST, "projects"), { recursive: true });
if (fs.existsSync(PICTURES_DIR)) fs.cpSync(PICTURES_DIR, path.join(DIST, "pictures"), { recursive: true });

// 3. Process Projects
const projects = fs.existsSync(PROJECTS_DIR) ? fs.readdirSync(PROJECTS_DIR).filter(f => fs.existsSync(path.join(PROJECTS_DIR, f, "index.html"))).map(folder => {
  const html = fs.readFileSync(path.join(PROJECTS_DIR, folder, "index.html"), "utf8");
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1].trim() || folder.replace(/-/g, " ");
  return { title, href: `./projects/${folder}/index.html` };
}).sort((a, b) => a.title.localeCompare(b.title)) : [];

// 4. Process General Pictures
const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
const images = fs.existsSync(PICTURES_DIR) ? fs.readdirSync(PICTURES_DIR).filter(file => 
  validExtensions.includes(path.extname(file).toLowerCase())
) : [];

// 5. Generate HTML content
const projectList = projects.map(p => `<li><a href="${p.href}">${p.title}</a></li>`).join("");
const imageGallery = images.map(img => `<img src="./pictures/${img}" alt="Gallery Image">`).join("");

const fullHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>My Hub</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0b1020; color: #e9ecff; margin: 0; padding: 40px; }
    .container { max-width: 900px; margin: 0 auto; }
    a { color: #9ac6ff; text-decoration: none; font-size: 1.1rem; }
    a:hover { text-decoration: underline; }
    
    section { margin-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; }
    h2 { opacity: 0.8; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
    ul { list-style: none; padding: 0; }
    li { margin: 10px 0; }

    .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 20px; }
    .gallery img { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); }
  </style>
</head>
<body>
  <div class="container">
    <h1>Dashboard</h1>
    
    <section>
      <h2>Projects</h2>
      <ul>${projectList || "<li>No projects found.</li>"}</ul>
    </section>

    <section>
      <h2>Gallery</h2>
      <div class="gallery">${imageGallery || "<p>No images found in /pictures.</p>"}</div>
    </section>
  </div>
</body>
</html>`;

// 6. Write Files
fs.writeFileSync(path.join(DIST, "index.html"), fullHtml);
fs.writeFileSync(path.join(DIST, ".nojekyll"), "");

console.log(`Build Success: ${projects.length} projects and ${images.length} images.`);
