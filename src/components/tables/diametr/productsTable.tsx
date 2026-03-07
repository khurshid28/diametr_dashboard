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

export interface ProductItemProps {
  id: number;
  name_uz?: string;
  name_ru?: string;
  name?: string;
  image?: string;
  category?: { id: number; name_uz?: string; name?: string };
  categoryId?: number;
  createdt?: string; createdAt?: string;
}

const showOptions = [{ value: "10", label: "10" }, { value: "20", label: "20" }, { value: "50", label: "50" }];
const emptyForm = { name_uz: "", name_ru: "", category_id: "" };

export default function ProductsTable({ data, onRefetch }: { data: ProductItemProps[]; onRefetch?: () => void }) {
  const [tableData, setTableData] = useState(data);
  const { isOpen, openModal, closeModal } = useModal();
  const [editItem, setEditItem] = useState<ProductItemProps | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [optionValue, setOptionValue] = useState("10");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => { setTableData(data); setCurrentPage(1); }, [data]);
  useEffect(() => { setCurrentPage(1); }, [optionValue]);
  useEffect(() => {
    axiosClient.get("/category/all").then((res) => {
      const list = res.data?.data ?? res.data ?? [];
      setCategoryOptions(list.map((c: any) => ({ value: String(c.id), label: c.name_uz ?? c.name ?? String(c.id) })));
    }).catch(() => {});
  }, []);

  const filteredData = search.trim() === "" ? tableData : tableData.filter((s) => { const q = search.toLowerCase(); return (s.name ?? "").toLowerCase().includes(q) || (s.name_uz ?? "").toLowerCase().includes(q) || (s.name_ru ?? "").toLowerCase().includes(q); });
  const maxPage = Math.ceil(filteredData.length / +optionValue);
  const currentItems = filteredData.slice((currentPage - 1) * +optionValue, currentPage * +optionValue);
  const staticUrl = import.meta.env.VITE_STATIC_PATH ?? "";

  const openEdit = (item: ProductItemProps) => {
    setEditItem(item);
    setForm({
      name_uz: item.name_uz ?? item.name ?? "",
      name_ru: item.name_ru ?? "",
      category_id: item.category?.id ? String(item.category.id) : (item.categoryId ? String(item.categoryId) : ""),
    });
    openModal();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = { name_uz: form.name_uz, name_ru: form.name_ru };
      if (form.category_id) payload.category_id = Number(form.category_id);
      if (editItem) {
        await axiosClient.put(`/product/${editItem.id}`, payload);
        toast.success("Mahsulot yangilandi");
      }
      onRefetch?.(); closeModal();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Xatolik yuz berdi");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await axiosClient.delete(`/product/${id}`);
      toast.success("Mahsulot o'chirildi");
      onRefetch?.();
    } catch { toast.error("Xatolik yuz berdi"); }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(tableData.map((p) => ({
      ID: p.id, "Nomi (UZ)": p.name_uz ?? p.name ?? "", "Nomi (RU)": p.name_ru ?? "",
      Kategoriya: p.category?.name_uz ?? p.category?.name ?? "", Yaratilgan: Moment(p.createdAt).format("DD.MM.YYYY"),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, `products-${Moment().format("YYYY-MM-DD")}.xlsx`);
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
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Nomi (UZ)</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Nomi (RU)</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Kategoriya</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Yaratilgan</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Amallar</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="py-8 text-center text-gray-400">Ma'lumot yo'q</TableCell></TableRow>
            ) : currentItems.map((item, idx) => (
              <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{(currentPage - 1) * +optionValue + idx + 1}</TableCell>
                <TableCell className="px-5 py-4">
                  {item.image ? (
                    <img src={`${staticUrl}/${item.image}`} alt={item.name_uz} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-white/[0.06] shadow-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center"><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' className='text-gray-400 dark:text-gray-600'><rect x='3' y='3' width='18' height='18' rx='4' /><circle cx='9' cy='9' r='2' /><path d='m21 15-5-5L5 21'/></svg></div>}
                </TableCell>
                <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">{item.name_uz ?? item.name ?? "-"}</TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{item.name_ru ?? "-"}</TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{item.category?.name_uz ?? item.category?.name ?? "-"}</TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{Moment(item.createdt ?? item.createdAt).format("DD.MM.YYYY")}</TableCell>
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
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white">Mahsulotni tahrirlash</h4>
          </div>
          <div className="flex flex-col gap-4 px-2">
            <div>
              <Label>Nomi (O'zbek)</Label>
              <Input type="text" placeholder="Uzbekcha nomi" value={form.name_uz} onChange={(e) => setForm({ ...form, name_uz: e.target.value })} />
            </div>
            <div>
              <Label>Nomi (Ruscha)</Label>
              <Input type="text" placeholder="Ruscha nomi" value={form.name_ru} onChange={(e) => setForm({ ...form, name_ru: e.target.value })} />
            </div>
            {categoryOptions.length > 0 && (
              <div>
                <Label>Kategoriya</Label>
                <Select options={categoryOptions} defaultValue={form.category_id} onChange={(v) => setForm({ ...form, category_id: v })} />
              </div>
            )}
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