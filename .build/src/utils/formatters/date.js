"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="788995c1-156d-54bf-a3a5-69e4e549b226")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = void 0;
/**
 * @param dateInput The date to format
 * @param format The format to put it in
 *
 * Tokens:
 *
 * `YYYY` -> 2025   (Full year)
 *
 * `YY`   -> 25     (Short year)
 *
 * `MMMM` -> March  (Full month)
 *
 * `MMM`  -> Mar    (Short month)
 *
 * `MM`   -> 04     (Number month)
 *
 * `M`    -> 4      (Number month)
 *
 * `DD`   -> 09     (Day of month)
 *
 * `D`    -> 9      (Day of month)
 *
 * `dddd` -> Monday (Full weekday)
 *
 * `ddd`  -> Mon    (Short weekday)
 *
 * `hh`   -> 02     (12 hour)
 *
 * `h`    -> 2      (12 hour)
 *
 * `HH`   -> 14     (24 hour)
 *
 * `H`    -> 14     (24 hour)
 *
 * `mm`   -> 05     (minute)
 *
 * `m`    -> 5      (minute)
 *
 * `ss`   -> 09     (second)
 *
 * `s`    -> 9      (second)
 *
 * `A`    -> PM     (AM/PM)
 *
 * `a`    -> pm     (am/pm)
 */
const formatDate = (dateInput, format) => {
    const date = new Date(dateInput);
    const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daysFull = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const monthsShort = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = date.getDay();
    const hours24 = date.getHours();
    const hours12 = hours24 % 12 || 12;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const isPM = hours24 >= 12;
    const pad = (n) => n.toString().padStart(2, "0");
    return format
        .replace(/YYYY/g, year.toString())
        .replace(/YY/g, year.toString().slice(-2))
        .replace(/MMM/g, monthsShort[month - 1])
        .replace(/MMMM/g, months[month - 1])
        .replace(/MM/g, pad(month))
        .replace(/M/g, month.toString())
        .replace(/DD/g, pad(day))
        .replace(/D/g, day.toString())
        .replace(/dddd/g, daysFull[dayOfWeek])
        .replace(/ddd/g, daysShort[dayOfWeek])
        .replace(/hh/g, pad(hours12))
        .replace(/h/g, hours12.toString())
        .replace(/HH/g, pad(hours24))
        .replace(/H/g, hours24.toString())
        .replace(/mm/g, pad(minutes))
        .replace(/m/g, minutes.toString())
        .replace(/ss/g, pad(seconds))
        .replace(/s/g, seconds.toString())
        .replace(/A/g, isPM ? "PM" : "AM")
        .replace(/a/g, isPM ? "pm" : "am");
};
exports.formatDate = formatDate;
//# sourceMappingURL=/src/utils/formatters/date.js.map
//# debugId=788995c1-156d-54bf-a3a5-69e4e549b226
