#!/usr/bin/env python3
"""
Script to check if database tables are created
"""

import os
import sys
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_database_tables():
    """Check if database tables are created"""
    
    # Get database URL from environment or use default
    database_url = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/transportation_db")
    
    print("🔍 Checking database connection and tables...")
    print(f"📊 Database URL: {database_url}")
    print("=" * 60)
    
    try:
        # Create engine
        engine = create_engine(database_url)
        
        # Test connection
        with engine.connect() as connection:
            print("✅ Database connection successful!")
            
            # Get inspector
            inspector = inspect(engine)
            
            # Get all table names
            tables = inspector.get_table_names()
            
            print(f"\n📋 Found {len(tables)} tables in database:")
            print("-" * 40)
            
            if tables:
                for i, table in enumerate(tables, 1):
                    print(f"{i:2d}. {table}")
                    
                    # Get column information for each table
                    columns = inspector.get_columns(table)
                    print(f"    Columns ({len(columns)}):")
                    for col in columns:
                        print(f"      - {col['name']}: {col['type']}")
                    print()
            else:
                print("❌ No tables found in database!")
                print("\n💡 Tables should be created when the application starts.")
                print("   Check if the application has been run at least once.")
                
            # Check if specific expected tables exist
            expected_tables = [
                'users', 'vehicles', 'orders', 'routes', 'trips', 
                'trip_bookings', 'payments', 'logs', 'services', 
                'service_histories', 'parts_inventories', 'parts_usages',
                'maintenance_schedules', 'fleets', 'bookings', 'dispatches',
                'public_services', 'trackings', 'notifications', 'admin_dashboards'
            ]
            
            print("🔍 Checking for expected tables:")
            print("-" * 40)
            
            missing_tables = []
            for expected_table in expected_tables:
                if expected_table in tables:
                    print(f"✅ {expected_table}")
                else:
                    print(f"❌ {expected_table} - MISSING")
                    missing_tables.append(expected_table)
            
            if missing_tables:
                print(f"\n⚠️  {len(missing_tables)} expected tables are missing!")
                print("💡 To create tables, run the application or use Alembic migrations.")
            else:
                print(f"\n🎉 All expected tables are present!")
                
    except OperationalError as e:
        print(f"❌ Database connection failed: {e}")
        print("\n💡 Possible solutions:")
        print("   1. Check if PostgreSQL is running")
        print("   2. Verify database credentials in .env file")
        print("   3. Ensure database 'transportation_db' exists")
        print("   4. Check if the database URL is correct")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def check_database_exists():
    """Check if the database exists"""
    print("\n🔍 Checking if database exists...")
    
    # Try to connect to PostgreSQL server (without specifying database)
    base_url = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/transportation_db")
    
    # Extract connection info
    if "postgresql://" in base_url:
        # Remove database name from URL
        if "/transportation_db" in base_url:
            server_url = base_url.replace("/transportation_db", "/postgres")
        else:
            server_url = base_url
            
        try:
            engine = create_engine(server_url)
            with engine.connect() as connection:
                # Check if transportation_db exists
                result = connection.execute(text("SELECT 1 FROM pg_database WHERE datname = 'transportation_db'"))
                if result.fetchone():
                    print("✅ Database 'transportation_db' exists")
                else:
                    print("❌ Database 'transportation_db' does not exist")
                    print("💡 Create it with: CREATE DATABASE transportation_db;")
        except Exception as e:
            print(f"❌ Cannot connect to PostgreSQL server: {e}")

if __name__ == "__main__":
    check_database_exists()
    check_database_tables()
