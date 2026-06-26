const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'app', 'svgs');
const outFile = path.join(__dirname, '..', 'src', 'data', 'avatars.ts');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

const lines = [
  '// Auto-generated from app/svgs/*.svg',
  'export const AVATARS: Record<string, string> = {',
];

files.forEach(f => {
  const key = f.replace('-svgrepo-com.svg', '');
  let content = fs.readFileSync(path.join(dir, f), 'utf8');
  // Collapse newlines, escape backticks and ${}
  content = content.replace(/\n/g, ' ').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  lines.push(`  '${key}': \`${content}\`,`);
});

lines.push('};');
lines.push('');
lines.push('export const AVATAR_IDS = Object.keys(AVATARS);');
lines.push('');

fs.writeFileSync(outFile, lines.join('\n'));
console.log(`Written ${files.length} avatars to ${outFile}`);
