const fs = require('fs');

const f = 'src/components/dashboard/dashboard-real-map-leaflet.tsx';
let c = fs.readFileSync(f, 'utf8');
const lines = c.split(/\r?\n/);

// Find line with "}, [aiRecommendZone, markers, ready])"
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('}, [aiRecommendZone, markers, ready])')) {
    // Check if the previous line closes map.whenReady
    const prev = lines[i-1] ? lines[i-1].trim() : '';
    console.log('Found useEffect close at line', i+1);
    console.log('Previous line:', JSON.stringify(lines[i-1]));
    
    if (prev !== '})') {
      // Insert closing for map.whenReady before this line
      lines.splice(i, 0, '    })');
      fs.writeFileSync(f, lines.join('\n'), 'utf8');
      console.log('FIXED: Added }) to close map.whenReady before line', i+2);
    } else {
      console.log('map.whenReady already closed');
    }
    break;
  }
}
