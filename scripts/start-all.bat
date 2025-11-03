@echo off
echo Starting all services...
cd /d %~dp0..
call npm run start-all