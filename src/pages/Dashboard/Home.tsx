import { useCallback, useState } from "react";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import PageMeta from "../../components/common/PageMeta";
import axiosClient from "../../service/axios.service";
import { usePolling } from "../../hooks/usePolling";

export default function Home() {
  const [clientsCount, setClientsCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.allSettled([
        axiosClient.get("/order/all"),
        axiosClient.get("/product/all"),
        axiosClient.get("/user/all"),
      ]);

      if (ordersRes.status === "fulfilled") {
        const orders: any[] = Array.isArray(ordersRes.value.data)
          ? ordersRes.value.data
          : ordersRes.value.data?.data ?? [];
        setOrdersCount(orders.length);
        const sum = orders.reduce(
          (acc: number, o: any) => acc + (Number(o.total) || 0),
          0
        );
        setTotalSales(sum);
        setRecentOrders(orders.slice(0, 8));
      }

      if (productsRes.status === "fulfilled") {
        const products: any[] = Array.isArray(productsRes.value.data)
          ? productsRes.value.data
          : productsRes.value.data?.data ?? [];
        setProductsCount(products.length);
      }

      if (usersRes.status === "fulfilled") {
        const users: any[] = Array.isArray(usersRes.value.data)
          ? usersRes.value.data
          : usersRes.value.data?.data ?? [];
        setClientsCount(users.length);
      }

      setLastUpdated(new Date());
    } catch (_) {
      // silent – polling will retry
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  usePolling(fetchDashboardData, 10_000);

  return (
    <>
      <PageMeta
        title="Diametr Dashboard"
        description="Diametr Dashboard"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics
            clientsCount={clientsCount}
            productsCount={productsCount}
            ordersCount={ordersCount}
            totalSales={totalSales}
            isLoading={metricsLoading}
            lastUpdated={lastUpdated}
          />

          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12">
          <RecentOrders orders={recentOrders} isLoading={metricsLoading} />
        </div>
      </div>
    </>
  );
}
