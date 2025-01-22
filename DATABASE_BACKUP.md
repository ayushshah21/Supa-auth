# Supabase Database Backup Process

This document outlines the backup process for our Supabase database, including how to create backups, restore from them, and best practices for database safety.

## Quick Start

```bash
# Create a backup
./backup-db.sh

# View available backups
ls -l backups/
```

## Backup System Overview

Our backup system consists of:

1. A shell script (`backup-db.sh`) that creates timestamped backups
2. A `backups/` directory that stores the backup files
3. Automatic rotation to keep only the last 5 backups

### What Gets Backed Up

Each backup includes:

- Complete database schema
- All tables and their data
- Functions and triggers
- Row Level Security (RLS) policies
- Extensions and configurations

## Creating Backups

### Automatic Backup Script

The `backup-db.sh` script handles the backup process:

```bash
#!/bin/bash
# Creates timestamped backups and manages retention

mkdir -p backups
export SUPABASE_ACCESS_TOKEN="sbp_6e17c450f153005e1cea2023ff505139d8c28f4e"

echo "Creating database backup..."
supabase db dump -p qmdgcgzxksojnaifodqm --password Chalamli118$ -f backups/$(date +%Y%m%d_%H%M%S)_backup.sql

echo "Cleaning up old backups..."
ls -t backups/*_backup.sql | tail -n +6 | xargs rm -f 2>/dev/null

echo "Backup completed!"
```

### Manual Backup

If you need to create a manual backup:

```bash
export SUPABASE_ACCESS_TOKEN="sbp_6e17c450f153005e1cea2023ff505139d8c28f4e"
supabase db dump -p qmdgcgzxksojnaifodqm -f backups/manual_backup.sql
```

## Restoring from Backup

To restore your database from a backup:

1. First, create a safety backup:

   ```bash
   ./backup-db.sh
   ```

2. Then restore from your chosen backup file:

   ```bash
   export SUPABASE_ACCESS_TOKEN="sbp_6e17c450f153005e1cea2023ff505139d8c28f4e"
   supabase db reset -p qmdgcgzxksojnaifodqm --backup-file backups/YYYYMMDD_HHMMSS_backup.sql
   ```

## Best Practices

### When to Create Backups

Always create a backup before:

1. Making schema changes
2. Running migrations
3. Bulk data operations
4. Major application updates

### Backup File Management

- Backups are automatically stored in the `backups/` directory
- Files are named with timestamps (format: YYYYMMDD_HHMMSS_backup.sql)
- Only the last 5 backups are kept to manage storage
- Backup files are git-ignored to prevent accidental commits

### Security Considerations

- Never commit backup files to version control
- Store the Supabase access token securely
- Consider encrypting sensitive backups
- Regularly verify backup integrity

## Additional Safety Measures

### Supabase Built-in Backups

If you're on a paid Supabase plan:

- Daily automatic backups are included
- Point-in-time recovery is available
- Backups are retained according to your plan

### Local vs Production

- This backup system works with both local and production databases
- Always test restore procedures in a safe environment first
- Keep multiple backup copies for critical data

## Troubleshooting

### Common Issues

1. **Permission Denied**

   ```bash
   chmod +x backup-db.sh
   ```

2. **Connection Issues**
   - Verify your Supabase access token
   - Check your internet connection
   - Ensure project reference is correct

3. **Space Issues**
   - The script keeps only the last 5 backups
   - Manually clean up if needed: `rm backups/*_backup.sql`

### Verifying Backups

To check a backup file's contents:

```bash
head -n 50 backups/YYYYMMDD_HHMMSS_backup.sql
```

## Support

For issues with:

- Supabase backups: [Supabase Support](https://supabase.com/support)
- This backup system: Contact the development team

## Future Improvements

Planned enhancements:

1. Automated backup verification
2. Compression for backup files
3. Cloud storage integration
4. Email notifications for backup status
