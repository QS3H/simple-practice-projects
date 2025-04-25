const fs = require('fs');
const path = require('path');

// Configuration
const githubUsername = 'QS3H';
const repoName = 'simple-practice-projects';
const githubPagesBase = `https://${githubUsername.toLowerCase()}.github.io/${repoName}/`;

// Directory containing all projects
const projectsDir = __dirname;
const readmePath = path.join(projectsDir, 'README.md');

// Helper to make a URL-friendly folder name
function toUrlPath(folderName) {
  return encodeURIComponent(folderName).replace(/%20/g, '%20');
}

// Utility to escape RegExp special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Get all project folders (ignore .git and files)
function getProjectFolders() {
  return fs.readdirSync(projectsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() &&
      dirent.name !== '.git' &&
      dirent.name !== 'node_modules')
    .map(dirent => dirent.name);
}

// Update README.md with live demo links
function updateReadme() {
  const readme = fs.readFileSync(readmePath, 'utf-8');
  const folders = getProjectFolders();
  let newReadme = readme;

  folders.forEach(folder => {
    // Escape folder name for regex
    const folderEscaped = escapeRegExp(folder);
    // Regex to match the section for this project
    // e.g., ### Age Calculator\n...\n**[Live Demo](#)**
    const sectionRegex = new RegExp(`(### ${folderEscaped}\\n[\\s\\S]*?)\\*\\*\\[Live Demo\\]\\(#\\)\\*\\*`, 'm');
    const liveDemoUrl = githubPagesBase + toUrlPath(folder) + '/';
    newReadme = newReadme.replace(sectionRegex, `$1**[Live Demo](${liveDemoUrl})**`);
  });

  fs.writeFileSync(readmePath, newReadme, 'utf-8');
  console.log('README.md updated with GitHub Pages links!');
}

updateReadme();
