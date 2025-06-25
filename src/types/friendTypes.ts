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

// POST /friend/:friend_Id/request/reply
export interface PostFriendRequestReplyBody {
  accepted: boolean;
}
