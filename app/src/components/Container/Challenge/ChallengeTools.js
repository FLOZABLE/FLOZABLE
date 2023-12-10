import { DateTime } from 'luxon';

function findLongestFocus(subjects, startUnix, mode){

    if (mode === "Weekly" || mode === "Week"){
        const dateDiff = DateTime.fromMillis(Date.now()).startOf('week').diff(startUnix, ['weeks']); //start of this week to start of range
        const weeklyIndex1 = subjects.weekly.focus.length - dateDiff.weeks - 1; //index of object (-1 for 0-index)
        if (weeklyIndex1 >= 0) {
            return subjects.weekly.focus[weeklyIndex1];
        }
        return 0;
    }
    else if (mode === "Daily" || mode === "Day"){
        const dateDiff = DateTime.fromMillis(Date.now()).startOf('day').diff(startUnix, ['days']);
        const dailyIndex1 = subjects.daily.focus.length - dateDiff.days - 1;
        if (dailyIndex1 >= 0) {
            return subjects.daily.focus[dailyIndex1];
        }
        return 0;
    }
}

function findTotalStudy(subjects, startUnix, mode){
    if (mode === "Weekly" || mode === "Week"){
        const dateDiff = DateTime.fromMillis(Date.now()).startOf('week').diff(startUnix, ['weeks']); //start of this week to start of range
        const weeklyIndex1 = subjects.weekly.groupedTotal.length - dateDiff.weeks - 1; //index of object (-1 for 0-index)
        if (weeklyIndex1 >= 0) {
            return subjects.weekly.groupedTotal[weeklyIndex1];
        }
        return 0;
    }
    else if (mode === "Daily" || mode === "Day"){
        const dateDiff = DateTime.fromMillis(Date.now()).startOf('day').diff(startUnix, ['days']);
        const dailyIndex1 = subjects.daily.groupedTotal.length - dateDiff.days - 1;
        if (dailyIndex1 >= 0) {
            return subjects.daily.groupedTotal[dailyIndex1];
        }
        return 0;
    }
}

export { findTotalStudy, findLongestFocus };