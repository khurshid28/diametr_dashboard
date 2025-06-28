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

  let data: SaleItemProps[] = [
    {
      id: 2,
      shop: "Sherzod Market",
      createdAt: new Date().toString(),
      total : 120000,
      products :[
        {
            name : "Bo'yoq 1l",
            price : 60000,
            count : 2,
            product : {
                id  :4,
                name : "Bo'yoq"
            }
        },
       
      ],
    
    },
    {
      id: 1,
      shop: "Reno Market",
      createdAt: new Date().toString(),
      total : 57000,
      products :[
        {
            name : "CocaCola 1.5l",
            price : 15000,
            count : 3,
            product : {
                id  :2,
                name : "CocaCola"
            }
        },
        {
            name : "Flesh 0.7l",
            price : 12000,
            count : 1,
            product : {
                id  :1,
                name : "Flesh"
            }
        }
      ],
      delivery: {
        provider :"Yandex",
        amount : 15000,
        phone : "+998990023918"
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
        title="Sales | Diametr Dashboard"
        description="Diametr Dashboard"
      />
      <PageBreadcrumb pageTitle="Sales" />

      <div className="space-y-6 ">
        {/* {isLoading && (
                 <div className="min-h-[450px]  flex-col flex justify-center">
                   <LoadSpinner />
                 </div>
               )} */}

        {data && (
          <ComponentCard
            title="Sales Table"
           
          >
            <SalesTable data={data} />
          </ComponentCard>
        )}
      </div>
   
    </>
  );
}
