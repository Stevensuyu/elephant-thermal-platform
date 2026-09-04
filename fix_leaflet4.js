const fs = require('fs');

const f = 'src/components/dashboard/dashboard-real-map-leaflet.tsx';
let c = fs.readFileSync(f, 'utf8');
const lines = c.split(/\r?\n/);

// Find line with "}, [aiRecommendZone, markers, ready])"
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('}, [aiRecommendZone, markers, ready])')) {
    // The line before should be "    })" closing .on('click')
    // We need to add another "    })" to close map.whenReady
    console.log('Found useEffect close at line', i+1);
    console.log('Line before:', JSON.stringify(lines[i-1]));
    console.log('Line before that:', JSON.stringify(lines[i-2]));
    
    // Insert "    })" to close map.whenReady before the useEffect close
    lines.splice(i, 0, '    })');
    fs.writeFileSync(f, lines.join('\n'), 'utf8');
    console.log('FIXED: Added }) to close map.whenReady at line', i+1);
    break;
  }
}

// Re-check balance
const c2 = fs.readFileSync(f, 'utf8');
let paren = 0;
let inStr = false, strChar = '', inTemplate = false, inComment = false;
const lines2 = c2.split('\n');
for (let li = 0; li < lines2.length; li++) {
  for (let i = 0; i < lines2[li].length; i++) {
    const ch = lines2[li][i];
    const next = lines2[li][i+1];
    if (inComment) continue;
    if (inStr) { if (ch === '\\') i++; else if (ch === strChar) inStr = false; continue; }
    if (inTemplate) { if (ch === '\\') i++; else if (ch === '`') inTemplate = false; continue; }
    if (ch === '/' && next === '/') { inComment = true; continue; }
    if (ch === '"' || ch === "'") { inStr = true; strChar = ch; continue; }
    if (ch === '`') { inTemplate = true; continue; }
    if (ch === '(') paren++;
    if (ch === ')') paren--;
  }
  inComment = false;
}
console.log('Final paren balance:', paren);
