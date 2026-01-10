import React, { useEffect, useRef, useState } from "react";
import {
  HiEllipsisHorizontal,
  HiXMark,
} from "react-icons/hi2";
import profile7 from "@/assets/images/profile-7.jpeg";
import profile8 from "@/assets/images/profile-8.jpeg";
import profile9 from "@/assets/images/profile-9.jpeg";
import documentImage from "@/assets/images/document.png";
import iconEdit from "@/assets/images/edit.png";
import iconView from "@/assets/images/view.png";
import iconDelete from "@/assets/images/delete.png";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import VendorTable from "./CustomTable";


/* ================= TYPES ================= */

export type VendorDoc = {
  id: number;
  vendor: string;
  avatar: string;
  docImage: string;
  documents: { name: string; src: string }[];
  docType: string;
  category: string;
  status: "Pending" | "Completed" | "Rejected" | "Under Review";
  submitted: string;
  submittedTime: string;
};

export type VendorProfile = {
  name: string;
  id: string | number;
  avatar?: string;
  location?: string;
  verified?: boolean;
};

const defaultVendor: VendorProfile = {
  name: "Malmo Romokare",
  id: "355657",
  avatar: profile7,
  location: "Malmo",
  verified: true,
};

const createSeedDocuments = (vendor: VendorProfile): VendorDoc[] => [
  {
    id: 355657,
    vendor: vendor.name,
    avatar: vendor.avatar ?? profile7,
    docImage: vendor.avatar ?? profile7,
    documents: [
      { name: "Driving license", src: vendor.avatar ?? profile7 },
      { name: "Company registration", src: profile9 },
    ],
    docType: "Company registration",
    category: "Hotel",
    status: "Pending",
    submitted: "Dec 26, 2025",
    submittedTime: "14:32",
  },
  {
    id: 355658,
    vendor: vendor.name,
    avatar: vendor.avatar ?? profile9,
    docImage: documentImage,
    documents: [
      { name: "Business license", src: profile9 },
      { name: "Tax certificate", src: vendor.avatar ?? profile7 },
      { name: "Owner ID", src: profile8 },
    ],
    docType: "Company registration",
    category: "Restaurant",
    status: "Completed",
    submitted: "Dec 26, 2025",
    submittedTime: "11:10",
  },
  {
    id: 355659,
    vendor: vendor.name,
    avatar: profile8,
    docImage: profile8,
    documents: [
      { name: "Driving license", src: vendor.avatar ?? profile7 },
      { name: "Company registration", src: profile9 },
    ],
    docType: "Company registration",
    category: "Hotel",
    status: "Pending",
    submitted: "Dec 26, 2025",
    submittedTime: "14:32",
  },
];

/* ================= DATA ================= */
/* ================= COMPONENT ================= */

type VendorDocumentsTableProps = {
  vendor?: VendorProfile;
};

