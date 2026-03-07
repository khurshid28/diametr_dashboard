import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import { PlusIcon } from "../../icons";
import Button from "../../components/ui/button/Button";
import { useModal } from "../../hooks/useModal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import { useCallback, useRef, useState } from "react";
import ShopsTable, {
  ShopItemProps,
} from "../../components/tables/diametr/shopsTable";
import Select from "../../components/form/Select";
import axiosClient from "../../service/axios.service";
import { useFetchWithLoader } from "../../hooks/useFetchWithLoader";
import { SkeletonTable } from "../../components/spinner/load-spinner";
import { usePolling } from "../../hooks/usePolling";
import ImageField, { ImageFieldResult } from "../../components/common/ImageField";
import { toast } from "../../components/ui/toast";

export interface Shop {
  name?: string;
  region?: string;
  address?: string;
  mfo?: string;
  inn?: string;
  hisob_raqam?: string;
  director_name?: string;
  director_phone?: string;
  image?: string;
}

const region_options = [
  { value: "Toshkent sh", label: "Toshkent sh" },
  { value: "Andijon", label: "Andijon" },
  { value: "Buxoro", label: "Buxoro" },
  { value: "Farg'ona", label: "Farg'ona" },
  { value: "Jizzax", label: "Jizzax" },
  { value: "Navoiy", label: "Navoiy" },
  { value: "Namangan", label: "Namangan" },
  { value: "Qashqadaryo", label: "Qashqadaryo" },
  { value: "Samarqand", label: "Samarqand" },
  { value: "Sirdaryo", label: "Sirdaryo" },
  { value: "Surxondaryo", label: "Surxondaryo" },
  { value: "Toshkent", label: "Toshkent" },
  { value: "Xorazm", label: "Xorazm" },
  { value: "Qoraqalpog'iston", label: "Qoraqalpog'iston" },
];

export default function ShopsPage() {
  const { isOpen, openModal, closeModal } = useModal();

  const emptyShop: Shop = {
    name: "", region: "", address: "",
    mfo: "", inn: "", hisob_raqam: "",
    director_name: "", director_phone: "", image: "",
  };

  const [shopForm, setShopForm] = useState<Shop>(emptyShop);
  const imageResultRef = useRef<ImageFieldResult | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchShops = useCallback(
    () => axiosClient.get("/shop/all").then((res) => res.data),
    []
  );
  const { data, isLoading, refetch } = useFetchWithLoader<ShopItemProps[]>({
    fetcher: fetchShops,
  });
  usePolling(refetch, 10_000);

  const shopData: ShopItemProps[] = Array.isArray(data) ? data : [];

  const handleAdding = async () => {
    setSaving(true);
    try {
      let imageFilename = shopForm.image ?? "";
      const imgResult = imageResultRef.current;

      if (imgResult?.mode === "upload" && imgResult.file) {
        const fd = new FormData();
        fd.append("image", imgResult.file);
        const res = await axiosClient.post("/shop/upload-image", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageFilename = res.data?.data?.image ?? res.data?.image ?? "";
      } else if (imgResult?.mode === "url" && imgResult.url) {
        const res = await axiosClient.post("/shop/upload-image-url", { url: imgResult.url });
        imageFilename = res.data?.data?.image ?? res.data?.image ?? imgResult.url;
      }

      await axiosClient.post("/shop", {
        name: shopForm.name,
        region: shopForm.region,
        address: shopForm.address,
        mfo: shopForm.mfo,
        inn: shopForm.inn,
        hisob_raqam: shopForm.hisob_raqam,
        director: shopForm.director_name,
        director_phone: shopForm.director_phone,
        image: imageFilename,
      });
      toast.success("Do'kon qo'shildi");
      refetch();
      closeModal();
      setShopForm(emptyShop);
      imageResultRef.current = null;
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const f = (key: keyof Shop) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setShopForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <>
      <PageMeta title="Shops | Diametr Dashboard" description="Diametr Dashboard" />
      <PageBreadcrumb pageTitle="Shops" />

      <div className="space-y-6">
        <ComponentCard
          title="Shops Table"
          action={
            <Button
              size="sm"
              variant="primary"
              startIcon={<PlusIcon className="size-5 fill-white" />}
              onClick={() => { setShopForm(emptyShop); imageResultRef.current = null; openModal(); }}
            >
              Add Shop
            </Button>
          }
        >
          {isLoading ? <SkeletonTable cols={6} rows={7} /> : <ShopsTable data={shopData ?? []} onRefetch={refetch} />}
        </ComponentCard>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Add Shop</h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Create new Shop with full details.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleAdding(); }}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Nomi *</Label>
                  <Input type="text" value={shopForm.name} onChange={f("name")} placeholder="Do'kon nomi" />
                </div>
                <div>
                  <Label>Viloyat</Label>
                  <Select
                    options={region_options}
                    className="dark:bg-dark-900"
                    onChange={(v) => setShopForm((prev) => ({ ...prev, region: v }))}
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label>Manzil</Label>
                  <Input type="text" value={shopForm.address} onChange={f("address")} placeholder="To'liq manzil" />
                </div>
                <div>
                  <Label>MFO</Label>
                  <Input type="text" value={shopForm.mfo} onChange={f("mfo")} />
                </div>
                <div>
                  <Label>INN</Label>
                  <Input type="text" value={shopForm.inn} onChange={f("inn")} />
                </div>
                <div>
                  <Label>Hisob raqam</Label>
                  <Input type="text" value={shopForm.hisob_raqam} onChange={f("hisob_raqam")} />
                </div>
                <div>
                  <Label>Direktor ismi</Label>
                  <Input type="text" value={shopForm.director_name} onChange={f("director_name")} />
                </div>
                <div>
                  <Label>Direktor telefoni</Label>
                  <Input type="tel" value={shopForm.director_phone} onChange={f("director_phone")} placeholder="+998..." />
                </div>
                <div className="lg:col-span-2">
                  <ImageField
                    label="Do'kon rasmi"
                    onChange={(result) => { imageResultRef.current = result; }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} type="button">Close</Button>
              <Button size="sm" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
