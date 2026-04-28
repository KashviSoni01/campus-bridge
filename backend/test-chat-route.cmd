@echo off
cd /d %~dp0
echo Testing /api/chat on localhost:5000
powershell -NoProfile -Command "try { $r = Invoke-WebRequest 'http://localhost:5000/api/chat' -Method GET -UseBasicParsing; Write-Output \"STATUS: $($r.StatusCode)\"; Write-Output $r.Content } catch { Write-Output \"ERROR: $($_.Exception.Message)\" }"
echo.
pause
