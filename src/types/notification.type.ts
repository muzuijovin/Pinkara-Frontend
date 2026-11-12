export type NotificationType = "ORDER_STATUS" | "ORDER_PAID" | "CUSTOM_REQUEST" | "CUSTOM_MESSAGE" | "CUSTOM_QUOTE" | "NEW_PRODUCT";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  href: string | null;
  imageUrl: string | null;
  createdAt: string;
  isRead: boolean;
  isAnnouncement: boolean; // pengumuman produk baru untuk semua customer
};

export type NotificationPage = {
  notifications: AppNotification[];
  unreadCount: number;
  hasMore: boolean;
};
