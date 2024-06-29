import { Command } from "commander";
import { dailyTaskReminder } from "./dailyTaskReminder";
import { promotionReminder } from "./promotionReminder";

const program = new Command();

program
  .argument("<jobname>")
  .description("Run the desired job")
  .action((jobname) => {
    switch (jobname) {
      case "dailyTaskReminder": {
        dailyTaskReminder();
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
