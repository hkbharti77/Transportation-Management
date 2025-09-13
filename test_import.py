#!/usr/bin/env python3
"""
Test script to verify that the main module can be imported correctly.
This helps diagnose deployment issues.
"""

try:
    print("Attempting to import main module...")
    import main
    print("Successfully imported main module")
    print(f"App type: {type(main.app)}")
    print(f"App title: {main.app.title}")
    print("Import test completed successfully!")
except Exception as e:
    print(f"Failed to import main module: {e}")
    import traceback
    traceback.print_exc()