import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import { BoxIcon, PlusIcon } from "../../icons";
import Button from "../../components/ui/button/Button";
import { useModal } from "../../hooks/useModal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import { useCallback, useState } from "react";

import FileInput from "../../components/form/input/FileInput";
import Select from "../../components/form/Select";
import axiosClient from "../../service/axios.service";
import { useFetchWithLoader } from "../../hooks/useFetchWithLoader";
import { LoadSpinner } from "../../components/spinner/load-spinner";
import CategorysTable, {
  CategoryItemProps,
} from "../../components/tables/diametr/categoriesTable";
export interface Category {
  name?: string;
  image?: string;
}
export default function CategorysPage() {
  const { isOpen, openModal, closeModal } = useModal();
  const handleAdding = () => {
    // Handle save logic here

    console.log("handleAdding...");

    closeModal();
    setCategory(emptyCategory);
  };
  let emptyCategory: Category = {
    name: "",
    image: "",
  };

  let [Category, setCategory] = useState<Category>(emptyCategory);

  const region_options = [
    { value: "Toshkent sh", label: "Toshkent sh" },
    { value: "Andijon", label: "Andijon" },
    { value: "Buxoro", label: "Buxoro" },
    { value: "Farg'ona", label: "Farg'ona" },
    { value: "Jizzax", label: "Jizzax" },
    { value: "Samarqand", label: "Samarqand" },
    { value: "Toshkent", label: "Toshkent" },
  ];

  const percent_type_options = [
    { value: "OUT", label: "OUT" },
    { value: "IN", label: "IN" },
  ];

  //    const fetchCategorys = useCallback(() => {
  //     return axiosClient.get("/Category/all").then((res) => res.data);
  //   }, []);

  //   const { data, isLoading, error, refetch } = useFetchWithLoader({
  //     fetcher: fetchCategorys,
  //   });

  let data: CategoryItemProps[] = [
    {
      id: 4,
      name: "Kabel",
      image: "/images/cards/card-02.png",
      product_count: 12,
      createdAt: new Date().toString(),
    },
    {
      id: 3,
      name: "Bo'yoq",
       image: "/images/cards/card-03.jpg",
      product_count: 5,
      createdAt: new Date().toString(),
    },
    {
      id: 2,
      name: "Ichimlik",
        image: "/images/cards/card-02.png",
      product_count: 40,
      createdAt: new Date().toString(),
    },
    {
      id: 1,
      name: "Gilam",
        image: "/images/cards/card-02.png",
      product_count: 4,
      createdAt: new Date().toString(),
    },
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name);
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
        {/* {isLoading && (
                 <div className="min-h-[450px]  flex-col flex justify-center">
                   <LoadSpinner />
                 </div>
               )} */}

        {data && (
          <ComponentCard
            title="Categorys Table"
            action={
              <>
                <Button
                  size="sm"
                  variant="primary"
                  startIcon={<PlusIcon className="size-5 fill-white" />}
                  onClick={() => {
                    setCategory(emptyCategory);
                    openModal();
                  }}
                >
                  Add Category
                </Button>
              </>
            }
          >
            <CategorysTable data={data} />
          </ComponentCard>
        )}
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
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={Category.name}
                    onChange={(e) => setCategory(emptyCategory)}
                  />
                </div>
                <div>
                  <Label>Image</Label>
                  <FileInput
                    onChange={handleFileChange}
                    className="custom-class"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleAdding}>
                Saves
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
