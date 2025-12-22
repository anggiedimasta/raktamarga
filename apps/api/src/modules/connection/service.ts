import { db } from '@raktamarga/db'
import type { NewConnection } from '@raktamarga/db/schema'
import { connections, families, members } from '@raktamarga/db/schema'
import { and, eq, or, aliasedTable } from 'drizzle-orm'

export class ConnectionService {
  async create(data: Omit<NewConnection, 'id' | 'createdAt' | 'verifiedAt'>) {
    // Prevent duplicate connections
    const existing = await db
      .select()
      .from(connections)
      .where(
        or(
          and(
            eq(connections.family1Id, data.family1Id),
            eq(connections.family2Id, data.family2Id),
          ),
          and(
            eq(connections.family1Id, data.family2Id),
            eq(connections.family2Id, data.family1Id),
          ),
        ),
      )
      .limit(1)

    if (existing.length > 0) {
      throw new Error('Connection already exists between these families')
    }

    const [connection] = await db.insert(connections).values(data).returning()
    return connection
  }

  async findById(id: string) {
    const [connection] = await db
      .select()
      .from(connections)
      .where(eq(connections.id, id))
      .limit(1)

    return connection || null
  }

  async listByFamily(familyId: string) {
    const family1 = aliasedTable(families, 'family1')
    const family2 = aliasedTable(families, 'family2')

    const results = await db
      .select({
        id: connections.id,
        family1Id: connections.family1Id,
        family2Id: connections.family2Id,
        connectingMemberId: connections.connectingMemberId,
        status: connections.status,
        verified: connections.verified,
        approvedByFamily1Admin: connections.approvedByFamily1Admin,
        approvedByFamily2Admin: connections.approvedByFamily2Admin,
        createdAt: connections.createdAt,
        connectingMember: {
          name: members.name,
          profilePhoto: members.profilePhoto,
        },
        family1Name: family1.name,
        family2Name: family2.name,
      })
      .from(connections)
      .leftJoin(members, eq(connections.connectingMemberId, members.id))
      .leftJoin(family1, eq(connections.family1Id, family1.id))
      .leftJoin(family2, eq(connections.family2Id, family2.id))
      .where(
        or(eq(connections.family1Id, familyId), eq(connections.family2Id, familyId)),
      )

    return results
  }

  async approve(connectionId: string, familyId: string, _userId: string) {
    const connection = await this.findById(connectionId)
    if (!connection) {
      throw new Error('Connection not found')
    }

    // Determine which family is approving
    const isFamily1 = connection.family1Id === familyId
    const isFamily2 = connection.family2Id === familyId

    if (!isFamily1 && !isFamily2) {
      throw new Error('Family is not part of this connection')
    }

    // Update approval status
    const updateData: Partial<typeof connections.$inferInsert> = {}
    if (isFamily1) {
      updateData.approvedByFamily1Admin = true
    } else {
      updateData.approvedByFamily2Admin = true
    }

    // If both families have approved, mark as verified
    if (
      (isFamily1 && connection.approvedByFamily2Admin) ||
      (isFamily2 && connection.approvedByFamily1Admin)
    ) {
      updateData.status = 'verified'
      updateData.verified = true
      updateData.verifiedAt = new Date()
    } else {
      updateData.status = 'pending'
    }

    const [updatedConnection] = await db
      .update(connections)
      .set(updateData)
      .where(eq(connections.id, connectionId))
      .returning()

    return updatedConnection
  }

  async reject(connectionId: string, familyId: string) {
    const connection = await this.findById(connectionId)
    if (!connection) {
      throw new Error('Connection not found')
    }

    // Verify family is part of connection
    const isFamily1 = connection.family1Id === familyId
    const isFamily2 = connection.family2Id === familyId

    if (!isFamily1 && !isFamily2) {
      throw new Error('Family is not part of this connection')
    }

    const [updatedConnection] = await db
      .update(connections)
      .set({ status: 'rejected' })
      .where(eq(connections.id, connectionId))
      .returning()

    return updatedConnection
  }

  async verify(connectionId: string) {
    const [connection] = await db
      .update(connections)
      .set({
        verified: true,
        status: 'verified',
        verifiedAt: new Date(),
      })
      .where(eq(connections.id, connectionId))
      .returning()

    if (!connection) {
      throw new Error('Connection not found')
    }

    return connection
  }
}
