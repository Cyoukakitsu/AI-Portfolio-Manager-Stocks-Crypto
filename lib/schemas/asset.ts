import { z } from "zod";

export const assetSchema = z.object({
  symbol: z.string().min(1, "pleace  enter a correct symbol"),
  fullname: z.string().min(1, "pleace  enter a correct name"),
  asset_type: z.enum(["stock", "crypto", "etf", "cash"], {
    error: "pleace  enter a correct asset type",
  }),
});

export type AssetFormData = z.infer<typeof assetSchema>;
