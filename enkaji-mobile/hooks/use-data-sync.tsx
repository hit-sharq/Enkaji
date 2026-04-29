import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AppState } from 'react-native'
import { storageService } from '@/lib/storage'
import { syncService } from '@/lib/sync'
import { useConnectivity } from './use-connectivity'

interface DataSyncContextType {
  isOnline: boolean
  isSyncing: boolean
  pendingActions: number
  syncNow: () => Promise<void>
  invalidateCache: (key?: string) => Promise<void>
}

const DataSyncContext = createContext<DataSyncContextType | null>(null)

export function DataSyncProvider({ children }: { children: ReactNode }) {
  const { isConnected: isOnline } = useConnectivity()
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingActions, setPendingActions] = useState(0)

  // Update pending count
  useEffect(() => {
    const updatePending = async () => {
      const count = await syncService.getQueueLength()
      setPendingActions(count)
    }

    updatePending()
    const interval = setInterval(updatePending, 5000)
    return () => clearInterval(interval)
  }, [])

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingActions > 0) {
      syncNow()
    }
  }, [isOnline, pendingActions])

  // Sync on app foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && isOnline) {
        syncNow()
      }
    })
    return () => subscription.remove()
  }, [isOnline])

  const syncNow = async () => {
    if (isSyncing || !isOnline) return

    setIsSyncing(true)
    try {
      const result = await syncService.syncAll()
      console.log(`Sync complete: ${result.success} success, ${result.failed} failed`)
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const invalidateCache = async (key?: string) => {
    if (key) {
      await storageService.remove(key)
    } else {
      // Clear all cached data
      await storageService.clear()
    }
  }

  return (
    <DataSyncContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingActions,
        syncNow,
        invalidateCache,
      }}
    >
      {children}
    </DataSyncContext.Provider>
  )
}

export function useDataSync() {
  const context = useContext(DataSyncContext)
  if (!context) {
    throw new Error('useDataSync must be used within DataSyncProvider')
  }
  return context
}
