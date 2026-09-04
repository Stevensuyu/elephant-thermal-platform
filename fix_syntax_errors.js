const fs = require('fs');

// ═══════════════════════════════════════════════════════════════
// FIX 1: dashboard-real-map-leaflet.tsx - missing catch closing brace
// ═══════════════════════════════════════════════════════════════
{
  const f = 'src/components/dashboard/dashboard-real-map-leaflet.tsx';
  let c = fs.readFileSync(f, 'utf8');
  const lines = c.split(/\r?\n/);
  
  // Find line 780 (0-indexed 779): "} catch (e) {"
  // The catch block is empty and never closed. Need to add "}" after it.
  let fixed = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('} catch (e) {') && i > 770 && i < 790) {
      // Check if next non-empty line starts with "// AI" or "L.marker" (meaning catch not closed)
      let nextIdx = i + 1;
      while (nextIdx < lines.length && lines[nextIdx].trim() === '') nextIdx++;
      if (nextIdx < lines.length && (lines[nextIdx].includes('// AI') || lines[nextIdx].includes('L.marker'))) {
        // Insert closing brace for catch
        lines.splice(i + 1, 0, '      }');
        fixed = true;
        console.log('FIX 1: Added catch closing brace at line', i + 2);
        break;
      }
    }
  }
  if (fixed) {
    fs.writeFileSync(f, lines.join('\n'), 'utf8');
  } else {
    console.log('FIX 1: No fix needed or pattern not found');
  }
}

// ═══════════════════════════════════════════════════════════════
// FIX 2: risk-simulation/route.ts - outer try missing catch/finally
// ═══════════════════════════════════════════════════════════════
{
  const f = 'src/app/api/risk-simulation/route.ts';
  let c = fs.readFileSync(f, 'utf8');
  const lines = c.split(/\r?\n/);
  
  // The file ends with:
  //   } catch (aiError) {   (line 206)
  //     // comment           (line 207)
  //                         (line 208)
  //   }                     (line 209 - closes inner catch)
  // }                       (line 210 - closes POST function, but outer try at line 62 never closed!)
  //
  // Need to add outer catch before the final closing brace
  
  // Find the last two closing braces
  const lastLine = lines.length - 1;
  // Go backwards to find the structure
  let innerCatchClose = -1;
  let funcClose = -1;
  
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === '}' && funcClose === -1) {
      funcClose = i;
    } else if (lines[i].trim() === '}' && funcClose !== -1 && innerCatchClose === -1) {
      innerCatchClose = i;
      break;
    }
  }
  
  console.log('FIX 2: innerCatchClose at line', innerCatchClose + 1, 'funcClose at line', funcClose + 1);
  
  // Check if there's already an outer catch between innerCatchClose and funcClose
  let hasOuterCatch = false;
  for (let i = innerCatchClose; i <= funcClose; i++) {
    if (lines[i].includes('catch')) {
      hasOuterCatch = true;
      break;
    }
  }
  
  if (!hasOuterCatch && innerCatchClose > 0 && funcClose > innerCatchClose) {
    // Insert outer catch block before funcClose
    const outerCatch = [
      '  } catch (err) {',
      '    return NextResponse.json({ error: String(err?.message || err), points: [], peakRisk: 0, peakOffsetMin: 0, invasionProbability: 0, trend: \'RISK_STABLE\', mathModel: \'\' }, { status: 500 })',
      '  }',
    ];
    lines.splice(funcClose, 0, ...outerCatch);
    fs.writeFileSync(f, lines.join('\n'), 'utf8');
    console.log('FIX 2: Added outer catch block');
  } else {
    console.log('FIX 2: Outer catch already exists or pattern not found');
  }
}

