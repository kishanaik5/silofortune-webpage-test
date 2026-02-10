import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    try:
        # Connect to default 'postgres' database to create new db
        conn = psycopg2.connect(
            user="postgres",
            password="silo123",
            host="localhost",
            port="5432",
            dbname="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        # Check if database exists
        cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'silo_fortune'")
        exists = cur.fetchone()
        
        if not exists:
            print("Creating database 'silo_fortune'...")
            cur.execute("CREATE DATABASE silo_fortune")
            print("Database created successfully!")
        else:
            print("Database 'silo_fortune' already exists.")
            
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    create_database()
