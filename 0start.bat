call config.bat
set DEBUG=true
set NODE_ENV=development

echo INICIANDO NODEJS en nueva ventana
"%NODDIR%\node" "%RANDOMDIR%"\server.js
::npm start
