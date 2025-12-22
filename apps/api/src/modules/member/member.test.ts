import { describe, expect, it, vi } from 'vitest'
import { MemberService } from './service'

// Mock the database
vi.mock('@raktamarga/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ id: '1', name: 'Member 1', familyId: 'f1' }])),
          orderBy: vi.fn(() => Promise.resolve([]))
        }))
      }))
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ id: '1', name: 'Member 1' }]))
      }))
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{ id: '1', name: 'Updated Member' }]))
        }))
      }))
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve({ success: true }))
    }))
  }
}))

// Mock FamilyService
vi.mock('../family/service', () => ({
  FamilyService: vi.fn().mockImplementation(() => ({
    isAdmin: vi.fn().mockResolvedValue(true),
    isMember: vi.fn().mockResolvedValue(true),
  }))
}))

describe('MemberService', () => {
  it('should create a member', async () => {
    const service = new MemberService()
    const member = await service.create({
      familyId: 'f1',
      name: 'Member 1',
      createdBy: 'u1'
    } as any)
    expect(member).toBeDefined()
    expect(member.name).toBe('Member 1')
  })

  it('should find member by id', async () => {
    const service = new MemberService()
    const member = await service.findById('1')
    expect(member).toBeDefined()
    expect(member?.id).toBe('1')
  })

  it('should handle access control', async () => {
    const service = new MemberService()
    const canAccess = await service.canAccessMember('1', 'u1')
    expect(canAccess).toBe(true)
  })
})
