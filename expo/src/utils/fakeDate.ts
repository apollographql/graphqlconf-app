// fake `Date` to always create a fixed-time date during the conference when called without arguments
// this makes it easier to test date-related features like "today" highlighting
const realDate = Symbol.for("realDate");
const g = globalThis as unknown as { [realDate]: typeof Date };
if (!(realDate in globalThis)) {
  // saving the real date in globalThis once so in "hot reload" scenarios we won't wrap it again and again by treating a wrapped version as the original
  g[realDate] = Date;
}
const targetDate = 1757318880000; // "Mon Sep 08 2025 10:08:00 GMT+0200 (Central European Summer Time)" - during one of the keynotes
function FakeDate(...args: Parameters<typeof Date>) {
  const RealDate = g[realDate];
  if (new.target) {
    if (args.length === 0) {
      return new RealDate(targetDate);
    } else {
      return new RealDate(...args);
    }
  }
  return new RealDate(targetDate).toString();
}
FakeDate.now = () => targetDate;
FakeDate.parse = g[realDate].parse;
FakeDate.UTC = g[realDate].UTC;
// @ts-ignore
globalThis.Date = FakeDate;
