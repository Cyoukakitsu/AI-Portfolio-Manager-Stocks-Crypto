import { z } from "zod";

export const assetSchema = z.object({
  symbol: z.string().min(1, "Please enter a correct symbol"),
  fullname: z.string().min(1, "Please enter a correct name"),
  asset_type: z.enum(["stock", "crypto", "etf", "cash"], {
    error: "Please select a valid asset type (stock, crypto, etf, or cash)",
  }),
});

export type AssetFormData = z.infer<typeof assetSchema>;
