const fs = require('fs');

const f = 'src/components/dashboard/dashboard-real-map-leaflet.tsx';
let c = fs.readFileSync(f, 'utf8');
const lines = c.split(/\r?\n/);

// Find the broken structure:
// Line ~923: "} catch (e) {"  (first catch - for markers)
// Line ~924: (empty or comment)
// Line ~925: ";(drones ?? []).forEach..."  (drone code WRONGLY inside catch)
// ...
// Line ~942: "})"  (end of drone forEach)
// Line ~943: "} catch (e) {"  (second catch - no matching try!)
// Line ~944: comment
// Line ~945: "}"  (closes something)

let firstCatch = -1;
let droneStart = -1;
let secondCatch = -1;
let closeBrace = -1;

for (let i = 0; i < lines.length; i++) {
  if (i > 910 && i < 930 && lines[i].includes('} catch (e) {')) {
    firstCatch = i;
  }
  if (firstCatch > 0 && lines[i].includes('(drones ?? []).forEach') && droneStart === -1) {
    droneStart = i;
  }
  if (firstCatch > 0 && i > 935 && i < 955 && lines[i].includes('} catch (e) {')) {
    secondCatch = i;
  }
  if (secondCatch > 0 && i > secondCatch && lines[i].trim() === '}' && closeBrace === -1) {
    closeBrace = i;
    break;
  }
}

console.log('firstCatch:', firstCatch + 1);
console.log('droneStart:', droneStart + 1);
console.log('secondCatch:', secondCatch + 1);
console.log('closeBrace:', closeBrace + 1);

if (firstCatch > 0 && droneStart > 0 && secondCatch > 0 && closeBrace > 0) {
  // The fix:
  // 1. After firstCatch line, add closing "}" for the first catch
  // 2. Add "try {" before drone code
  // 3. The second catch stays as the catch for the drone try
  // 4. Add closing "}" for the second catch after its body
  // 5. The closeBrace stays as-is

  // Current structure (lines firstCatch to closeBrace):
  // firstCatch:   } catch (e) {
  // firstCatch+1: (empty)
  // droneStart:   ;(drones ?? []).forEach((d) => {
  // ... drone code ...
  // secondCatch-1: })
  // secondCatch:  } catch (e) {
  // secondCatch+1: comment
  // closeBrace:   }

  // We need to insert:
  // - After firstCatch: "      }" (close first catch)
  // - Before droneStart: "      try {" (start drone try)
  // - After secondCatch+1 (comment): "      }" (close second catch)

  // Build the replacement
  const replacement = [];
  replacement.push('      } catch (e) {');
  replacement.push('        // 标记绘制异常，静默忽略');
  replacement.push('      }');
  replacement.push('');
  replacement.push('      try {');
  
  // Add drone code from droneStart to secondCatch-1
  for (let i = droneStart; i < secondCatch; i++) {
    replacement.push(lines[i]);
  }
  
  replacement.push('      } catch (e) {');
  replacement.push('        // 无人机绘制异常，静默忽略');
  replacement.push('      }');

  // Replace from firstCatch to closeBrace (inclusive)
  const removeCount = closeBrace - firstCatch + 1;
  lines.splice(firstCatch, removeCount, ...replacement);
  
  fs.writeFileSync(f, lines.join('\n'), 'utf8');
  console.log('FIXED: Separated marker and drone try/catch blocks');
} else {
  console.log('Pattern not found fully');
}
