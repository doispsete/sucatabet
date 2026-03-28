@echo off
set "PATH=%PATH%;C:\Program Files\PostgreSQL\18\bin"
psql -U postgres -d postgres -c "CREATE DATABASE sucatabet_db;"
