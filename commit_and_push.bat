@echo off
git add .
git commit -m "Fix ASGI import error and pip warnings for Render deployment"
git push origin DEV
echo Done!
