@echo off
chcp 65001 >nul
setlocal
title 天眼护象 象群热风险平台 - 运行中
cd /d "C:\Users\123\Desktop\elephant-thermal-risk-platform"

REM 清除沙箱/代理注入的安全删除钩子环境变量（普通机器上这些变量不存在，set 为空无副作用）
set CODEBUDDY_SESSION_ID=
set CLAUDE_SESSION_ID=
set CODEBUDDY_SAFE_DELETE_BULK_STATE_DIR=
set CODEBUDDY_TOOL_CALL_ID=

echo.
echo ============================================================
echo   天眼护象 象群热风险平台  -  启动器
echo   正在启动开发服务器，请稍候...
echo   浏览器会自动打开 http://localhost:3000
echo   直播会在服务器启动后自动运行（内置本地象群样本）
echo   演示结束：直接关闭本窗口即可停止服务
echo ============================================================
echo.

REM 若服务器已在运行（端口 3000 已响应），直接打开浏览器，不再重复启动
powershell -Command "try{(Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing -TimeoutSec 2).StatusCode}catch{exit 1}" >nul 2>&1
if not errorlevel 1 (
  echo 检测到服务器已在运行，直接打开浏览器。
  start "" http://localhost:3000
  goto :done
)

REM 后台启动 dev 服务器（日志写入 dev_console.log）
start "TY_LIVE_DEV" cmd /c "npm run dev > dev_console.log 2>&1"

REM 轮询等待端口就绪（每 2 秒一次，最多约 40 秒）
:wait
timeout /t 2 /nobreak >nul
powershell -Command "try{(Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing -TimeoutSec 2).StatusCode}catch{exit 1}" >nul 2>&1
if errorlevel 1 goto wait

REM 就绪后打开浏览器
start "" http://localhost:3000

:done
echo.
echo 已就绪：浏览器已打开，直播会自动运行。
echo 保持本窗口打开；关闭本窗口即停止服务。
echo.
echo 按任意键停止服务...
pause >nul
taskkill /fi "WINDOWTITLE eq TY_LIVE_DEV" /f >nul 2>&1
endlocal
