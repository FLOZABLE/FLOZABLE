import { NextFunction, Request, Response } from 'express';
import { google } from 'googleapis';
import { DateTime } from 'luxon';

import { AppErrorFactory } from '../libs/errors';
import { googleOauth2client } from '../services/authService';
import { getCacheUserGoogleAccessToken } from '../services/cacheService';
import { formatPlan } from '../services/planService';
import {
  CalendarPlan,
  DeletePlanBody,
  DeletePlanParams,
  GetPlanAllQuery,
  PatchPlanBody,
  PatchPlanParams,
  PutPlanBody,
} from '../types/planTypes';

export const getPlanAll = async (
  req: Request<{}, {}, {}, GetPlanAllQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;
    const { date } = req.query;

    const googleAccessToken = await getCacheUserGoogleAccessToken(userId);
    if (!googleAccessToken) {
      const response = AppErrorFactory.tokenMissing();
      res.status(response.status).send(response);
      return;
    }

    const auth = googleOauth2client();
    auth.setCredentials({ access_token: googleAccessToken });

    const calendarApi = google.calendar({ version: 'v3', auth });
    const calendarListResponse = await calendarApi.calendarList.list();
    const calendars = calendarListResponse.data.items || [];

    if (!calendars.length) {
      res.status(200).send({
        success: true,
        status: 200,
        data: { plans: [] },
      });
      return;
    }

    const dateTime = DateTime.fromISO(date).startOf('month');
    const timeMin = dateTime.minus({ weeks: 1 }).toISO()!;
    const timeMax = dateTime.endOf('month').plus({ weeks: 1 }).toISO()!;

    const calendarResults = await Promise.allSettled(
      calendars.map(async (calendar) => {
        if (!calendar.id) return null;

        const eventsRes = await calendarApi.events.list({
          calendarId: calendar.id,
          timeMin,
          timeMax,
          maxResults: 250,
        });

        const events = (eventsRes.data.items || []).map((event) =>
          formatPlan(calendar, event),
        );

        return {
          background_color: calendar.backgroundColor,
          foreground_color: calendar.foregroundColor,
          summary: calendar.summary,
          id: calendar.id!,
          events,
        } as CalendarPlan;
      }),
    );

    const plans: CalendarPlan[] = calendarResults
      .filter(
        (result): result is PromiseFulfilledResult<CalendarPlan> =>
          result.status === 'fulfilled' && result.value !== null,
      )
      .map((result) => result.value);

    res.send({ success: true, data: { plans } });
  } catch (error) {
    next(error);
  }
};

export const patchPlan = async (
  req: Request<PatchPlanParams, {}, PatchPlanBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;

    const { plan_id } = req.params;
    const { plan } = req.body;

    const googleAccessToken = await getCacheUserGoogleAccessToken(userId);
    if (!googleAccessToken) {
      const response = AppErrorFactory.tokenMissing();
      res.status(response.status).send(response);
      return;
    }

    const auth = googleOauth2client();
    auth.setCredentials({ access_token: googleAccessToken });

    const calendarApi = google.calendar({ version: 'v3', auth });

    const patchPlanResponse = await calendarApi.events.update({
      calendarId: plan.calendar_id,
      eventId: plan_id,
      requestBody: {
        ...plan,
        summary: plan.title,
        start: { dateTime: plan.start },
        end: { dateTime: plan.end },
      },
    });

    const calendarResponse = await calendarApi.calendarList.get({
      calendarId: 'primary',
      auth,
    });

    const formattedPlan = formatPlan(
      calendarResponse.data,
      patchPlanResponse.data,
    );

    res.status(200).send({
      success: true,
      status: 200,
      message: 'Plan Saved!',
      data: { plan: formattedPlan },
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlan = async (
  req: Request<DeletePlanParams, {}, DeletePlanBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;
    const { plan_id } = req.params;
    const { calendar_id } = req.body;

    const googleAccessToken = await getCacheUserGoogleAccessToken(userId);

    if (!googleAccessToken) {
      const response = AppErrorFactory.tokenMissing();
      res.status(response.status).send(response);
      return;
    }

    const auth = googleOauth2client();
    auth.setCredentials({
      access_token: googleAccessToken,
    });

    const calendarApi = google.calendar({ version: 'v3', auth });

    await calendarApi.events.delete({
      calendarId: calendar_id,
      eventId: plan_id,
    });

    res.status(200).send({
      success: true,
      status: 200,
      message: `Deleted the plan`,
    });
  } catch (error) {
    next(error);
  }
};

export const putPlan = async (
  req: Request<{}, {}, PutPlanBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user_id!;
    const { plan } = req.body;

    const googleAccessToken = await getCacheUserGoogleAccessToken(userId);

    if (!googleAccessToken) {
      const response = AppErrorFactory.tokenMissing();
      res.status(response.status).send(response);
      return;
    }

    const auth = googleOauth2client();
    auth.setCredentials({
      access_token: googleAccessToken,
    });

    const calendarApi = google.calendar({ version: 'v3', auth });

    const response = await calendarApi.events.insert({
      calendarId: 'primary',
      requestBody: {
        ...plan,
        summary: plan.title,
        start: { dateTime: plan.start },
        end: { dateTime: plan.end },
      },
    });

    const calendarResponse = await calendarApi.calendarList.get({
      calendarId: 'primary',
      auth,
    });

    const formattedPlan = formatPlan(calendarResponse.data, response.data);

    res.status(200).send({
      success: true,
      status: 200,
      message: 'Plan Saved!',
      data: {
        plan: formattedPlan,
      },
    });
  } catch (error) {
    next(error);
  }
};
