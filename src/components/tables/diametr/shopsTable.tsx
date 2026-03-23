import TableActions from "./TableActions";
import TableToolbar from "./TableToolbar";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import Moment from "moment";
import Button from "../../ui/button/Button";
import { DeleteIcon, EditIcon, DownloadIcon } from "../../../icons";
import { useEffect, useState } from "react";
import { useModal } from "../../../hooks/useModal";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";
import { Modal } from "../../ui/modal";
import Select from "../../form/Select";
import axiosClient from "../../../service/axios.service";
import { toast } from "../../ui/toast";
import * as XLSX from "xlsx";

export interface ShopItemProps {
  id: number;
  name?: string;
  inn?: string;
  address?: string;
  delivery_amount?: number;
  expired?: string;
  image?: string;
  region?: { id: number; name?: string };
  regionId?: number;
  product_count?: number;
  total_stock?: number;
  total_value?: number;
  createdt?: string; createdAt?: string;
}

const showOptions = [{ value: "10", label: "10" }, { value: "20", label: "20" }, { value: "50", label: "50" }];
const emptyForm = { name: "", region_id: "", inn: "", address: "", delivery_amount: "", expired: "" };

export default function ShopsTable({ data, onRefetch }: { data: ShopItemProps[]; onRefetch?: () => void }) {
  const [tableData, setTableData] = useState(data);
  const { isOpen, openModal, closeModal } = useModal();
  const [editItem, setEditItem] = useState<ShopItemProps | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [optionValue, setOptionValue] = useState("10");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [regionOptions, setRegionOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => { setTableData(data); setCurrentPage(1); }, [data]);
  useEffect(() => { setCurrentPage(1); }, [optionValue]);
  useEffect(() => {
    axiosClient.get("/region/all").then((res) => {
      const list = res.data?.data ?? res.data ?? [];
      setRegionOptions(list.map((r: any) => ({ value: String(r.id), label: r.name ?? String(r.id) })));
    }).catch(() => {});
  }, []);

  const filteredData = search.trim() === "" ? tableData : tableData.filter((s) => { const q = search.toLowerCase(); return (s.name ?? "").toLowerCase().includes(q) || (s.inn ?? "").toLowerCase().includes(q) || (s.address ?? "").toLowerCase().includes(q) || (s.region?.name ?? "").toLowerCase().includes(q); });
  const maxPage = Math.ceil(filteredData.length / +optionValue);
  const currentItems = filteredData.slice((currentPage - 1) * +optionValue, currentPage * +optionValue);
  const staticUrl = import.meta.env.VITE_STATIC_PATH ?? "";

  const openEdit = (item: ShopItemProps) => {
    setEditItem(item);
    setForm({
      name: item.name ?? "",
      region_id: item.region?.id ? String(item.region.id) : (item.regionId ? String(item.regionId) : ""),
      inn: item.inn ?? "",
      address: item.address ?? "",
      delivery_amount: item.delivery_amount != null ? String(item.delivery_amount) : "",
      expired: item.expired ? Moment(item.expired).format("YYYY-MM-DD") : "",
    });
    openModal();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = { name: form.name, inn: form.inn, address: form.address };
      if (form.region_id) payload.region_id = Number(form.region_id);
      if (form.delivery_amount) payload.delivery_amount = Number(form.delivery_amount);
      if (form.expired) payload.expired = form.expired;
      if (editItem) {
        await axiosClient.put(`/shop/${editItem.id}`, payload);
        toast.success("Do'kon yangilandi");
      }
      onRefetch?.(); closeModal();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Xatolik yuz berdi");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await axiosClient.delete(`/shop/${id}`);
      toast.success("Do'kon o'chirildi");
      onRefetch?.();
    } catch { toast.error("Xatolik yuz berdi"); }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(tableData.map((s) => ({
      ID: s.id, Nomi: s.name ?? "", INN: s.inn ?? "", Manzil: s.address ?? "",
      Viloyat: s.region?.name ?? "", "Yetkazish narxi": s.delivery_amount ?? "",
      "Tovarlar soni": s.product_count ?? 0, "Skladda": s.total_stock ?? 0,
      "Umumiy qiymati": s.total_value ?? 0,
      Muddati: s.expired ? Moment(s.expired).format("DD.MM.YYYY") : "",
      Yaratilgan: Moment(s.createdAt).format("DD.MM.YYYY"),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Shops");
    XLSX.writeFile(wb, `shops-${Moment().format("YYYY-MM-DD")}.xlsx`);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <TableToolbar search={search} onSearch={(v) => { setSearch(v); setCurrentPage(1); }} searchPlaceholder="Qidirish..." showValue={optionValue} onShowChange={(v) => { setOptionValue(v); setCurrentPage(1); }} onExport={handleExport} />
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">#</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Rasm</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Nomi</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Viloyat</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">INN</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Manzil</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Yetkazish</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Tovarlar</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Skladda</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Umumiy qiymati</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Muddati</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Amallar</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow><TableCell colSpan={12} className="py-8 text-center text-gray-400">Ma'lumot yo'q</TableCell></TableRow>
            ) : currentItems.map((item, idx) => (
              <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{(currentPage - 1) * +optionValue + idx + 1}</TableCell>
                <TableCell className="px-5 py-4">
                  {item.image ? (
                    <img src={`${staticUrl}/${item.image}`} alt={item.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-white/[0.06] shadow-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center"><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' className='text-gray-400 dark:text-gray-600'><rect x='3' y='3' width='18' height='18' rx='4' /><circle cx='9' cy='9' r='2' /><path d='m21 15-5-5L5 21'/></svg></div>}
                </TableCell>
                <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">{item.name ?? "-"}</TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{item.region?.name ?? "-"}</TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{item.inn ?? "-"}</TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate">{item.address ?? "-"}</TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{item.delivery_amount != null ? `${item.delivery_amount.toLocaleString()} so'm` : "-"}</TableCell>
                <TableCell className="px-5 py-4 text-sm">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    (item.product_count ?? 0) > 0
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                  }`}>
                    {item.product_count ?? 0} xil
                  </span>
                </TableCell>
                <TableCell className="px-5 py-4 text-sm">
                  <span className={`font-semibold ${
                    (item.total_stock ?? 0) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                  }`}>
                    {(item.total_stock ?? 0).toLocaleString()} ta
                  </span>
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {(item.total_value ?? 0) > 0 ? `${(item.total_value! / 1_000_000).toFixed(1)}M` : '—'}
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{item.expired ? Moment(item.expired).format("DD.MM.YYYY") : "-"}</TableCell>
                <TableCell className="px-5 py-4">
                  <TableActions onEdit={() => openEdit(item)} onDelete={() => handleDelete(item.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="px-5 py-3 flex justify-between items-center border-t border-gray-100 dark:border-white/[0.05]">
          <span className="text-sm text-gray-500 dark:text-gray-400">{tableData.length} ta ichidan {Math.min((currentPage-1)*+optionValue+1,tableData.length)}–{Math.min(currentPage*+optionValue,tableData.length)} ko'rsatilmoqda</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={currentPage<=1} onClick={()=>setCurrentPage(p=>p-1)}>Oldingi</Button>
            <Button size="sm" variant="outline" disabled={currentPage>=maxPage} onClick={()=>setCurrentPage(p=>p+1)}>Keyingi</Button>
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-8">
          <div className="px-2 pr-14 mb-6">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white">Do'konni tahrirlash</h4>
          </div>
          <div className="flex flex-col gap-4 px-2">
            <div>
              <Label>Nomi</Label>
              <Input type="text" placeholder="Do'kon nomi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            {regionOptions.length > 0 && (
              <div>
                <Label>Viloyat</Label>
                <Select options={regionOptions} defaultValue={form.region_id} onChange={(v) => setForm({ ...form, region_id: v })} />
              </div>
            )}
            <div>
              <Label>INN</Label>
              <Input type="text" placeholder="INN raqami" value={form.inn} onChange={(e) => setForm({ ...form, inn: e.target.value })} />
            </div>
            <div>
              <Label>Manzil</Label>
              <Input type="text" placeholder="Do'kon manzili" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <Label>Yetkazib berish narxi (so'm)</Label>
              <Input type="number" placeholder="0" value={form.delivery_amount} onChange={(e) => setForm({ ...form, delivery_amount: e.target.value })} />
            </div>
            <div>
              <Label>Muddati</Label>
              <Input type="date" value={form.expired} onChange={(e) => setForm({ ...form, expired: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 justify-end">
            <Button size="sm" variant="outline" onClick={closeModal}>Bekor qilish</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? "Saqlanmoqda..." : "Saqlash"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}