import { useState, useEffect } from 'react'

interface MigrationStatus {
  legacyOrderCount: number
  databaseOrderCount: number
  hasLegacyData: boolean
  migrationComplete: boolean
  error?: string
}

interface MigrationResult {
  success?: boolean
  message?: string
  migrated?: number
  skipped?: number
  errors?: string[]
  error?: string
}

export default function MigrationPanel() {
  const [status, setStatus] = useState<MigrationStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MigrationResult | null>(null)

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/migrate')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Error fetching migration status:', error)
      setStatus({
        legacyOrderCount: 0,
        databaseOrderCount: 0,
        hasLegacyData: false,
        migrationComplete: false,
        error: 'Failed to fetch status'
      })
    }
  }

  const performAction = async (action: 'migrate' | 'backup' | 'clear') => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, ...data })
        // Refresh status after successful action
        await fetchStatus()
      } else {
        setResult({ success: false, error: data.error || 'Action failed' })
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error)
      setResult({ success: false, error: `Failed to ${action}` })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  if (!status) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Data Migration</h2>
        <div className="text-center">Loading migration status...</div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Data Migration Panel</h2>
      
      {/* Status Display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Current Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Legacy Orders:</span> {status.legacyOrderCount}
          </div>
          <div>
            <span className="font-medium">Database Orders:</span> {status.databaseOrderCount}
          </div>
          <div className="col-span-2">
            <span className="font-medium">Status:</span>{' '}
            {status.migrationComplete ? (
              <span className="text-green-600">✅ Migration Complete</span>
            ) : status.hasLegacyData ? (
              <span className="text-yellow-600">⚠️ Legacy Data Found - Migration Needed</span>
            ) : (
              <span className="text-blue-600">ℹ️ No Legacy Data</span>
            )}
          </div>
        </div>
        {status.error && (
          <div className="mt-2 text-red-600 text-sm">Error: {status.error}</div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {status.hasLegacyData && (
          <>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Migration Available</h4>
              <p className="text-blue-700 text-sm mb-3">
                Found {status.legacyOrderCount} orders in localStorage that can be migrated to the database.
                A backup will be created automatically before migration.
              </p>
              <button
                onClick={() => performAction('migrate')}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Migrating...' : 'Migrate Legacy Data'}
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => performAction('backup')}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Backup'}
              </button>

              <button
                onClick={() => performAction('clear')}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
                title="Warning: This will permanently delete localStorage data"
              >
                {loading ? 'Clearing...' : 'Clear Legacy Data'}
              </button>
            </div>
          </>
        )}

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:bg-gray-400"
        >
          Refresh Status
        </button>
      </div>

      {/* Results Display */}
      {result && (
        <div className={`mt-6 p-4 rounded-lg ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <h4 className={`font-semibold mb-2 ${
            result.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {result.success ? '✅ Success' : '❌ Error'}
          </h4>
          
          {result.message && (
            <p className={`text-sm mb-2 ${
              result.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {result.message}
            </p>
          )}

          {result.migrated !== undefined && (
            <div className="text-sm space-y-1">
              <div>Migrated: {result.migrated} orders</div>
              <div>Skipped: {result.skipped} orders</div>
              {result.errors && result.errors.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium">Errors:</div>
                  <ul className="list-disc list-inside">
                    {result.errors.map((error, index) => (
                      <li key={index} className="text-xs">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {result.error && (
            <p className="text-red-700 text-sm">{result.error}</p>
          )}
        </div>
      )}

      {/* Warning Notice */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes</h4>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• Always create a backup before migration</li>
          <li>• Migration can be run multiple times safely (duplicates are skipped)</li>
          <li>• Clearing legacy data is permanent - ensure migration is successful first</li>
          <li>• This panel is for admin use only</li>
        </ul>
      </div>
    </div>
  )
}