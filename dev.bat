@echo off
set "PATH=C:\Progra~1\nodejs;%PATH%"
echo Iniciando SucataBet API em localhost:3006...
start "SucataBet API" cmd /k "cd apps\api && npm run start:dev"
echo Iniciando SucataBet Web em localhost:3005...
start "SucataBet Web" cmd /k "cd apps\web && npm run dev -- -p 3005"
echo Servidores iniciados! Verifique as janelas abertas para logs.
