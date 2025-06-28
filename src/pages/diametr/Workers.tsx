import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

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
import WorkersTable, {
  WorkerItemProps,
} from "../../components/tables/diametr/workersTable";
export interface Worker {
  name?: string;
  phone?: string;
  service?: string;
}
export default function WorkersPage() {
  const { isOpen, openModal, closeModal } = useModal();
  const handleWorkerding = () => {
    // Handle save logic here

    console.log("handleWorkerding...");

    closeModal();
    setWorker(emptyWorker);
  };
  let emptyWorker: Worker = {
    name : "",
    phone: "",
    service: "",
  };

  let [Worker, setWorker] = useState<Worker>(emptyWorker);

  const region_options = [
    { value: "Toshkent sh", label: "Toshkent sh" },
    { value: "Andijon", label: "Andijon" },
    { value: "Buxoro", label: "Buxoro" },
    { value: "Farg'ona", label: "Farg'ona" },
    { value: "Jizzax", label: "Jizzax" },
    { value: "Samarqand", label: "Samarqand" },
    { value: "Toshkent", label: "Toshkent" },
  ];



    const shop_options = [
    { value: "Shohruh Market", label: "Shohruh Market" },
    { value: "Farhod Qurilish mchj", label: "Farhod Qurilish mchj" },
  ];

     const service_options = [
    { value: "Qurilish", label: "Qurilish" },
    { value: "Oshpaz", label: "Oshpaz" },
  ];

  //    const fetchWorkers = useCallback(() => {
  //     return axiosClient.get("/Worker/all").then((res) => res.data);
  //   }, []);

  //   const { data, isLoWorkering, error, refetch } = useFetchWithLoWorkerer({
  //     fetcher: fetchWorkers,
  //   });

  let data: WorkerItemProps[] = [
    {
      id: 4,
      name: "Bahodir Ochilov",
      phone :"+998907802019",
      image: "/images/user/user-10.jpg",
      service :"Qurilish",
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
        title="Workers | Diametr Dashboard"
        description="Diametr Dashboard"
      />
      <PageBreadcrumb pageTitle="Workers" />

      <div className="space-y-6 ">
        {/* {isLoWorkering && (
                 <div className="min-h-[450px]  flex-col flex justify-center">
                   <LoWorkerSpinner />
                 </div>
               )} */}

        {data && (
          <ComponentCard
            title="Workers Table"
            action={
              <>
                <Button
                  size="sm"
                  variant="primary"
                  startIcon={<PlusIcon className="size-5 fill-white" />}
                  onClick={() => {
                    setWorker(emptyWorker);
                    openModal();
                  }}
                >
                  Add Workers
                </Button>
              </>
            }
          >
            <WorkersTable data={data} />
          </ComponentCard>
        )}
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add Workers
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Create new Worker with full details.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    value={Worker.name}
                    onChange={(e) => setWorker(emptyWorker)}
                  />
                </div>
                 <div>
                  <Label>Phone</Label>
                  <Input
                    type="text"
                    value={Worker.phone}
                    onChange={(e) => setWorker(emptyWorker)}
                  />
                </div>

                 <div>
                  <Label>Service</Label>
                  <Select
                    options={service_options}
                    className="dark:bg-dark-900"
                    placeholder="Servisni tanlang"
                    onChange={() => {}}
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
              <Button size="sm" onClick={handleWorkerding}>
                Saves
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