const VendorDocumentsTable: React.FC<VendorDocumentsTableProps> = ({
  vendor = defaultVendor,
}) => {
  const [documents, setDocuments] = useState<VendorDoc[]>(
    () => createSeedDocuments(vendor)
  );
  const [activeDoc, setActiveDoc] = useState<VendorDoc | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<VendorDoc | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const uploadedObjectUrlsRef = useRef<string[]>([]);
  const vendorAvatar = vendor.avatar ?? profile7;
  const vendorStatusLabel = vendor.verified ? "Verified" : "Pending";

  useEffect(() => {
    setDocuments(createSeedDocuments(vendor));
  }, [vendor]);

  useEffect(() => {
    if (!activeDoc) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (confirmOpen) {
          setConfirmOpen(false);
          return;
        }
        if (viewDoc) {
          setViewDoc(null);
          return;
        }
        setActiveDoc(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDoc, confirmOpen, viewDoc]);

  useEffect(() => {
    if (!activeDoc) {
      setConfirmOpen(false);
    }
  }, [activeDoc]);

  useEffect(() => {
    return () => {
      uploadedObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const addFiles = (files: FileList | File[]) => {
    const nextDocs: VendorDoc[] = Array.from(files).map((file) => {
      const vendorName = vendor.name;
      const vendorAvatar = vendor.avatar ?? profile7;
      const createdAt = new Date();
      const dateLabel = createdAt.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const objectUrl = URL.createObjectURL(file);
      uploadedObjectUrlsRef.current.push(objectUrl);
      const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";
      return {
        id: Date.now() + Math.floor(Math.random() * 1000),
        vendor: vendorName,
        avatar: vendorAvatar,
        docImage: objectUrl,
        documents: [{ name: file.name, src: objectUrl }],
        docType: `${ext} document`,
        category: "Business",
        status: "Under Review",
        submitted: dateLabel,
        submittedTime: createdAt.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });

    setDocuments((prev) => [...nextDocs, ...prev]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addFiles(files);
      event.target.value = "";
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      addFiles(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
  };

  const activityLog = [
    { title: "Request submitted", time: "Dec 18 ΓÇó 10:12", tone: "bg-emerald-400" },
    { title: "Documents received", time: "Dec 18 ΓÇó 10:18", tone: "bg-emerald-400" },
    { title: "Review completed", time: "Dec 18 ΓÇó 14:32", tone: "bg-blue-400" },
    { title: "Vendor approved", time: "Recorded automatically", tone: "bg-slate-300" },
  ];

  const statusStyles = (status: VendorDoc["status"]) => {
    if (status === "Pending") {
      return "bg-yellow-100 text-yellow-700";
    }
    if (status === "Completed") {
      return "bg-green-100 text-green-700";
    }
    if (status === "Rejected") {
      return "bg-red-100 text-red-600";
    }
    return "bg-blue-100 text-blue-700";
  };

  const columns = [
    { key: "id", header: "ID", width: "90px" },

    {
      key: "vendor",
      header: "Vendor",
      width: "",
      render: (row: VendorDoc) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar}
            alt={row.vendor}
            className="w-8 h-8 rounded-full border border-gray-200"
          />
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {row.vendor}
          </span>
        </div>
      ),
    },

    { key: "docType", header: "Doc type" },
    { key: "category", header: "Category" },

    {
      key: "status",
      header: "Status",
      render: (row: VendorDoc) => (
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            statusStyles(row.status)
          }`}
        >
          {row.status}
        </span>
      ),
    },

    {
      key: "submitted",
      header: "Submitted",
      render: (row: VendorDoc) => (
        <div>
          <div className="text-gray-900 dark:text-gray-100">
            {row.submitted}
          </div>
          <div className="text-xs text-gray-400">3 days ago</div>
        </div>
      ),
    },

{
  key: "actions",
  header: "Actions",
  render: (row: VendorDoc) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="
            h-9 w-9
            rounded-md
            bg-gray-100
            hover:bg-gray-200
          "
        >
          <HiEllipsisHorizontal className="h-4 w-4 text-gray-700" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="
          w-30
          rounded-md
          p-1
          bg-white
          shadow-md
          border border-gray-200
        "
      >
        <DropdownMenuItem
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700"
          onSelect={() => setActiveDoc(row)}
        >
          <img src={iconEdit} className="h-4 w-4" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700"
          onSelect={() => setViewDoc(row)}
        >
          <img src={iconView} className="h-4 w-4" />
          View
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 focus:text-red-600">
          <img src={iconDelete} className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
  ];

 return (
   <>
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Documents & Verification
              </p>
              <p className="text-xs text-gray-500">
                Upload and manage your business documents.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <img
                src={vendorAvatar}
                alt={vendor.name}
                className="h-10 w-10 rounded-full border border-gray-200 object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {vendor.name}
                  <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    {vendorStatusLabel}
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  ID: {vendor.id}
                  {vendor.location ? ` · ${vendor.location}` : ""}
                </p>
              </div>
            </div>
          </div>
          <Button
            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            onClick={() => setUploadOpen(true)}
          >
            Upload document
          </Button>
        </div>
      </div>
     <VendorTable<VendorDoc> columns={columns} data={documents} />
     {uploadOpen ? (
       <div
         className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
         onClick={() => setUploadOpen(false)}
       >
         <div
           className="relative w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
           onClick={(event) => event.stopPropagation()}
         >
           <button
             type="button"
             onClick={() => setUploadOpen(false)}
             className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100"
           >
             <HiXMark className="h-4 w-4" />
           </button>

           <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-4">
             <div>
               <p className="text-sm font-semibold text-gray-900">
                 Documents & Verification
               </p>
               <p className="text-xs text-gray-500">
                 Upload and manage your business documents. Approved documents
                 increase trust and visibility.
               </p>
             </div>
            <div className="flex items-center gap-3">
              <img
                src={vendorAvatar}
                alt="Vendor profile"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {vendor.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>ID: {vendor.id}</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    {vendorStatusLabel}
                  </span>
                </div>
              </div>
            </div>
           </div>

           <div className="mt-5 rounded-2xl border border-gray-200 p-4">
             <div className="flex flex-wrap items-center justify-between gap-4">
               <div>
                 <p className="text-sm font-semibold text-gray-900">
                   Upload a new document
                 </p>
                 <p className="text-xs text-gray-500">
                   Business registration, insurance certificate, owner ID, tax
                   documents (PDF, JPG, PNG)
                 </p>
               </div>
               <Button
                 className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                 onClick={() => fileInputRef.current?.click()}
               >
                 Upload document
               </Button>
             </div>
             <div
               className={`mt-4 rounded-xl border border-dashed px-4 py-6 text-center text-xs ${
                 isDragging
                   ? "border-blue-400 bg-blue-50 text-blue-600"
                   : "border-blue-200 bg-blue-50/30 text-gray-500"
               }`}
               onDragOver={(event) => {
                 event.preventDefault();
                 setIsDragging(true);
               }}
               onDragLeave={() => setIsDragging(false)}
               onDrop={handleDrop}
               onClick={() => fileInputRef.current?.click()}
               role="button"
               tabIndex={0}
               onKeyDown={(event) => {
                 if (event.key === "Enter" || event.key === " ") {
                   event.preventDefault();
                   fileInputRef.current?.click();
                 }
               }}
             >
               Drag & drop files here, or click "Upload document"
             </div>
             <input
               ref={fileInputRef}
               type="file"
               accept=".pdf,.png,.jpg,.jpeg"
               multiple
               className="hidden"
               onChange={handleFileChange}
             />
           </div>

           <div className="mt-4 flex flex-wrap items-center gap-3">
             <div className="relative flex-1">
               <input
                 placeholder="Search documents..."
                 className="h-10 w-full rounded-full border border-gray-200 pl-10 pr-4 text-xs text-gray-600 outline-none focus:border-blue-500"
               />
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                 <HiEllipsisHorizontal className="h-4 w-4 rotate-90" />
               </span>
             </div>
             <Button
               variant="outline"
               className="h-10 rounded-full border-gray-200 px-4 text-xs text-gray-600 hover:bg-gray-50"
             >
               Status filter
             </Button>
             <Button
               variant="outline"
               className="h-10 rounded-full border-gray-200 px-4 text-xs text-gray-600 hover:bg-gray-50"
             >
               Type filter
             </Button>
           </div>

           <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
             <span className="font-semibold text-gray-700">Your documents</span>
             <span>Last updated: today</span>
           </div>

           <div className="mt-3">
             <VendorTable<VendorDoc>
               columns={columns}
               data={documents}
               showToolbar={false}
             />
           </div>
         </div>
       </div>
     ) : null}
     {activeDoc ? (
       <div
         className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
         onClick={() => setActiveDoc(null)}
       >
         <div
           className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
           onClick={(event) => event.stopPropagation()}
         >
           <button
             type="button"
             onClick={() => setActiveDoc(null)}
             className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100"
           >
             <HiXMark className="h-4 w-4" />
           </button>

           <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
             <div className="bg-gray-100 p-4">
               <img
                 src={activeDoc.docImage}
                 alt={`${activeDoc.vendor} document`}
                 className="h-full max-h-[520px] w-full rounded-xl object-cover"
               />
             </div>

             <div className="flex flex-col gap-5 mt-5 mb-5 ml-5 mr-5 bg-gray-50 p-6 rounded-2xl">
               <div className="flex flex-col items-center text-center">
                 <img
                   src={activeDoc.avatar}
                   alt={activeDoc.vendor}
                   className="h-20 w-20 rounded-full border border-gray-200 object-cover"
                 />
                 <h3 className="mt-3 text-lg font-semibold text-gray-900">
                   {activeDoc.vendor}
                 </h3>
                 <p className="text-sm text-gray-500">ID: {activeDoc.id}</p>
               </div>

               <div className="space-y-3 text-sm">
                 <div className="flex items-center justify-between text-gray-500">
                   <span>Document type</span>
                   <span className="font-medium text-gray-900">
                     {activeDoc.docType}
                   </span>
                 </div>
                 <div className="flex items-center justify-between text-gray-500">
                   <span>Category</span>
                   <span className="font-medium text-gray-900">
                     {activeDoc.category}
                   </span>
                 </div>
                 <div className="flex items-center justify-between text-gray-500">
                   <span>Submitted</span>
                   <span className="font-medium text-gray-900">
                     {activeDoc.submitted} - {activeDoc.submittedTime}
                   </span>
                 </div>
                 <div className="flex items-center justify-between text-gray-500">
                   <span>Status</span>
                   <span
                     className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles(
                       activeDoc.status
                     )}`}
                   >
                     {activeDoc.status}
                   </span>
                 </div>
               </div>

               <div>
                 <label className="text-sm font-medium text-gray-700">
                   Comment
                 </label>
                 <textarea
                   placeholder="Add a note for this KYC review"
                   className="mt-2 min-h-[96px] w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                 />
               </div>

               <div className="mt-auto flex flex-wrap gap-3">
                 <Button className="bg-red-500 text-white hover:bg-red-600">
                   Decline
                 </Button>
                 <Button
                   className="bg-blue-600 text-white hover:bg-blue-700"
                   onClick={() => setConfirmOpen(true)}
                 >
                   Approve
                 </Button>
                 <Button
                   variant="outline"
                   className="border-blue-500 text-blue-600 hover:bg-blue-50"
                 >
                   Request reupload
                 </Button>
               </div>
             </div>
           </div>
         </div>
       </div>
     ) : null}
     {viewDoc ? (
       <div
         className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
         onClick={() => setViewDoc(null)}
       >
         <div
           className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
           onClick={(event) => event.stopPropagation()}
         >
           <div className="border-b border-gray-200 px-6 py-4">
             <div className="flex flex-wrap items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                 <img
                   src={viewDoc.avatar}
                   alt={viewDoc.vendor}
                   className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                 />
                 <div>
                   <p className="text-sm font-semibold text-gray-900">
                     {viewDoc.vendor}
                   </p>
                   <p className="text-xs text-gray-500">
                     Vendor verification ΓÇó Documents & audit trail
                   </p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <span
                   className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles(
                     viewDoc.status
                   )}`}
                 >
                   {viewDoc.status}
                 </span>
                 <button
                   type="button"
                   onClick={() => setViewDoc(null)}
                   className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100"
                 >
                   <HiXMark className="h-4 w-4" />
                 </button>
               </div>
             </div>
           </div>

           <div className="grid gap-4 bg-gray-50 p-5 md:grid-cols-[1.2fr_0.8fr]">
             <div className="rounded-2xl border border-gray-200 bg-white p-4">
               <div className="flex flex-wrap items-center justify-between gap-3">
                 <div>
                   <p className="text-sm font-semibold text-gray-900">
                     Uploaded documents
                   </p>
                   <p className="text-xs text-gray-500">
                     {viewDoc.documents.length} files ΓÇó Click a card to open viewer
                   </p>
                 </div>
                 <input
                   placeholder="Search documents..."
                   className="h-9 w-full max-w-[180px] rounded-full border border-gray-200 px-3 text-xs text-gray-600 outline-none focus:border-blue-500"
                 />
               </div>

               <div className="mt-4 grid gap-4 sm:grid-cols-2">
                 {viewDoc.documents.map((doc) => (
                   <div
                     key={doc.name}
                     className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                   >
                     <div className="flex items-start gap-3">
                       <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-[10px] font-semibold text-gray-500">
                         PDF
                       </div>
                       <div className="flex-1">
                         <p className="text-sm font-semibold text-gray-900">
                           {doc.name}
                         </p>
                         <p className="text-xs text-gray-500">PDF ΓÇó 1.2 MB</p>
                       </div>
                     </div>
                     <div className="mt-3 flex items-center justify-between gap-2">
                       <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                         Approved
                       </span>
                       <Button
                         variant="outline"
                         className="h-8 rounded-full border-gray-300 px-4 text-xs text-gray-600 hover:bg-gray-100"
                       >
                         View
                       </Button>
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             <div className="rounded-2xl border border-gray-200 bg-white p-4">
               <p className="text-sm font-semibold text-gray-900">
                 Verification workflow
               </p>
               <p className="text-xs text-gray-500">
                 Progress and recorded actions
               </p>

               <div className="mt-4 rounded-xl bg-gray-50 p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-xs text-gray-500">Current status</p>
                     <p className="text-sm font-semibold text-gray-900">
                       {viewDoc.status}
                     </p>
                   </div>
                   <span className="rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1 text-xs font-semibold text-emerald-600">
                     OK
                   </span>
                 </div>
               </div>

               <div className="mt-4">
                 <p className="text-xs font-semibold text-gray-700">
                   Activity log
                 </p>
                 <div className="mt-3 space-y-4">
                   {activityLog.map((entry, index) => (
                     <div key={entry.title} className="flex items-start gap-3">
                       <div className="relative flex w-4 justify-center">
                         <span
                           className={`mt-1 h-2.5 w-2.5 rounded-full ${entry.tone}`}
                         />
                         {index < activityLog.length - 1 ? (
                           <span className="absolute left-1/2 top-4 h-6 w-px -translate-x-1/2 bg-gray-200" />
                         ) : null}
                       </div>
                       <div>
                         <p className="text-sm font-medium text-gray-900">
                           {entry.title}
                         </p>
                         <p className="text-xs text-gray-500">{entry.time}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
     ) : null}
     {activeDoc && confirmOpen ? (
       <div
         className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-4 py-6"
         onClick={() => setConfirmOpen(false)}
       >
         <div
           className="relative w-full max-w-lg rounded-2xl border border-blue-300 bg-white p-6 shadow-xl"
           onClick={(event) => event.stopPropagation()}
         >
           <button
             type="button"
             onClick={() => setConfirmOpen(false)}
             className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-100"
           >
             <HiXMark className="h-4 w-4" />
           </button>

           <div className="space-y-1">
             <p className="text-sm font-semibold text-gray-900">
               Confirm action
             </p>
             <p className="text-sm text-gray-500">
               Approve - {activeDoc.docType}
             </p>
           </div>

           <div className="mt-5 space-y-4 text-sm">
             <div>
               <label className="text-sm font-medium text-gray-700">
                 Reason *
               </label>
               <select className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500">
                 <option value="">Select a reason</option>
                 <option value="valid">Valid document</option>
                 <option value="verified">Verified vendor</option>
               </select>
             </div>

             <div>
               <label className="text-sm font-medium text-gray-700">
                 Additional comments *
               </label>
               <textarea
                 placeholder="Explain what was checked"
                 className="mt-2 min-h-[120px] w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 outline-none focus:border-blue-500"
               />
             </div>

             <p className="text-xs text-gray-500">
               This message will be sent to the vendor and stored for audit.
             </p>
           </div>

           <div className="mt-6 flex justify-end gap-3">
             <Button
               variant="outline"
               className="border-blue-500 text-blue-600 hover:bg-blue-50"
               onClick={() => setConfirmOpen(false)}
             >
               Cancel
             </Button>
             <Button className="bg-blue-600 text-white hover:bg-blue-700">
               Confirm
             </Button>
           </div>
         </div>
       </div>
     ) : null}
   </>
 );

};

export default VendorDocumentsTable;
