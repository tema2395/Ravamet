import sys
import os

# Add the parent directory to the path to make imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.app import app_instance

# Get the FastAPI app instance
app = app_instance.app

if __name__ == "__main__":
    # Run the app
    app_instance.run()
