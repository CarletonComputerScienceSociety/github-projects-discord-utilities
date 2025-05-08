import { Command } from "commander";
import { dailyTasksReminder, promotionReminder } from "./reminders/tasks";

const program = new Command();

program
  .argument("<task name>")
  .description("Run the desired job")
  .action((jobname) => {
    switch (jobname) {
      case "dailyTasksReminder": {
        dailyTasksReminder();
        break;
      }
      case "promotionReminder": {
        promotionReminder();
        break;
      }
      default: {
        console.log("Please enter a valid job name");
        break;
      }
    }
  })
  .allowExcessArguments(false)
  .parse(process.argv);
