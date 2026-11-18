@echo off
title Painel Admin - Sidao Dicas
echo ===================================================
echo   Iniciando Servidor Local do Painel Admin...
echo   Aguarde alguns segundos, o navegador vai abrir!
echo ===================================================
start "" "http://localhost:3000/admin"
npm run dev
pause
