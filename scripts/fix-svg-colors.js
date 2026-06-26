/**
 * Post-processes SVGs from app/svgs-for-the-app/ to inline CSS class fills
 * as inline fill attributes, because react-native-svg's SvgXml doesn't
 * process <style> blocks.
 *
 * Run: node scripts/fix-svg-colors.js
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'app', 'svgs-for-the-app');

function inlineCssClasses(svgContent) {
  // Extract <style> block
  const styleMatch = svgContent.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (!styleMatch) return svgContent; // No style block, already inline

  const styleText = styleMatch[1];

  // Parse class definitions: .a{fill:#ffffff;} or .b { fill: #211715; }
  const classMap = {};
  const classRegex = /\.([a-zA-Z_][\w-]*)\s*\{([^}]+)\}/g;
  let m;
  while ((m = classRegex.exec(styleText)) !== null) {
    const className = m[1];
    const declarations = m[2];
    // Extract fill value
    const fillMatch = declarations.match(/fill\s*:\s*([^;]+)/i);
    if (fillMatch) {
      classMap[className] = fillMatch[1].trim();
    }
  }

  if (Object.keys(classMap).length === 0) return svgContent;

  let result = svgContent;

  // Replace class="x" with fill="color" on path elements
  for (const [cls, fill] of Object.entries(classMap)) {
    // Match class="className" on any element
    const classAttrRegex = new RegExp(`class="${cls}"`, 'g');
    result = result.replace(classAttrRegex, `fill="${fill}"`);
  }

  // Remove <style> block (and surrounding <defs> if it only contained the style)
  result = result.replace(/<defs>\s*<style[^>]*>[\s\S]*?<\/style>\s*<\/defs>/gi, '');
  // Also handle style block without defs wrapper
  result = result.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  return result;
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.svg'));
let fixed = 0;

for (const file of files) {
  const filePath = path.join(DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('<style')) {
    const cleaned = inlineCssClasses(content);
    fs.writeFileSync(filePath, cleaned, 'utf8');
    console.log(`✅ Fixed: ${file}`);
    fixed++;
  } else {
    console.log(`⏭️  Already inline: ${file}`);
  }
}

console.log(`\nDone. Fixed ${fixed}/${files.length} SVGs.`);
