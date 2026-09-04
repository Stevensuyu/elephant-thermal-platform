const fs = require('fs');

const f = 'src/components/dashboard/dashboard-real-map-leaflet.tsx';
let c = fs.readFileSync(f, 'utf8');
const lines = c.split(/\r?\n/);

// FIX 1: handleRadiusChange - onDispatchZoneChange expects number
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('onDispatchZoneChange?.({ ...dispatchZone, radiusMeters: r })')) {
    lines[i] = '    onDispatchZoneChange?.(r)';
    console.log('FIX 1: Fixed onDispatchZoneChange call at line', i + 1);
    break;
  }
}

// FIX 2: AI center - use marker position instead of aiRecommendZone.center
// Find the line with aiRecommendZone?.center
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('aiRecommendZone?.center')) {
    // Replace with marker lookup
    lines[i] = '    const aiMarker = aiRecommendZone ? markers.find((m) => m.id === aiRecommendZone.markerId) : null';
    lines.splice(i + 1, 0,
      '    const aiCenter: [number, number] = aiMarker ? [aiMarker.lat, aiMarker.lng] : [24.88, 102.83]'
    );
    console.log('FIX 2: Fixed AI center at line', i + 1);
    break;
  }
}

// FIX 3: Replace remaining aiCenter references that use aiRecommendZone.center
// The variable definitions I added earlier use aiRecommendZone?.center - need to fix
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const aiCenter = (aiRecommendZone?.center')) {
    lines[i] = '    const aiMarker = aiRecommendZone ? markers.find((m) => m.id === aiRecommendZone.markerId) : null';
    lines.splice(i + 1, 0,
      '    const aiCenter: [number, number] = aiMarker ? [aiMarker.lat, aiMarker.lng] : [24.88, 102.83]'
    );
    console.log('FIX 3: Fixed aiCenter definition at line', i + 1);
    break;
  }
}

// FIX 4: Add null checks for aiRecommendZone in mainCircle creation
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const mainCircle = aiRecommendZone ?')) {
    // Already has null check, good
    console.log('FIX 4: mainCircle already has null check at line', i + 1);
    break;
  }
}

// FIX 5: Fix aiRecommendZone possibly undefined in bindTooltip/onClick
// These are wrapped in if (mainCircle) which implies aiRecommendZone exists, but TS doesn't know
// Add a guard: if (!aiRecommendZone || !mainCircle) return before the AI code
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '// AI 推荐区变量定义') {
    // Add guard after this line
    lines.splice(i + 1, 0,
      '    if (!aiRecommendZone) return'
    );
    console.log('FIX 5: Added aiRecommendZone guard at line', i + 2);
    break;
  }
}

fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('\n=== FIXES APPLIED ===');
