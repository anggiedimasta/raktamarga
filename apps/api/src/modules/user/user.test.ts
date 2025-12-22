import { describe, expect, it, vi } from 'vitest'
import { UserService } from './service'

// Mock the database
vi.mock('@raktamarga/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ id: '1', name: 'Test User' }]))
        }))
      }))
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{ id: '1', name: 'Updated User' }]))
        }))
      }))
    }))
  }
}))

describe('UserService', () => {
  it('should find user by id', async () => {
    const service = new UserService()
    const user = await service.findById('1')
    expect(user).toBeDefined()
    expect(user?.id).toBe('1')
  })

  it('should update profile', async () => {
    const service = new UserService()
    const updatedUser = await service.updateProfile('1', { name: 'Updated User' })
    expect(updatedUser).toBeDefined()
    expect(updatedUser.name).toBe('Updated User')
  })
})
