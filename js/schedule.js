/**
 * Parse doctor_clinic_links.schedule text into weekday availability and time slots.
 * Supports lines like: "Mon-Fri: 9:00 AM - 5:00 PM" or "Mon,Wed: 10AM-2PM"
 */
(function (global) {
  const DAY_ALIASES = {
    sun: 0,
    sunday: 0,
    mon: 1,
    monday: 1,
    tue: 2,
    tues: 2,
    tuesday: 2,
    wed: 3,
    wednesday: 3,
    thu: 4,
    thur: 4,
    thurs: 4,
    thursday: 4,
    fri: 5,
    friday: 5,
    sat: 6,
    saturday: 6,
  };

  function parseTimeToMinutes(str) {
    if (!str) return null;
    const s = str.trim().toUpperCase().replace(/\s+/g, " ");
    const m = s.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    const ap = m[3];
    if (ap === "PM" && h < 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    return h * 60 + min;
  }

  function expandDayRange(start, end) {
    const out = [];
    let cur = start;
    for (let n = 0; n < 8; n++) {
      out.push(cur);
      if (cur === end) break;
      cur = cur === 6 ? 0 : cur + 1;
    }
    return out;
  }

  function expandDayToken(token) {
    const t = token.trim().toLowerCase();
    if (!t) return [];
    if (t.includes("-")) {
      const parts = t.split("-").map((p) => p.trim().toLowerCase());
      if (parts.length !== 2) return [];
      const start = DAY_ALIASES[parts[0]];
      const end = DAY_ALIASES[parts[1]];
      if (start == null || end == null) return [];
      return expandDayRange(start, end);
    }
    const single = DAY_ALIASES[t.replace(/\.$/, "")];
    return single != null ? [single] : [];
  }

  function parseDayList(part) {
    const days = new Set();
    const chunks = part.split(/[,;/]/);
    chunks.forEach((chunk) => {
      const seg = chunk.trim();
      if (!seg) return;
      expandDayToken(seg).forEach((d) => days.add(d));
    });
    return days;
  }

  /**
   * @returns {{ weekdays: Set<number>, slotLabels: string[] } | null}
   */
  function parseVenueSchedule(scheduleStr) {
    if (!scheduleStr || typeof scheduleStr !== "string") return null;
    const text = scheduleStr.replace(/\r\n/g, "\n").trim();
    if (!text) return null;

    const weekdays = new Set();
    let startMin = 9 * 60;
    let endMin = 17 * 60;

    const segments = text.split(/\||\n/).map((s) => s.trim()).filter(Boolean);
    const toParse = segments.length ? segments : [text];

    for (const seg of toParse) {
      const colonIdx = seg.indexOf(":");
      let dayPart = seg;
      let timePart = "";
      if (colonIdx !== -1) {
        dayPart = seg.slice(0, colonIdx).trim();
        timePart = seg.slice(colonIdx + 1).trim();
      }
      parseDayList(dayPart).forEach((d) => weekdays.add(d));

      if (timePart) {
        const timeSeg = timePart.replace(/\u2013|\u2014/g, "-");
        const rangeMatch = timeSeg.match(
          /(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*[-–to]+\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i
        );
        if (rangeMatch) {
          const a = parseTimeToMinutes(rangeMatch[1]);
          const b = parseTimeToMinutes(rangeMatch[2]);
          if (a != null && b != null && b > a) {
            startMin = a;
            endMin = b;
          }
        }
      }
    }

    if (weekdays.size === 0) {
      [1, 2, 3, 4, 5].forEach((d) => weekdays.add(d));
    }

    const slotLabels = [];
    const step = 30;
    for (let m = startMin; m + step <= endMin; m += step) {
      const h24 = Math.floor(m / 60);
      const mm = m % 60;
      slotLabels.push(formatSlotLabel(h24, mm));
    }

    if (slotLabels.length === 0) {
      slotLabels.push("09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM");
    }

    return { weekdays, slotLabels };
  }

  function formatSlotLabel(h24, mm) {
    const period = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return `${h12}:${String(mm).padStart(2, "0")} ${period}`;
  }

  global.ScheduleParser = {
    parseVenueSchedule,
    formatSlotLabel,
  };
})(typeof window !== "undefined" ? window : globalThis);
