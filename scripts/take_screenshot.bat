@echo off
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless --disable-gpu --window-size=390,844 --virtual-time-budget=3000 --screenshot="d:\Blob\welcome_screen_test.png" http://localhost:5173/
echo Screenshot captured.
