import AdvancedChart from "@/components/custom/stocks/AdvancedChart";
import MarketDataStock from "@/components/custom/stocks/MarketDataStock";
import StockHeatmap from "@/components/custom/stocks/StockHeatmap";
import TopStories from "@/components/custom/stocks/TopStories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Flame, Newspaper, TrendingUp } from "lucide-react";

export default function Stocks() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stock Market</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time market data and news
        </p>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3 border-b">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">
            Live Chart
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-150 p-4">
            <AdvancedChart />
          </div>
        </CardContent>
      </Card>

      {/* Heatmap + News */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3 border-b">
            <Flame className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">
              Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-125 p-4">
              <StockHeatmap />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3 border-b">
            <Newspaper className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">
              Top Stories
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-125 p-4">
              <TopStories />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Data */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3 border-b">
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">
            Market Data
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-125 p-4">
            <MarketDataStock />
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground pb-2">
        Powered by TradingView &middot; Updated{" "}
        {new Date().toLocaleString("en-US")}
      </p>
    </div>
  );
}
