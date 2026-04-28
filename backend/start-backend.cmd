@echo off
cd /d %~dp0
echo Starting backend from %cd%
pnpm run dev
