@echo off
set "PATH=%PATH%;C:\Program Files\nodejs"
call npm install
call npx prisma generate
