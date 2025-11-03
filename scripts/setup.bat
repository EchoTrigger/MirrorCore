@echo off
echo Installing dependencies...
pushd ..\shared
call npm install
popd
pushd ..\backend
call npm install
popd
pushd ..\desktop
call npm install
popd