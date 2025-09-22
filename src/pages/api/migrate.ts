import { NextApiRequest, NextApiResponse } from 'next'
import { 
  migrateLegacyOrders, 
  createBackup, 
  clearLegacyData, 
  getMigrationStatus 
} from '@/lib/migration'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        return handleGetStatus(res)
      case 'POST':
        return handleMigration(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Migration API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGetStatus(res: NextApiResponse) {
  try {
    const status = await getMigrationStatus()
    return res.status(200).json(status)
  } catch (error) {
    console.error('Error getting migration status:', error)
    return res.status(500).json({ error: 'Failed to get migration status' })
  }
}

async function handleMigration(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.body

  if (!action) {
    return res.status(400).json({ error: 'Action is required' })
  }

  try {
    switch (action) {
      case 'migrate':
        return handleMigrateAction(res)
      case 'backup':
        return handleBackupAction(res)
      case 'clear':
        return handleClearAction(res)
      default:
        return res.status(400).json({ error: 'Invalid action. Use: migrate, backup, or clear' })
    }
  } catch (error) {
    console.error(`Error handling action ${action}:`, error)
    return res.status(500).json({ error: `Failed to ${action}` })
  }
}

async function handleMigrateAction(res: NextApiResponse) {
  console.log('Starting migration process...')
  
  // Create backup first
  const backupResult = await createBackup()
  if (!backupResult.success) {
    return res.status(500).json({ 
      error: 'Failed to create backup before migration',
      details: backupResult.error 
    })
  }

  // Perform migration
  const migrationResult = await migrateLegacyOrders()
  
  if (!migrationResult.success) {
    return res.status(500).json({
      error: 'Migration failed',
      migrated: migrationResult.migratedCount,
      skipped: migrationResult.skippedCount,
      errors: migrationResult.errors
    })
  }

  return res.status(200).json({
    message: 'Migration completed successfully',
    migrated: migrationResult.migratedCount,
    skipped: migrationResult.skippedCount,
    errors: migrationResult.errors,
    backupCreated: true
  })
}

async function handleBackupAction(res: NextApiResponse) {
  const backupResult = await createBackup()
  
  if (!backupResult.success) {
    return res.status(500).json({ 
      error: 'Backup failed',
      details: backupResult.error 
    })
  }

  return res.status(200).json({
    message: 'Backup created successfully',
    orderCount: backupResult.backupData?.orderCount || 0
  })
}

async function handleClearAction(res: NextApiResponse) {
  const clearResult = await clearLegacyData()
  
  if (!clearResult.success) {
    return res.status(500).json({ 
      error: 'Failed to clear legacy data',
      details: clearResult.error 
    })
  }

  return res.status(200).json({
    message: 'Legacy data cleared successfully'
  })
}