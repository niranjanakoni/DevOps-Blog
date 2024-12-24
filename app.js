const fs = require('fs');
const path = require('path');
const express = require('express');
const marked = require('marked');
const app = express();

const PORT = 3000;
const DOCS_DIR = path.join(__dirname, 'docs');

// Serve static files (CSS, JS, images, etc.)
app.use(express.static('public'));

// Helper function to read Markdown files and convert them to HTML
const renderMarkdown = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return marked(fileContent);
  } catch (error) {
    console.error(`Error reading file: ${filePath}`, error);
    return '<h1>Error loading content</h1>';
  }
};

// Dynamically list all markdown files
app.get('/', (req, res) => {
  const getMarkdownFiles = (dir, prefix = '') => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(prefix, entry.name);

      if (entry.isDirectory()) {
        files.push(...getMarkdownFiles(fullPath, relativePath));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(relativePath);
      }
    }
    return files;
  };

  const markdownFiles = getMarkdownFiles(DOCS_DIR);
  let html = '<h1>DevOps Blog</h1><ul>';
  markdownFiles.forEach((file) => {
    const fileName = path.basename(file, '.md');
    html += `<li><a href="/docs/${file}">${fileName}</a></li>`;
  });
  html += '</ul>';
  res.send(html);
});

// Serve individual markdown files
app.get('/docs/:subpath(*)', (req, res) => {
  const filePath = path.join(DOCS_DIR, req.params.subpath);

  if (fs.existsSync(filePath) && filePath.endsWith('.md')) {
    const htmlContent = renderMarkdown(filePath);
    res.send(`<html><body>${htmlContent}</body></html>`);
  } else {
    res.status(404).send('<h1>404 - File Not Found</h1>');
  }
});

app.listen(PORT, () => {
  console.log(`DevOps Blog is running at http://localhost:${PORT}`);
});
