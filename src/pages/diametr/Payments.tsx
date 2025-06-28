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
import PaymentsTable, {
  PaymentItemProps,
} from "../../components/tables/diametr/paymentsTable";
export interface Payment {
  name?: string;
  image?: string;
}
export default function PaymentsPage() {
  const { isOpen, openModal, closeModal } = useModal();
  const handleAdding = () => {
    // Handle save logic here

    console.log("handleAdding...");

    closeModal();
    setPayment(emptyPayment);
  };
  let emptyPayment: Payment = {
    name: "",
    image: "",
  };

  let [Payment, setPayment] = useState<Payment>(emptyPayment);

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

  //    const fetchPayments = useCallback(() => {
  //     return axiosClient.get("/Payment/all").then((res) => res.data);
  //   }, []);

  //   const { data, isLoading, error, refetch } = useFetchWithLoader({
  //     fetcher: fetchPayments,
  //   });

  let data: PaymentItemProps[] = [
    {
      id: 6,
      type: "Card",
      createdAt: new Date().toString(),
      price: 450000,
      shop: "Anor market",
      subject: "Payment",
    },
    {
      id: 5,
      type: "Naxd",
      createdAt: new Date().toString(),
      price: 1200000,
      shop: "Texno park mchj",
      subject: "Payment",
    },

    {
      id: 4,
      type: "provider",
      provider_name: "click",
      createdAt: new Date().toString(),
      price: 215000,
      shop: "TexnoMarket",
      subject: "Ad",
    },
    {
      id: 3,
      type: "provider",
      provider_name: "uzum",
      createdAt: new Date().toString(),
      price: 700000,
      shop: "TexnoMarket",
      subject: "Payment",
    },
    {
      id: 2,
      type: "provider",
      provider_name: "payme",
      createdAt: new Date().toString(),
      price: 350000,
      shop: "TexnoMarket",
      subject: "Ad",
    },
    {
      id: 1,
      type: "provider",
      provider_name: "payme",
      createdAt: new Date().toString(),
      price: 1200000,
      shop: "TexnoMarket",
      subject: "Payment",
    },
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name);
    }
  };
  const payment_options = [
    { value: "Card", label: "Card" },
    { value: "Naxd", label: "Naxd" },
  ];

  const shop_options = [
    { value: "Shohruh Market", label: "Shohruh Market" },
    { value: "Farhod Qurilish mchj", label: "Farhod Qurilish mchj" },
  ];

  
  const subject_options = [
    { value: "Payment", label: "Payment" },
    { value: "Ad", label: "Ad" },
    
  ];

  return (
    <>
      <PageMeta
        title="Payments | Diametr Dashboard"
        description="Diametr Dashboard"
      />
      <PageBreadcrumb pageTitle="Payments" />

      <div className="space-y-6 ">
        {/* {isLoading && (
                 <div className="min-h-[450px]  flex-col flex justify-center">
                   <LoadSpinner />
                 </div>
               )} */}

        {data && (
          <ComponentCard
            title="Payments Table"
            action={
              <>
                <Button
                  size="sm"
                  variant="primary"
                  startIcon={<PlusIcon className="size-5 fill-white" />}
                  onClick={() => {
                    setPayment(emptyPayment);
                    openModal();
                  }}
                >
                  Add Payment
                </Button>
              </>
            }
          >
            <PaymentsTable data={data} />
          </ComponentCard>
        )}
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add Payment
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Create new Payment with full details.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Type</Label>
                  <Select
                    options={payment_options}
                    className="dark:bg-dark-900"
                    placeholder="To'lov turini tanlang"
                    onChange={() => {}}
                  />
                </div>

                <div>
                  <Label>Shop</Label>
                  <Select
                    options={shop_options}
                    className="dark:bg-dark-900"
                    placeholder="Do'konni tanlang"
                    onChange={() => {}}
                  />
                </div>

                <div>
                  <Label>Price</Label>
                  <Input type="text" />
                </div>

                  <div>
                  <Label>Subject</Label>
                  <Select
                    options={subject_options}
                    className="dark:bg-dark-900"
                    placeholder="To'lov sababini ko'rsating"
                    onChange={() => {}}
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
