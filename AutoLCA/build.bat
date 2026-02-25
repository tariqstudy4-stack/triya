@echo off
REM build.bat - Script to trigger PyInstaller for packaging
echo Building AutoLCA executable...
pyinstaller AutoLCA.spec --clean -y
echo Build Complete! Look in the "dist" folder.
pause
