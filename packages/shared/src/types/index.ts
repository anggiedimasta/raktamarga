// User types
export type User = {
  id: string
  email: string | null
  phone: string | null
  authProvider: 'google' | 'phone' | 'whatsapp'
  createdAt: Date
  updatedAt: Date
}

// Family types
export type Family = {
  id: string
  name: string
  description: string | null
  familyCode: string
  adminId: string
  createdAt: Date
  updatedAt: Date
}

export type FamilyMember = {
  id: string
  familyId: string
  userId: string | null
  name: string
  dob: Date | null
  dod: Date | null
  gender: 'male' | 'female' | 'other' | null
  profilePhoto: string | null
  privacySettings: PrivacySettings
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type PrivacySettings = {
  visibilityLevel: VisibilityLevel
  customRules?: Record<string, unknown>
}

export type VisibilityLevel =
  | 'private'
  | 'family_only'
  | 'immediate_family'
  | 'extended_family'
  | 'connected_families'
  | 'extended_connections'
  | 'public'

// Relationship types
export type Relationship = {
  id: string
  member1Id: string
  member2Id: string
  relationshipType: RelationshipType
  verified: boolean
  createdAt: Date
}

export type RelationshipType =
  | 'parent'
  | 'child'
  | 'sibling'
  | 'spouse'
  | 'partner'
  | 'adoption'
  | 'step_sibling'

// Family connection types
export type FamilyConnection = {
  id: string
  family1Id: string
  family2Id: string
  connectingMemberId: string
  status: ConnectionStatus
  verified: boolean
  approvedByFamily1Admin: boolean
  approvedByFamily2Admin: boolean
  createdAt: Date
  verifiedAt: Date | null
}

export type ConnectionStatus = 'pending' | 'verified' | 'rejected'

// Event types
export type Event = {
  id: string
  memberId: string
  eventType: EventType
  eventDate: Date
  location: string | null
  description: string | null
  relatedMemberId: string | null
  photos: string[]
  privacyLevel: VisibilityLevel
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type EventType =
  | 'birth'
  | 'death'
  | 'marriage'
  | 'divorce'
  | 'partnership'
  | 'adoption'
  | 'graduation'
  | 'migration'
  | 'custom'

// Notification types
export type Notification = {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  relatedEntityType: string | null
  relatedEntityId: string | null
  read: boolean
  createdAt: Date
}

export type NotificationType =
  | 'member_submission_pending'
  | 'member_edit_pending'
  | 'connection_request'
  | 'join_request'
  | 'submission_approved'
  | 'submission_rejected'
  | 'edit_approved'
  | 'edit_rejected'
  | 'member_added'
  | 'connection_established'
  | 'event_added'
  | 'privacy_changed'

// Member submission types
export type MemberSubmission = {
  id: string
  familyId: string
  memberData: Record<string, unknown>
  submissionType: 'create' | 'update'
  status: SubmissionStatus
  submittedBy: string
  reviewedBy: string | null
  createdAt: Date
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'
