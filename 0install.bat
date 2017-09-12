call config.bat

:: Descargar componentes
echo --- Descargando componentes servidor
call npm install

echo --- Descargando componentes cliente
call bower install
