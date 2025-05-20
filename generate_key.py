#!/usr/bin/env python
"""
Script to generate a secure secret key for the application.
This key is used for JWT token signing.
"""

import os
import base64
import sys


def generate_secret_key():
    """Generate a secure random secret key"""
    # Generate a 32-byte random value
    secret_key = base64.b64encode(os.urandom(32)).decode('utf-8')
    return secret_key


if __name__ == "__main__":
    key = generate_secret_key()
    
    print("\nGenerated SECRET_KEY:\n")
    print(key)
    print("\nAdd this to your .env file:\n")
    print(f"SECRET_KEY=\"{key}\"")
    
    # Check if .env file exists
    if os.path.exists(".env"):
        choice = input("\nWould you like to update the existing .env file? (y/n): ")
        if choice.lower() == 'y':
            with open(".env", "r") as f:
                content = f.read()
            
            # Check if SECRET_KEY already exists
            if "SECRET_KEY" in content:
                content = content.replace(
                    content[content.find("SECRET_KEY"):content.find("\n", content.find("SECRET_KEY"))], 
                    f"SECRET_KEY=\"{key}\""
                )
            else:
                content += f"\nSECRET_KEY=\"{key}\"\n"
            
            with open(".env", "w") as f:
                f.write(content)
            
            print("\n.env file updated successfully!")
    else:
        choice = input("\nWould you like to create a new .env file? (y/n): ")
        if choice.lower() == 'y':
            if os.path.exists(".env.example"):
                with open(".env.example", "r") as f:
                    content = f.read()
                
                # Replace SECRET_KEY in the content
                if "SECRET_KEY" in content:
                    content = content.replace(
                        content[content.find("SECRET_KEY"):content.find("\n", content.find("SECRET_KEY"))], 
                        f"SECRET_KEY=\"{key}\""
                    )
                else:
                    content += f"\nSECRET_KEY=\"{key}\"\n"
                
                with open(".env", "w") as f:
                    f.write(content)
                
                print("\n.env file created from .env.example with the new SECRET_KEY!")
            else:
                with open(".env", "w") as f:
                    f.write(f"SECRET_KEY=\"{key}\"\n")
                
                print("\n.env file created with the new SECRET_KEY!")
    
    sys.exit(0)
