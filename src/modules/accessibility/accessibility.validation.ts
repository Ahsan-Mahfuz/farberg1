import { z } from "zod";

export const updateAccessibilityValidation = z.object({
  isDashboardShow: z.boolean().optional(),
  isAnalyticsShow: z.boolean().optional(),
  isUsersShow: z.boolean().optional(),
  isServicesShow: z.boolean().optional(),
  isTransactionsShow: z.boolean().optional(),
});
