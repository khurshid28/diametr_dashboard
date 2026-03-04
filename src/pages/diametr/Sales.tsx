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
import SalesTable, {
  SaleItemProps,
} from "../../components/tables/diametr/salesTable";
import FileInput from "../../components/form/input/FileInput";
import Select from "../../components/form/Select";
import axiosClient from "../../service/axios.service";
import { useFetchWithLoader } from "../../hooks/useFetchWithLoader";
import { LoadSpinner } from "../../components/spinner/load-spinner";
import { usePolling } from "../../hooks/usePolling";
export interface Sale {
  name?: string;
  image?: string;
}
export default function SalesPage() {
  const { isOpen, openModal, closeModal } = useModal();
  const handleAdding = () => {
    // Handle save logic here

    console.log("handleAdding...");

    closeModal();
    setSale(emptySale);
  };
  let emptySale: Sale = {
    name: "",
    image: "",
  };

  let [Sale, setSale] = useState<Sale>(emptySale);

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

  //    const fetchSales = useCallback(() => {
  //     return axiosClient.get("/Sale/all").then((res) => res.data);
  //   }, []);

  //   const { data, isLoading, error, refetch } = useFetchWithLoader({
  //     fetcher: fetchSales,
  //   });

  const fetchOrders = useCallback(
    () => axiosClient.get("/order/all").then((res) => res.data),
    []
  );
  const { data, isLoading, refetch } = useFetchWithLoader<SaleItemProps[]>({
    fetcher: fetchOrders,
  });
  usePolling(refetch, 10_000);

  const saleData: SaleItemProps[] = Array.isArray(data) ? data : [];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name);
    }
  };
  return (
    <>
      <PageMeta
        title="Sales | Diametr Dashboard"
        description="Diametr Dashboard"
      />
      <PageBreadcrumb pageTitle="Sales" />

      <div className="space-y-6 ">
        {isLoading && (
          <div className="min-h-[450px] flex-col flex justify-center">
            <LoadSpinner />
          </div>
        )}
        {!isLoading && saleData && (
          <ComponentCard
            title="Sales Table"
          >
            <SalesTable data={saleData} />
          </ComponentCard>
        )}
      </div>
   
    </>
  );
}
