@echo off
echo Installing Dependencies for Triya.io Dependencies...
python -m venv venv
call venv\Scripts\activate
pip install -r backend\requirements.txt
cd frontend
npm install
echo Dependencies installed successfully.
pause
