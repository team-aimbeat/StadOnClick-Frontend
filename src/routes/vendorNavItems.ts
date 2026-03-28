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
  HiOutlineBookOpen,
  HiOutlineChatBubbleLeftRight,
  HiOutlineBookmarkSquare,
  HiOutlineUserGroup,
  HiOutlineTicket,
  HiOutlineBell,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";
import { IconType } from "react-icons";
import { LayoutGrid } from "lucide-react";

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
  allLeads?: number;
  contactedLeads?: number;
  convertedLeads?: number;
  lostLeads?: number;
  allBookings?: number;
  upcomingBookings?: number;
  completedBookings?: number;
  refundRequestBookings?: number;
  pendingBookings?: number;
  kycDocumentsCount?: number;
  kycStatus: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";
  subscriptionExpired: boolean;
};

export const getVendorNavGroups = ({
  newLeads,
  allLeads = 0,
  contactedLeads = 0,
  convertedLeads = 0,
  lostLeads = 0,
  allBookings = 0,
  upcomingBookings = 0,
  completedBookings = 0,
  refundRequestBookings = 0,
  pendingBookings = 0,
  kycDocumentsCount = 0,
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
      {
        label: "Analytics",
        icon: HiOutlinePresentationChartLine,
        to: "/vendor/analytics",
      },
      {
        label: "Notifications",
        icon: HiOutlineBell,
        to: "/vendor/notifications",
      },
    ],
  },
    {
    label: "BUSINESS ACCOUNT",
    items: [
      {
        label: "Business Profile",
        icon: HiOutlineBookmarkSquare,
        to: "/vendor/profile",
      },
      {
        label: "Account Settings",
        icon: HiOutlineCog6Tooth,
        to: "/vendor/settings",
      },
      {
        label: "KYC Documents",
        icon: HiOutlineShieldCheck,
        to: "/vendor/kyc",
        badge: kycDocumentsCount > 0 ? `${kycDocumentsCount}` : undefined,
      },
      {
        label: "Payout Setup",
        icon: HiOutlineCreditCard,
        to: "/vendor/stripe",
      },
    ],
  },

  {
    label: "OPERATIONS",
    items: [
      {
        label: "Bookings",
        icon: HiOutlineQueueList,
        badge: allBookings > 0 ? `${allBookings}` : undefined,
        children: [
          {
            label: "Upcoming",
            to: "/vendor/bookings/upcoming",
            badge:
              (upcomingBookings > 0 ? upcomingBookings : pendingBookings) > 0
                ? `${upcomingBookings > 0 ? upcomingBookings : pendingBookings}`
                : undefined,
          },
          {
            label: "Completed",
            to: "/vendor/bookings/completed",
            badge: completedBookings > 0 ? `${completedBookings}` : undefined,
          },
          {
            label: "Refund Requests",
            to: "/vendor/bookings/refunds",
            badge: refundRequestBookings > 0 ? `${refundRequestBookings}` : undefined,
          },
        ],
      },
      {
        label: "Services",
        icon: LayoutGrid ,
        to: "/vendor/services",
      },
      {
        label: "Photos & Media",
        icon: HiOutlineCloud,
        to: "/vendor/media",
      },
      {
        label: "Menu",
        icon: HiOutlineBookmarkSquare,
        to: "/vendor/menu",
      },
      {
        label: "Coupons",
        icon: HiOutlineTicket,
        to: "/vendor/coupons",
      },
    ],
  },
    {
    label: "SALES",
    items: [
      {
        label: "Leads",
        icon: HiOutlineEnvelopeOpen,
        badge: allLeads > 0 ? `${allLeads}` : undefined,
        children: [
          {
            label: "All Leads",
            to: "/vendor/leads",
            badge: allLeads > 0 ? `${allLeads}` : undefined,
          },
          {
            label: "New Leads",
            to: "/vendor/leads?status=NEW",
            badge: newLeads > 0 ? `${newLeads}` : undefined,
          },
          {
            label: "Contacted Leads",
            to: "/vendor/leads?status=CONTACTED",
            badge: contactedLeads > 0 ? `${contactedLeads}` : undefined,
          },
          {
            label: "Converted Leads",
            to: "/vendor/leads?status=CONVERTED",
            badge: convertedLeads > 0 ? `${convertedLeads}` : undefined,
          },
          {
            label: "Lost Leads",
            to: "/vendor/leads?status=LOST",
            badge: lostLeads > 0 ? `${lostLeads}` : undefined,
          },
        ],
      },
      // {
      //   label: "Lead Sources",
      //   icon: HiOutlinePresentationChartLine,
      //   to: "/vendor/leads/sources",
      // },
      // {
      //   label: "Customer Insights",
      //   icon: HiOutlineUserGroup,
      //   to: "/vendor/insights",
      // },
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
    label: "SUPPORT",
    items: [
      {
        label: "Support",
        icon: HiOutlineChatBubbleLeftRight,
        to: "/vendor/support",
      },
      {
        label: "Help Center",
        icon: HiOutlineLifebuoy,
        to: "/vendor/help",
      },
      {
        label: "User Manual",
        icon: HiOutlineBookOpen,
        to: "/vendor/help/user-manual",
      },
    ],
  },
];
