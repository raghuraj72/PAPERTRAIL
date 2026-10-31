@echo off
echo ======================================================================
echo  RUNNING PAPERTRAIL TEST & BENCHMARK SUITE
echo ======================================================================
echo.

set PYTHONPATH=backend
echo [1/2] Running PyTest Suite...
.\venv\Scripts\python -m pytest backend\tests
if %ERRORLEVEL% NEQ 0 (
    echo PyTest failed!
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Running Benchmark Evaluation...
.\venv\Scripts\python backend\evaluate.py

echo.
echo All tests and evaluations finished successfully!
