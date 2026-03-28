@echo off
set "PATH=%PATH%;C:\Program Files\nodejs"
echo yes | npx -y create-next-app@latest web --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-git --no-react-compiler
