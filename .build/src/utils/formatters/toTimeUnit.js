"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="77d5f32e-9ed0-5893-aeb8-d436c55c2dfc")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.toTimeUnit = toTimeUnit;
/**
 * Converts a time duration to a specific unit.
 *
 * @param unit The unit to convert to
 * @param seconds Seconds component
 * @param minutes Minutes component
 * @param hours Hours component
 * @param days Days component
 * @param weeks Weeks component
 * @param months Months component (assumes 30 days per month)
 * @returns Total duration converted into the given unit
 */
function toTimeUnit(unit, seconds = 0, minutes = 0, hours = 0, days = 0, weeks = 0, months = 0) {
    // Convert everything to seconds first
    const totalSeconds = seconds +
        minutes * 60 +
        hours * 3600 +
        days * 86400 +
        weeks * 604800 +
        months * 2592000; // Assumes 30-day months
    switch (unit) {
        case "seconds":
            return totalSeconds;
        case "minutes":
            return totalSeconds / 60;
        case "hours":
            return totalSeconds / 3600;
        case "days":
            return totalSeconds / 86400;
        case "weeks":
            return totalSeconds / 604800;
        case "months":
            return totalSeconds / 2592000;
        default:
            throw new Error(`Unsupported time unit: ${unit}`);
    }
}
//# sourceMappingURL=/src/utils/formatters/toTimeUnit.js.map
//# debugId=77d5f32e-9ed0-5893-aeb8-d436c55c2dfc
