export interface WallLinkRequest {
  link: string;
  count?: number;
}

export interface GroupLinkRequest {
  link: string;
}

export interface LikePostRequest {
  postUrl: string;
  tokenCount?: number;
}

export interface SubscribeRequest {
  publicUrl: string;
}

export interface ShareRequest {
  postUrl: string;
}

export interface WallInfo {
  ownerId: string;
  postId: string;
  fullPostId: string;
}

export interface GroupInfo {
  groupId: string;
  screenName: string;
  isPublic: boolean;
}

export interface ProcessedWallData extends WallInfo {
  processedCount: number;
  status: string;
  timestamp: string;
}

export interface ProcessedGroupData extends GroupInfo {
  status: string;
  memberCount: number;
  timestamp: string;
}

// Типы для Like функционала
export interface LikeResult {
  accountNumber: number;
  tokenPreview: string;
  success: boolean;
  error?: string;
  message?: string;
  response?: any;
}

export interface LikeSummary {
  totalAccounts: number;
  successfulLikes: number;
  failedLikes: number;
  postInfo: WallInfo;
  postUrl: string;
  results: LikeResult[];
}

export interface LikePostData {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  summary?: LikeSummary;
  data?: LikeSummary;
}

// Типы для Subscribe функционала
export interface SubscribeResult {
  accountNumber: number;
  tokenPreview: string;
  success: boolean;
  error?: string;
  message?: string;
}

export interface SubscribeSummary {
  totalAccounts: number;
  successfulSubscriptions: number;
  failedSubscriptions: number;
  publicUrl: string;
  publicId: number;
  results: SubscribeResult[];
}

export interface SubscribeData {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  summary?: SubscribeSummary;
  data?: SubscribeSummary;
}

// Типы для Share функционала
export interface ShareResult {
  messageNumber?: number;
  senderNumber?: number;
  senderToken: string;
  senderName: string;
  senderId: number;
  receiverName: string;
  receiverId: number;
  success: boolean;
  error?: string;
  message?: string;
}

export interface ShareSummary {
  totalMessages: number;
  successfulMessages: number;
  failedMessages: number;
  totalSenders?: number;
  postInfo: WallInfo;
  postUrl: string;
  results: ShareResult[];
}

export interface ShareData {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  summary?: ShareSummary;
  data?: ShareSummary;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string;
  summary?: any;
}

export interface LoadingState {
  wall: boolean;
  group: boolean;
  single: boolean;
  subscribe: boolean;
  like: boolean;
  share: boolean; // ← ДОБАВЬТЕ ЭТУ СТРОЧКУ
}