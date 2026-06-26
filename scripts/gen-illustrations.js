const fs = require('fs');
const path = require('path');
const dir = 'app/svgs-for-the-app';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

let out = '// Auto-generated illustration registry from app/svgs-for-the-app/\n';
out += 'export const ILLUSTRATIONS: Record<string, string> = {\n';

files.forEach(f => {
  const key = f.replace('-svgrepo-com.svg', '');
  // Read SVG content and clean it up
  let content = fs.readFileSync(path.join(dir, f), 'utf8');
  // Remove XML declaration and comments
  content = content.replace(/<\?xml[^?]*\?>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  // Remove \r and extra whitespace/newlines
  content = content.replace(/\r/g, '').replace(/\n\s*/g, ' ').trim();
  // Escape backticks and ${ in content for template literals
  content = content.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  out += `  '${key}': \`${content}\`,\n`;
});

out += '};\n';
out += '\n';
out += 'export const ILLUSTRATION_KEYS = Object.keys(ILLUSTRATIONS);\n';

fs.writeFileSync('src/data/appIllustrations.ts', out);
console.log(`Written ${files.length} illustrations to src/data/appIllustrations.ts`);
files.forEach(f => console.log(`  - ${f.replace('-svgrepo-com.svg', '')}`));
