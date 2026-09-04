const fs = require('fs');

const f = 'src/components/dashboard/dashboard-real-map-leaflet.tsx';
let c = fs.readFileSync(f, 'utf8');
const lines = c.split(/\r?\n/);

// Find the second catch closing brace and the return statement
let secondCatchClose = -1;
let returnLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (i > 940 && i < 960 && lines[i].trim() === '}' && lines[i-1] && lines[i-1].includes('无人机绘制异常')) {
    secondCatchClose = i;
  }
  if (secondCatchClose > 0 && i > secondCatchClose && lines[i].includes('return (')) {
    returnLine = i;
    break;
  }
}

console.log('secondCatchClose:', secondCatchClose + 1);
console.log('returnLine:', returnLine + 1);

if (secondCatchClose > 0 && returnLine > 0) {
  // Check what's between secondCatchClose and returnLine
  console.log('Lines between:');
  for (let i = secondCatchClose; i <= returnLine; i++) {
    console.log((i+1) + ': ' + JSON.stringify(lines[i]));
  }
  
  // Insert after secondCatchClose:
  // 1. Close map.whenReady callback: "    })"
  // 2. Close useEffect with deps: "  }, [ready, markers, drones, LEAFLET, onMarkerClick])"
  // 3. Blank line
  const insertion = [
    '    })',
    '  }, [ready, markers, drones, LEAFLET, onMarkerClick])',
    '',
  ];
  
  lines.splice(secondCatchClose + 1, 0, ...insertion);
  fs.writeFileSync(f, lines.join('\n'), 'utf8');
  console.log('FIXED: Added closing for map.whenReady and useEffect');
} else {
  console.log('Pattern not found');
}
