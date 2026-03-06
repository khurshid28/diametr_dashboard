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

import Select from "../../components/form/Select";
import axiosClient from "../../service/axios.service";
import { useFetchWithLoader } from "../../hooks/useFetchWithLoader";
import { LoadSpinner } from "../../components/spinner/load-spinner";
import ProductsTable, {
  ProductItemProps,
} from "../../components/tables/diametr/productsTable";
import { usePolling } from "../../hooks/usePolling";
import ImageField, { ImageFieldResult } from "../../components/common/ImageField";
import { toast } from "react-toastify";

export interface Product {
  name?: string;
  name_uz?: string;
  name_ru?: string;
  image?: string;
  category_id?: string;
}
export default function ProductsPage() {
  const { isOpen, openModal, closeModal } = useModal();

  let emptyProduct: Product = {
    name: "",
    name_uz: "",
    name_ru: "",
    image: "",
    category_id: "",
  };

  let [Product, setProduct] = useState<Product>(emptyProduct);
  const imageResultRef = useRef<ImageFieldResult | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(
    () => axiosClient.get("/product/all").then((res) => res.data),
    []
  );
  const { data, isLoading, refetch } = useFetchWithLoader<ProductItemProps[]>({
    fetcher: fetchProducts,
  });
  usePolling(refetch, 10_000);

  const productData: ProductItemProps[] = Array.isArray(data) ? data : [];

  // Fetch categories for select
  const fetchCats = useCallback(
    () => axiosClient.get("/category/all").then((res) => res.data),
    []
  );
  const { data: catsData } = useFetchWithLoader<{ id: number; name_uz?: string; name_ru?: string; name?: string }[]>({
    fetcher: fetchCats,
  });
  const category_options = Array.isArray(catsData)
    ? catsData.map((c) => ({ value: String(c.id), label: c.name_uz ?? c.name ?? c.name_ru ?? "" }))
    : [];

  const handleAdding = async () => {
    setSaving(true);
    try {
      let imageFilename = Product.image ?? "";
      const imgResult = imageResultRef.current;

      if (imgResult?.mode === "upload" && imgResult.file) {
        const fd = new FormData();
        fd.append("image", imgResult.file);
        const res = await axiosClient.post("/product/upload-image", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageFilename = res.data?.data?.image ?? res.data?.image ?? "";
      } else if (imgResult?.mode === "url" && imgResult.url) {
        const res = await axiosClient.post("/product/upload-image-url", { url: imgResult.url });
        imageFilename = res.data?.data?.image ?? res.data?.image ?? imgResult.url;
      }

      await axiosClient.post("/product", {
        name_uz: Product.name_uz,
        name_ru: Product.name_ru,
        image: imageFilename,
        category_id: Product.category_id ? Number(Product.category_id) : undefined,
      });
      toast.success("Mahsulot qo'shildi");
      refetch();
      closeModal();
      setProduct(emptyProduct);
      imageResultRef.current = null;
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Products | Diametr Dashboard"
        description="Diametr Dashboard"
      />
      <PageBreadcrumb pageTitle="Products" />

      <div className="space-y-6 ">
        {isLoading && (
          <div className="min-h-[450px] flex-col flex justify-center">
            <LoadSpinner />
          </div>
        )}
        {!isLoading && productData && (
          <ComponentCard
            title="Products Table"
            action={
              <>
                <Button
                  size="sm"
                  variant="primary"
                  startIcon={<PlusIcon className="size-5 fill-white" />}
                  onClick={() => {
                    setProduct(emptyProduct);
                    imageResultRef.current = null;
                    openModal();
                  }}
                >
                  Add Product
                </Button>
              </>
            }
          >
            <ProductsTable data={productData} />
          </ComponentCard>
        )}
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add Product
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Create new Product with full details.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Nomi (O'zbek)</Label>
                  <Input
                    type="text"
                    placeholder="Uzbekcha nomini kiriting"
                    value={Product.name_uz}
                    onChange={(e) => setProduct({ ...Product, name_uz: e.target.value })}
                  />
                </div>
                <div>
                  <Label>РќР°Р·РІР°РЅРёРµ (Р СѓСЃСЃРєРёР№)</Label>
                  <Input
                    type="text"
                    placeholder="Р’РІРµРґРёС‚Рµ РЅР°Р·РІР°РЅРёРµ РЅР° СЂСѓСЃСЃРєРѕРј"
                    value={Product.name_ru}
                    onChange={(e) => setProduct({ ...Product, name_ru: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Kategoriya</Label>
                  <Select
                    options={category_options}
                    className="dark:bg-dark-900"
                    placeholder="Kategoriyani tanlang"
                    onChange={(v) => setProduct({ ...Product, category_id: v })}
                  />
                </div>
                <div className="lg:col-span-2">
                  <ImageField
                    label="Rasm"
                    onChange={(result) => { imageResultRef.current = result; }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>Close</Button>
              <Button size="sm" onClick={handleAdding} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

