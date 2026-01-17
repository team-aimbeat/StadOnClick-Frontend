import {
  HiOutlineHome,
  HiOutlineEnvelopeOpen,
  HiOutlineQueueList,
  HiOutlineSparkles,
  HiOutlinePresentationChartLine,
  HiOutlineWallet,
  HiOutlineCreditCard,
  HiOutlineMegaphone,
  HiOutlineShieldCheck,
  HiOutlineCloud,
  HiOutlineLifebuoy,
  HiOutlineChatBubbleLeftRight,
  HiOutlineBookmarkSquare,
  HiOutlineUserGroup,
  HiOutlineTicket,
} from "react-icons/hi2";
import { IconType } from "react-icons";

export type VendorNavChild = {
  label: string;
  to: string;
  badge?: string;
};

export type VendorNavItem = {
  label: string;
  icon: IconType;
  to?: string;
  badge?: string;
  children?: VendorNavChild[];
};

export type VendorNavGroup = {
  label: string;
  items: VendorNavItem[];
};

export type VendorSidebarMeta = {
  newLeads: number;
  pendingBookings?: number;
  kycStatus: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";
  subscriptionExpired: boolean;
};

export const getVendorNavGroups = ({
  newLeads,
  pendingBookings = 0,
  kycStatus,
  subscriptionExpired,
}: VendorSidebarMeta): VendorNavGroup[] => [
  {
    label: "OVERVIEW",
    items: [
      {
        label: "Dashboard",
        icon: HiOutlineHome,
        to: "/vendor/dashboard",
      },
    ],
  },
  {
    label: "SALES",
    items: [
      {
        label: "Leads",
        icon: HiOutlineEnvelopeOpen,
        badge: newLeads > 0 ? `${newLeads}` : undefined,
        children: [
          { label: "All Leads", to: "/vendor/leads" },
          {
            label: "New Leads",
            to: "/vendor/leads/new",
            badge: newLeads > 0 ? `${newLeads}` : undefined,
          },
          { label: "Contacted Leads", to: "/vendor/leads/contacted" },
          { label: "Converted Leads", to: "/vendor/leads/converted" },
          { label: "Lost Leads", to: "/vendor/leads/lost" },
        ],
      },
      {
        label: "Lead Sources",
        icon: HiOutlinePresentationChartLine,
        to: "/vendor/leads/sources",
      },
      {
        label: "Customer Insights",
        icon: HiOutlineUserGroup,
        to: "/vendor/insights",
      },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      {
        label: "Bookings",
        icon: HiOutlineQueueList,
        badge: pendingBookings > 0 ? `${pendingBookings}` : undefined,
        children: [
          { label: "Upcoming", to: "/vendor/bookings/upcoming" },
          { label: "Completed", to: "/vendor/bookings/completed" },
          { label: "Refund Requests", to: "/vendor/bookings/refunds" },
        ],
      },
      {
        label: "Services",
        icon: HiOutlineSparkles,
        to: "/vendor/services",
      },
      {
        label: "Photos & Media",
        icon: HiOutlineCloud,
        to: "/vendor/media",
      },
      {
        label: "Coupons",
        icon: HiOutlineTicket,
        to: "/vendor/coupons",
      },
    ],
  },
  {
    label: "MONETIZATION",
    items: [
      {
        label: "Wallet",
        icon: HiOutlineWallet,
        to: "/vendor/wallet",
      },
      {
        label: "Payouts",
        icon: HiOutlineCreditCard,
        to: "/vendor/payouts",
      },
      {
        label: "Lead Plan Subscription",
        icon: HiOutlineMegaphone,
        to: "/vendor/subscription",
        badge: subscriptionExpired ? "Expired" : undefined,
      },
      {
        label: "Promote / Sponsorships",
        icon: HiOutlineSparkles,
        to: "/vendor/promote",
      },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      {
        label: "Business Profile",
        icon: HiOutlineBookmarkSquare,
        to: "/vendor/profile",
      },
      {
        label: "KYC Documents",
        icon: HiOutlineShieldCheck,
        to: "/vendor/kyc",
        badge: kycStatus !== "VERIFIED" ? "!" : undefined,
      },
      {
        label: "Stripe Connect",
        icon: HiOutlineCreditCard,
        to: "/vendor/stripe",
      },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      {
        label: "Support Chat",
        icon: HiOutlineChatBubbleLeftRight,
        to: "/vendor/support",
      },
      {
        label: "Help Center",
        icon: HiOutlineLifebuoy,
        to: "/vendor/help",
      },
    ],
  },
];
