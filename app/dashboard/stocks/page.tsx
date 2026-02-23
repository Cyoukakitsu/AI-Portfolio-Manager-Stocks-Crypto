import AdvancedChart from "@/components/custom/stocks/AdvancedChart";
import MarketDataStock from "@/components/custom/stocks/MarketDataStock";
import StockHeatmap from "@/components/custom/stocks/StockHeatmap";
import TopStories from "@/components/custom/stocks/TopStories";

export default function Stocks() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-500 mx-auto">
        {/* ページタイトル */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            株式市場ダッシュボード
          </h1>
          <p className="text-slate-600">リアルタイムの市場データとニュース</p>
        </div>

        {/* メインチャートエリア */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-200 bg-linear-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-semibold text-slate-800">
                📈 リアルタイムチャート
              </h2>
            </div>
            <div className="p-4" style={{ height: "600px" }}>
              <AdvancedChart />
            </div>
          </div>
        </div>

        {/* ヒートマップとニュース - 2カラムレイアウト */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* 株式ヒートマップ */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-200 bg-linear-to-r from-green-50 to-emerald-50">
              <h2 className="text-xl font-semibold text-slate-800">
                🔥 ヒートマップ
              </h2>
            </div>
            <div className="p-4" style={{ height: "500px" }}>
              <StockHeatmap />
            </div>
          </div>

          {/* トップニュース */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-200 bg-linear-to-r from-amber-50 to-yellow-50">
              <h2 className="text-xl font-semibold text-slate-800">
                📰 トップニュース
              </h2>
            </div>
            <div className="p-4" style={{ height: "500px" }}>
              <TopStories />
            </div>
          </div>
        </div>

        {/* 市場データ */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-200 bg-linear-to-r from-purple-50 to-pink-50">
              <h2 className="text-xl font-semibold text-slate-800">
                💼 市場データ
              </h2>
            </div>
            <div className="p-4" style={{ height: "500px" }}>
              <MarketDataStock />
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center text-slate-500 text-sm mt-8 pb-4">
          Powered by TradingView | 最終更新:{" "}
          {new Date().toLocaleString("ja-JP")}
        </div>
      </div>
    </div>
  );
}
