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

import axiosClient from "../../service/axios.service";
import { useFetchWithLoader } from "../../hooks/useFetchWithLoader";
import { SkeletonTable } from "../../components/spinner/load-spinner";
import { usePolling } from "../../hooks/usePolling";
import CategorysTable, {
  CategoryItemProps,
} from "../../components/tables/diametr/categoriesTable";
import ImageField, { ImageFieldResult } from "../../components/common/ImageField";

export interface Category {
  name?: string;
  name_uz?: string;
  name_ru?: string;
  image?: string;
}
export default function CategorysPage() {
  const { isOpen, openModal, closeModal } = useModal();

  let emptyCategory: Category = {
    name: "",
    name_uz: "",
    name_ru: "",
    image: "",
  };

  const fetchCategories = useCallback(
    () => axiosClient.get("/category/all").then((res) => res.data),
    []
  );
  const { data, isLoading, refetch } = useFetchWithLoader<CategoryItemProps[]>({
    fetcher: fetchCategories,
  });
  usePolling(refetch, 10_000);

  const categoryData: CategoryItemProps[] = Array.isArray(data) ? data : [];

  let [Category, setCategory] = useState<Category>(emptyCategory);
  const imageResultRef = useRef<ImageFieldResult | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAdding = async () => {
    setSaving(true);
    try {
      let imageFilename = Category.image ?? "";
      const imgResult = imageResultRef.current;

      if (imgResult?.mode === "upload" && imgResult.file) {
        const fd = new FormData();
        fd.append("image", imgResult.file);
        const res = await axiosClient.post("/category/upload-image", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageFilename = res.data?.data?.image ?? res.data?.image ?? "";
      } else if (imgResult?.mode === "url" && imgResult.url) {
        // Backend will fetch URL and save as PNG
        const res = await axiosClient.post("/category/upload-image-url", {
          url: imgResult.url,
        });
        imageFilename = res.data?.data?.image ?? res.data?.image ?? imgResult.url;
      }

      await axiosClient.post("/category", {
        name_uz: Category.name_uz,
        name_ru: Category.name_ru,
        image: imageFilename,
      });
      refetch();
      closeModal();
      setCategory(emptyCategory);
      imageResultRef.current = null;
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Categorys | Diametr Dashboard"
        description="Diametr Dashboard"
      />
      <PageBreadcrumb pageTitle="Categorys" />

      <div className="space-y-6 ">
        <ComponentCard
          title="Categorys Table"
          action={
            <Button
              size="sm"
              variant="primary"
              startIcon={<PlusIcon className="size-5 fill-white" />}
              onClick={() => {
                setCategory(emptyCategory);
                imageResultRef.current = null;
                openModal();
              }}
            >
              Add Category
            </Button>
          }
        >
          {isLoading ? <SkeletonTable cols={5} rows={7} /> : <CategorysTable data={categoryData ?? []} onRefetch={refetch} />}
        </ComponentCard>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add Category
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Create new Category with full details.
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
                    value={Category.name_uz}
                    onChange={(e) =>
                      setCategory({ ...Category, name_uz: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Nomi (Ruscha)</Label>
                  <Input
                    type="text"
                    placeholder="Ruscha nomini kiriting"
                    value={Category.name_ru}
                    onChange={(e) =>
                      setCategory({ ...Category, name_ru: e.target.value })
                    }
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
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
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
