import dayjs from "dayjs";
import { useEffect, useState } from "react";

const useCurrentTime = () => {
  const [currentMin, setCurrentMin] = useState(dayjs().startOf("minute"));
  const [currentHour, setCurrentHour] = useState(dayjs().startOf("hour"));
  const [currentDay, setCurrentDay] = useState(dayjs().startOf("day"));

  useEffect(() => {
    // Initialize with current time units
    const now = dayjs();
    setCurrentMin(now.startOf("minute"));
    setCurrentHour(now.startOf("hour"));
    setCurrentDay(now.startOf("day"));

    let minuteUpdateTimer: number;
    let hourUpdateTimer: number;
    let dayUpdateTimer: number;

    const scheduleNextMinuteUpdate = () => {
      const now = dayjs();
      const nextMinuteBoundary = now.add(1, "minute").startOf("minute");
      const millisecondsUntilNextMinute = nextMinuteBoundary.diff(now);

      minuteUpdateTimer = setTimeout(() => {
        setCurrentMin(dayjs().startOf("minute"));
        scheduleNextMinuteUpdate();
      }, millisecondsUntilNextMinute);
    };

    const scheduleNextHourUpdate = () => {
      const now = dayjs();
      const nextHourBoundary = now.add(1, "hour").startOf("hour");
      const millisecondsUntilNextHour = nextHourBoundary.diff(now);

      hourUpdateTimer = setTimeout(() => {
        setCurrentHour(dayjs().startOf("hour"));
        scheduleNextHourUpdate();
      }, millisecondsUntilNextHour);
    };

    const scheduleNextDayUpdate = () => {
      const now = dayjs();
      const nextDayBoundary = now.add(1, "day").startOf("day");
      const millisecondsUntilNextDay = nextDayBoundary.diff(now);

      dayUpdateTimer = setTimeout(() => {
        setCurrentDay(dayjs().startOf("day"));
        scheduleNextDayUpdate();
      }, millisecondsUntilNextDay);
    };

    scheduleNextMinuteUpdate();
    scheduleNextHourUpdate();
    scheduleNextDayUpdate();

    return () => {
      if (minuteUpdateTimer) {
        clearTimeout(minuteUpdateTimer);
      }
      if (hourUpdateTimer) {
        clearTimeout(hourUpdateTimer);
      }
      if (dayUpdateTimer) {
        clearTimeout(dayUpdateTimer);
      }
    };
  }, []);

  return { currentMin, currentHour, currentDay };
};

export { useCurrentTime };
