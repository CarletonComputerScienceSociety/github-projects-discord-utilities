import axios from "axios";
import { Ok, Err, Result } from "ts-results";

export { dueTodayReminder } from "./dueTodayReminder";
export { fullItemReportReminder } from "./fullItemReportReminder";
export { urgentPromotionReminder } from "./urgentPromotionReminder";

export const fetchFacts = async (): Promise<Result<string, Error>> => {
  try {
    const response = await axios.get("https://api.api-ninjas.com/v1/facts", {
      headers: {
        "X-Api-Key": "OW3TaucPc4fGSrBpJe9KuQ==c0GNDiePYzdFuHYm",
      },
    });
    const data = response.data;
    return data[0].fact;
  } catch (error) {
    return Err(new Error("Failed to fetch fact"));
  }
};
