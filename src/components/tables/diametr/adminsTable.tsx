import TableActions from "./TableActions";
import TableToolbar from "./TableToolbar";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import Moment from "moment";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";
import Select from "../../form/Select";
import axiosClient from "../../../service/axios.service";
import { toast } from "../../ui/toast";
import { useEffect, useState } from "react";
import { useModal } from "../../../hooks/useModal";
import * as XLSX from "xlsx";

export interface AdminItemProps {
  id: number;
  fullname?: string;
  phone?: string;
  image?: string;
  chat_id?: string;
  chatid?: string;
  shop_id?: number;
  shop?: { id: number; name?: string };
  role?: string;
  createdt?: string;
  createdAt?: string;
}

const emptyForm = { fullname: "", phone: "", shop_id: "", chatid: "" };

export default function AdminsTable({
  data,
  onRefetch,
}: {
  data: AdminItemProps[];
  onRefetch?: () => void;
}) {
  const [search, setSearch]     = useState("");
  const [showValue, setShowValue] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const { isOpen, openModal, closeModal } = useModal();
  const [editItem, setEditItem] = useState<AdminItemProps | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [shopOptions, setShopOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    axiosClient.get("/shop/all").then((res) => {
      const list = res.data?.data ?? res.data ?? [];
      setShopOptions(list.map((s: any) => ({ value: String(s.id), label: s.name ?? String(s.id) })));
    }).catch(() => {});
  }, []);

  const filtered = search.trim()
    ? data.filter((a) =>
        [a.fullname, a.phone, a.shop?.name].some((v) =>
          v?.toLowerCase().includes(search.toLowerCase())
        )
      )
    : data;

  const pageSize = parseInt(showValue);
  const maxPage  = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current  = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSearch = (v: string) => { setSearch(v); setCurrentPage(1); };
  const handleShow   = (v: string) => { setShowValue(v); setCurrentPage(1); };

  const openCreate = () => {
    setEditItem(null);
    setForm({ ...emptyForm });
    openModal();
  };

  const openEdit = (item: AdminItemProps) => {
    setEditItem(item);
    setForm({
      fullname: item.fullname ?? "",
      phone:    item.phone ?? "",
      shop_id:  item.shop?.id ? String(item.shop.id) : item.shop_id ? String(item.shop_id) : "",
      chatid:   item.chatid ?? item.chat_id ?? "",
    });
    openModal();
  };

  const handleSave = async () => {
    if (!form.fullname.trim()) { toast.error("To'liq ism kiritilishi shart"); return; }
    if (!form.phone.trim())    { toast.error("Telefon raqam kiritilishi shart"); return; }
    if (!form.shop_id)         { toast.error("Do'kon tanlanishi shart"); return; }

    setSaving(true);
    try {
      const payload: any = {
        fullname: form.fullname,
        phone:    form.phone,
        shop_id:  Number(form.shop_id),
      };
      if (form.chatid) payload.chatid = form.chatid;

      if (editItem) {
        await axiosClient.put(`/admin/${editItem.id}`, payload);
        toast.success("Admin yangilandi");
      } else {
        await axiosClient.post(`/admin`, payload);
        toast.success("Admin yaratildi. Parol avtomatik yuborildi.");
      }
      onRefetch?.();
      closeModal();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axiosClient.delete(`/admin/${id}`);
      toast.success("Admin o'chirildi");
      onRefetch?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Xatolik yuz berdi");
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(
      data.map((a) => ({
        ID: a.id,
        "To'liq ism": a.fullname ?? "",
        Telefon: a.phone ?? "",
        "Do'kon": a.shop?.name ?? "",
        "Telegram Chat ID": a.chatid ?? a.chat_id ?? "",
        Yaratilgan: Moment(a.createdt ?? a.createdAt).format("DD.MM.YYYY"),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Admins");
    XLSX.writeFile(wb, `admins-${Moment().format("YYYY-MM-DD")}.xlsx`);
  };

  const staticUrl = import.meta.env.VITE_STATIC_PATH ?? "";

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <TableToolbar
        search={search}
        onSearch={handleSearch}
        searchPlaceholder="Ism, telefon yoki do'kon..."
        showValue={showValue}
        onShowChange={handleShow}
        onExport={handleExport}
        action={
          <Button size="sm" onClick={openCreate}>
            + Yangi admin
          </Button>
        }
      />

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">#</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Admin</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Telefon</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Do'kon</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Chat ID</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Rol</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Sana</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Amallar</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {current.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-gray-400 dark:text-gray-500">
                  {search ? "Qidiruv natijasi topilmadi" : "Ma'lumot yo'q"}
                </TableCell>
              </TableRow>
            ) : current.map((item, idx) => (
              <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {(currentPage - 1) * pageSize + idx + 1}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <img
                        src={`${staticUrl}/${item.image}`}
                        alt={item.fullname}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-white/[0.06] shadow-sm flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold shadow-sm">
                        {(item.fullname ?? item.phone ?? "?")[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {item.fullname ?? <span className="text-gray-400 italic">Ism yo'q</span>}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                  {item.phone ?? "-"}
                </TableCell>
                <TableCell className="px-5 py-4">
                  {item.shop ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      {item.shop.name}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-4">
                  {(item.chatid ?? item.chat_id) ? (
                    <span className="inline-flex items-center gap-1 text-xs font-mono bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-md">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 flex-shrink-0">
                        <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.926A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                      </svg>
                      {item.chatid ?? item.chat_id}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Badge color="warning" size="sm">{item.role ?? "ADMIN"}</Badge>
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {Moment(item.createdt ?? item.createdAt).format("DD.MM.YYYY")}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <TableActions
                    onEdit={() => openEdit(item)}
                    onDelete={() => handleDelete(item.id)}
                    confirmTitle="Adminni o'chirasizmi?"
                    confirmDesc="Admin tizimga kira olmaydi."
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 flex flex-wrap gap-2 justify-between items-center border-t border-gray-100 dark:border-white/[0.05]">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filtered.length} ta ichidan {Math.min((currentPage - 1) * pageSize + 1, filtered.length)}–{Math.min(currentPage * pageSize, filtered.length)} ko'rsatilmoqda
        </span>
        <div className="flex gap-1.5">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/[0.05] text-gray-600 dark:text-gray-400 transition-colors"
          >
            Oldingi
          </button>
          <span className="px-3 py-1.5 text-xs rounded-lg bg-brand-500 text-white font-medium">
            {currentPage} / {maxPage}
          </span>
          <button
            disabled={currentPage >= maxPage}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/[0.05] text-gray-600 dark:text-gray-400 transition-colors"
          >
            Keyingi
          </button>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="relative w-full p-6 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-8">
          <div className="pr-12 mb-6">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
              {editItem ? "Adminni tahrirlash" : "Yangi admin yaratish"}
            </h4>
            {!editItem && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Parol avtomatik ravishda generatsiya qilinadi.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <Label>To'liq ism *</Label>
              <Input
                type="text"
                placeholder="Alisher Toshmatov"
                value={form.fullname}
                onChange={(e) => setForm({ ...form, fullname: e.target.value })}
              />
            </div>
            <div>
              <Label>Telefon raqam *</Label>
              <Input
                type="text"
                placeholder="+998901234567"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Do'kon *</Label>
              <Select
                options={shopOptions}
                defaultValue={form.shop_id}
                onChange={(v) => setForm({ ...form, shop_id: v })}
                placeholder="Do'konni tanlang"
              />
            </div>
            <div>
              <Label>Telegram Chat ID (ixtiyoriy)</Label>
              <Input
                type="text"
                placeholder="123456789"
                value={form.chatid}
                onChange={(e) => setForm({ ...form, chatid: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Admin Telegram botni /start bosib chat ID olishi mumkin
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Bekor qilish
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saqlanmoqda..." : editItem ? "Saqlash" : "Yaratish"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
