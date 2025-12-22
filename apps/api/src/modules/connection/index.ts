import { protectedProcedure, router } from '../../trpc'
import {
  approveConnectionSchema,
  createConnectionSchema,
  getConnectionByIdSchema,
  listConnectionsSchema,
  rejectConnectionSchema,
  verifyConnectionSchema,
} from './model'
import { ConnectionService } from './service'
import { FamilyService } from '../family/service'
import { MemberService } from '../member/service'

const connectionService = new ConnectionService()
const familyService = new FamilyService()
const memberService = new MemberService()

export const connectionRouter = router({
  create: protectedProcedure
    .input(createConnectionSchema)
    .mutation(async ({ input, ctx }) => {
      // Only admin can create connections
      const isAdmin1 = await familyService.isAdmin(input.family1Id, ctx.user.id)
      const isAdmin2 = await familyService.isAdmin(input.family2Id, ctx.user.id)

      if (!isAdmin1 && !isAdmin2) {
        throw new Error('Unauthorized: Only admin can create connections')
      }

      // Verify connecting member exists and belongs to one of the families
      const member = await memberService.findById(input.connectingMemberId)
      if (!member) {
        throw new Error('Connecting member not found')
      }

      if (member.familyId !== input.family1Id && member.familyId !== input.family2Id) {
        throw new Error('Connecting member must belong to one of the families')
      }

      const connection = await connectionService.create({
        family1Id: input.family1Id,
        family2Id: input.family2Id,
        connectingMemberId: input.connectingMemberId,
        status: 'pending',
        verified: false,
        approvedByFamily1Admin: false,
        approvedByFamily2Admin: false,
      })

      return connection
    }),

  getById: protectedProcedure
    .input(getConnectionByIdSchema)
    .query(async ({ input, ctx }) => {
      const connection = await connectionService.findById(input.id)
      if (!connection) {
        throw new Error('Connection not found')
      }

      // Check if user is admin of either family
      const isAdmin1 = await familyService.isAdmin(connection.family1Id, ctx.user.id)
      const isAdmin2 = await familyService.isAdmin(connection.family2Id, ctx.user.id)

      if (!isAdmin1 && !isAdmin2) {
        throw new Error('Unauthorized: Only admin can view connections')
      }

      return connection
    }),

  list: protectedProcedure.input(listConnectionsSchema).query(async ({ input, ctx }) => {
    // Only admin can list connections
    const isAdmin = await familyService.isAdmin(input.familyId, ctx.user.id)
    if (!isAdmin) {
      throw new Error('Unauthorized: Only admin can list connections')
    }

    const familyConnections = await connectionService.listByFamily(input.familyId)
    return familyConnections
  }),

  approve: protectedProcedure
    .input(approveConnectionSchema)
    .mutation(async ({ input, ctx }) => {
      const connection = await connectionService.findById(input.id)
      if (!connection) {
        throw new Error('Connection not found')
      }

      // Determine which family the user is admin of
      const isAdmin1 = await familyService.isAdmin(connection.family1Id, ctx.user.id)
      const isAdmin2 = await familyService.isAdmin(connection.family2Id, ctx.user.id)

      if (!isAdmin1 && !isAdmin2) {
        throw new Error('Unauthorized: Only admin can approve connections')
      }

      const familyId = isAdmin1 ? connection.family1Id : connection.family2Id
      const approvedConnection = await connectionService.approve(
        input.id,
        familyId,
        ctx.user.id,
      )

      return approvedConnection
    }),

  reject: protectedProcedure
    .input(rejectConnectionSchema)
    .mutation(async ({ input, ctx }) => {
      const connection = await connectionService.findById(input.id)
      if (!connection) {
        throw new Error('Connection not found')
      }

      // Determine which family the user is admin of
      const isAdmin1 = await familyService.isAdmin(connection.family1Id, ctx.user.id)
      const isAdmin2 = await familyService.isAdmin(connection.family2Id, ctx.user.id)

      if (!isAdmin1 && !isAdmin2) {
        throw new Error('Unauthorized: Only admin can reject connections')
      }

      const familyId = isAdmin1 ? connection.family1Id : connection.family2Id
      const rejectedConnection = await connectionService.reject(input.id, familyId)

      return rejectedConnection
    }),

  verify: protectedProcedure
    .input(verifyConnectionSchema)
    .mutation(async ({ input, ctx }) => {
      const connection = await connectionService.findById(input.id)
      if (!connection) {
        throw new Error('Connection not found')
      }

      // Only admin can verify (must be admin of at least one family)
      const isAdmin1 = await familyService.isAdmin(connection.family1Id, ctx.user.id)
      const isAdmin2 = await familyService.isAdmin(connection.family2Id, ctx.user.id)

      if (!isAdmin1 && !isAdmin2) {
        throw new Error('Unauthorized: Only admin can verify connections')
      }

      const verifiedConnection = await connectionService.verify(input.id)
      return verifiedConnection
    }),
})
