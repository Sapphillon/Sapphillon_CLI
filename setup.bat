@echo off
setlocal

:: Check if Deno is installed
where deno >nul 2>nul
if %ERRORLEVEL% neq 0 (
    if exist "%USERPROFILE%\.deno\bin\deno.exe" (
        echo Deno found in %USERPROFILE%\.deno\bin\deno.exe
        set "PATH=%USERPROFILE%\.deno\bin;%PATH%"
    ) else (
        echo Deno not found. Installing Deno...
        :: NOTE: This downloads and executes a remote PowerShell script. Review the
        :: script at https://deno.land/install.ps1 before running, or install Deno
        :: manually via a package manager (e.g. 'winget install DenoLand.Deno') if
        :: you prefer not to pipe remote scripts directly to iex.
        powershell -Command "irm https://deno.land/install.ps1 | iex"
        set "PATH=%USERPROFILE%\.deno\bin;%PATH%"
    )
) else (
    for /f "tokens=*" %%i in ('deno --version') do (
        echo Deno is already installed: %%i
        goto :deno_installed
    )
)

:deno_installed
:: Ensure Deno is in PATH for the rest of the script
set "PATH=%USERPROFILE%\.deno\bin;%PATH%"

echo Installing Sapphillon CLI...
deno install --global -f -n sapphillon --allow-read --allow-write --allow-net --allow-run --allow-env "%~dp0main.ts"

echo Verifying installation...
where sapphillon >nul 2>nul
if %ERRORLEVEL% eq 0 (
    echo Sapphillon CLI installed successfully!
    sapphillon --version
) else (
    echo Error: Sapphillon CLI installation failed or not in PATH.
    exit /b 1
)

endlocal
