const fs = require('fs');
const f = 'src/components/common/common-watermark-layer.tsx';
let c = fs.readFileSync(f, 'utf8');

// Find the broken section by line markers
const lines = c.split(/\r?\n/);
console.log('Total lines:', lines.length);

// Find start of broken section (line with "防伪：MutationObserver")
let startIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('防伪：MutationObserver')) {
    startIdx = i;
    break;
  }
}
console.log('Broken section starts at line', startIdx + 1);

// Find end (line with "}, [])" after the broken section)
let endIdx = -1;
for (let i = startIdx; i < lines.length; i++) {
  if (lines[i].trim() === '}, [])') {
    endIdx = i;
    break;
  }
}
console.log('Broken section ends at line', endIdx + 1);

// Show the broken lines
for (let i = startIdx; i <= endIdx; i++) {
  console.log((i+1) + ': ' + JSON.stringify(lines[i]));
}

// Replace with correct code
const newLines = [
  '    // 防伪：MutationObserver 检测水印被隐藏/删除',
  '    let observer: MutationObserver | null = null',
  '    if (typeof window !== \'undefined\' && wmRef.current) {',
  '      observer = new MutationObserver((mutations) => {',
  '        for (const m of mutations) {',
  '          if (m.type === \'childList\' && m.removedNodes.length > 0) {',
  '            for (const node of Array.from(m.removedNodes)) {',
  '              if (node instanceof HTMLElement && node.getAttribute(\'data-watermark\') === \'true\') {',
  '                setNow(new Date())',
  '              }',
  '            }',
  '          }',
  '        }',
  '      })',
  '      observer.observe(document.body, { childList: true, subtree: true })',
  '    }',
  '',
  '    return () => {',
  '      unsub()',
  '      clearInterval(timer)',
  '      window.removeEventListener(\'storage\', onStorage)',
  '      if (observer) observer.disconnect()',
  '    }',
  '  }, [])',
];

const before = lines.slice(0, startIdx);
const after = lines.slice(endIdx + 1);
const result = [...before, ...newLines, ...after].join('\n');
fs.writeFileSync(f, result, 'utf8');
console.log('FIXED watermark component');
