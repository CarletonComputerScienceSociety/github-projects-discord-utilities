import { dueTodayReminder, fullItemReportReminder } from "../reminders";

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

  if (dayOfWeek === "Sunday" || dayOfWeek === "Thursday") {
    console.log("Sending full item report reminder");
    fullItemReportReminder();
  } else {
    console.log("Sending due today reminder");
    dueTodayReminder();
  }
};

execute();
