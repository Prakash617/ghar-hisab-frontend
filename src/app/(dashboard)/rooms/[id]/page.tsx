"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roomsApi, paymentsApi, tenantsApi, tenantDocumentsApi, emailApi } from "@/lib/api";
import { useTranslation } from "@/i18n/provider";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime, getMediaUrl } from "@/lib/utils";
import { getTodayNepaliDate } from "@/lib/nepaliDate";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Send,
  FileText,
  Eye,
  Banknote,
  Mail,
  AlertTriangle,
  CreditCard,
  Pencil,
  Trash2,
  CheckCircle,
  Loader2,
  Calculator,
  RotateCcw,
  ExternalLink,
  Download,
  User,
  Phone,
  ChevronDown,
  ChevronUp,
  FolderOpen,
} from "lucide-react";

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const roomId = parseInt(id);
  const { t, locale } = useTranslation();
  const queryClient = useQueryClient();

  // Navigation & Display State
  const [showTenantProfile, setShowTenantProfile] = useState(false);
  const [viewingBill, setViewingBill] = useState<any>(null);
  const [mobileTab, setMobileTab] = useState<"bills" | "tenant" | "docs">("bills");
  const [expandedBillId, setExpandedBillId] = useState<number | null>(null);

  // 1) Record Payment Modal State (defaults to today's Nepali BS date)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    payment_received_date: getTodayNepaliDate(),
    remarks: "",
  });

  // 2) Add Bill Modal State
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [addBillForm, setAddBillForm] = useState({
    billing_month: "",
    current_units: "",
    remarks: "",
    is_meter_reset: false,
    meter_reset_reason: "",
    previous_units: "",
    old_meter_reading: "",
    additional_units: "0",
  });

  // 3) Send Pending Bills Modal State
  const [isPendingEmailModalOpen, setIsPendingEmailModalOpen] = useState(false);
  const [pendingEmailLang, setPendingEmailLang] = useState<"en" | "ne">("en");
  const [pendingEmailSubject, setPendingEmailSubject] = useState("");
  const [pendingEmailMessage, setPendingEmailMessage] = useState("");

  // 4) Room Email History Modal State
  const [isEmailHistoryOpen, setIsEmailHistoryOpen] = useState(false);

  // 5) Edit Tenant Modal State
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [tenantForm, setTenantForm] = useState({
    name: "",
    contact: "",
    email: "",
    client_code: "",
    move_in_date: new Date().toISOString().slice(0, 10),
    rent_price: "0",
    electricity_price_per_unit: "15",
    water_price: "200",
    waste_price: "0",
    internet_price: "0",
    initial_unit: 0,
    opening_balance: "0",
  });

  // Edit / Delete Bill States
  const [editingBill, setEditingBill] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    billing_month: "",
    previous_units: "",
    current_units: "",
    electricity: "",
    rent: "",
    water: "",
    waste: "",
    internet: "",
    status: "Unpaid" as "Paid" | "Unpaid" | "Partially Paid",
    total_paid: "0",
    payment_received_date: "",
    remarks: "",
    is_meter_reset: false,
    meter_reset_reason: "",
    old_meter_reading: "",
    additional_units: "0",
  });
  const [deletingBill, setDeletingBill] = useState<any>(null);

  // Document Modal State
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);

  // Receipt Reversal State
  const [reversingReceipt, setReversingReceipt] = useState<any>(null);

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => roomsApi.getDetail(roomId),
  });

  const { data: pendingPreview, isLoading: isLoadingPendingPreview } = useQuery({
    queryKey: ["pending-preview", roomId],
    queryFn: () => emailApi.getPendingBillPreview(roomId),
    enabled: isPendingEmailModalOpen,
  });

  const { data: roomEmails, isLoading: isLoadingEmails } = useQuery({
    queryKey: ["room-emails", roomId],
    queryFn: () => emailApi.getHistory(roomId),
    enabled: isEmailHistoryOpen,
  });

  const tenant = data?.tenant;
  const room = data?.room;
  const payments = data?.payments?.items || [];
  const totalPages = data?.payments?.total_pages || 1;
  const currentPage = data?.payments?.page || 1;
  const totalAmountToReceive = data?.total_amount_to_receive || "0";
  const unpaidCount = data?.unpaid_count || 0;
  const paidCount = data?.paid_bills_count || 0;
  const partialCount = data?.partial_bills_count || 0;
  const openingBalance = data?.opening_balance || "0";
  const openingBalancePaid = data?.opening_balance_paid || "0";
  const openingBalanceRemaining = data?.opening_balance_remaining || "0";
  const totalUnapplied = data?.total_unapplied || "0";
  const documents = data?.documents || [];
  const latestReceipt = data?.latest_receipt;
  const recentReceipts = data?.recent_receipts || [];
  const nextPreviousUnits: number = data?.next_previous_units ?? (payments[0]?.current_units ?? tenant?.initial_unit ?? 0);
  const totalPaidAll = payments.reduce((acc: number, p: any) => acc + (parseFloat(p.total_paid) || 0), 0);

  // Nepali today date (BS Bikram Sambat)
  const todayNepaliDate = data?.today_nepali_date || data?.current_billing_month || getTodayNepaliDate();

  // Synchronize payment received date with today's Nepali date when room data is loaded
  useEffect(() => {
    if (todayNepaliDate) {
      setPaymentData((prev) => {
        if (!prev.payment_received_date || prev.payment_received_date.startsWith("2026") || prev.payment_received_date.startsWith("2025")) {
          return { ...prev, payment_received_date: todayNepaliDate };
        }
        return prev;
      });
    }
  }, [todayNepaliDate]);

  // Open Record Lump-Sum Payment Modal with today's Nepali date
  const openPaymentModal = () => {
    setPaymentData({
      amount: "",
      payment_received_date: todayNepaliDate,
      remarks: "",
    });
    setIsPaymentOpen(true);
  };

  // Synchronize pending preview text when loaded or language changed
  useEffect(() => {
    if (pendingPreview) {
      if (pendingEmailLang === "ne") {
        setPendingEmailSubject(pendingPreview.subject_nepali || pendingPreview.subject || "");
        setPendingEmailMessage(pendingPreview.message_nepali || pendingPreview.message || "");
      } else {
        setPendingEmailSubject(pendingPreview.subject || "");
        setPendingEmailMessage(pendingPreview.message || "");
      }
    }
  }, [pendingPreview, pendingEmailLang]);

  // Open Edit Tenant Modal
  const openTenantModal = () => {
    if (tenant) {
      setTenantForm({
        name: tenant.name || tenant.full_name || "",
        contact: tenant.contact || tenant.phone_number || "",
        email: tenant.email || "",
        client_code: tenant.client_code || "",
        move_in_date: tenant.move_in_date || tenant.moveInDate || new Date().toISOString().slice(0, 10),
        rent_price: String(tenant.rent_price || 0),
        electricity_price_per_unit: String(tenant.electricity_price_per_unit || tenant.electricityPricePerUnit || 15),
        water_price: String(tenant.water_price || 0),
        waste_price: String(tenant.waste_price || 0),
        internet_price: String(tenant.internet_price || 0),
        initial_unit: tenant.initial_unit || 0,
        opening_balance: String(tenant.opening_balance || 0),
      });
    } else {
      setTenantForm({
        name: "",
        contact: "",
        email: "",
        client_code: "",
        move_in_date: new Date().toISOString().slice(0, 10),
        rent_price: "0",
        electricity_price_per_unit: "15",
        water_price: "0",
        waste_price: "0",
        internet_price: "0",
        initial_unit: 0,
        opening_balance: "0",
      });
    }
    setIsTenantModalOpen(true);
  };

  // Open Add Bill Modal with defaults
  const openAddBillModal = (isReset = false) => {
    setAddBillForm({
      billing_month: todayNepaliDate || new Date().toISOString().slice(0, 7),
      current_units: "",
      remarks: "",
      is_meter_reset: isReset,
      meter_reset_reason: isReset ? "Meter damaged/replaced in the middle of season" : "",
      previous_units: isReset ? "0" : String(nextPreviousUnits),
      old_meter_reading: isReset ? String(nextPreviousUnits) : "",
      additional_units: "0",
    });
    setIsAddBillOpen(true);
  };

  // Mutations
  const recordPaymentMutation = useMutation({
    mutationFn: (d: any) => paymentsApi.recordPayment(roomId, d),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      setIsPaymentOpen(false);
      setPaymentData({
        amount: "",
        payment_received_date: todayNepaliDate,
        remarks: "",
      });
      toast.success(res?.message || "Payment recorded and allocated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to record payment.");
    },
  });

  const createBillMutation = useMutation({
    mutationFn: (bData: any) =>
      paymentsApi.create({
        room: roomId,
        billing_month: bData.billing_month,
        current_units: parseInt(bData.current_units),
        previous_units: bData.is_meter_reset ? (parseInt(bData.previous_units) || 0) : nextPreviousUnits,
        remarks: bData.remarks || "",
        is_meter_reset: Boolean(bData.is_meter_reset),
        meter_reset_reason: bData.is_meter_reset ? (bData.meter_reset_reason || "") : "",
        old_meter_reading: bData.is_meter_reset && bData.old_meter_reading ? parseInt(bData.old_meter_reading) : null,
        new_meter_start_reading: bData.is_meter_reset ? (parseInt(bData.previous_units) || 0) : null,
        additional_units: bData.is_meter_reset ? (parseInt(bData.additional_units) || 0) : 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      setIsAddBillOpen(false);
      toast.success("New bill created successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create bill.");
    },
  });

  const sendPendingMutation = useMutation({
    mutationFn: (payload: { subject: string; custom_message: string }) =>
      emailApi.sendPendingBills(roomId, payload),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      queryClient.invalidateQueries({ queryKey: ["room-emails", roomId] });
      setIsPendingEmailModalOpen(false);
      toast.success(res?.message || "Pending bills notice sent successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to send pending bill email.");
    },
  });

  const sendSingleBillMutation = useMutation({
    mutationFn: (paymentId: number) => paymentsApi.sendEmail(paymentId),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      queryClient.invalidateQueries({ queryKey: ["room-emails", roomId] });
      toast.success(res?.message || "Bill invoice sent successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to send bill email.");
    },
  });

  const saveTenantMutation = useMutation({
    mutationFn: (tData: any) => {
      const payload = {
        name: tData.name,
        contact: tData.contact,
        email: tData.email || null,
        client_code: tData.client_code || null,
        move_in_date: tData.move_in_date,
        rent_price: parseFloat(tData.rent_price) || 0,
        electricity_price_per_unit: parseFloat(tData.electricity_price_per_unit) || 15,
        water_price: parseFloat(tData.water_price) || 0,
        waste_price: parseFloat(tData.waste_price) || 0,
        internet_price: parseFloat(tData.internet_price) || 0,
        initial_unit: parseInt(String(tData.initial_unit)) || 0,
        opening_balance: parseFloat(tData.opening_balance) || 0,
        room: roomId,
      };
      if (tenant?.id) {
        return tenantsApi.update(tenant.id, payload);
      }
      return tenantsApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      setIsTenantModalOpen(false);
      toast.success("Tenant information saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save tenant information.");
    },
  });

  const reverseReceiptMutation = useMutation({
    mutationFn: (receiptId: number) => paymentsApi.reverseReceipt(receiptId),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      setReversingReceipt(null);
      toast.success(res?.message || "Payment receipt reversed successfully! Outstanding balances restored.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to reverse receipt.");
    },
  });

  const updateBillMutation = useMutation({
    mutationFn: (d: any) => paymentsApi.update(d.id, d.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      setEditingBill(null);
      toast.success("Bill details updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update bill.");
    },
  });

  const deleteBillMutation = useMutation({
    mutationFn: (billId: number) => paymentsApi.delete(billId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      setDeletingBill(null);
      toast.success("Bill deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete bill.");
    },
  });

  const deleteEmailMutation = useMutation({
    mutationFn: (emailId: number) => emailApi.deleteHistory(emailId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-emails", roomId] });
      toast.success("Email history deleted.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete email history.");
    },
  });

  const uploadDocMutation = useMutation({
    mutationFn: async () => {
      if (!docFile || !tenant?.id) return;
      const fd = new FormData();
      fd.append("tenant", String(tenant.id));
      fd.append("document", docFile);
      if (docName) fd.append("name", docName);
      return tenantDocumentsApi.upload(fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      setIsDocModalOpen(false);
      setDocName("");
      setDocFile(null);
      toast.success("Document uploaded successfully.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to upload document.");
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: (docId: number) => tenantDocumentsApi.delete(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      toast.success("Document deleted.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete document.");
    },
  });

  // Handlers
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordPaymentMutation.mutate({
      amount: parseFloat(paymentData.amount),
      payment_received_date: paymentData.payment_received_date,
      remarks: paymentData.remarks,
    });
  };

  const handleEditBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBill) return;
    updateBillMutation.mutate({
      id: editingBill.id,
      data: {
        billing_month: editForm.billing_month,
        previous_units: parseInt(editForm.previous_units) || 0,
        current_units: parseInt(editForm.current_units) || 0,
        electricity: parseFloat(editForm.electricity) || 0,
        rent: parseFloat(editForm.rent) || 0,
        water: parseFloat(editForm.water) || 0,
        waste: parseFloat(editForm.waste) || 0,
        internet: parseFloat(editForm.internet) || 0,
        status: editForm.status,
        total_paid: parseFloat(editForm.total_paid) || 0,
        payment_received_date: editForm.payment_received_date || null,
        remarks: editForm.remarks || "",
        is_meter_reset: Boolean(editForm.is_meter_reset),
        meter_reset_reason: editForm.is_meter_reset ? (editForm.meter_reset_reason || "") : "",
        old_meter_reading: editForm.is_meter_reset && editForm.old_meter_reading ? parseInt(editForm.old_meter_reading) : null,
        additional_units: editForm.is_meter_reset ? (parseInt(editForm.additional_units) || 0) : 0,
      },
    });
  };

  const openEditBill = (bill: any) => {
    setEditingBill(bill);
    setEditForm({
      billing_month: bill.billing_month || "",
      previous_units: String(bill.previous_units ?? 0),
      current_units: String(bill.current_units ?? 0),
      electricity: String(bill.electricity ?? 0),
      rent: String(bill.rent ?? 0),
      water: String(bill.water ?? 0),
      waste: String(bill.waste ?? 0),
      internet: String(bill.internet ?? 0),
      status: (bill.status as "Paid" | "Unpaid" | "Partially Paid") || "Unpaid",
      total_paid: String(bill.total_paid ?? 0),
      payment_received_date: bill.payment_received_date || "",
      remarks: bill.remarks || "",
      is_meter_reset: Boolean(bill.is_meter_reset),
      meter_reset_reason: bill.meter_reset_reason || "",
      old_meter_reading: bill.old_meter_reading != null ? String(bill.old_meter_reading) : "",
      additional_units: String(bill.additional_units ?? 0),
    });
    setViewingBill(null);
  };

  const handleQuickStatusChange = (bill: any, newStatus: "Paid" | "Unpaid" | "Partially Paid") => {
    const payload: any = { status: newStatus };
    if (newStatus === "Paid") {
      payload.total_paid = bill.total;
      if (!bill.payment_received_date) {
        payload.payment_received_date = todayNepaliDate;
      }
    } else if (newStatus === "Unpaid") {
      payload.total_paid = 0;
    }
    updateBillMutation.mutate({
      id: bill.id,
      data: payload,
    });
  };

  // Add Bill calculations
  const parsedCurrentUnits = parseInt(addBillForm.current_units);
  const effectivePreviousUnits = addBillForm.is_meter_reset
    ? (parseInt(addBillForm.previous_units) || 0)
    : nextPreviousUnits;
  const newMeterUnits = !isNaN(parsedCurrentUnits) ? Math.max(0, parsedCurrentUnits - effectivePreviousUnits) : 0;
  const additionalOldUnits = addBillForm.is_meter_reset ? (parseInt(addBillForm.additional_units) || 0) : 0;
  const unitsUsed = newMeterUnits + additionalOldUnits;
  const electricityRate = parseFloat(tenant?.electricity_price_per_unit || tenant?.electricityPricePerUnit || "15");
  const estimatedElectricity = unitsUsed * electricityRate;
  const estimatedRent = parseFloat(tenant?.rent_price || "0");
  const estimatedWater = parseFloat(tenant?.water_price || "0");
  const estimatedWaste = parseFloat(tenant?.waste_price || "0");
  const estimatedInternet = parseFloat(tenant?.internet_price || "0");
  const estimatedTotal = estimatedElectricity + estimatedRent + estimatedWater + estimatedWaste + estimatedInternet;
  const isUnitValid = addBillForm.is_meter_reset
    ? (!isNaN(parsedCurrentUnits) && parsedCurrentUnits >= effectivePreviousUnits)
    : (!isNaN(parsedCurrentUnits) && parsedCurrentUnits > nextPreviousUnits);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-slate-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link href="/houses" className="mb-1 flex items-center text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="mr-1 h-4 w-4" />
            {t("roomDetail.backToHouses")}
          </Link>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              {room?.room_name || `${t("rooms.room")} ${room?.room_number}`}
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                room?.is_occupied ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${room?.is_occupied ? "bg-emerald-600" : "bg-slate-500"}`}></span>
              {room?.is_occupied ? t("roomDetail.occupied") : t("roomDetail.vacant")}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {tenant ? t("roomDetail.tenantSubtitle") : t("roomDetail.noTenantSubtitle")}
          </p>
        </div>

        {/* Desktop Tenant Actions */}
        <div className="hidden sm:flex items-center gap-2">
          {tenant ? (
            <>
              <button
                onClick={openTenantModal}
                className="btn-primary inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold shadow-sm"
              >
                <Pencil className="h-4 w-4" />
                {t("roomDetail.editTenant")}
              </button>
              <button
                onClick={() => setShowTenantProfile(!showTenantProfile)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Eye className="h-4 w-4" />
                {showTenantProfile ? t("roomDetail.hideTenantProfile") : t("roomDetail.viewTenantProfile")}
              </button>
            </>
          ) : (
            <button
              onClick={openTenantModal}
              className="btn-primary inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4" />
              {t("roomDetail.assignTenant")}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Segmented Tab Controls (md:hidden) */}
      <div className="md:hidden">
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600 shadow-inner">
          <button
            type="button"
            onClick={() => setMobileTab("bills")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 transition-all ${
              mobileTab === "bills"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-4 w-4 text-indigo-600" />
            <span>{t("roomDetail.tabBills")}</span>
            {unpaidCount > 0 && (
              <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                {unpaidCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("tenant")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 transition-all ${
              mobileTab === "tenant"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="h-4 w-4 text-emerald-600" />
            <span>{t("roomDetail.tabTenant")}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("docs")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 transition-all ${
              mobileTab === "docs"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FolderOpen className="h-4 w-4 text-sky-600" />
            <span>{t("roomDetail.tabDocs")}</span>
            {documents.length > 0 && (
              <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                {documents.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Content Container (md:hidden) */}
      <div className="md:hidden space-y-4">
        {mobileTab === "bills" && (
          <div className="space-y-3.5">
            {/* Quick Action Bar */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openAddBillModal(false)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition"
                >
                  <Plus className="h-4 w-4" />
                  {t("roomDetail.addNewBill")}
                </button>
                <button
                  onClick={openPaymentModal}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition"
                >
                  <Banknote className="h-4 w-4" />
                  {t("roomDetail.recordPayment")}
                </button>
              </div>

              {/* Secondary Quick Action Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => openAddBillModal(true)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 font-semibold text-amber-800 shadow-2xs hover:bg-amber-100"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
                  {t("roomDetail.resetChangeMeter")}
                </button>
                {unpaidCount > 0 && (
                  <button
                    onClick={() => setIsPendingEmailModalOpen(true)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-sky-300 bg-sky-50 px-2.5 py-1.5 font-semibold text-sky-700 shadow-2xs hover:bg-sky-100"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {t("roomDetail.sendBillsNotice")}
                  </button>
                )}
                <button
                  onClick={() => setIsEmailHistoryOpen(true)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-violet-300 bg-violet-50 px-2.5 py-1.5 font-semibold text-violet-700 shadow-2xs hover:bg-violet-100"
                >
                  <FileText className="h-3.5 w-3.5" />
                  {t("roomDetail.sentEmailsHistory")}
                </button>
              </div>
            </div>

            {/* Total Amount to Receive Card */}
            <div className="rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 via-orange-50/40 to-amber-50 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                    {locale === "ne" ? "प्राप्त गर्नुपर्ने कुल रकम" : "Total to receive"}
                  </p>
                  <p className="font-display text-2xl font-extrabold text-rose-700">Rs. {totalAmountToReceive}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
                    {unpaidCount} {t("dashboard.unpaid")}
                  </span>
                  {partialCount > 0 && (
                    <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">
                      {partialCount} {t("dashboard.partiallyPaid")}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between border-t border-rose-100 pt-2 text-xs text-slate-600">
                <span>{t("roomDetail.totalCollected")}: <strong className="text-emerald-700 font-bold">Rs. {totalPaidAll}</strong></span>
                {unpaidCount > 0 && (
                  <button
                    onClick={() => setIsPendingEmailModalOpen(true)}
                    className="text-xs font-bold text-rose-700 underline"
                  >
                    {locale === "ne" ? "बाँकी बिलहरू" : "View pending"}
                  </button>
                )}
              </div>
            </div>

            {/* Opening Balance Warning if exists */}
            {tenant && parseFloat(openingBalance) > 0 && parseFloat(openingBalanceRemaining) > 0 && (
              <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-3 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <div className="text-xs">
                    <h4 className="font-bold text-red-900">{t("roomDetail.prevBalanceDue")}</h4>
                    <p className="mt-0.5 text-red-800">
                      <strong>Rs. {openingBalanceRemaining}</strong> {t("roomDetail.prevBalanceOwedBefore")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Unapplied balance */}
            {parseFloat(totalUnapplied) > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <div className="rounded-full bg-amber-100 p-1.5 text-amber-600 shrink-0">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-amber-900">Unapplied balance</p>
                    <p className="mt-0.5 text-amber-700">
                      Rs. {totalUnapplied} from receipts is yet to be allocated.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Latest receipt preview with undo */}
            {latestReceipt && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-3 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-indigo-900">Latest Receipt #{latestReceipt.id}</span>
                    <p className="text-[11px] text-indigo-700 mt-0.5">Rs. {latestReceipt.amount} &middot; {latestReceipt.received_date}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReversingReceipt(latestReceipt)}
                    className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2 py-1 text-[11px] font-bold text-rose-700 shadow-2xs hover:bg-rose-50"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Undo
                  </button>
                </div>
              </div>
            )}

            {/* Streamlined Mobile Billing Cards */}
            <div className="space-y-3">
              {payments.map((payment: any) => {
                const unitDiff = (Number(payment.current_units) - Number(payment.previous_units)) + (Number(payment.additional_units) || 0);
                const isExpanded = expandedBillId === payment.id;
                const dueAmount = Math.max(0, Number(payment.total) - Number(payment.total_paid));

                return (
                  <article key={payment.id} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:border-slate-300">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-display text-base font-bold text-slate-900">{payment.billing_month}</h3>
                          {payment.is_meter_reset && (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300">
                              <RotateCcw className="h-2.5 w-2.5 text-amber-600" />
                              {t("roomDetail.meterReset")}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {payment.previous_units} → {payment.current_units} ({unitDiff} {t("roomDetail.units")})
                          {payment.is_meter_reset && Number(payment.additional_units) > 0 && ` (+${payment.additional_units})`}
                        </p>
                      </div>

                      {/* Quick status dropdown */}
                      <div className="shrink-0 text-right">
                        <select
                          value={payment.status}
                          disabled={updateBillMutation.isPending}
                          onChange={(e) => handleQuickStatusChange(payment, e.target.value as any)}
                          aria-label="Payment status"
                          className={`rounded-full px-2.5 py-1 text-xs font-bold border cursor-pointer transition shadow-2xs ${
                            payment.status === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : payment.status === "Partially Paid"
                              ? "bg-amber-50 text-amber-700 border-amber-300"
                              : "bg-red-50 text-red-700 border-red-300"
                          }`}
                        >
                          <option value="Paid">✓ {t("dashboard.paid")}</option>
                          <option value="Partially Paid">⏳ {t("dashboard.partiallyPaid")}</option>
                          <option value="Unpaid">✕ {t("dashboard.unpaid")}</option>
                        </select>
                      </div>
                    </div>

                    {/* Meter reset detail note if reset */}
                    {payment.is_meter_reset && (
                      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/70 p-2 text-xs text-amber-900">
                        <div className="flex items-center gap-1 font-semibold text-amber-800">
                          <RotateCcw className="h-3 w-3 text-amber-600" />
                          <span>{t("roomDetail.meterDamagedReset")}</span>
                        </div>
                        {payment.meter_reset_reason && (
                          <p className="mt-0.5 text-amber-700 text-[11px]">{payment.meter_reset_reason}</p>
                        )}
                        {payment.old_meter_reading != null && (
                          <p className="mt-0.5 text-amber-700 text-[11px]">{t("roomDetail.damagedMeterFinal")}: {payment.old_meter_reading}</p>
                        )}
                      </div>
                    )}

                    {/* Core Amounts Row */}
                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-center text-xs">
                      <div>
                        <p className="text-[10px] font-semibold uppercase text-slate-500">{t("dashboard.billed")}</p>
                        <p className="mt-0.5 font-display font-bold text-slate-900">Rs. {payment.total}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase text-emerald-700">{t("roomDetail.paidCol")}</p>
                        <p className="mt-0.5 font-display font-bold text-emerald-700">Rs. {payment.total_paid}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase text-rose-600">{t("roomDetail.dueCol")}</p>
                        <p className={`mt-0.5 font-display font-bold ${dueAmount > 0 ? "text-rose-700" : "text-slate-400"}`}>
                          Rs. {dueAmount}
                        </p>
                      </div>
                    </div>

                    {/* Collapsible Utility Breakdown */}
                    {isExpanded && (
                      <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-sky-50/70 p-2">
                            <span className="text-[10px] uppercase text-sky-700">{t("dashboard.electricity")}</span>
                            <p className="font-bold text-sky-800">Rs. {payment.electricity}</p>
                          </div>
                          <div className="rounded-lg bg-orange-50/70 p-2">
                            <span className="text-[10px] uppercase text-orange-700">{t("roomDetail.rentCol")}</span>
                            <p className="font-bold text-orange-800">Rs. {payment.rent}</p>
                          </div>
                          <div className="rounded-lg bg-cyan-50/70 p-2">
                            <span className="text-[10px] uppercase text-cyan-700">{t("roomDetail.waterCol")}</span>
                            <p className="font-bold text-cyan-800">Rs. {payment.water}</p>
                          </div>
                          <div className="rounded-lg bg-purple-50/70 p-2">
                            <span className="text-[10px] uppercase text-purple-700">{t("dashboard.internet")}</span>
                            <p className="font-bold text-purple-800">Rs. {payment.internet}</p>
                          </div>
                        </div>
                        {payment.waste > 0 && (
                          <p className="text-[11px] text-slate-500">{t("roomDetail.wasteCol")}: Rs. {payment.waste}</p>
                        )}
                        {payment.payment_received_date && (
                          <p className="text-[11px] text-slate-500">{t("roomDetail.paymentDate")}: {payment.payment_received_date}</p>
                        )}
                        {payment.remarks && (
                          <p className="text-[11px] text-slate-500">{t("roomDetail.remarks")}: {payment.remarks}</p>
                        )}
                      </div>
                    )}

                    {/* Toggle Details & Actions Row */}
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                      <button
                        type="button"
                        onClick={() => setExpandedBillId(isExpanded ? null : payment.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3.5 w-3.5" />
                            {t("roomDetail.hideBreakdown")}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3.5 w-3.5" />
                            {t("roomDetail.showBreakdown")}
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewingBill(payment)}
                          className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 active:scale-95 transition"
                          title={t("common.view")}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>{t("common.view")}</span>
                        </button>
                        <button
                          onClick={() => openEditBill(payment)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 active:scale-95 transition"
                          title={t("common.edit")}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>{t("common.edit")}</span>
                        </button>
                        <button
                          onClick={() => sendSingleBillMutation.mutate(payment.id)}
                          disabled={payment.status === "Paid" || sendSingleBillMutation.isPending}
                          className="inline-flex items-center justify-center rounded-lg bg-sky-50 p-1.5 text-sky-700 hover:bg-sky-100 disabled:opacity-40 active:scale-95 transition"
                          title={t("roomDetail.sendEmailAction")}
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingBill(payment)}
                          className="inline-flex items-center justify-center rounded-lg bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100 active:scale-95 transition"
                          title={t("common.delete")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {payments.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <FileText className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-sm font-semibold text-slate-700">{t("roomDetail.noBillingHistory")}</p>
                  <button
                    onClick={() => openAddBillModal(false)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t("roomDetail.addNewBill")}
                  </button>
                </div>
              )}

              {/* Mobile pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">{t("roomDetail.page")} {currentPage} {t("roomDetail.of")} {totalPages}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`h-8 w-8 rounded-lg text-xs font-semibold ${
                          page === currentPage
                            ? "bg-slate-900 text-white"
                            : "border border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {mobileTab === "tenant" && (
          <div className="space-y-4">
            {/* Opening Balance Warning if exists */}
            {tenant && parseFloat(openingBalance) > 0 && parseFloat(openingBalanceRemaining) > 0 && (
              <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-3.5 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <div className="text-xs">
                    <h3 className="font-bold text-red-900">{t("roomDetail.prevBalanceDue")}</h3>
                    <p className="mt-0.5 text-red-800">
                      <strong>Rs. {openingBalanceRemaining}</strong> {t("roomDetail.prevBalanceOwedBefore")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tenant Profile Card */}
            {tenant ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900">{tenant.name || tenant.full_name}</h2>
                    <p className="text-xs text-slate-500">{tenant.client_code ? `Code: ${tenant.client_code}` : t("roomDetail.tenantProfile")}</p>
                  </div>
                  <button
                    onClick={openTenantModal}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t("roomDetail.editTenant")}
                  </button>
                </div>

                {/* Direct Contact Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {tenant.contact || tenant.phone_number ? (
                    <a
                      href={`tel:${tenant.contact || tenant.phone_number}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
                    >
                      <Phone className="h-4 w-4 text-emerald-600" />
                      <span>{t("roomDetail.call")} ({tenant.contact || tenant.phone_number})</span>
                    </a>
                  ) : (
                    <div className="rounded-xl bg-slate-50 p-2 text-center text-xs text-slate-400">
                      No phone
                    </div>
                  )}

                  {tenant.email ? (
                    <a
                      href={`mailto:${tenant.email}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-50 px-3 py-2.5 text-xs font-bold text-sky-800 border border-sky-200 hover:bg-sky-100 transition truncate"
                    >
                      <Mail className="h-4 w-4 text-sky-600 shrink-0" />
                      <span className="truncate">{t("roomDetail.email")}</span>
                    </a>
                  ) : (
                    <div className="rounded-xl bg-slate-50 p-2 text-center text-xs text-slate-400">
                      No email
                    </div>
                  )}
                </div>

                {/* Rates & Lease Details */}
                <div className="space-y-2.5 border-t border-slate-100 pt-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("roomDetail.leaseDetails")}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <span className="text-[10px] uppercase text-slate-500">{t("roomDetail.monthlyRent")}</span>
                      <p className="mt-0.5 font-bold text-emerald-700">Rs. {tenant.rent_price || 0}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <span className="text-[10px] uppercase text-slate-500">{t("roomDetail.electricity")}</span>
                      <p className="mt-0.5 font-bold text-amber-700">Rs. {tenant.electricity_price_per_unit || tenant.electricityPricePerUnit || 0}/unit</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <span className="text-[10px] uppercase text-slate-500">{t("roomDetail.waterWasteInternet")}</span>
                      <p className="mt-0.5 font-bold text-cyan-700">
                        Rs. {(parseFloat(tenant.water_price || "0") + parseFloat(tenant.waste_price || "0") + parseFloat(tenant.internet_price || "0"))}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <span className="text-[10px] uppercase text-slate-500">{t("roomDetail.moveInDate")}</span>
                      <p className="mt-0.5 font-semibold text-slate-900">{tenant.move_in_date || tenant.moveInDate || "-"}</p>
                    </div>
                  </div>
                  {parseFloat(openingBalance) > 0 && (
                    <div className="rounded-lg bg-rose-50 p-2.5 text-xs">
                      <span className="text-[10px] uppercase text-rose-600">{t("roomDetail.openingBalance")}</span>
                      <p className="font-bold text-rose-700">Rs. {openingBalance}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center">
                <User className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-2 text-sm font-bold text-slate-900">{t("roomDetail.noTenantSubtitle")}</h3>
                <p className="mt-1 text-xs text-slate-500">{t("roomDetail.noTenantAssigned")}</p>
                <button
                  onClick={openTenantModal}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  {t("roomDetail.assignTenant")}
                </button>
              </div>
            )}

            {/* Room Details Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4 text-sky-600" />
                <h3 className="font-display text-sm font-bold text-slate-900">{t("roomDetail.roomSummary")}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <span className="text-[10px] uppercase text-slate-500">{t("roomDetail.house")}</span>
                  <p className="mt-0.5 font-bold text-slate-900">{room?.house_name || "-"}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <span className="text-[10px] uppercase text-slate-500">{t("roomDetail.roomNumber")}</span>
                  <p className="mt-0.5 font-bold text-slate-900">{room?.room_number}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {mobileTab === "docs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">{t("roomDetail.tenantDocuments")}</h3>
                <p className="text-xs text-slate-500">{t("roomDetail.uploadDocsDesc")}</p>
              </div>
              {tenant && (
                <button
                  onClick={() => setIsDocModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("roomDetail.upload")}
                </button>
              )}
            </div>

            {documents.length > 0 ? (
              <ul className="space-y-2.5">
                {documents.map((doc: any) => {
                  const docUrl = getMediaUrl(doc.document);
                  return (
                    <li key={doc.id} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-900 truncate">{doc.name || t("roomDetail.documents")}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {docUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewDoc({ url: docUrl, name: doc.name || "Document" })}
                            className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>{t("common.view")}</span>
                          </button>
                        )}
                        {docUrl && (
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteDocMutation.mutate(doc.id)}
                          className="inline-flex items-center justify-center rounded-md bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                <FolderOpen className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-sm font-semibold text-slate-900">{t("roomDetail.noDocumentsUploaded")}</p>
                <p className="text-xs text-slate-500 mt-1">{t("roomDetail.uploadDocsDesc")}</p>
                {tenant && (
                  <button
                    onClick={() => setIsDocModalOpen(true)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t("roomDetail.upload")}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop View (hidden md:block) */}
      <div className="hidden md:block space-y-6">
      {/* Opening Balance Warning */}
      {tenant && parseFloat(openingBalance) > 0 && parseFloat(openingBalanceRemaining) > 0 && (
        <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <h3 className="text-sm font-bold text-red-900">{t("roomDetail.prevBalanceDue")}</h3>
              <p className="mt-1 text-sm text-red-800">
                <strong>Rs. {openingBalanceRemaining}</strong> {t("roomDetail.prevBalanceOwedBefore")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tenant Profile Card */}
      {tenant && showTenantProfile && (
        <div className="card animate-scale-in p-4 sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">{t("roomDetail.tenantProfile")}</h2>
              <p className="mt-1 text-sm text-slate-500">{t("roomDetail.tenantProfileDesc")}</p>
            </div>
            <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-600"></span>{t("houses.active")}
              </span>
              <button
                onClick={openTenantModal}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" />{t("roomDetail.editTenant")}
              </button>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { label: t("roomDetail.clientCode"), value: tenant.client_code || "-", border: "border-sky-500" },
              { label: t("roomDetail.name"), value: tenant.name || tenant.full_name, border: "border-sky-400" },
              { label: t("roomDetail.contact"), value: tenant.contact || tenant.phone_number, border: "border-slate-400" },
              { label: t("roomDetail.email"), value: tenant.email || "-", border: "border-slate-400" },
              { label: t("roomDetail.moveInDate"), value: tenant.move_in_date || tenant.moveInDate || "-", border: "border-violet-500" },
              { label: t("roomDetail.monthlyRent"), value: `Rs. ${tenant.rent_price || 0}`, border: "border-emerald-500", color: "text-emerald-600" },
              { label: t("roomDetail.electricity"), value: `Rs. ${tenant.electricity_price_per_unit || tenant.electricityPricePerUnit || 0}/unit`, border: "border-amber-500", color: "text-orange-600" },
              { label: t("roomDetail.waterWasteInternet"), value: `Rs. ${tenant.water_price || 0} + ${tenant.waste_price || 0} + ${tenant.internet_price || 0}`, border: "border-cyan-500", color: "text-cyan-600" },
              { label: t("roomDetail.openingBalance"), value: `Rs. ${openingBalance}`, border: "border-rose-500", color: parseFloat(openingBalance) > 0 ? "text-red-600" : "text-slate-600" },
            ].map((item) => (
              <div key={item.label} className={`border-l-4 ${item.border} pl-4`}>
                <p className="section-header">{item.label}</p>
                <p className={`mt-1 font-display text-base font-bold text-slate-900 ${item.color || ""}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing Summary Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card p-3">
          <p className="section-header">{t("roomDetail.totalPending")}</p>
          <p className="mt-1 font-display text-lg font-bold text-rose-700">Rs. {totalAmountToReceive}</p>
        </div>
        <div className="stat-card p-3">
          <p className="section-header">{t("dashboard.unpaid")}</p>
          <p className="mt-1 font-display text-lg font-bold text-red-700">{unpaidCount}</p>
        </div>
        <div className="stat-card p-3">
          <p className="section-header">{t("dashboard.partiallyPaid")}</p>
          <p className="mt-1 font-display text-lg font-bold text-amber-700">{partialCount}</p>
        </div>
        <div className="stat-card p-3">
          <p className="section-header">{t("roomDetail.totalCollected")}</p>
          <p className="mt-1 font-display text-lg font-bold text-emerald-700">
            Rs. {totalPaidAll}
          </p>
        </div>
      </div>

      {/* Total Amount to Receive Banner */}
      <div className="rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 via-orange-50/50 to-amber-50 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">
              {locale === "ne" ? "प्राप्त गर्नुपर्ने कुल रकम" : "Total amount to be received"}
            </p>
            <p className="mt-1 font-display text-3xl font-extrabold text-rose-700">Rs. {totalAmountToReceive}</p>
            <p className="mt-1 text-sm text-slate-600">
              {locale === "ne"
                ? `${unpaidCount} बाँकी बिलहरूको रकम उठाउन बाँकी छ`
                : `${unpaidCount} pending bill${unpaidCount !== 1 ? "s" : ""} need collection`}
            </p>
            {parseFloat(openingBalance) > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                {locale === "ne" ? "यसमा अघिल्लो बाँकी बक्यौता रकम पनि समावेश छ।" : "Includes previous balance due."}
              </p>
            )}
          </div>
          {unpaidCount > 0 && (
            <button
              onClick={() => setIsPendingEmailModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50"
            >
              <Eye className="h-4 w-4" />
              {locale === "ne" ? "बाँकी बिलहरू हेर्नुहोस्" : "View pending bills"}
            </button>
          )}
        </div>
      </div>

      {/* Unapplied Balance */}
      {parseFloat(totalUnapplied) > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-amber-100 p-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Unapplied balance</p>
              <p className="mt-1 text-sm text-amber-700">
                Rs. {totalUnapplied} from payment receipts is yet to be allocated to bills.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Latest Receipt */}
      {latestReceipt && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Latest payment receipt</p>
              <p className="mt-1 text-sm font-semibold text-indigo-900">
                Amount: Rs. {latestReceipt.amount} | Allocated: Rs. {latestReceipt.allocated_amount} | Unapplied: Rs. {latestReceipt.unapplied_amount}
              </p>
              <p className="mt-1 text-xs text-indigo-700">
                Received: {latestReceipt.received_date}{latestReceipt.remarks ? ` | Remarks: ${latestReceipt.remarks}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReversingReceipt(latestReceipt)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50 w-fit"
              title="Undo this payment and restore bills"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Undo payment
            </button>
          </div>
          {latestReceipt.allocations && latestReceipt.allocations.length > 0 && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {latestReceipt.allocations.map((alloc: any, idx: number) => (
                <div key={idx} className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs text-slate-700">
                  <span className="font-semibold">{alloc.billing_month || alloc.payment_history?.billing_month}</span>
                  <span className="mx-1">-</span>
                  <span>Rs. {alloc.allocated_amount}</span>
                  <span className="ml-1 text-slate-500">({alloc.payment_status || alloc.status || alloc.payment_history?.status})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Receipts History */}
      {recentReceipts.length > 0 && (
        <details className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" open={recentReceipts.length > 0 && !latestReceipt}>
          <summary className="cursor-pointer text-sm font-semibold text-slate-700">
            Payment receipt history (last {recentReceipts.length})
          </summary>
          <div className="mt-3 space-y-2">
            {recentReceipts.map((receipt: any, idx: number) => (
              <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Receipt #{receipt.id} &middot; {receipt.received_date} | Rs. {receipt.amount}
                    </p>
                    <p className="text-xs text-slate-600">
                      Allocated: Rs. {receipt.allocated_amount} | Unapplied: Rs. {receipt.unapplied_amount}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReversingReceipt(receipt)}
                    className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 w-fit"
                    title="Undo this payment and restore bills"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Undo receipt
                  </button>
                </div>
                {receipt.allocations && receipt.allocations.length > 0 && (
                  <p className="mt-2 text-xs text-slate-600">
                    {receipt.allocations.slice(0, 4).map((a: any) =>
                      `${a.billing_month || a.payment_history?.billing_month}: Rs. ${a.allocated_amount}`
                    ).join(", ")}
                    {receipt.allocations.length > 4 ? "..." : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Billing History Section */}
      <div className="card p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">{t("roomDetail.billingHistory")}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {tenant ? t("roomDetail.tenantSubtitle") : t("roomDetail.noTenantSubtitle")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openPaymentModal}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <Banknote className="h-4 w-4" />
              1) {t("roomDetail.recordPayment")}
            </button>
            <button
              onClick={() => openAddBillModal(false)}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              2) {t("roomDetail.addNewBill")}
            </button>
            <button
              onClick={() => openAddBillModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm font-semibold text-amber-800 shadow-xs hover:bg-amber-100 transition-colors"
              title={t("roomDetail.resetChangeMeter")}
            >
              <RotateCcw className="h-4 w-4 text-amber-600" />
              {t("roomDetail.resetChangeMeter")}
            </button>
            {unpaidCount > 0 && (
              <button
                onClick={() => setIsPendingEmailModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-100 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-200"
              >
                <Mail className="h-4 w-4" />
                3) {t("roomDetail.sendBillsNotice")}
              </button>
            )}
            <button
              onClick={() => setIsEmailHistoryOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-100 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-200"
            >
              <FileText className="h-4 w-4" />
              {t("roomDetail.sentEmailsHistory")}
            </button>
          </div>
        </div>

        {/* Desktop billing table */}
        <div className="-mx-4 w-auto overflow-x-auto px-4 sm:mx-0 sm:w-full sm:px-0">
          <table className="w-full min-w-[980px] text-left text-xs sm:text-sm">
            <thead className="border-b-2 border-slate-200 bg-slate-50">
              <tr>
                <th className="section-header px-4 py-4 text-left">{t("roomDetail.date")}</th>
                <th className="section-header px-4 py-4 text-left">{t("roomDetail.month")}</th>
                <th className="section-header px-4 py-4 text-left">{t("roomDetail.units")}</th>
                <th className="section-header px-4 py-4 text-right">{t("dashboard.electricity")}</th>
                <th className="section-header px-4 py-4 text-right">{t("roomDetail.rentCol")}</th>
                <th className="section-header px-4 py-4 text-right">{t("roomDetail.waterCol")}</th>
                <th className="section-header px-4 py-4 text-right">{t("roomDetail.wasteCol")}</th>
                <th className="section-header px-4 py-4 text-right">{t("dashboard.internet")}</th>
                <th className="section-header px-4 py-4 text-right font-bold">{t("dashboard.billed")}</th>
                <th className="section-header px-4 py-4 text-right">{t("roomDetail.paidCol")}</th>
                <th className="section-header px-4 py-4 text-center">{t("roomDetail.statusCol")}</th>
                <th className="section-header px-4 py-4 text-center">{t("roomDetail.actionsCol")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.map((payment: any) => {
                const unitDiff = (Number(payment.current_units) - Number(payment.previous_units)) + (Number(payment.additional_units) || 0);
                return (
                  <tr key={payment.id} className="bg-white transition-colors hover:bg-slate-50">
                    <td className="px-4 py-4 font-medium text-slate-900">
                      {new Date(payment.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{payment.billing_month}</span>
                        {payment.is_meter_reset && (
                          <span
                            className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300"
                            title={payment.meter_reset_reason || "Meter Reset / Replaced"}
                          >
                            <RotateCcw className="h-2.5 w-2.5 text-amber-600" />
                            {t("roomDetail.meterResetBadge")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-slate-900">
                          {payment.previous_units} → {payment.current_units} = {unitDiff}
                        </span>
                        {payment.is_meter_reset && (
                          <span className="text-[11px] text-amber-700 font-medium">
                            {Number(payment.additional_units) > 0 ? `(+${payment.additional_units} old units)` : "(meter changed)"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-900">Rs. {payment.electricity}</td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-900">Rs. {payment.rent}</td>
                    <td className="px-4 py-4 text-right text-slate-900">Rs. {payment.water}</td>
                    <td className="px-4 py-4 text-right text-slate-900">Rs. {payment.waste}</td>
                    <td className="px-4 py-4 text-right text-slate-900">Rs. {payment.internet}</td>
                    <td className="px-4 py-4 text-right text-lg font-bold text-slate-900">Rs. {payment.total}</td>
                    <td className="px-4 py-4 text-right font-semibold text-emerald-600">Rs. {payment.total_paid}</td>
                    <td className="px-4 py-4 text-center">
                      <select
                        value={payment.status}
                        disabled={updateBillMutation.isPending}
                        onChange={(e) => handleQuickStatusChange(payment, e.target.value as any)}
                        aria-label="Payment status"
                        className={`rounded-full px-2.5 py-1 text-xs font-bold border cursor-pointer transition shadow-xs ${
                          payment.status === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                            : payment.status === "Partially Paid"
                            ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                            : "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                        }`}
                      >
                        <option value="Paid">✓ {t("dashboard.paid")}</option>
                        <option value="Partially Paid">⏳ {t("dashboard.partiallyPaid")}</option>
                        <option value="Unpaid">✕ {t("dashboard.unpaid")}</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col justify-center gap-1 sm:flex-row">
                        <button onClick={() => setViewingBill(payment)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50">
                          <Eye className="h-3.5 w-3.5" />{t("common.view")}
                        </button>
                        <button onClick={() => openEditBill(payment)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50">
                          <Pencil className="h-3.5 w-3.5" />{t("common.edit")}
                        </button>
                        <button onClick={() => sendSingleBillMutation.mutate(payment.id)} disabled={payment.status === "Paid" || sendSingleBillMutation.isPending} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 disabled:opacity-50">
                          <Send className="h-3.5 w-3.5" />{t("roomDetail.sendEmailAction")}
                        </button>
                        <button onClick={() => setDeletingBill(payment)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5" />{t("common.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-6 text-center text-sm text-slate-500">{t("roomDetail.noBillingHistory")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-slate-500">{t("roomDetail.page")} {currentPage} {t("roomDetail.of")} {totalPages}</span>
            <div className="inline-flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} className={`px-3 py-2 text-sm ${page === currentPage ? "border border-slate-300 bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-500 hover:bg-slate-100"}`}>
                  {page}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>

      {/* Room Summary + Documents Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="card p-4 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
              <CreditCard className="h-5 w-5 text-sky-600" />
            </div>
            <h2 className="font-display text-xl font-bold text-gray-900">{t("roomDetail.roomSummary")}</h2>
          </div>
          <div className="space-y-4">
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="section-header">{t("roomDetail.house")}</p>
              <p className="mt-1 font-display text-lg font-bold text-gray-900">{room?.house_name || "-"}</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="section-header">{t("roomDetail.roomNumber")}</p>
              <p className="mt-1 font-display text-lg font-bold text-gray-900">{room?.room_number}</p>
            </div>
            <div className={`border-l-4 ${room?.is_occupied ? "border-emerald-500" : "border-gray-400"} pl-4`}>
              <p className="section-header">{t("common.status")}</p>
              <div className="mt-2">
                {room?.is_occupied ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-bold text-emerald-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>{t("roomDetail.occupied")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-600"></span>{t("roomDetail.vacant")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="font-display text-xl font-bold text-gray-900">{t("roomDetail.tenantDocuments")}</h2>
            </div>
            {tenant && (
              <button
                onClick={() => setIsDocModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5" />{t("roomDetail.upload")}
              </button>
            )}
          </div>
          {documents.length > 0 ? (
            <ul className="space-y-3">
              {documents.map((doc: any) => {
                const docUrl = getMediaUrl(doc.document);
                return (
                  <li key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-slate-100">
                    <div>
                      <p className="font-semibold text-slate-900">{doc.name || t("roomDetail.documents")}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {t("roomDetail.uploaded")}: {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : "-"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {docUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewDoc({ url: docUrl, name: doc.name || "Document" })}
                          className="inline-flex items-center gap-1.5 rounded-md bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-200 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />{t("common.view")}
                        </button>
                      )}
                      {docUrl && (
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-md bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200"
                          title={t("roomDetail.openInNewTab")}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteDocMutation.mutate(doc.id)}
                        className="inline-flex items-center justify-center rounded-md bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 cursor-pointer"
                        title={t("roomDetail.deleteDocument")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="mt-3 text-sm font-semibold text-slate-900">{t("roomDetail.noDocumentsUploaded")}</p>
              <p className="text-xs text-slate-500">{t("roomDetail.uploadDocsDesc")}</p>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* 1) Record Lump-Sum Payment Modal */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>{t("roomDetail.recordLumpSumTitle")}</DialogTitle>
            <p className="text-xs text-slate-500">
              {t("roomDetail.recordLumpSumDesc")}
            </p>
          </DialogHeader>

          {/* Previous receipts & Undo section (Matches Django lump_sum_payment_form.html) */}
          {recentReceipts.length > 0 && (
            <details className="rounded-xl border border-slate-200 bg-slate-50 p-3" open={recentReceipts.length <= 3}>
              <summary className="cursor-pointer text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center justify-between">
                <span>{t("roomDetail.previousReceipts")} ({recentReceipts.length})</span>
                <span className="text-[11px] font-normal text-rose-600">{t("roomDetail.clickUndoToReverse")}</span>
              </summary>
              <div className="mt-2.5 max-h-48 space-y-2 overflow-y-auto pr-1">
                {recentReceipts.map((rcpt: any) => (
                  <div key={rcpt.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 text-xs shadow-xs">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-900 truncate">
                        {t("roomDetail.receipt")} #{rcpt.id} &middot; {rcpt.received_date} &middot; Rs. {rcpt.amount}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {t("roomDetail.allocated")}: Rs. {rcpt.allocated_amount} &middot; {t("roomDetail.unapplied")}: Rs. {rcpt.unapplied_amount}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setReversingReceipt(rcpt);
                      }}
                      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:text-rose-800"
                      title="Undo this payment and restore bills"
                    >
                      <RotateCcw className="h-3 w-3" />
                      {t("roomDetail.undo")}
                    </button>
                  </div>
                ))}
              </div>
            </details>
          )}

          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pay-amount">{t("roomDetail.amountReceived")}</Label>
              <Input
                id="pay-amount"
                type="number"
                step="0.01"
                min="1"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                required
                placeholder="e.g. 15000"
                className="mt-1"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {[5000, 8000, 10000, 15000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPaymentData({ ...paymentData, amount: String(amt) })}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Rs. {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="pay-date">{t("roomDetail.paymentReceivedDateBS")}</Label>
                <button
                  type="button"
                  onClick={() => setPaymentData({ ...paymentData, payment_received_date: todayNepaliDate })}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                >
                  {t("roomDetail.resetToToday")} ({todayNepaliDate})
                </button>
              </div>
              <Input
                id="pay-date"
                type="text"
                value={paymentData.payment_received_date}
                onChange={(e) => setPaymentData({ ...paymentData, payment_received_date: e.target.value })}
                required
                placeholder="YYYY-MM-DD (e.g. 2083-05-21)"
                className="mt-1 font-semibold text-slate-900"
              />
              <p className="mt-1 text-xs text-slate-500">
                {t("roomDetail.autoFilledNepaliDate")} (<strong>{todayNepaliDate}</strong>).
              </p>
            </div>

            <div>
              <Label htmlFor="pay-remarks">{t("roomDetail.remarksReceipt")}</Label>
              <Input
                id="pay-remarks"
                value={paymentData.remarks}
                onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
                placeholder="Optional note for this receipt (e.g. cash, eSewa)"
                className="mt-1"
              />
            </div>

            <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-800">
              {t("roomDetail.fifoPaymentNote")}
            </div>

            <div className="sticky bottom-0 bg-white z-10 pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={recordPaymentMutation.isPending || !paymentData.amount}>
                {recordPaymentMutation.isPending ? t("roomDetail.recording") : t("roomDetail.recordPayment")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2) Add New Monthly Bill Modal */}
      <Dialog open={isAddBillOpen} onOpenChange={setIsAddBillOpen}>
        <DialogContent className="max-w-lg rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("roomDetail.addNewBillTitle")}</DialogTitle>
            <p className="text-xs text-slate-500">{t("roomDetail.addNewBillDesc")}</p>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isUnitValid) return;
              createBillMutation.mutate(addBillForm);
            }}
            className="space-y-4"
          >
            {/* Meter Reset / Damage Toggle */}
            <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-3.5 shadow-2xs">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-start gap-2.5">
                  <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <span className="text-sm font-bold text-amber-950">{t("roomDetail.meterDamagedToggle")}</span>
                    <p className="text-xs text-amber-700">
                      {t("roomDetail.meterDamagedToggleDesc")}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={addBillForm.is_meter_reset}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setAddBillForm({
                      ...addBillForm,
                      is_meter_reset: checked,
                      previous_units: checked ? "0" : String(nextPreviousUnits),
                      old_meter_reading: checked ? String(nextPreviousUnits) : "",
                      additional_units: "0",
                      meter_reset_reason: checked
                        ? (addBillForm.meter_reset_reason || "Meter damaged and replaced with new meter")
                        : "",
                    });
                  }}
                  className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer ml-2"
                />
              </label>

              {addBillForm.is_meter_reset && (
                <div className="mt-3 space-y-3 border-t border-amber-200 pt-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-amber-950 font-semibold">{t("roomDetail.newMeterStart")}</Label>
                      <Input
                        type="number"
                        min="0"
                        value={addBillForm.previous_units}
                        onChange={(e) => setAddBillForm({ ...addBillForm, previous_units: e.target.value })}
                        placeholder="Usually 0 for new meter"
                        className="mt-1 bg-white border-amber-300"
                        required
                      />
                      <p className="mt-1 text-[11px] text-amber-700">{t("roomDetail.newMeterStartDesc")}</p>
                    </div>

                    <div>
                      <Label className="text-amber-950 font-semibold">{t("roomDetail.damagedMeterFinalOptional")}</Label>
                      <Input
                        type="number"
                        min={nextPreviousUnits}
                        value={addBillForm.old_meter_reading}
                        onChange={(e) => {
                          const oldVal = e.target.value;
                          const oldNum = parseInt(oldVal);
                          const addUnits = !isNaN(oldNum) && oldNum >= nextPreviousUnits ? oldNum - nextPreviousUnits : 0;
                          setAddBillForm({
                            ...addBillForm,
                            old_meter_reading: oldVal,
                            additional_units: String(addUnits),
                          });
                        }}
                        placeholder={`e.g. ${nextPreviousUnits}`}
                        className="mt-1 bg-white border-amber-300"
                      />
                      <p className="mt-1 text-[11px] text-amber-700">
                        {t("roomDetail.previousBaselineWas")} {nextPreviousUnits}.
                        {parseInt(addBillForm.additional_units) > 0 && ` (+${addBillForm.additional_units} ${t("roomDetail.oldMeterUnits")})`}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-amber-950 font-semibold">{t("roomDetail.additionalUnitsDamaged")}</Label>
                      <Input
                        type="number"
                        min="0"
                        value={addBillForm.additional_units}
                        onChange={(e) => setAddBillForm({ ...addBillForm, additional_units: e.target.value })}
                        className="mt-1 bg-white border-amber-300"
                      />
                      <p className="mt-1 text-[11px] text-amber-700">{t("roomDetail.additionalOldUnitsDesc")}</p>
                    </div>

                    <div>
                      <Label className="text-amber-950 font-semibold">{t("roomDetail.reasonForMeterReset")}</Label>
                      <Input
                        value={addBillForm.meter_reset_reason}
                        onChange={(e) => setAddBillForm({ ...addBillForm, meter_reset_reason: e.target.value })}
                        placeholder="e.g. Meter damaged by surge, replaced"
                        className="mt-1 bg-white border-amber-300"
                      />
                      <p className="mt-1 text-[11px] text-amber-700">{t("roomDetail.resetReasonDesc")}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!addBillForm.is_meter_reset && (
              <div>
                <Label>{t("roomDetail.previousElectricityUnits")}</Label>
                <Input
                  value={nextPreviousUnits}
                  readOnly
                  disabled
                  className="mt-1 bg-slate-100 text-slate-700 font-semibold cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-slate-400">{t("roomDetail.prevUnitsFromInitial")}</p>
              </div>
            )}

            <div>
              <Label>{t("roomDetail.billingMonth")}</Label>
              <Input
                value={addBillForm.billing_month}
                onChange={(e) => setAddBillForm({ ...addBillForm, billing_month: e.target.value })}
                required
                placeholder="e.g. 2026-09 or 2026-09-01"
                className="mt-1"
              />
            </div>

            <div>
              <Label>
                {addBillForm.is_meter_reset ? t("roomDetail.currentReadingNewMeter") : t("roomDetail.currentElectricityUnits")}
              </Label>
              <Input
                type="number"
                min={effectivePreviousUnits}
                value={addBillForm.current_units}
                onChange={(e) => setAddBillForm({ ...addBillForm, current_units: e.target.value })}
                required
                placeholder={
                  addBillForm.is_meter_reset
                    ? `Current reading on new meter (>= ${effectivePreviousUnits})`
                    : `Must be greater than ${nextPreviousUnits}`
                }
                className="mt-1"
              />
              {!isUnitValid && addBillForm.current_units && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {addBillForm.is_meter_reset
                    ? `Current units must be greater than or equal to new meter starting units (${effectivePreviousUnits}).`
                    : `Current units must be greater than previous units (${nextPreviousUnits}).`}
                </p>
              )}
            </div>

            {/* Live Auto-Calculation Breakdown */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Calculator className="h-3.5 w-3.5" />
                  <span>{t("roomDetail.estimatedBillCalc")}</span>
                </div>
                {addBillForm.is_meter_reset && (
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    {t("roomDetail.meterResetMode")}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded bg-white p-2 border border-slate-100">
                  <span className="text-slate-500">{t("roomDetail.unitsUsed")}:</span>{" "}
                  <span className="font-semibold text-slate-900">{unitsUsed}</span>
                  {addBillForm.is_meter_reset && (
                    <span className="block text-[10px] text-amber-700">
                      ({newMeterUnits} new + {additionalOldUnits} old)
                    </span>
                  )}
                </div>
                <div className="rounded bg-white p-2 border border-slate-100">
                  <span className="text-slate-500">{t("dashboard.electricity")}:</span>{" "}
                  <span className="font-bold text-sky-700">Rs. {estimatedElectricity.toFixed(2)}</span>
                </div>
                <div className="rounded bg-white p-2 border border-slate-100">
                  <span className="text-slate-500">{t("roomDetail.rentCol")}:</span>{" "}
                  <span className="font-semibold text-slate-900">Rs. {estimatedRent}</span>
                </div>
                <div className="rounded bg-white p-2 border border-slate-100">
                  <span className="text-slate-500">{t("roomDetail.waterCol")}:</span>{" "}
                  <span className="font-semibold text-slate-900">Rs. {estimatedWater}</span>
                </div>
                <div className="rounded bg-white p-2 border border-slate-100">
                  <span className="text-slate-500">{t("roomDetail.wasteCol")}:</span>{" "}
                  <span className="font-semibold text-slate-900">Rs. {estimatedWaste}</span>
                </div>
                <div className="rounded bg-white p-2 border border-slate-100">
                  <span className="text-slate-500">{t("dashboard.internet")}:</span>{" "}
                  <span className="font-semibold text-slate-900">Rs. {estimatedInternet}</span>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-900">{t("roomDetail.totalCalculatedBill")}:</span>
                <span className="font-extrabold text-emerald-700 text-base">Rs. {estimatedTotal.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <Label>{t("roomDetail.remarksOptional")}</Label>
              <Input
                value={addBillForm.remarks}
                onChange={(e) => setAddBillForm({ ...addBillForm, remarks: e.target.value })}
                placeholder="Optional remarks"
                className="mt-1"
              />
            </div>

            <div className="sticky bottom-0 bg-white z-10 pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddBillOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={createBillMutation.isPending || !isUnitValid}>
                {createBillMutation.isPending ? t("roomDetail.creating") : t("roomDetail.createBill")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3) Send Pending Bills Modal (Full Django Template Parity) */}
      <Dialog open={isPendingEmailModalOpen} onOpenChange={setIsPendingEmailModalOpen}>
        <DialogContent className="max-w-3xl rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("roomDetail.sendPendingNoticeTitle")}</DialogTitle>
            <p className="text-xs text-slate-500">
              {t("roomDetail.sendPendingNoticeDesc")}
            </p>
          </DialogHeader>

          {isLoadingPendingPreview ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Metric Highlights */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold uppercase text-slate-500">{t("roomDetail.tenant")}</p>
                  <p className="mt-1 font-bold text-slate-900 text-sm">{pendingPreview?.tenant?.name || tenant?.name}</p>
                  <p className="text-slate-500 truncate">{pendingPreview?.tenant?.email || tenant?.email || (locale === "ne" ? "इमेल छैन" : "No email")}</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="font-semibold uppercase text-amber-700">{t("roomDetail.pendingBills")}</p>
                  <p className="mt-1 font-extrabold text-amber-900 text-base">{pendingPreview?.pending_count || 0}</p>
                  <p className="text-amber-600">{t("roomDetail.unpaidPartialBills")}</p>
                </div>
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                  <p className="font-semibold uppercase text-rose-700">{t("roomDetail.currentPending")}</p>
                  <p className="mt-1 font-extrabold text-rose-900 text-base">Rs. {pendingPreview?.current_pending_amount || "0"}</p>
                  <p className="text-rose-600">{t("roomDetail.fromBillRows")}</p>
                </div>
                <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3">
                  <p className="font-semibold uppercase text-emerald-700">{t("roomDetail.totalPayableNow")}</p>
                  <p className="mt-1 font-extrabold text-emerald-900 text-lg">Rs. {pendingPreview?.total_amount_to_be_paid || "0"}</p>
                  <p className="text-emerald-700 font-medium">{t("roomDetail.currentPlusPreviousDue")}</p>
                </div>
              </div>

              {/* Simple Calculation Explanation Box */}
              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs space-y-2">
                <p className="font-bold uppercase tracking-wide text-amber-900">
                  {t("roomDetail.howTotalCalculated")}
                </p>
                <div className="flex justify-between items-center text-slate-700">
                  <span>{t("roomDetail.step1Pending")}</span>
                  <span className="font-bold text-rose-700">Rs. {pendingPreview?.current_pending_amount || "0"}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span>{t("roomDetail.step2PreviousDue")}</span>
                  <span className="font-bold text-rose-700">Rs. {pendingPreview?.previous_due || "0"}</span>
                </div>
                <div className="border-t border-amber-300 pt-1.5 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-900">{t("roomDetail.totalPayableStep")}</span>
                  <span className="font-extrabold text-emerald-800 text-base">Rs. {pendingPreview?.total_amount_to_be_paid || "0"}</span>
                </div>
              </div>

              {/* Included Rooms Table */}
              {pendingPreview?.room_summaries && pendingPreview.room_summaries.length > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                  <p className="text-xs font-semibold text-blue-900 mb-2">{t("roomDetail.roomsIncluded")}</p>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-blue-200 text-blue-800">
                        <th className="py-1">{t("rooms.room")}</th>
                        <th className="py-1">{t("roomDetail.house")}</th>
                        <th className="py-1 text-center">{t("payments.month")}</th>
                        <th className="py-1 text-right">{t("roomDetail.dueCol")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPreview.room_summaries.map((rs: any) => (
                        <tr key={rs.room_id} className="border-b border-blue-100">
                          <td className="py-1 font-semibold text-slate-800">{rs.room_name}</td>
                          <td className="py-1 text-slate-600">{rs.house_name}</td>
                          <td className="py-1 text-center text-slate-700">{rs.count}</td>
                          <td className="py-1 text-right font-bold text-rose-700">Rs. {rs.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Language Switcher */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-700">{t("roomDetail.messageLanguage")}</p>
                  <p className="text-[11px] text-slate-500">{t("roomDetail.switchUpdatesDefault")}</p>
                </div>
                <div className="inline-flex rounded-md border border-slate-300 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setPendingEmailLang("en")}
                    className={`px-3 py-1 text-xs font-semibold rounded ${pendingEmailLang === "en" ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingEmailLang("ne")}
                    className={`px-3 py-1 text-xs font-semibold rounded ${pendingEmailLang === "ne" ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}
                  >
                    नेपाली
                  </button>
                </div>
              </div>

              {/* Email Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendPendingMutation.mutate({
                    subject: pendingEmailSubject,
                    custom_message: pendingEmailMessage,
                  });
                }}
                className="space-y-3"
              >
                <div>
                  <Label>{t("roomDetail.emailSubject")}</Label>
                  <Input
                    value={pendingEmailSubject}
                    onChange={(e) => setPendingEmailSubject(e.target.value)}
                    required
                    className="mt-1 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label>{locale === "ne" ? "इमेल सन्देश" : "Email Message"}</Label>
                  <textarea
                    rows={10}
                    value={pendingEmailMessage}
                    onChange={(e) => setPendingEmailMessage(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="sticky bottom-0 bg-white z-10 pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsPendingEmailModalOpen(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={sendPendingMutation.isPending || !tenant?.email}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {sendPendingMutation.isPending ? t("roomDetail.sendingNotice") : t("roomDetail.sendNotice")}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 4) Room Email History Modal */}
      <Dialog open={isEmailHistoryOpen} onOpenChange={setIsEmailHistoryOpen}>
        <DialogContent className="max-w-3xl rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{t("roomDetail.emailHistoryForRoom")} {room?.room_name || `Room ${room?.room_number}`}</DialogTitle>
                <p className="text-xs text-slate-500">{t("roomDetail.emailHistoryDesc")}</p>
              </div>
              <Link
                href="/emails"
                className="text-xs font-semibold text-sky-600 hover:underline"
              >
                {t("roomDetail.viewAllEmails")}
              </Link>
            </div>
          </DialogHeader>

          {isLoadingEmails ? (
            <div className="py-10 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
            </div>
          ) : (
            <div className="space-y-3">
              {((roomEmails?.items || roomEmails) as any[])?.length > 0 ? (
                <>
                  {/* Mobile Email List */}
                  <div className="space-y-2.5 sm:hidden">
                    {((roomEmails?.items || roomEmails) as any[]).map((email: any) => (
                      <div key={email.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${email.email_type === "pending" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"}`}>
                              {email.email_type === "pending" ? (locale === "ne" ? "बाँकी सूचना" : "Pending notice") : (locale === "ne" ? "मासिक बिल" : "Single bill")}
                            </span>
                            <p className="mt-1 font-semibold text-slate-900 line-clamp-2">{email.subject}</p>
                          </div>
                          <button
                            onClick={() => deleteEmailMutation.mutate(email.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title={t("emails.deleteLog")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2 flex flex-col gap-0.5 border-t border-slate-200/60 pt-1.5 text-[11px] text-slate-500">
                          <span className="truncate">To: {email.recipient_name} ({email.recipient_email})</span>
                          <span>{formatDateTime(email.sent_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold">
                        <tr>
                          <th className="px-3 py-2">{t("emails.sentAt")}</th>
                          <th className="px-3 py-2">{t("emails.type")}</th>
                          <th className="px-3 py-2">{t("emails.recipient")}</th>
                          <th className="px-3 py-2">{t("emails.subject")}</th>
                          <th className="px-3 py-2 text-right">{t("common.action")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {((roomEmails?.items || roomEmails) as any[]).map((email: any) => (
                          <tr key={email.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2.5 text-slate-600">{formatDateTime(email.sent_at)}</td>
                            <td className="px-3 py-2.5">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${email.email_type === "pending" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"}`}>
                                {email.email_type === "pending" ? (locale === "ne" ? "बाँकी सूचना" : "Pending notice") : (locale === "ne" ? "मासिक बिल" : "Single bill")}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-slate-700">
                              <span className="font-semibold">{email.recipient_name}</span>
                              <br />
                              <span className="text-[11px] text-slate-400">{email.recipient_email}</span>
                            </td>
                            <td className="px-3 py-2.5 max-w-xs truncate font-medium text-slate-800">{email.subject}</td>
                            <td className="px-3 py-2.5 text-right">
                              <button
                                onClick={() => deleteEmailMutation.mutate(email.id)}
                                className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title={t("emails.deleteLog")}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-sm text-slate-500">
                  <Mail className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  {t("roomDetail.noSentEmailsRoom")}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 5) Edit Tenant Modal (Full 12 Fields) */}
      <Dialog open={isTenantModalOpen} onOpenChange={setIsTenantModalOpen}>
        <DialogContent className="max-w-xl rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tenant ? t("roomDetail.editTenantTitle") : t("roomDetail.assignTenantTitle")}</DialogTitle>
            <p className="text-xs text-slate-500">{tenant ? t("roomDetail.tenantSubtitle") : t("roomDetail.noTenantSubtitle")}</p>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveTenantMutation.mutate(tenantForm);
            }}
            className="space-y-4"
          >
            {/* Section 1: Personal info */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t("roomDetail.personalInformation")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>{t("roomDetail.fullName")}</Label>
                  <Input
                    value={tenantForm.name}
                    onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("roomDetail.contactNumber")}</Label>
                  <Input
                    value={tenantForm.contact}
                    onChange={(e) => setTenantForm({ ...tenantForm, contact: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("roomDetail.emailOptional")}</Label>
                  <Input
                    type="email"
                    value={tenantForm.email}
                    onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("roomDetail.clientCodeOptional")}</Label>
                  <Input
                    value={tenantForm.client_code}
                    onChange={(e) => setTenantForm({ ...tenantForm, client_code: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Lease details */}
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t("roomDetail.leaseDetails")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>{t("roomDetail.moveInDate")} *</Label>
                  <Input
                    type="date"
                    value={tenantForm.move_in_date}
                    onChange={(e) => setTenantForm({ ...tenantForm, move_in_date: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("roomDetail.openingBalanceField")}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tenantForm.opening_balance}
                    onChange={(e) => setTenantForm({ ...tenantForm, opening_balance: e.target.value })}
                    className="mt-1"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">{t("roomDetail.owedBeforeFirst")}</p>
                </div>
              </div>
            </div>

            {/* Section 3: Service Charges & Initial meter */}
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t("roomDetail.serviceChargesRates")}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <Label>{t("roomDetail.rentPrice")} *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tenantForm.rent_price}
                    onChange={(e) => setTenantForm({ ...tenantForm, rent_price: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("roomDetail.electricityPricePerUnit")} *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tenantForm.electricity_price_per_unit}
                    onChange={(e) => setTenantForm({ ...tenantForm, electricity_price_per_unit: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("roomDetail.waterPrice")}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tenantForm.water_price}
                    onChange={(e) => setTenantForm({ ...tenantForm, water_price: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("roomDetail.wastePrice")}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tenantForm.waste_price}
                    onChange={(e) => setTenantForm({ ...tenantForm, waste_price: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("roomDetail.internetPrice")}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tenantForm.internet_price}
                    onChange={(e) => setTenantForm({ ...tenantForm, internet_price: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("roomDetail.initialUnit")}</Label>
                  <Input
                    type="number"
                    value={tenantForm.initial_unit}
                    onChange={(e) => setTenantForm({ ...tenantForm, initial_unit: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsTenantModalOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={saveTenantMutation.isPending}>
                {saveTenantMutation.isPending ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Bill Modal */}
      <Dialog open={!!viewingBill} onOpenChange={() => setViewingBill(null)}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>{t("roomDetail.billDetails")} - {viewingBill?.billing_month}</DialogTitle>
          </DialogHeader>
          {viewingBill && (
            <div className="space-y-3">
              {viewingBill.is_meter_reset && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
                    <RotateCcw className="h-4 w-4 text-amber-600" />
                    <span>{t("roomDetail.meterResetNoticeTitle")}</span>
                  </div>
                  <p className="mt-1 text-amber-800">
                    {t("roomDetail.meterResetNoticeDesc")}
                  </p>
                  <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 font-medium">
                    {viewingBill.old_meter_reading != null && (
                      <div className="rounded-lg bg-white p-2 border border-amber-200">
                        <span className="block text-[11px] text-amber-700">{t("roomDetail.damagedMeterFinal")}</span>
                        <span className="font-bold text-slate-900">{viewingBill.old_meter_reading}</span>
                      </div>
                    )}
                    <div className="rounded-lg bg-white p-2 border border-amber-200">
                      <span className="block text-[11px] text-amber-700">{t("roomDetail.newMeterStart")}</span>
                      <span className="font-bold text-slate-900">{viewingBill.previous_units}</span>
                    </div>
                    <div className="rounded-lg bg-white p-2 border border-amber-200">
                      <span className="block text-[11px] text-amber-700">{t("roomDetail.newMeterCurrent")}</span>
                      <span className="font-bold text-slate-900">{viewingBill.current_units}</span>
                    </div>
                    {Number(viewingBill.additional_units) > 0 && (
                      <div className="rounded-lg bg-white p-2 border border-amber-200">
                        <span className="block text-[11px] text-amber-700">{t("roomDetail.oldMeterUnits")}</span>
                        <span className="font-bold text-slate-900">+{viewingBill.additional_units}</span>
                      </div>
                    )}
                  </div>
                  {viewingBill.meter_reset_reason && (
                    <p className="mt-2 text-amber-800">
                      <strong>{t("roomDetail.reasonRemarks")}</strong> {viewingBill.meter_reset_reason}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">{t("roomDetail.units")}</p>
                  <p className="font-semibold">
                    {viewingBill.previous_units} → {viewingBill.current_units}
                    {viewingBill.is_meter_reset && Number(viewingBill.additional_units) > 0
                      ? ` (+${viewingBill.additional_units} ${t("roomDetail.oldMeterUnits")}) = ${(Number(viewingBill.current_units) - Number(viewingBill.previous_units)) + Number(viewingBill.additional_units)} ${t("roomDetail.units")}`
                      : ` = ${Number(viewingBill.current_units) - Number(viewingBill.previous_units)} ${t("roomDetail.units")}`}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">{t("common.status")}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <select
                      value={viewingBill.status}
                      disabled={updateBillMutation.isPending}
                      onChange={(e) => {
                        const newStat = e.target.value as "Paid" | "Unpaid" | "Partially Paid";
                        handleQuickStatusChange(viewingBill, newStat);
                        setViewingBill({ ...viewingBill, status: newStat });
                      }}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold border cursor-pointer ${
                        viewingBill.status === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : viewingBill.status === "Partially Paid"
                          ? "bg-amber-50 text-amber-700 border-amber-300"
                          : "bg-red-50 text-red-700 border-red-300"
                      }`}
                    >
                      <option value="Paid">✓ {t("dashboard.paid")}</option>
                      <option value="Partially Paid">⏳ {t("dashboard.partiallyPaid")}</option>
                      <option value="Unpaid">✕ {t("dashboard.unpaid")}</option>
                    </select>
                  </div>
                </div>
                <div className="rounded-lg bg-sky-50 p-3">
                  <p className="text-xs uppercase text-sky-700">{t("dashboard.electricity")}</p>
                  <p className="font-bold text-sky-700">Rs. {viewingBill.electricity}</p>
                </div>
                <div className="rounded-lg bg-orange-50 p-3">
                  <p className="text-xs uppercase text-orange-700">{t("roomDetail.rentCol")}</p>
                  <p className="font-bold text-orange-700">Rs. {viewingBill.rent}</p>
                </div>
                <div className="rounded-lg bg-cyan-50 p-3">
                  <p className="text-xs uppercase text-cyan-700">{t("roomDetail.waterCol")}</p>
                  <p className="font-bold text-cyan-700">Rs. {viewingBill.water}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">{t("roomDetail.wasteCol")}</p>
                  <p className="font-bold">Rs. {viewingBill.waste}</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-3">
                  <p className="text-xs uppercase text-purple-700">{t("dashboard.internet")}</p>
                  <p className="font-bold text-purple-700">Rs. {viewingBill.internet}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">{t("roomDetail.paymentDate")}</p>
                  <p className="font-semibold">{viewingBill.payment_received_date || "-"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <span className="text-sm font-semibold text-slate-700">{t("dashboard.billed")}</span>
                <span className="text-lg font-bold text-slate-900">Rs. {viewingBill.total}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <span className="text-sm font-semibold text-emerald-700">{t("roomDetail.paidCol")}</span>
                <span className="text-lg font-bold text-emerald-700">Rs. {viewingBill.total_paid}</span>
              </div>
              {viewingBill.remarks && (
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">{t("roomDetail.remarks")}</p>
                  <p className="text-sm">{viewingBill.remarks}</p>
                </div>
              )}
              <div className="sticky bottom-0 bg-white z-10 pt-3 border-t border-slate-100 flex gap-2">
                <Button variant="outline" onClick={() => { openEditBill(viewingBill); }} className="flex-1">
                  <Pencil className="mr-2 h-4 w-4" />{t("roomDetail.editBill")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    sendSingleBillMutation.mutate(viewingBill.id);
                    setViewingBill(null);
                  }}
                  disabled={viewingBill.status === "Paid" || sendSingleBillMutation.isPending}
                  className="flex-1"
                >
                  <Send className="mr-2 h-4 w-4" />{t("roomDetail.sendEmailAction")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Bill Modal */}
      <Dialog open={!!editingBill} onOpenChange={() => setEditingBill(null)}>
        <DialogContent className="max-w-xl rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("roomDetail.editBillTitle")} - {editingBill?.billing_month}</DialogTitle>
            <p className="text-xs text-slate-500">
              {t("roomDetail.editBillDesc")}
            </p>
          </DialogHeader>
          <form onSubmit={handleEditBillSubmit} className="space-y-4">
            {/* Meter Reset / Damage Toggle */}
            <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-3.5 shadow-2xs">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-start gap-2.5">
                  <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <span className="text-sm font-bold text-amber-950">{t("roomDetail.meterDamagedToggle")}</span>
                    <p className="text-xs text-amber-700">
                      {t("roomDetail.meterDamagedToggleDesc")}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={editForm.is_meter_reset}
                  onChange={(e) => setEditForm({ ...editForm, is_meter_reset: e.target.checked })}
                  className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer ml-2"
                />
              </label>

              {editForm.is_meter_reset && (
                <div className="mt-3 space-y-3 border-t border-amber-200 pt-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <Label className="text-amber-950 font-semibold">{t("roomDetail.damagedMeterFinalOptional")}</Label>
                      <Input
                        type="number"
                        value={editForm.old_meter_reading}
                        onChange={(e) => setEditForm({ ...editForm, old_meter_reading: e.target.value })}
                        placeholder="Final reading"
                        className="mt-1 bg-white border-amber-300"
                      />
                    </div>
                    <div>
                      <Label className="text-amber-950 font-semibold">{t("roomDetail.additionalUnitsDamaged")}</Label>
                      <Input
                        type="number"
                        value={editForm.additional_units}
                        onChange={(e) => setEditForm({ ...editForm, additional_units: e.target.value })}
                        className="mt-1 bg-white border-amber-300"
                      />
                    </div>
                    <div>
                      <Label className="text-amber-950 font-semibold">{t("roomDetail.reasonForMeterReset")}</Label>
                      <Input
                        value={editForm.meter_reset_reason}
                        onChange={(e) => setEditForm({ ...editForm, meter_reset_reason: e.target.value })}
                        placeholder="e.g. Meter damaged"
                        className="mt-1 bg-white border-amber-300"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 1: Month and units */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t("roomDetail.billingAndUnits")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label>{t("roomDetail.billingMonth")} *</Label>
                  <Input value={editForm.billing_month} onChange={(e) => setEditForm({ ...editForm, billing_month: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <Label>{editForm.is_meter_reset ? t("roomDetail.newMeterStart") : t("roomDetail.previousElectricityUnits")}</Label>
                  <Input type="number" value={editForm.previous_units} onChange={(e) => setEditForm({ ...editForm, previous_units: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>{editForm.is_meter_reset ? t("roomDetail.newMeterCurrent") : t("roomDetail.currentElectricityUnits")}</Label>
                  <Input type="number" value={editForm.current_units} onChange={(e) => setEditForm({ ...editForm, current_units: e.target.value })} className="mt-1" />
                </div>
              </div>
            </div>

            {/* Section 2: Component Breakdown */}
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t("roomDetail.costBreakdown")}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <Label>{t("dashboard.electricity")} (Rs.)</Label>
                  <Input type="number" step="0.01" value={editForm.electricity} onChange={(e) => setEditForm({ ...editForm, electricity: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>{t("roomDetail.rentCol")} (Rs.)</Label>
                  <Input type="number" step="0.01" value={editForm.rent} onChange={(e) => setEditForm({ ...editForm, rent: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>{t("roomDetail.waterCol")} (Rs.)</Label>
                  <Input type="number" step="0.01" value={editForm.water} onChange={(e) => setEditForm({ ...editForm, water: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>{t("roomDetail.wasteCol")} (Rs.)</Label>
                  <Input type="number" step="0.01" value={editForm.waste} onChange={(e) => setEditForm({ ...editForm, waste: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>{t("dashboard.internet")} (Rs.)</Label>
                  <Input type="number" step="0.01" value={editForm.internet} onChange={(e) => setEditForm({ ...editForm, internet: e.target.value })} className="mt-1" />
                </div>
                <div className="rounded-lg bg-slate-50 p-2 border border-slate-200 flex flex-col justify-center">
                  <span className="text-[11px] font-semibold text-slate-500">{t("roomDetail.calculatedTotal")}</span>
                  <span className="font-display text-sm font-bold text-slate-900">
                    Rs. {(
                      (parseFloat(editForm.electricity) || 0) +
                      (parseFloat(editForm.rent) || 0) +
                      (parseFloat(editForm.water) || 0) +
                      (parseFloat(editForm.waste) || 0) +
                      (parseFloat(editForm.internet) || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Payment Status & Settlement */}
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t("roomDetail.paymentStatusSettlement")}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t("common.status")} *</Label>
                  <select
                    value={editForm.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as "Paid" | "Unpaid" | "Partially Paid";
                      const currentTotal = (
                        (parseFloat(editForm.electricity) || 0) +
                        (parseFloat(editForm.rent) || 0) +
                        (parseFloat(editForm.water) || 0) +
                        (parseFloat(editForm.waste) || 0) +
                        (parseFloat(editForm.internet) || 0)
                      );
                      if (newStatus === "Paid") {
                        setEditForm({
                          ...editForm,
                          status: newStatus,
                          total_paid: String(currentTotal || editingBill?.total || 0),
                          payment_received_date: editForm.payment_received_date || new Date().toISOString().slice(0, 10),
                        });
                      } else if (newStatus === "Unpaid") {
                        setEditForm({
                          ...editForm,
                          status: newStatus,
                          total_paid: "0",
                        });
                      } else {
                        setEditForm({ ...editForm, status: newStatus });
                      }
                    }}
                    className={`mt-1 flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 ${
                      editForm.status === "Paid"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold"
                        : editForm.status === "Partially Paid"
                        ? "bg-amber-50 text-amber-800 border-amber-300 font-semibold"
                        : "bg-red-50 text-red-800 border-red-300 font-semibold"
                    }`}
                  >
                    <option value="Unpaid">{t("dashboard.unpaid")}</option>
                    <option value="Partially Paid">{t("dashboard.partiallyPaid")}</option>
                    <option value="Paid">{t("dashboard.paid")}</option>
                  </select>
                </div>

                <div>
                  <Label>{t("roomDetail.paidAmount")}</Label>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Input
                      type="number"
                      step="0.01"
                      value={editForm.total_paid}
                      onChange={(e) => setEditForm({ ...editForm, total_paid: e.target.value })}
                      placeholder="0"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const currentTotal = (
                          (parseFloat(editForm.electricity) || 0) +
                          (parseFloat(editForm.rent) || 0) +
                          (parseFloat(editForm.water) || 0) +
                          (parseFloat(editForm.waste) || 0) +
                          (parseFloat(editForm.internet) || 0)
                        );
                        setEditForm({
                          ...editForm,
                          status: "Paid",
                          total_paid: String(currentTotal || editingBill?.total || 0),
                          payment_received_date: editForm.payment_received_date || todayNepaliDate,
                        });
                      }}
                      className="shrink-0 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      title="Set full amount paid"
                    >
                      {t("roomDetail.full")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditForm({
                          ...editForm,
                          status: "Unpaid",
                          total_paid: "0",
                        });
                      }}
                      className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      title="Set 0 / unpaid"
                    >
                      {t("roomDetail.clear")}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label>{t("roomDetail.paymentReceivedDateBS")}</Label>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, payment_received_date: todayNepaliDate })}
                      className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                    >
                      {t("roomDetail.resetToToday")} ({todayNepaliDate})
                    </button>
                  </div>
                  <Input
                    type="text"
                    value={editForm.payment_received_date}
                    onChange={(e) => setEditForm({ ...editForm, payment_received_date: e.target.value })}
                    placeholder="YYYY-MM-DD (e.g. 2083-05-21)"
                    className="mt-1"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">{t("roomDetail.autoFilledNepaliDate")}</p>
                </div>

                <div>
                  <Label>{t("roomDetail.remarksReceipt")}</Label>
                  <Input
                    value={editForm.remarks}
                    onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                    placeholder="Optional remarks (e.g. Cash, eSewa)"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white z-10 pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingBill(null)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={updateBillMutation.isPending}>
                {updateBillMutation.isPending ? t("common.saving") : t("roomDetail.saveChanges")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Bill Modal */}
      <Dialog open={!!deletingBill} onOpenChange={() => setDeletingBill(null)}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>{t("roomDetail.deleteBillTitle")}</DialogTitle>
            <p className="text-sm text-slate-600">
              {locale === "ne"
                ? `के तपाईं "${deletingBill?.billing_month}" को बिल मेटाउन निश्चित हुनुहुन्छ? यो कार्य फिर्ता गर्न सकिँदैन।`
                : `Are you sure you want to delete the bill for "${deletingBill?.billing_month}"? This action cannot be undone.`}
            </p>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setDeletingBill(null)}>{t("common.cancel")}</Button>
            <Button variant="destructive" onClick={() => deletingBill && deleteBillMutation.mutate(deletingBill.id)} disabled={deleteBillMutation.isPending}>
              {deleteBillMutation.isPending ? t("common.deleting") : t("common.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Document Modal */}
      <Dialog open={isDocModalOpen} onOpenChange={setIsDocModalOpen}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>{t("roomDetail.uploadDocTitle")}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              uploadDocMutation.mutate();
            }}
            className="space-y-4"
          >
            <div>
              <Label>{t("roomDetail.docNameLabel")}</Label>
              <Input
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="e.g. Citizenship, Agreement"
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t("roomDetail.selectFile")}</Label>
              <Input
                type="file"
                onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                required
                className="mt-1"
              />
            </div>
            <div className="sticky bottom-0 bg-white z-10 pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDocModalOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={uploadDocMutation.isPending || !docFile}>
                {uploadDocMutation.isPending ? t("roomDetail.uploading") : t("roomDetail.uploadDocument")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reverse Receipt Confirmation Modal */}
      <Dialog open={!!reversingReceipt} onOpenChange={() => setReversingReceipt(null)}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>{t("roomDetail.reverseReceiptTitle")}</DialogTitle>
            <p className="text-sm text-slate-600">
              {locale === "ne"
                ? `के तपाईं रसिद #${reversingReceipt?.id} (रु. ${reversingReceipt?.amount}, मिति: ${reversingReceipt?.received_date}) उल्ट्याउन निश्चित हुनुहुन्छ? यसले बिलहरूबाट भुक्तानी हटाउनेछ र बाँकी रकम पूर्ववत गर्नेछ।`
                : `Are you sure you want to reverse receipt #${reversingReceipt?.id} of Rs. ${reversingReceipt?.amount} received on ${reversingReceipt?.received_date}? This will unallocate payments from bills and restore outstanding balances.`}
            </p>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setReversingReceipt(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => reversingReceipt && reverseReceiptMutation.mutate(reversingReceipt.id)}
              disabled={reverseReceiptMutation.isPending}
            >
              {reverseReceiptMutation.isPending ? t("roomDetail.reversing") : t("roomDetail.confirmReversal")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl rounded-xl p-4 sm:p-6">
          <DialogHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 pr-8 sm:pr-0">
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {previewDoc?.name || t("roomDetail.documentPreview")}
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">{t("roomDetail.tenantDocViewer")}</p>
            </div>
            {previewDoc && (
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.url}
                  download
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  title={t("roomDetail.download")}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{t("roomDetail.download")}</span>
                </a>
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
                  title={t("roomDetail.openInNewTab")}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>{t("roomDetail.fullSize")}</span>
                </a>
              </div>
            )}
          </DialogHeader>
          <div className="mt-4 flex items-center justify-center min-h-[300px] max-h-[75vh] overflow-auto bg-slate-100/60 rounded-xl p-2">
            {previewDoc && (
              previewDoc.url.toLowerCase().match(/\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/) ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewDoc.url}
                  alt={previewDoc.name}
                  className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-xs"
                />
              ) : previewDoc.url.toLowerCase().match(/\.pdf(\?.*)?$/) ? (
                <iframe
                  src={previewDoc.url}
                  className="w-full h-[70vh] rounded-lg border border-slate-200"
                  title={previewDoc.name}
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="h-16 w-16 text-slate-400 mx-auto mb-3" />
                  <p className="font-semibold text-slate-800">{previewDoc.name}</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    {t("roomDetail.cannotPreviewBrowser")}
                  </p>
                  <a
                    href={previewDoc.url}
                    download
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                  >
                    <Download className="h-4 w-4" /> {t("roomDetail.downloadFile")}
                  </a>
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
