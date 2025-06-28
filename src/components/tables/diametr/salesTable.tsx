import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Moment from "moment";

import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import {
  ArrowRightIcon,
  BoxCubeIcon,
  CloseIcon,
  CloseLineIcon,
  CopyIcon,
  DeleteIcon,
  DeliveryIcon,
  DownloadIcon,
  EditIcon,
  EyeCloseIcon,
  EyeIcon,
  MoneyIcon,
  PencilIcon,
  PlusIcon,
  UserIcon,
} from "../../../icons";
import { useEffect, useState } from "react";
import { useModal } from "../../../hooks/useModal";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";
import { Modal } from "../../ui/modal";
import Select from "../../form/Select";
import DropzoneComponent from "../../form/form-elements/DropZone";
import FileInputExample from "../../form/form-elements/FileInputExample";
import FileInput from "../../form/input/FileInput";
import { Sale } from "../../../pages/diametr/Sales";
import { formatMoney } from "../../../service/formatters/money.format";
import { formatPhoneNumber } from "../../../service/formatters/phone.format";

export interface SaleItemProps {
  id: number;
  total: number;
  products?: {
    name: string;
    price: number;
    count: number;
    product?: {
      id?: number;
      name?: string;
      image?: string;
    };
  }[];
  shop: string;
  delivery?: {
    provider: string;
    amount: number;
    phone: string;
  };

  createdAt: string;
}

// Define the table data using the interface
// const statictableData: Order[] = [
//   {
//     id: 1,
//     merchant: {
//       name: "Idea"
//     },
//     name: "Oq Tepa",
//     image: "/images/new/idea.png",
//     createdAt: new Date("2025-03-02"),
//     region: "Toshkent sh",
//     status: "Active",
//   },
//   {
//     id: 2,

//     name: "Mirobod",
//     merchant: {
//       name: "Idea"
//     },
//     region: "Toshkent sh",
//     image: "/images/new/idea.png",
//     createdAt: new Date("2025-03-02"),

//     status: "Active",
//   },

//   {
//     id: 3,
//     merchant: {
//       name: "MediaPark"
//     },
//     region: "Toshkent sh",
//     name: "Chilonzor",
//     image: "/images/new/media.png",
//     createdAt: new Date("2025-03-02"),
//     status: "Active",
//   },

//   {
//     id: 4,
//     merchant: {
//       name: "MediaPark"
//     },
//     region: "Samarqand",
//     name: "Shahrisabs",
//     image: "/images/new/media.png",
//     createdAt: new Date("2025-03-02"),
//     status: "Active",
//   },

// ];

export default function SalesTable({ data }: { data: SaleItemProps[] }) {
  const [tableData, settableData] = useState(data);

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

  const options = [
    { value: "5", label: "5" },
    { value: "10", label: "10" },
    { value: "20", label: "20" },
  ];
  let [optionValue, setoptionValue] = useState("5");

  let [percent, setPercent] = useState("38");

  let [percent_type, setPercentType] = useState("OUT");

  const handleSelectChange = (value: string) => {
    setoptionValue(value);
  };

  // Pationation

  const [currentPage, setCurrentPage] = useState(1);
  const maxPage = Math.ceil(tableData.length / +optionValue);

  const startIndex = (currentPage - 1) * +optionValue;
  const endIndex = startIndex + +optionValue;
  let currentItems: SaleItemProps[] = tableData.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, maxPage));
  };
  console.log(">> data length :", tableData.length);

  useEffect(() => {
    const startIndex = (currentPage - 1) * +optionValue;
    const endIndex = startIndex + +optionValue;
    currentItems = tableData.slice(startIndex, endIndex);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [optionValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="px-5 py-3  flex flex-row justify-between items-center border-b border-gray-100 dark:border-white/[0.05]">
          <div className="flex flex-row items-center gap-2 text-theme-sm font-medium text-gray-500 text-start  dark:text-gray-400">
            <span>Show</span>

            <Select
              options={options}
              onChange={handleSelectChange}
              className="dark:bg-dark-900"
              defaultValue="5"
            />
            <span>entries</span>
          </div>
          <div>
            {" "}
            <Button
              size="sm"
              variant="outline"
              endIcon={<DownloadIcon className="size-5 fill-white" />}
            >
              Download
            </Button>
          </div>
        </div>
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                ID
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Products
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Amount
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Shop
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Added
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Delivery
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {currentItems.map((order, index) => (
              <TableRow key={index}>
                <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                  {order.id}
                </TableCell>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <div className="flex items-start gap-1 flex-col ">
                    {order.products?.map((item) => (
                      <div className="flex flex-row gap-2 item-center">
                        <BoxCubeIcon className="text-gray-800  dark:text-white/90" />
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {item.name} ({item.count}x) -{" "}
                          {formatMoney(item.price * item.count)}
                        </span>
                      </div>
                    ))}
                  </div>
                </TableCell>

                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <div>
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {formatMoney(order.total)}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.shop}
                </TableCell>

                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {Moment(order.createdAt).format("HH:mm - MMMM DD, yyyy")}
                </TableCell>

                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      "success"
                      // order.status === "Active"
                      //   ? "success"
                      //   : order.status === "Pending"
                      //   ? "warning"
                      //   : "error"
                    }
                  >
                    Active
                  </Badge>
                </TableCell>

                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {
                    order.delivery ? (<div className="flex flex-col items-start">
                    <div className="flex flex-row gap-2 items-center">
                      <DeliveryIcon className="text-gray-800  dark:text-white/90" />{" "}
                      {order.delivery?.provider}
                    </div>

                    <div className="flex flex-row gap-2 items-center">
                      <MoneyIcon className="text-gray-800  dark:text-white/90" />{" "}
                      {formatMoney(order.delivery?.amount)}
                    </div>

                       <div className="flex flex-row gap-2 items-center">
                      <UserIcon className="text-gray-800  dark:text-white/90" />{" "}
                      {formatPhoneNumber(order.delivery?.phone)}
                    </div>
                  </div>) : (<></>)
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="px-5 py-3 gap-3 flex flex-col md:flex-row justify-between md:items-center border-t border-gray-100 dark:border-white/[0.05] text-theme-sm font-medium text-gray-500  dark:text-gray-400">
        <div className="flex flex-row items-center gap-2  text-start  ">
          <Button
            size="sm"
            variant="outline"
            className="w-10 h-10"
            disabled={currentPage === 1}
            onClick={goToPreviousPage}
          >
            <ArrowRightIcon className="rotate-180 fill-gray-500  dark:fill-gray-400 scale-200" />
          </Button>

          {[...Array(maxPage)].map((_, i) => (
            <Button
              size="sm"
              variant={currentPage === i + 1 ? "primary" : "outline"}
              className="w-10 h-10"
              disabled={false}
              key={i}
              onClick={() => {
                currentPage !== i + 1 && setCurrentPage(i + 1);
              }}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            size="sm"
            variant="outline"
            className="w-10 h-10"
            disabled={currentPage === maxPage}
            onClick={goToNextPage}
          >
            <ArrowRightIcon className=" fill-gray-500  dark:fill-gray-400 scale-200" />
          </Button>
        </div>
        <div>
          Showing {(currentPage - 1) * +optionValue + 1} to{" "}
          {Math.min(data.length, currentPage * +optionValue)} of {data.length}{" "}
          entries
        </div>
      </div>
    </div>
  );
}
