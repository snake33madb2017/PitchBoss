/**
 * PitchBoss Enterprise — Daily Practice Reminder & Push Notification Service
 * Drives daily retention by sending timely micro-practice alerts to employees.
 */

const NOTIFICATION_PERMISSION_KEY = 'pitchboss_notification_reminders_enabled';
const REMINDER_HOUR_KEY = 'pitchboss_reminder_hour';

export class NotificationService {
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public static isEnabled(): boolean {
    if (!this.isSupported()) return false;
    return Notification.permission === 'granted' && localStorage.getItem(NOTIFICATION_PERMISSION_KEY) === 'true';
  }

  public static getReminderHour(): number {
    const saved = localStorage.getItem(REMINDER_HOUR_KEY);
    return saved ? parseInt(saved, 10) : 10; // Default 10:00 AM
  }

  public static setReminderHour(hour: number): void {
    localStorage.setItem(REMINDER_HOUR_KEY, hour.toString());
  }

  /**
   * Requests browser notification permissions and enables reminder
   */
  public static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
        this.sendImmediateNotification(
          '¡Recordatorios PitchBoss activados! 🚀',
          'Recibirás un aviso diario para hacer tu simulación de 3 minutos antes de tu turno.'
        );
        this.scheduleDailyCheck();
        return true;
      } else {
        localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'false');
        return false;
      }
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return false;
    }
  }

  public static disable(): void {
    localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'false');
  }

  /**
   * Sends an immediate browser notification
   */
  public static sendImmediateNotification(title: string, body: string): void {
    if (!this.isSupported() || Notification.permission !== 'granted') return;
    try {
      new Notification(title, {
        body,
        icon: '/logo-icon.png',
        badge: '/logo-icon.png',
        tag: 'pitchboss-reminder'
      });
    } catch (err) {
      console.warn('Could not display notification:', err);
    }
  }

  /**
   * Checks every hour if a reminder is due today
   */
  public static scheduleDailyCheck(): void {
    if (!this.isEnabled()) return;

    const check = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const targetHour = this.getReminderHour();
      const todayStr = now.toISOString().split('T')[0];
      const lastSentKey = 'pitchboss_last_notification_sent_date';

      if (currentHour === targetHour && localStorage.getItem(lastSentKey) !== todayStr) {
        this.sendImmediateNotification(
          '🎯 PitchBoss — Tu turno de práctica',
          'Tómate 3 minutos para afinar tu inglés de ventas antes de atender clientes hoy.'
        );
        localStorage.setItem(lastSentKey, todayStr);
      }
    };

    // Run check immediately and every 15 minutes
    check();
    setInterval(check, 15 * 60 * 1000);
  }
}
