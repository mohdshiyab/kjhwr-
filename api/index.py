import os
import sys

# Add backend directory to sys.path so app modules are resolvable
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.main import app

# Vercel serverless function entrypoint
