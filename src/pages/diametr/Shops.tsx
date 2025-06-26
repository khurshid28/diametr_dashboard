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
import ShopsTable, {
  ShopItemProps,
} from "../../components/tables/diametr/shopsTable";
import FileInput from "../../components/form/input/FileInput";
import Select from "../../components/form/Select";
import axiosClient from "../../service/axios.service";
import { useFetchWithLoader } from "../../hooks/useFetchWithLoader";
import { LoadSpinner } from "../../components/spinner/load-spinner";
export interface Shop {
  name?: string;
  image?: string;
}
export default function ShopsPage() {
  const { isOpen, openModal, closeModal } = useModal();
  const handleAdding = () => {
    // Handle save logic here

    console.log("handleAdding...");

    closeModal();
    setShop(emptyShop);
  };
  let emptyShop: Shop = {
    name: "",
    image: "",
  };

  let [Shop, setShop] = useState<Shop>(emptyShop);

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

  //    const fetchShops = useCallback(() => {
  //     return axiosClient.get("/Shop/all").then((res) => res.data);
  //   }, []);

  //   const { data, isLoading, error, refetch } = useFetchWithLoader({
  //     fetcher: fetchShops,
  //   });

  let data: ShopItemProps[] = [
    {
      id: 1,
      name: "Reno Market",
      region: "Toshkent",
      image: "",
      createdAt: new Date().toString(),
      inn: "23044891",
      director : {
        fullname :"Ravshan",
        phone : "+998950642827"
      }
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
        title="Shops | Diametr Dashboard"
        description="Diametr Dashboard"
      />
      <PageBreadcrumb pageTitle="Shops" />

      <div className="space-y-6 ">
        {/* {isLoading && (
                 <div className="min-h-[450px]  flex-col flex justify-center">
                   <LoadSpinner />
                 </div>
               )} */}

        {data && (
          <ComponentCard
            title="Shops Table"
            action={
              <>
                <Button
                  size="sm"
                  variant="primary"
                  startIcon={<PlusIcon className="size-5 fill-white" />}
                  onClick={() => {
                    setShop(emptyShop);
                    openModal();
                  }}
                >
                  Add Shop
                </Button>
              </>
            }
          >
            <ShopsTable data={data} />
          </ComponentCard>
        )}
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add Shop
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Create new Shop with full details.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Region</Label>
                  <Select
                    options={region_options}
                    className="dark:bg-dark-900"
                    onChange={() => {}}
                  />
                </div>

                <div>
                  <Label>Address</Label>
                  <Input type="text" />
                </div>

                <div>
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={Shop.name}
                    onChange={(e) => setShop(emptyShop)}
                  />
                </div>

                <div>
                  <Label>MFO</Label>
                  <Input type="text" onChange={(e) => {}} />
                </div>
                <div>
                  <Label>INN</Label>
                  <Input type="text" onChange={(e) => {}} />
                </div>

                <div>
                  <Label>Hisob raqam</Label>
                  <Input type="text" onChange={(e) => {}} />
                </div>

                <div>
                  <Label>Director Name</Label>
                  <Input type="text" onChange={(e) => {}} />
                </div>
                <div>
                  <Label>Director Phone</Label>
                  <Input type="text" onChange={(e) => {}} />
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
