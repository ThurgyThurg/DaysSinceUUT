# Days Since UUT 
NOTE: I just added the .env for sharing to github, so there may be some bugs related to getting that set up. 

## Database Setup 
Here's a draft of database setup instructions for your README:



This application uses PostgreSQL to store the timer data. Follow these steps to set up the database:

### Prerequisites

- PostgreSQL (version 12 or higher)
- Database administration privileges

### Setup Steps

1. **Install PostgreSQL** (if not already installed):

   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

2. **Create the Database and User**:

   ```bash
   # Connect to PostgreSQL as the postgres user
   sudo -u postgres psql

   # In the PostgreSQL shell, run:
   CREATE DATABASE uutimer;
   CREATE USER uuttimer WITH ENCRYPTED PASSWORD 'your_secure_password';
   ALTER DATABASE uutimer OWNER TO uuttimer;

   # Grant necessary permissions
   \c uutimer
   GRANT ALL ON SCHEMA public TO uuttimer;

   # Exit PostgreSQL shell
   \q
   ```

3. **Create the Timer Table**:

   ```bash
   # Connect to the uutimer database
   sudo -u postgres psql -d uutimer

   # Create the timer table
   CREATE TABLE timer (
     id SERIAL PRIMARY KEY,
     timestamp BIGINT NOT NULL
   );

   # Initialize with current timestamp
   INSERT INTO timer (id, timestamp) VALUES (1, extract(epoch from now()) * 1000);

   # Change table ownership to the uuttimer user
   ALTER TABLE timer OWNER TO uuttimer;

   # Exit
   \q
   ```

4. **Verify the Setup**:

   ```bash
   # Check if you can connect with the new user
   PGPASSWORD='your_secure_password' psql -h localhost -U uuttimer -d uutimer -c 'SELECT * FROM timer;'
   ```

   You should see one row with the current timestamp.

### Database Connection Configuration

Update your environment variables or `.env` file with the following settings:

```
DB_USER=uuttimer
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_NAME=uutimer
DB_PORT=5432
```

### Troubleshooting Common Issues

- **Permission Denied Errors**: Make sure the `uuttimer` user has proper permissions on both the database and the table.
- **Connection Refused**: Ensure PostgreSQL is running and configured to accept connections.
- **Authentication Failed**: Double-check the username and password configuration.

To restart PostgreSQL if needed:

```bash
sudo systemctl restart postgresql
```
## Running as a Service

To run the application as a systemd service, create a file at `/etc/systemd/system/uutimer.service` with the following content:

```
[Unit]
Description=Days Since UUT Timer
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/api
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=PORT=3000
Environment=DB_USER=your_db_user
Environment=DB_PASSWORD=your_db_password
Environment=DB_HOST=localhost
Environment=DB_NAME=uutimer
Environment=DB_PORT=5432

[Install]
WantedBy=multi-user.target
```
Commands to begin service: 
```
sudo systemctl daemon-reload
sudo systemctl enable uutimer
sudo systemctl start uutimer
```
