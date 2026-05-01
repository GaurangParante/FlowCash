import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import notifee, {
  AndroidNotificationSetting,
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TriggerType,
} from "@notifee/react-native";

const DAILY_REMINDER_ID = "daily-expense-reminder";
const DAILY_REMINDER_CHANNEL_ID = "daily-reminders";
const REMINDER_ENABLED_KEY = "@flowcash:daily-reminder-enabled";

const DAILY_REMINDER_TITLE = "FlowCash reminder";
const DAILY_REMINDER_BODY =
  "Aaj ke expenses add kar lo taaki spending clear rahe.";

const getNextReminderDate = (hour, minute) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  if (date <= new Date()) {
    date.setDate(date.getDate() + 1);
  }

  return date;
};

const ensureNotificationPermission = async () => {
  const settings = await notifee.requestPermission();

  if (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  ) {
    return { ok: true };
  }

  return {
    ok: false,
    reason: "Notifications permission allow karni padegi.",
    action: "notifications",
  };
};

const ensureAndroidAlarmPermission = async () => {
  if (Platform.OS !== "android" || Platform.Version < 31) {
    return { ok: true };
  }

  const settings = await notifee.getNotificationSettings();

  if (settings.android?.alarm === AndroidNotificationSetting.ENABLED) {
    return { ok: true };
  }

  return {
    ok: false,
    reason:
      "Daily reminder ke liye Android me Alarms & reminders access enable karna padega.",
    action: "alarm",
  };
};

const ensureReminderChannel = async () =>
  notifee.createChannel({
    id: DAILY_REMINDER_CHANNEL_ID,
    name: "Daily reminders",
    description: "Expense logging reminders for every evening.",
    importance: AndroidImportance.HIGH,
  });

export const scheduleDailyReminder = async (hour = 20, minute = 0) => {
  const permission = await ensureNotificationPermission();
  if (!permission.ok) {
    return permission;
  }

  const alarmPermission = await ensureAndroidAlarmPermission();
  if (!alarmPermission.ok) {
    return alarmPermission;
  }

  const scheduledFor = getNextReminderDate(hour, minute);
  const channelId = await ensureReminderChannel();

  await notifee.cancelNotification(DAILY_REMINDER_ID);
  await notifee.createTriggerNotification(
    {
      id: DAILY_REMINDER_ID,
      title: DAILY_REMINDER_TITLE,
      body: DAILY_REMINDER_BODY,
      android: {
        channelId,
        pressAction: {
          id: "default",
        },
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: scheduledFor.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    }
  );

  await AsyncStorage.setItem(REMINDER_ENABLED_KEY, "true");

  return {
    ok: true,
    scheduledFor,
  };
};

export const cancelDailyReminder = async () => {
  await notifee.cancelNotification(DAILY_REMINDER_ID);
  await AsyncStorage.setItem(REMINDER_ENABLED_KEY, "false");

  return { ok: true };
};

export const getDailyReminderEnabled = async () => {
  const value = await AsyncStorage.getItem(REMINDER_ENABLED_KEY);
  return value === "true";
};

export const syncDailyReminder = async (hour = 20, minute = 0) => {
  const enabled = await getDailyReminderEnabled();

  if (!enabled) {
    return { ok: true, enabled: false };
  }

  const result = await scheduleDailyReminder(hour, minute);
  return {
    ...result,
    enabled: result?.ok === true,
  };
};

export const openReminderSettings = async (action) => {
  if (action === "alarm") {
    await notifee.openAlarmPermissionSettings();
    return;
  }

  await notifee.openNotificationSettings();
};
