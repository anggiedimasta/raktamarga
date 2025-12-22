import { describe, expect, it, vi } from 'vitest'
import { FamilyService } from './service'

// Mock the database
vi.mock('@raktamarga/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ id: 'f1', name: 'Test Family', familyCode: 'TEST1' }])),
        })),
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([])),
        })),
      }))
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ id: 'f1', name: 'Test Family', familyCode: 'TEST1' }]))
      }))
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{ id: 'f1', name: 'Updated Family' }]))
        }))
      }))
    })),
  }
}))

// Mock generateFamilyCode
vi.mock('@raktamarga/shared', () => ({
  generateFamilyCode: vi.fn(() => 'MOCKEDCODE'),
}))

describe('FamilyService', () => {
  it('should create a family', async () => {
    const service = new FamilyService()
    const family = await service.create({
      name: 'Test Family',
      adminId: 'u1',
      familyCode: 'TEST1',
    })
    expect(family).toBeDefined()
    expect(family.familyCode).toBe('TEST1')
  })

  it('should find family by id', async () => {
    const service = new FamilyService()
    const family = await service.findById('f1')
    expect(family).toBeDefined()
    expect(family?.id).toBe('f1')
  })

  it('should check if user is admin', async () => {
    const service = new FamilyService()
    const isAdmin = await service.isAdmin('f1', 'u1')
    expect(isAdmin).toBe(true)
  })
})
