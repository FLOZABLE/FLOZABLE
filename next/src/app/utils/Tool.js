import ct from "countries-and-timezones";
import config from "./config";
import { DateTime } from "luxon";
import { postNotificationsSubscribe } from "@/Api/notificationsApi";

function getCountryCode(timezone) {
  try {
    const timeZoneData = ct.getTimezone(timezone);
    if (timeZoneData && timeZoneData.countries[0]) {
      return timeZoneData.countries[0];
    }
    return false;
  } catch (error) {
    console.error(
      `Error getting country code for timezone ${timezone}:`,
      error
    );
    return false;
  }
}

/**
 * @param {*} sec
 * @returns
 */
const secondConverter = (sec, options = ["s", "m", "h"]) => {
  let value = sec ? sec : 0;
  let type = 0;
  if (sec >= 60 * 60) {
    value = (sec / (60 * 60)).toFixed(2);
    type = 2;
  } else if (sec > 60) {
    value = Math.floor(sec / 60);
    type = 1;
  }

  return { value, type: options[type] };
};

const durationFormatter = (sec) => {
  let res = "";
  let hours = 0;
  if (sec >= 3600) {
    hours = Math.floor(sec / 3600);
    sec = sec % 3600;
  }
  let mins = 0;
  if (sec >= 60) {
    mins = Math.floor(sec / 60);
    sec = sec % 60;
  }

  if (hours > 0) {
    res = hours + "hr " + mins.toString().padStart(2, "0") + "m";
  } else if (mins > 0) {
    res = mins + "m " + sec.toString().padStart(2, "0") + "s";
  } else {
    res = sec + " seconds";
  }

  return res;
};

const cyrb128 = (str) => {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4;
  h2 ^= h1;
  h3 ^= h1;
  h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
};

function randomIntInRange(min, max) {
  const randomVal = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomVal;
}

const focusCalculator = (grouped) => {
  if (!grouped) return 0;
  let focus = 0;
  grouped.map(([start, stop]) => {
    const duration = stop - start;
    if (duration > focus) {
      focus = duration;
    }
    return null;
  });
  return focus;
};

function streakCalculator(groupedSubjects) {
  const reversedDaily = groupedSubjects.daily.total.toReversed();

  let streak = 0;
  reversedDaily.find((day) => {
    if (day.data) {
      streak += 1;
    } else {
      return true;
    }
  });

  return streak;
}

function todayTotalCalculator(groupedSubjects) {
  if (!groupedSubjects || !groupedSubjects?.daily?.total?.length) return 0;
  const totalSeconds =
    groupedSubjects.daily.total[groupedSubjects.daily.total.length - 1].data;
  return totalSeconds ? totalSeconds : 0;
}

function todayFocusCalculator(groupedSubjects) {
  if (!groupedSubjects || !groupedSubjects?.daily?.focus?.length) return 0;
  const totalSeconds =
    groupedSubjects.daily.focus[groupedSubjects.daily.focus.length - 1].data;
  return totalSeconds ? totalSeconds : 0;
}

function generateRandomId(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomId = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomId += characters.charAt(randomIndex);
  }

  return randomId;
}

async function requestNotification(applicationServerKey) {
  // Helper function to check if service workers and push are supported
  function isSupported() {
    return "serviceWorker" in navigator && "PushManager" in window;
  }

  // Check if service workers and push notifications are supported
  if (!isSupported()) {
    console.log("Service Worker or Push API not supported");
    return { success: false, reason: "Browser unsupported" };
  }

  // Check if notification permission is already granted
  if (Notification.permission === "granted") {
    console.log("Notification permission already granted");
    return { success: true };
  }

  try {
    // Wait for the service worker to be ready
    const registration = await navigator.serviceWorker.ready;
    console.log("Service worker ready");

    // Request notification permission from the user
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      console.log("Push subscription:", subscription);
      const p256dh = btoa(
        String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")))
      );
      const auth = btoa(
        String.fromCharCode(...new Uint8Array(subscription.getKey("auth")))
      );
      const subscriptionObject = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh,
          auth,
        },
      };

      console.log(subscriptionObject);

      // Handle the subscription (e.g., send it to your server)
      const response = await postNotificationsSubscribe(subscriptionObject);
      return response;
    } else {
      console.log("Push permission denied");
      return { success: false, reason: "Permission denied" };
    }
  } catch (error) {
    console.error("Error during push subscription:", error);
    return { success: false, reason: error.message || "Unknown error" };
  }
}

function unsubscribeFromPush() {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker is not supported");
    return;
  }

  navigator.serviceWorker.ready
    .then((registration) => {
      return registration.pushManager.getSubscription();
    })
    .then((subscription) => {
      if (subscription) {
        return subscription.unsubscribe();
      } else {
        console.log("No subscription found");
      }
    })
    .then(() => {
      console.log("Successfully unsubscribed from push notifications");
    })
    .catch((error) => {
      console.error("Error unsubscribing from push notifications:", error);
    });
}

function getDates(date, mode, length) {
  const dates = [];
  let dateTime = DateTime.fromJSDate(date).startOf(mode).startOf("day");
  const now = DateTime.now().startOf(mode).startOf("day");

  for (let i = 0; i < length; i++) {
    if (dateTime.plus({ [mode]: i }) <= now) {
      dates.push(dateTime.plus({ [mode]: i }));
    }
  }
  while (dates.length < length) {
    dateTime = dateTime.minus({ [mode]: 1 });
    dates.unshift(dateTime);
  }

  return dates;
}

function getDatesDisplay(date, mode, format = "LLLL d", length = 1) {
  const dateTime = DateTime.fromJSDate(date);

  if (mode === "day") {
    if (length === 1) {
      return dateTime.toFormat(format);
    }
  } else if (mode === "week") {
    if (length === 1) {
      return dateTime.toFormat(format);
    }
  } else {
    if (length === 1) {
      return dateTime.toFormat("kkkk LLLL");
    }
  }
}

export {
  cyrb128,
  getCountryCode,
  secondConverter,
  randomIntInRange,
  durationFormatter,
  focusCalculator,
  todayTotalCalculator,
  todayFocusCalculator,
  streakCalculator,
  generateRandomId,
  requestNotification,
  unsubscribeFromPush,
  getDates,
  getDatesDisplay,
};