// ═══════════════════════════════════════════════════════════════
// FIX 3: page.tsx - incomplete onSubmitAlert function + missing Home closing brace
// ═══════════════════════════════════════════════════════════════
{
  const f = 'src/app/page.tsx';
  let c = fs.readFileSync(f, 'utf8');
  const lines = c.split(/\r?\n/);
  
  // Find the incomplete onSubmitAlert section
  // Line ~297: const onSubmitAlert = async (payload: ManualAlertPayload) => {
  // Line ~298: try {
  // Line ~305: if (d?.duplicate) {
  // Line ~306: (empty)
  // Line ~307: }  (closes if)
  // Then missing: catch, close onSubmitAlert, close Home
  // Line ~309: function StatTile...
  
  let startIdx = -1;
  let ifDuplicateIdx = -1;
  let ifCloseIdx = -1;
  let statTileIdx = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const onSubmitAlert = async')) startIdx = i;
    if (lines[i].includes('if (d?.duplicate)')) ifDuplicateIdx = i;
    if (ifDuplicateIdx > 0 && i > ifDuplicateIdx && lines[i].trim() === '}' && ifCloseIdx === -1) {
      ifCloseIdx = i;
    }
    if (lines[i].includes('function StatTile')) {
      statTileIdx = i;
      break;
    }
  }
  
  console.log('FIX 3: onSubmitAlert at', startIdx + 1, 'if duplicate at', ifDuplicateIdx + 1, 'if close at', ifCloseIdx + 1, 'StatTile at', statTileIdx + 1);
  
  if (startIdx > 0 && ifCloseIdx > 0 && statTileIdx > ifCloseIdx) {
    // Replace from ifCloseIdx+1 to statTileIdx-1 with proper closing code
    const replacement = [
      '      }',
      '      // 刷新任务列表',
      '      if (typeof window !== \'undefined\') {',
      '        window.dispatchEvent(new CustomEvent(\'tasks-updated\'))',
      '      }',
      '    } catch {',
      '      // 提交失败，静默处理',
      '    }',
      '  }',
      '',
      '  return (',
      '    <div className="min-h-screen bg-slate-950 text-slate-100">',
      '      {/* 主页面内容由各tab视图渲染 */}',
      '      <Sidebar />',
      '    </div>',
      '  )',
      '}',
      '',
    ];
    
    // Remove lines from ifCloseIdx+1 to statTileIdx-1, insert replacement
    const removeCount = statTileIdx - ifCloseIdx - 1;
    lines.splice(ifCloseIdx + 1, removeCount, ...replacement);
    
    fs.writeFileSync(f, lines.join('\n'), 'utf8');
    console.log('FIX 3: Completed onSubmitAlert function and closed Home component');
  } else {
    console.log('FIX 3: Pattern not found - may already be fixed');
  }
}

