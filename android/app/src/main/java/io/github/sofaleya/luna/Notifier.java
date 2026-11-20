package io.github.sofaleya.luna;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Уведомления Луны. Страница присылает список на ближайшие 2 недели
 * (таблетка, "завтра месячные", "последняя активная"), здесь он хранится
 * и ставится один будильник на ближайшее. Сработал - показали, поставили следующий.
 */
final class Notifier {
    static final String PREFS = "notif";
    static final String CHANNEL = "luna";
    private static final int REQ = 8101;

    private Notifier() {}

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static void save(Context c, String json) {
        prefs(c).edit().putString("items", json == null ? "[]" : json).apply();
        schedule(c);
    }

    private static PendingIntent pending(Context c) {
        Intent i = new Intent(c, AlarmReceiver.class);
        return PendingIntent.getBroadcast(c, REQ, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static JSONArray items(Context c) {
        try {
            return new JSONArray(prefs(c).getString("items", "[]"));
        } catch (Exception e) {
            return new JSONArray();
        }
    }

    /** Будильник на ближайшее будущее уведомление. */
    static void schedule(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        long now = System.currentTimeMillis(), next = Long.MAX_VALUE;
        JSONArray a = items(c);
        for (int k = 0; k < a.length(); k++) {
            long at = a.optJSONObject(k) == null ? 0 : a.optJSONObject(k).optLong("at");
            if (at > now && at < next) next = at;
        }
        if (next == Long.MAX_VALUE) {
            am.cancel(pending(c));
            return;
        }
        // не точный будильник: может прийти на пару минут позже, зато не нужно особое разрешение
        am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next, pending(c));
    }

    /** Показать всё, чему пора (с запасом в минуту), убрать показанное, поставить следующее. */
    static void fire(Context c) {
        long now = System.currentTimeMillis();
        JSONArray a = items(c), rest = new JSONArray();
        for (int k = 0; k < a.length(); k++) {
            JSONObject o = a.optJSONObject(k);
            if (o == null) continue;
            long at = o.optLong("at");
            if (at <= now + 60_000) {
                // опоздавшие больше чем на 3 часа (телефон был выключен) не показываем
                if (now - at < 3 * 3600_000L) show(c, o.optString("id"), o.optString("title"), o.optString("text"));
            } else rest.put(o);
        }
        prefs(c).edit().putString("items", rest.toString()).apply();
        schedule(c);
    }

    private static void show(Context c, String id, String title, String text) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        if (Build.VERSION.SDK_INT >= 26) {
            nm.createNotificationChannel(new NotificationChannel(CHANNEL, "Таблетка и месячные", NotificationManager.IMPORTANCE_HIGH));
        }
        Intent open = new Intent(c, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(c, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, CHANNEL) : new Notification.Builder(c);
        // на заблокированном экране - только "Луна", без подробностей
        Notification.Builder pub = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, CHANNEL) : new Notification.Builder(c);
        pub.setSmallIcon(android.R.drawable.ic_popup_reminder).setContentTitle("Луна").setContentText("Новое напоминание");
        b.setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(new Notification.BigTextStyle().bigText(text))
            .setContentIntent(pi)
            .setAutoCancel(true)
            .setVisibility(Notification.VISIBILITY_PRIVATE)
            .setPublicVersion(pub.build());
        nm.notify(id.hashCode(), b.build());
    }
}
