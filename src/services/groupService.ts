import { Group, RawGroup } from '../types/groupTypes';

export const formatGroups = (rawGroups: RawGroup[]): Group[] => {
  return rawGroups.map((rawGroup) => {
    let tags = [];
    try {
      tags = rawGroup.tags ? JSON.parse(rawGroup.tags) : [];
    } catch (err) {
      console.error('Failed to parse tags:', err);
    }

    return {
      group_id: rawGroup.group_id,
      name: rawGroup.name,
      leader: rawGroup.leader,
      visibility: Boolean(rawGroup.visibility),
      description: rawGroup.description,
      created_at: rawGroup.created_at,
      max_members: rawGroup.max_members,
      tags,
      color: rawGroup.color,
      goal_hr: rawGroup.goal_hr,
      members: rawGroup.group_members.map((m) => m.user_id),
      likes: rawGroup.group_likes.map((l) => l.user_id),
    };
  });
};