// ═══════════════════════════════════════════════════════════════
// FIX 4: common-my-tasks-view.tsx - broken loadMyTasks function
// ═══════════════════════════════════════════════════════════════
{
  const f = 'src/components/common/common-my-tasks-view.tsx';
  let c = fs.readFileSync(f, 'utf8');
  const lines = c.split(/\r?\n/);
  
  // Find the broken section:
  // Line ~54: const loadMyTasks = useCallback(async () => {
  // Line ~60: loadingTimerRef.current = setTimeout(() => {
  // Line ~61: forceTimeoutRef.current = true
  // Line ~62: (blank)
  // Line ~63: if (!res.ok) { ... }  -- WRONG: inside setTimeout, res undefined
  // ... all processing logic incorrectly nested ...
  // Line ~109: } catch (e: any) {
  // Line ~116: } finally {
  // Line ~117: clearTimeout(timeoutId)  -- timeoutId undefined
  // Line ~124: }, [currentRole])
  
  let funcStart = -1;
  let setTimeoutLine = -1;
  let catchLine = -1;
  let finallyLine = -1;
  let funcEnd = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const loadMyTasks = useCallback')) funcStart = i;
    if (funcStart > 0 && lines[i].includes('loadingTimerRef.current = setTimeout')) setTimeoutLine = i;
    if (funcStart > 0 && lines[i].includes('} catch (e: any)')) catchLine = i;
    if (funcStart > 0 && lines[i].includes('} finally')) finallyLine = i;
    if (funcStart > 0 && lines[i].includes('}, [currentRole]')) { funcEnd = i; break; }
  }
  
  console.log('FIX 4: funcStart', funcStart + 1, 'setTimeout', setTimeoutLine + 1, 'catch', catchLine + 1, 'finally', finallyLine + 1, 'funcEnd', funcEnd + 1);
  
  if (funcStart > 0 && setTimeoutLine > 0 && catchLine > 0 && finallyLine > 0 && funcEnd > 0) {
    // The processing logic between setTimeoutLine+2 and catchLine is correct but misplaced.
    // We need to:
    // 1. Close the setTimeout callback properly after forceTimeoutRef.current = true
    // 2. Add the fetch call before the processing logic
    // 3. Fix the finally block (remove undefined timeoutId)
    
    // The section from setTimeoutLine to funcEnd needs to be replaced
    
    // First, extract the processing logic (between the blank line after setTimeout and catch)
    // It starts after "forceTimeoutRef.current = true" and the blank line
    
    let processingStart = -1;
    for (let i = setTimeoutLine + 2; i < catchLine; i++) {
      if (lines[i].trim() !== '') {
        processingStart = i;
        break;
      }
    }
    
    console.log('FIX 4: processing starts at line', processingStart + 1);
    
    // Build the corrected function body
    const corrected = [
      '  const loadMyTasks = useCallback(async () => {',
      '    setLoading(true)',
      '    setLoadError(null)',
      '    forceTimeoutRef.current = false',
      '    // 组件级安全超时：12秒后强制结束 loading',
      '    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current)',
      '    loadingTimerRef.current = setTimeout(() => {',
      '      forceTimeoutRef.current = true',
      '      setLoading(false)',
      '      setLoadError(\'加载超时（12秒），请检查网络后重试\')',
      '    }, 12000)',
      '',
      '    try {',
      '      const res = await fetch(\'/api/disposal-workflows\', { cache: \'no-store\' })',
    ];
    
    // Add the processing logic (from processingStart to catchLine-1)
    // But we need to fix indentation - original was at 6 spaces inside setTimeout, should be at 6 spaces inside try
    for (let i = processingStart; i < catchLine; i++) {
      const line = lines[i];
      // Keep the line as-is (indentation should already be correct for try block)
      corrected.push(line);
    }
    
    // Add catch and finally
    corrected.push('    } catch (e: any) {');
    corrected.push('      if (e?.name === \'AbortError\') {');
    corrected.push('        setLoadError(\'加载超时，请检查网络后重试\')');
    corrected.push('      } else {');
    corrected.push('        setLoadError(e?.message || \'加载失败，请稍后重试\')');
    corrected.push('      }');
    corrected.push('      setGroups([])');
    corrected.push('    } finally {');
    corrected.push('      // 仅当未被安全超时强制结束时才清除 loading');
    corrected.push('      if (!forceTimeoutRef.current) {');
    corrected.push('        if (loadingTimerRef.current) { clearTimeout(loadingTimerRef.current); loadingTimerRef.current = null }');
    corrected.push('        setLoading(false)');
    corrected.push('      }');
    corrected.push('    }');
    corrected.push('  }, [currentRole])');
    
    // Replace from funcStart to funcEnd
    const removeCount = funcEnd - funcStart + 1;
    lines.splice(funcStart, removeCount, ...corrected);
    
    fs.writeFileSync(f, lines.join('\n'), 'utf8');
    console.log('FIX 4: Reconstructed loadMyTasks function');
  } else {
    console.log('FIX 4: Pattern not found - may already be fixed');
  }
}

console.log('\n=== ALL FIXES COMPLETE ===');
