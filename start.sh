#!/bin/bash
cd backend
exec python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
