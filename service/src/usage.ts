import * as moment from 'moment';
import { MeterReading } from './data';

import { isEndOfMonth } from './months';

interface Usage {
  year: number;
  month: number;
  usage: number;
}

export const calculate = (readings: MeterReading[]): Usage[] => {
  const monthlyUsage = [];

  const interpolated = interpolateReadings(readings);

  interpolated.forEach((_, index) => {
    if (index === 0) {
      return;
    }

    const { cumulative: nextCumulative } = interpolated[index];
    const { year, month, cumulative } = interpolated[index - 1];

    monthlyUsage[index - 1] = {
      year,
      month,
      usage: nextCumulative - cumulative
    };
  });

  return monthlyUsage;
};

const interpolateReadings = (readings: MeterReading[]): any[] => {
  const interpolated = [];

  let current: MeterReading;
  let date: moment.Moment;

  readings.forEach((next, index) => {
    current = readings[index - 1];
    if (Boolean(current)) {
      date = moment(current.readingDate);

      interpolated[index - 1] = {
        year: date.year(),
        month: date.month() + 1,
        cumulative: interpolateCumulative(date, current, next)
      };
    }
  });

  return interpolated;
};

const interpolateCumulative = (
  date: moment.Moment,
  current: MeterReading,
  next: MeterReading
): number => {
  if (isEndOfMonth(date)) {
    return current.cumulative;
  } else {
    return (next.cumulative - current.cumulative) / 2 + current.cumulative;
  }
};
