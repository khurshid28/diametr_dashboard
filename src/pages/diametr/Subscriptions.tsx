import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useCallback, useEffect, useState } from "react";
import axiosClient from "../../service/axios.service";
import { toast } from "../../components/ui/toast";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Moment from "moment";
import { formatMoney } from "../../service/formatters/money.format";

// ─── helpers ──────────────────────────────────────────────────────────────────
function subStatusBadge(expired?: string | null) {
  if (!expired) return { cls: "bg-gray-100 text-gray-500", label: "Belgilanmagan" };
  const days = Math.ceil((new Date(expired).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0)    return { cls: "bg-red-100 text-red-700",    label: "Tugagan" };
  if (days <= 3)   return { cls: "bg-red-100 text-red-700",    label: `${days}k qoldi` };
  if (days <= 7)   return { cls: "bg-yellow-100 text-yellow-700", label: `${days}k qoldi` };
  return { cls: "bg-green-100 text-green-700", label: "Faol" };
}

const LOG_LABELS: Record<string, string> = {
  TOP_UP_CLICK: "Click",
  TOP_UP_PAYME: "Payme",
  TOP_UP_UZUM: "Uzum",
  TOP_UP_MANUAL: "Qolda",
  SUBSCRIPTION_DEDUCT: "Obuna",
  FREE_TRIAL: "Trial",
};

export default function SubscriptionsPage() {
  const [settings, setSettings] = useState<{ free_trial_months: number; subscription_price: number } | null>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedShop, setSelectedShop] = useState<number | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpNote, setTopUpNote] = useState("");
  const [topping, setTopping] = useState(false);
  const [givingTrial, setGivingTrial] = useState(false);
  const [trialMonths, setTrialMonths] = useState("1");
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [settRes, shopsRes] = await Promise.allSettled([
        axiosClient.get("/subscription/settings"),
        axiosClient.get("/subscription/shops"),
      ]);
      if (settRes.status === "fulfilled") setSettings(settRes.value.data);
      if (shopsRes.status === "fulfilled") {
        const d = shopsRes.value.data;
        setShops(Array.isArray(d) ? d : d?.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async (shopId: number) => {
    try {
      const res = await axiosClient.get(`/subscription/logs/${shopId}?take=20`);
      const d = res.data;
      setLogs(Array.isArray(d) ? d : d?.data ?? []);
    } catch {
      setLogs([]);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    if (selectedShop) fetchLogs(selectedShop);
  }, [selectedShop, fetchLogs]);

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    try {
      await axiosClient.patch("/subscription/settings", settings);
      toast.success("Sozlamalar saqlandi");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Xatolik");
    } finally { setSavingSettings(false); }
  };

  const handleTopUp = async () => {
    if (!selectedShop || !topUpAmount) { toast.error("Dokon va summa tanlang"); return; }
    setTopping(true);
    try {
      await axiosClient.post(`/subscription/top-up/${selectedShop}`, { amount: Number(topUpAmount), note: topUpNote || undefined });
      toast.success("Balans toldiridi");
      setTopUpAmount(""); setTopUpNote("");
      await fetchAll();
      await fetchLogs(selectedShop);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Xatolik");
    } finally { setTopping(false); }
  };

  const handleGiveTrial = async (shopId?: number) => {
    const id = shopId ?? selectedShop;
    if (!id) { toast.error("Dokon tanlang"); return; }
    setGivingTrial(true);
    try {
      await axiosClient.post(`/subscription/free-trial/${id}`, { months: Number(trialMonths) || undefined });
      toast.success(`Bepul sinov berildi`);
      await fetchAll();
      if (selectedShop) await fetchLogs(selectedShop);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Xatolik");
    } finally { setGivingTrial(false); }
  };

  const selectedShopData = shops.find((s) => s.id === selectedShop);

  const skel = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-4 w-full";

  return (
    <>
      <PageMeta title="Obunalar" description="Obuna boshqaruvi" />
      <PageBreadcrumb pageTitle="Obuna Boshqaruvi" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Left — settings + top-up */}
        <div className="space-y-6">

          {/* Settings card */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Sozlamalar</h3>
            {settings ? (
              <div className="space-y-4">
                <div>
                  <Label>Bepul sinov (oy)</Label>
                  <Input
                    type="number"
                    value={String(settings.free_trial_months)}
                    onChange={(e: any) => setSettings({ ...settings, free_trial_months: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Oylik narx (som)</Label>
                  <Input
                    type="number"
                    value={String(settings.subscription_price)}
                    onChange={(e: any) => setSettings({ ...settings, subscription_price: Number(e.target.value) })}
                  />
                </div>
                <Button onClick={handleSaveSettings} disabled={savingSettings} className="w-full">
                  {savingSettings ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">{[1,2].map(i => <div key={i} className={skel} />)}</div>
            )}
          </div>

          {/* Top-up card */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Balans Toldirish</h3>
            <div className="space-y-3">
              <div>
                <Label>Dokon</Label>
                <select
                  value={selectedShop ?? ""}
                  onChange={(e) => setSelectedShop(Number(e.target.value) || null)}
                  className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-white px-3"
                >
                  <option value="">Dokon tanlang...</option>
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>{s.name ?? `#${s.id}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Summa (som)</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={topUpAmount}
                  onChange={(e: any) => setTopUpAmount(e.target.value)}
                />
              </div>
              <div>
                <Label>Izoh (ixtiyoriy)</Label>
                <Input
                  type="text"
                  placeholder="Sabab..."
                  value={topUpNote}
                  onChange={(e: any) => setTopUpNote(e.target.value)}
                />
              </div>
              <Button onClick={handleTopUp} disabled={topping} className="w-full">
                {topping ? "Toldirilyapti..." : "Balansni toldirish"}
              </Button>
            </div>
          </div>

          {/* Free trial card */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Bepul Sinov Berish</h3>
            <div className="space-y-3">
              <div>
                <Label>Oy soni</Label>
                <Input
                  type="number"
                  value={trialMonths}
                  onChange={(e: any) => setTrialMonths(e.target.value)}
                />
              </div>
              <Button
                onClick={() => handleGiveTrial()}
                disabled={givingTrial || !selectedShop}
                variant="outline"
                className="w-full"
              >
                {givingTrial ? "Berilmoqda..." : selectedShop ? `#${selectedShop} ga ${trialMonths} oy sinov` : "Avval dokon tanlang"}
              </Button>
            </div>
          </div>

        </div>

        {/* Right — shops table */}
        <div className="xl:col-span-2 space-y-6">

          {/* Shops balance table */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                Barcha Dokoklar Balansi ({shops.length})
              </h3>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className={skel} />)}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-50 dark:border-white/[0.03]">
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Dokon</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Admin</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Balans</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Obuna</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shops.map((shop) => {
                      const badge = subStatusBadge(shop.expired);
                      const admin = shop.admins?.[0];
                      const isSelected = selectedShop === shop.id;
                      return (
                        <tr
                          key={shop.id}
                          onClick={() => setSelectedShop(isSelected ? null : shop.id)}
                          className={[
                            "border-b border-gray-50 dark:border-white/[0.03] last:border-0 cursor-pointer transition-colors",
                            isSelected ? "bg-brand-50 dark:bg-brand-900/10" : "hover:bg-gray-50 dark:hover:bg-white/[0.02]",
                          ].join(" ")}
                        >
                          <td className="px-5 py-3 text-sm font-medium text-gray-800 dark:text-white">{shop.name ?? `#${shop.id}`}</td>
                          <td className="px-5 py-3 text-sm text-gray-500">
                            <div>{admin?.fullname ?? "—"}</div>
                            {admin?.chat_id && <div className="text-xs text-green-500">TG ulangan</div>}
                          </td>
                          <td className="px-5 py-3 text-sm font-semibold text-gray-800 dark:text-white">
                            {formatMoney(shop.balance ?? 0)} som
                          </td>
                          <td className="px-5 py-3">
                            <div>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>{badge.label}</span>
                            </div>
                            {shop.expired && (
                              <div className="text-xs text-gray-400 mt-0.5">{Moment(shop.expired).format("DD.MM.YY")}</div>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleGiveTrial(shop.id); }}
                              className="text-xs text-brand-500 hover:underline"
                            >
                              +Trial
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {shops.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">Dokoonlar yoq</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Selected shop logs */}
          {selectedShop && (
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05] flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                  {selectedShopData?.name ?? `#${selectedShop}`} — Jurnal
                </h3>
                <div className="text-sm font-bold text-brand-600 dark:text-brand-400">
                  {formatMoney(selectedShopData?.balance ?? 0)} som
                </div>
              </div>
              {logs.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">Harakatlar yoq</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-50 dark:border-white/[0.03]">
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Sana</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tur</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Summa</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Balans</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Izoh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log: any) => (
                        <tr key={log.id} className="border-b border-gray-50 dark:border-white/[0.03] last:border-0">
                          <td className="px-5 py-3 text-xs text-gray-400">{Moment(log.createdt).format("DD.MM.YY HH:mm")}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              log.type === "SUBSCRIPTION_DEDUCT" ? "bg-red-50 text-red-600" :
                              log.type === "FREE_TRIAL" ? "bg-purple-50 text-purple-600" :
                              "bg-green-50 text-green-600"
                            }`}>
                              {LOG_LABELS[log.type] ?? log.type}
                            </span>
                          </td>
                          <td className={`px-5 py-3 text-sm font-semibold ${log.amount >= 0 ? "text-green-600" : "text-red-500"}`}>
                            {log.amount >= 0 ? "+" : ""}{formatMoney(log.amount)} som
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{formatMoney(log.balance_after)} som</td>
                          <td className="px-5 py-3 text-xs text-gray-400 max-w-xs truncate">{log.note ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
