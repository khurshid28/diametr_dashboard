import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useCallback, useEffect, useState } from "react";
import axiosClient from "../../service/axios.service";
import { LoadSpinner } from "../../components/spinner/load-spinner";
import { usePolling } from "../../hooks/usePolling";
import { formatMoney } from "../../service/formatters/money.format";
import Moment from "moment";
import * as XLSX from "xlsx";
import { DownloadIcon } from "../../icons";
import Button from "../../components/ui/button/Button";

// ─────────────────────────────────────────────────────────
// interfaces
// ─────────────────────────────────────────────────────────
interface OrderItem {
  id: number;
  total: number;
  payment_type?: string;
  createdAt: string;
  shop?: string;
  products?: { name: string; price: number; count: number }[];
}

interface ShopStat {
  shop: string;
  totalOrders: number;
  totalRevenue: number;
  products: Record<string, { count: number; revenue: number }>;
  payments: Record<string, number>;
}

interface PaymentStat {
  type: string;
  count: number;
  total: number;
}

// ─────────────────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────────────────
function buildStats(orders: OrderItem[]) {
  const shopMap: Record<string, ShopStat> = {};
  const paymentMap: Record<string, { count: number; total: number }> = {};

  orders.forEach((o) => {
    const shop = o.shop ?? "Noma'lum";
    const payType = o.payment_type ?? "Noma'lum";

    // shop stats
    if (!shopMap[shop]) {
      shopMap[shop] = { shop, totalOrders: 0, totalRevenue: 0, products: {}, payments: {} };
    }
    shopMap[shop].totalOrders += 1;
    shopMap[shop].totalRevenue += o.total ?? 0;
    shopMap[shop].payments[payType] = (shopMap[shop].payments[payType] ?? 0) + 1;

    o.products?.forEach((p) => {
      const name = p.name ?? "Noma'lum";
      if (!shopMap[shop].products[name]) {
        shopMap[shop].products[name] = { count: 0, revenue: 0 };
      }
      shopMap[shop].products[name].count += p.count ?? 1;
      shopMap[shop].products[name].revenue += (p.price ?? 0) * (p.count ?? 1);
    });

    // global payment stats
    if (!paymentMap[payType]) paymentMap[payType] = { count: 0, total: 0 };
    paymentMap[payType].count += 1;
    paymentMap[payType].total += o.total ?? 0;
  });

  return {
    shopStats: Object.values(shopMap).sort((a, b) => b.totalRevenue - a.totalRevenue),
    paymentStats: Object.entries(paymentMap).map(([type, v]) => ({ type, ...v })) as PaymentStat[],
  };
}

