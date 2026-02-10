-- 1. Create the user
CREATE USER excel_reader WITH PASSWORD 'secure_excel_password';

-- 2. Grant permission to connect to the database
GRANT CONNECT ON DATABASE silo_fortune TO excel_reader;

-- 3. Grant usage on public schema
GRANT USAGE ON SCHEMA public TO excel_reader;

-- 4. Grant SELECT permission on specific tables needed for reporting
GRANT SELECT ON TABLE applicants TO excel_reader;
GRANT SELECT ON TABLE jobs TO excel_reader;

-- 5. Ensure future tables are also readable (Optional)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO excel_reader;

-- Instructions for Excel:
-- 1. Go to Data > Get Data > From Database > From PostgreSQL Database.
-- 2. Server: localhost (or IP), Database: silo_fortune
-- 3. Username: excel_reader, Password: secure_excel_password
