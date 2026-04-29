import AsyncStorage from '@react-native-async-storage/async-storage'
import { storageService } from '@/lib/storage'
import api from '@/lib/api'

type SyncAction = 'create' | 'update' | 'delete'

interface QueuedAction {
  id: string
  type: SyncAction
  endpoint: string
  payload: any
  timestamp: number
  retries: number
}

class SyncService {
  private readonly QUEUE_KEY = '@enkaji/sync/queue'
  private readonly SYNC_IN_PROGRESS_KEY = '@enkaji/sync/inProgress'

  /**
   * Queue an action to be synced when online
   */
  async queueAction(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    const queue = await this.getQueue()
    const newAction: QueuedAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    }
    queue.push(newAction)
    await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue))
  }

  /**
   * Get current sync queue
   */
  async getQueue(): Promise<QueuedAction[]> {
    const raw = await AsyncStorage.getItem(this.QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  }

  /**
   * Remove an action from queue after successful sync
   */
  async removeAction(actionId: string): Promise<void> {
    const queue = await this.getQueue()
    const filtered = queue.filter(a => a.id !== actionId)
    await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(filtered))
  }

  /**
   * Sync all queued actions with server
   */
  async syncAll(): Promise<{ success: number; failed: number }> {
    const inProgress = await AsyncStorage.getItem(this.SYNC_IN_PROGRESS_KEY)
    if (inProgress === 'true') {
      console.log('Sync already in progress')
      return { success: 0, failed: 0 }
    }

    await AsyncStorage.setItem(this.SYNC_IN_PROGRESS_KEY, 'true')

    try {
      const queue = await this.getQueue()
      if (queue.length === 0) {
        return { success: 0, failed: 0 }
      }

      let success = 0
      let failed = 0

      // Sort by timestamp (oldest first)
      queue.sort((a, b) => a.timestamp - b.timestamp)

      for (const action of queue) {
        try {
          await this.executeAction(action)
          await this.removeAction(action.id)
          success++
        } catch (error) {
          console.error(`Sync action failed: ${action.id}`, error)
          // Increment retry count and keep in queue if under limit
          action.retries++
          if (action.retries < 3) {
            await this.updateActionRetry(action)
          } else {
            await this.removeAction(action.id)
            failed++
          }
        }
      }

      return { success, failed }
    } finally {
      await AsyncStorage.removeItem(this.SYNC_IN_PROGRESS_KEY)
    }
  }

  private async executeAction(action: QueuedAction): Promise<void> {
    switch (action.type) {
      case 'create':
        await api.createOrder(action.payload)
        break
      case 'update':
        await api.updateProduct(action.payload.id, action.payload.data)
        break
      case 'delete':
        await api.deleteProduct(action.payload.id)
        break
      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  private async updateActionRetry(action: QueuedAction): Promise<void> {
    const queue = await this.getQueue()
    const index = queue.findIndex(a => a.id === action.id)
    if (index !== -1) {
      queue[index] = action
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue))
    }
  }

  /**
   * Get queue length
   */
  async getQueueLength(): Promise<number> {
    const queue = await this.getQueue()
    return queue.length
  }
}

export const syncService = new SyncService()