// ─────────────────────────────────────────────────────────
// export helpers
// ─────────────────────────────────────────────────────────
function exportOverview(orders: OrderItem[]) {
  const { shopStats, paymentStats } = buildStats(orders);

  const wb = XLSX.utils.book_new();

  // Sheet 1 – general
  const generalRows = [
    ["Jami buyurtmalar", orders.length],
    ["Jami tushum", orders.reduce((s, o) => s + (o.total ?? 0), 0)],
    ["Faol do'konlar", shopStats.length],
    ["Sanasi", Moment().format("DD.MM.YYYY HH:mm")],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(generalRows), "Umumiy");

  // Sheet 2 – by shop
  const shopRows = [
    ["Do'kon", "Buyurtmalar", "Tushum", "Asosiy tolov usuli"],
    ...shopStats.map((s) => {
      const topPay = Object.entries(s.payments).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
      return [s.shop, s.totalOrders, s.totalRevenue, topPay];
    }),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(shopRows), "Do'konlar bo'yicha");

  // Sheet 3 – by payment method
  const payRows = [
    ["To'lov usuli", "Soni", "Jami summa"],
    ...paymentStats.map((p) => [p.type, p.count, p.total]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(payRows), "Tolov usullari");

  // Sheet 4 – raw orders
  const orderRows = [
    ["ID", "Do'kon", "Summa", "To'lov", "Sana"],
    ...orders.map((o) => [
      o.id,
      o.shop ?? "-",
      o.total ?? 0,
      o.payment_type ?? "-",
      Moment(o.createdAt).format("DD.MM.YYYY HH:mm"),
    ]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(orderRows), "Buyurtmalar");

  // Sheet 5 – products per shop
  const prodRows: any[][] = [["Do'kon", "Mahsulot", "Soni", "Tushum"]];
  shopStats.forEach((s) => {
    Object.entries(s.products).forEach(([name, v]) => {
      prodRows.push([s.shop, name, v.count, v.revenue]);
    });
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(prodRows), "Mahsulotlar bo'yicha");

  XLSX.writeFile(wb, `diametr-analytics-${Moment().format("YYYY-MM-DD")}.xlsx`);
}

// ─────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(Moment().startOf("month").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(Moment().format("YYYY-MM-DD"));

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/order/all");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  usePolling(fetchOrders, 30_000);

  const filtered = orders.filter((o) => {
    const d = Moment(o.createdAt);
    return d.isSameOrAfter(dateFrom, "day") && d.isSameOrBefore(dateTo, "day");
  });

  const totalRevenue = filtered.reduce((s, o) => s + (o.total ?? 0), 0);
  const { shopStats, paymentStats } = buildStats(filtered);

  return (
    <>
      <PageMeta title="Analitika | Diametr Dashboard" description="Diametr Dashboard" />
      <PageBreadcrumb pageTitle="Analitika & Statistika" />

      {/* Date filter */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Dan</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Gacha</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
          />
        </div>
        <Button
          size="sm"
          variant="primary"
          endIcon={<DownloadIcon className="size-4 fill-white" />}
          onClick={() => exportOverview(filtered)}
        >
          Excel eksport
        </Button>
      </div>

      {loading ? (
        <div className="min-h-[400px] flex justify-center items-center"><LoadSpinner /></div>
      ) : (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Jami buyurtmalar", value: filtered.length, color: "bg-brand-500" },
              { label: "Jami tushum", value: formatMoney(totalRevenue), color: "bg-success-500" },
              { label: "Faol do'konlar", value: shopStats.length, color: "bg-blue-light-500" },
              { label: "To'lov usullari", value: paymentStats.length, color: "bg-orange-500" },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl border border-gray-100 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] p-5">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{c.label}</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{c.value}</p>
              </div>
            ))}
          </div>

          {/* Payment methods */}
          <div className="rounded-2xl border border-gray-100 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] p-5">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">To'lov usullari bo'yicha</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/[0.05]">
                    <th className="pb-2 pr-4">To'lov usuli</th>
                    <th className="pb-2 pr-4">Soni</th>
                    <th className="pb-2 pr-4">Jami summa</th>
                    <th className="pb-2">Ulush</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                  {paymentStats.map((p) => (
                    <tr key={p.type}>
                      <td className="py-2 pr-4 font-medium text-gray-800 dark:text-white">{p.type}</td>
                      <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{p.count}</td>
                      <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{formatMoney(p.total)}</td>
                      <td className="py-2 text-gray-600 dark:text-gray-300">
                        {filtered.length > 0 ? ((p.count / filtered.length) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shop stats */}
          <div className="rounded-2xl border border-gray-100 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] p-5">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Do'konlar bo'yicha hisobot</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/[0.05]">
                    <th className="pb-2 pr-4">Do'kon</th>
                    <th className="pb-2 pr-4">Buyurtmalar</th>
                    <th className="pb-2 pr-4">Tushum</th>
                    <th className="pb-2 pr-4">Mahsulotlar (tur)</th>
                    <th className="pb-2">Asosiy to'lov</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                  {shopStats.map((s) => {
                    const topPay = Object.entries(s.payments).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
                    return (
                      <tr key={s.shop}>
                        <td className="py-2 pr-4 font-medium text-gray-800 dark:text-white">{s.shop}</td>
                        <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{s.totalOrders}</td>
                        <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{formatMoney(s.totalRevenue)}</td>
                        <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{Object.keys(s.products).length}</td>
                        <td className="py-2 text-gray-600 dark:text-gray-300">{topPay}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Products per shop detail */}
          {shopStats.map((s) => (
            <div key={s.shop} className="rounded-2xl border border-gray-100 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] p-5">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                {s.shop} – mahsulotlar bo'yicha
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/[0.05]">
                      <th className="pb-2 pr-4">Mahsulot</th>
                      <th className="pb-2 pr-4">Soni</th>
                      <th className="pb-2">Tushum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                    {Object.entries(s.products)
                      .sort((a, b) => b[1].revenue - a[1].revenue)
                      .map(([name, v]) => (
                        <tr key={name}>
                          <td className="py-2 pr-4 text-gray-800 dark:text-white">{name}</td>
                          <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{v.count}</td>
                          <td className="py-2 text-gray-600 dark:text-gray-300">{formatMoney(v.revenue)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
