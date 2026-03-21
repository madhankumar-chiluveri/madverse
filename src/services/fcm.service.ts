// ─────────────────────────────────────────────────────────────
// src/services/fcm.service.ts
//
// Firebase Cloud Messaging (FCM) / Web Push integration.
// Handles permission request, service-worker registration,
// and subscription management.
//
// NOTE: FCM requires a Firebase project and a valid VAPID key.
// Set NEXT_PUBLIC_FIREBASE_VAPID_KEY in your .env.local.
// ─────────────────────────────────────────────────────────────

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "";
const SW_PATH = "/sw.js";

export interface PushSubscriptionResult {
  endpoint: string;
  expirationTime: number | null;
  keys: { p256dh: string; auth: string };
}

class FCMService {
  private registration: ServiceWorkerRegistration | null = null;

  /** Register the service worker and return the registration */
  async registerSW(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register(SW_PATH, {
        scope: "/",
      });
      console.info("[FCM] Service worker registered:", this.registration.scope);
      return this.registration;
    } catch (err) {
      console.error("[FCM] SW registration failed:", err);
      return null;
    }
  }

  /** Request notification permission. Returns "granted" | "denied" | "default" */
  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) return "denied";
    return Notification.requestPermission();
  }

  /** Subscribe to Web Push. Returns null if permission denied or VAPID missing. */
  async subscribe(): Promise<PushSubscriptionResult | null> {
    const permission = await this.requestPermission();
    if (permission !== "granted") {
      console.warn("[FCM] Notification permission not granted:", permission);
      return null;
    }

    if (!VAPID_KEY) {
      console.warn("[FCM] NEXT_PUBLIC_FIREBASE_VAPID_KEY not set — push notifications disabled.");
      return null;
    }

    if (!this.registration) {
      await this.registerSW();
    }
    if (!this.registration) return null;

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_KEY) as BufferSource,
      });

      const json = subscription.toJSON();
      return {
        endpoint: json.endpoint ?? "",
        expirationTime: subscription.expirationTime,
        keys: {
          p256dh: json.keys?.p256dh ?? "",
          auth: json.keys?.auth ?? "",
        },
      };
    } catch (err) {
      console.error("[FCM] Push subscription failed:", err);
      return null;
    }
  }

  /** Unsubscribe from push notifications */
  async unsubscribe(): Promise<void> {
    if (!this.registration) return;
    const sub = await this.registration.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
  }

  /** Check current subscription status */
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) await this.registerSW();
    return this.registration?.pushManager.getSubscription() ?? null;
  }

  // ── Helpers ─────────────────────────────────────────────────
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
  }
}

export const fcmService = new FCMService();
export default fcmService;
