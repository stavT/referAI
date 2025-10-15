@echo off
REM Referral Finder - Windows Setup Script

echo.
echo ================================
echo Referral Finder - Setup Script
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js version: %NODE_VERSION%

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm version: %NPM_VERSION%
echo.

REM Install dependencies
echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

echo [OK] Dependencies installed successfully
echo.

REM Create .env.local if it doesn't exist
if not exist .env.local (
    echo Creating .env.local file...
    copy env.example .env.local >nul
    echo [OK] .env.local created from template
    echo.
    
    echo.
    echo ============================================
    echo IMPORTANT: Please edit .env.local and add:
    echo ============================================
    echo   - Your MongoDB URI
    echo   - Your OpenAI API key or Grok API key
    echo   - Optional: Google OAuth credentials
    echo.
    echo To generate NEXTAUTH_SECRET, run this in Git Bash:
    echo   openssl rand -base64 32
    echo.
) else (
    echo [INFO] .env.local already exists. Skipping...
    echo.
)

REM MongoDB setup
echo ================================
echo MongoDB Setup
echo ================================
echo.
echo Do you want to set up MongoDB with Docker? (y/n)
set /p response=

if /i "%response%"=="y" (
    REM Check if Docker is installed
    where docker >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Docker is not installed. Please install Docker Desktop first.
        echo   Visit: https://docs.docker.com/desktop/windows/install/
    ) else (
        REM Check if MongoDB container exists
        docker ps -a | findstr mongodb >nul
        if %ERRORLEVEL% EQU 0 (
            echo [INFO] MongoDB container already exists
            echo Starting MongoDB container...
            docker start mongodb
        ) else (
            echo Creating and starting MongoDB container...
            docker run -d -p 27017:27017 --name mongodb mongo
        )
        
        echo [OK] MongoDB is running on mongodb://localhost:27017
        echo.
        echo Remember to update MONGODB_URI in .env.local:
        echo   MONGODB_URI=mongodb://localhost:27017/referral-finder
    )
) else (
    echo [INFO] Skipping MongoDB setup. Please configure manually.
    echo   You can use MongoDB Atlas: https://www.mongodb.com/cloud/atlas
)

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next steps:
echo 1. Edit .env.local and add your API keys:
echo    - OPENAI_API_KEY or XAI_API_KEY for Grok
echo    - Optional: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
echo.
echo 2. Generate NEXTAUTH_SECRET (in Git Bash):
echo    openssl rand -base64 32
echo.
echo 3. Start the development server:
echo    npm run dev
echo.
echo 4. Open http://localhost:3000 in your browser
echo.
echo Need help? Check out:
echo   - README.md for full documentation
echo   - SETUP.md for detailed setup guide
echo   - DEPLOYMENT.md for deployment instructions
echo.
echo Happy coding!
echo.
pause

