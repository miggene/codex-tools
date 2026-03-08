import { useI18n } from "../i18n/I18nProvider";

type AppTab = "accounts" | "proxy";

type BottomDockProps = {
  activeTab: AppTab;
  settingsOpen: boolean;
  onSelectTab: (tab: AppTab) => void;
  onToggleSettings: () => void;
};

function AccountsIcon() {
  return (
    <svg className="bottomDockIcon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ProxyIcon() {
  return (
    <svg className="bottomDockIcon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 7h10v4H7z" />
      <path d="M9 11v3" />
      <path d="M15 11v3" />
      <path d="M6 17h12" />
      <path d="M12 14v3" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="bottomDockIcon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3.75v2.1" />
      <path d="m18.54 5.46-1.49 1.49" />
      <path d="M20.25 12h-2.1" />
      <path d="m18.54 18.54-1.49-1.49" />
      <path d="M12 18.15v2.1" />
      <path d="m6.95 17.05-1.49 1.49" />
      <path d="M5.85 12h-2.1" />
      <path d="m6.95 6.95-1.49-1.49" />
      <circle cx="12" cy="12" r="3.25" />
    </svg>
  );
}

export function BottomDock({
  activeTab,
  settingsOpen,
  onSelectTab,
  onToggleSettings,
}: BottomDockProps) {
  const { copy } = useI18n();
  const accountActive = activeTab === "accounts" && !settingsOpen;
  const proxyActive = activeTab === "proxy" && !settingsOpen;

  return (
    <nav className="bottomDock" aria-label={copy.bottomDock.ariaLabel}>
      <button
        className={`bottomDockButton${accountActive ? " isActive" : ""}`}
        onClick={() => onSelectTab("accounts")}
        aria-label={copy.bottomDock.accounts}
        title={copy.bottomDock.accounts}
      >
        <AccountsIcon />
      </button>
      <button
        className={`bottomDockButton${proxyActive ? " isActive" : ""}`}
        onClick={() => onSelectTab("proxy")}
        aria-label={copy.bottomDock.proxy}
        title={copy.bottomDock.proxy}
      >
        <ProxyIcon />
      </button>
      <button
        className={`bottomDockButton${settingsOpen ? " isActive" : ""}`}
        onClick={onToggleSettings}
        aria-label={copy.bottomDock.settings}
        title={copy.bottomDock.settings}
      >
        <SettingsIcon />
      </button>
    </nav>
  );
}
