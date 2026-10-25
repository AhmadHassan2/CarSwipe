import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { getProfile } from "@/server/services/account";
import { PageHeader } from "@/components/shared/page-header";
import {
  DeleteAccount, NotificationsForm, PasswordForm, PreferencesForm, ProfileForm, SettingsCard, ThemeForm,
} from "@/components/settings/settings-forms";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const userId = (await auth())?.user?.id;
  if (!userId) redirect("/login?callbackUrl=/settings");
  const p = await getProfile(userId);
  const prefs = p.preferences;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader title="Settings" />
      <div className="space-y-6">
        <SettingsCard id="profile" title="Profile">
          <ProfileForm initial={{ name: p.name ?? "", email: p.email, phone: p.phone ?? "", sellerType: p.sellerType, dealerName: p.dealerName ?? "" }} />
        </SettingsCard>
        <SettingsCard id="preferences" title="Discovery preferences" description="Used to rank cars in your swipe deck. Nothing is hidden, just ordered.">
          <PreferencesForm
            initial={{
              minPrice: prefs?.minPrice ?? null, maxPrice: prefs?.maxPrice ?? null, minYear: prefs?.minYear ?? null, maxYear: prefs?.maxYear ?? null,
              maxMileage: prefs?.maxMileage ?? null, preferredMakes: prefs?.preferredMakes ?? [], bodyStyles: prefs?.bodyStyles ?? [],
              transmissions: prefs?.transmissions ?? [], fuelTypes: prefs?.fuelTypes ?? [], location: prefs?.location ?? null, radius: prefs?.radius ?? null,
            }}
          />
        </SettingsCard>
        <SettingsCard id="notifications" title="Notifications">
          <NotificationsForm initial={{ notifyMessages: prefs?.notifyMessages ?? true, notifyInquiries: prefs?.notifyInquiries ?? true }} />
        </SettingsCard>
        <SettingsCard id="appearance" title="Appearance"><ThemeForm /></SettingsCard>
        <SettingsCard id="security" title={p.hasPassword ? "Change password" : "Set a password"} description={p.hasPassword ? undefined : "You signed up with Google. Add a password to also sign in with email."}>
          <PasswordForm hasPassword={p.hasPassword} />
        </SettingsCard>
        <SettingsCard id="danger" title="Delete account"><DeleteAccount hasPassword={p.hasPassword} /></SettingsCard>
      </div>
    </div>
  );
}
