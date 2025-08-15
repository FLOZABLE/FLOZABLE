export interface FriendIdParams {
  friend_id: string;
}

export interface FriendshipIdParams {
  friendship_id: string;
}

// GET /friend/all/status
export interface GetFriendAllStatusQuery {
  timezone: string;
}

// GET /friend/search
export interface GetFriendSearchQuery {
  query: string;
}

// POST /friend/:friend_Id/request/reply
export interface PostFriendRequestReplyBody {
  accepted: boolean;
}
