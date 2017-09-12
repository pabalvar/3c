@echo OFF
:: Mi propia ubicación
set RANDOMDIR=%~dp0
set RANDOMDIR=%RANDOMDIR:~0,-1%

:: Determinar arquitectura CPU
set CPUOS=x64
if "%PROCESSOR_ARCHITECTURE%" == "x86" (
echo x86 CPU
set CPUOS="win32"
)

:: Definicion rutas y version de compiladores por defecto
set COMPILERSDIR=%RANDOMDIR%\..\..\ext

:: Cargar opciones de usuario
IF exist "%RANDOMDIR%\userconf.bat" call "%RANDOMDIR%\userconf.bat"

:: Opciones de proyecto
set MDBDIR=%COMPILERSDIR%\MongoDB\Mongodb3.0\%CPUOS%\bin
set NODDIR=%COMPILERSDIR%\Nodejs\Node6.9\%CPUOS%
set TMPDIR=%RANDOMDIR%\tmpdb

:NORMAL_EXIT
exit /b

:ERROR_EXIT
pause
@echo ON




