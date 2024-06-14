import cron from "node-cron";

cron.schedule("* * * * * *", () => {
  console.log("running every second");
});
