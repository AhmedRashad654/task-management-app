// common/constants/messages.constant.ts

export const AUTH_MESSAGES = {
  REGISTERED: 'User registered successfully',
  LOGGED_IN: 'Logged in successfully',
  PASSWORD_RESET_REQUESTED: 'If that email exists, a reset link has been sent',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully, please login again',
  INVALID_OTP: 'Invalid or expired OTP',
  INVALID_CREDENTIALS: 'Invalid email or password',
} as const;

export const PROJECT_MESSAGES = {
  CREATED: 'Project created successfully',
  UPDATED: 'Project updated successfully',
  DELETED: 'Project deleted successfully',
  NOT_FOUND: 'Project not found',
  MEMBER_ADDED: 'Member added successfully. Invitation email sent.',
  MEMBER_NOT_FOUND:'Member not found',
  CANNOT_REMOVE_OWNER:'Cannot remove project owner',
  MEMBER_REMOVED: 'Member removed from project',
  OWNER_CANNOT_ADDED_TO_MEMBER: 'Project owner cannot be added as a member',
  USER_ALREADY_MEMBER: 'User is already a member of this project',
  ONLY_OWNER_CAN_PERFORM_ACTION:'Only the project owner can perform this action'
} as const;

export const TASK_MESSAGES = {
  CREATED: 'Task created successfully',
  UPDATED: 'Task updated successfully',
  DELETED: 'Task deleted successfully',
  ASSIGNED: 'Task assigned successfully',
  NOT_FOUND: 'Task not found',
} as const;
