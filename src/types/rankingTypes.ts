import { Prisma } from '../generated/prisma';

import { UserInfo } from './accountTypes';
import { Viewer } from './otherTypes';

export interface RawRanking
  extends Pick<
    Prisma.ranking_detailsCreateManyInput,
    'user_id' | 'rank' | 'study_time'
  > {}

export interface Ranking extends UserInfo, RawRanking {
  date: string;
}

export type GetRankingBody = {
  viewer: Viewer;
  date: string;
};

export interface GetRankingQuery {
  viewer: Viewer;
  date: string;
  timezone: string;
}

export interface GetUserRankingParams {
  user_id: string;
}

export interface GetUserRankingQuery {
  viewer: Viewer;
  date: string;
  timezone: string;
}
