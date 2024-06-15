import { dueTodayReminder, fullItemReportReminder } from "./reminders";

const execute = async () => {
  enum Day {
    Sunday,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
  }

  const today = new Date().getDay();
  const dayOfWeek = Day[today];

  if (dayOfWeek === "Monday" || dayOfWeek === "Thursday") {
    fullItemReportReminder();
  } else {
    dueTodayReminder();
  }
};

execute();
