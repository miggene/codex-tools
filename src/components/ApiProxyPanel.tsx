import { useState } from "react";

import { useI18n } from "../i18n/I18nProvider";
import type {
  ApiProxyStatus,
  CloudflaredStatus,
  CloudflaredTunnelMode,
  StartCloudflaredTunnelInput,
} from "../types/app";

const DEFAULT_PROXY_PORT = "8787";

type ApiProxyPanelProps = {
  status: ApiProxyStatus;
  cloudflaredStatus: CloudflaredStatus;
  accountCount: number;
  autoStartEnabled: boolean;
  savingSettings: boolean;
  starting: boolean;
  stopping: boolean;
  refreshingApiKey: boolean;
  installingCloudflared: boolean;
  startingCloudflared: boolean;
  stoppingCloudflared: boolean;
  onStart: (port: number | null) => void;
  onStop: () => void;
  onRefreshApiKey: () => void;
  onRefresh: () => void;
  onToggleAutoStart: (enabled: boolean) => void;
  onRefreshCloudflared: () => void;
  onInstallCloudflared: () => void;
  onStartCloudflared: (input: StartCloudflaredTunnelInput) => void;
  onStopCloudflared: () => void;
};

function copyText(value: string | null) {
  if (!value) {
    return;
  }
  void navigator.clipboard?.writeText(value).catch(() => {});
}

export function ApiProxyPanel({
  status,
  cloudflaredStatus,
  accountCount,
  autoStartEnabled,
  savingSettings,
  starting,
  stopping,
  refreshingApiKey,
  installingCloudflared,
  startingCloudflared,
  stoppingCloudflared,
  onStart,
  onStop,
  onRefreshApiKey,
  onRefresh,
  onToggleAutoStart,
  onRefreshCloudflared,
  onInstallCloudflared,
  onStartCloudflared,
  onStopCloudflared,
}: ApiProxyPanelProps) {
  const { copy, locale } = useI18n();
  const proxyCopy = copy.apiProxy;
  const labelSeparator = locale === "zh-CN" || locale === "ja-JP" ? "：" : ": ";
  const busy = starting || stopping;
  const cloudflaredBusy = installingCloudflared || startingCloudflared || stoppingCloudflared;
  const [portInput, setPortInput] = useState(DEFAULT_PROXY_PORT);
  const [publicAccessEnabled, setPublicAccessEnabled] = useState(cloudflaredStatus.running);
  const [tunnelMode, setTunnelMode] = useState<CloudflaredTunnelMode>(
    cloudflaredStatus.tunnelMode ?? "quick",
  );
  const [useHttp2, setUseHttp2] = useState(cloudflaredStatus.useHttp2);
  const [namedInput, setNamedInput] = useState({
    apiToken: "",
    accountId: "",
    zoneId: "",
    hostname: cloudflaredStatus.customHostname ?? "",
  });
  const cloudflaredEnabled = publicAccessEnabled || cloudflaredStatus.running;

  const rawPort = portInput.trim();
  const effectivePort = !rawPort
    ? 8787
    : Number.isInteger(Number(rawPort)) && Number(rawPort) >= 1 && Number(rawPort) <= 65535
      ? Number(rawPort)
      : null;

  const namedReady =
    namedInput.apiToken.trim() !== "" &&
    namedInput.accountId.trim() !== "" &&
    namedInput.zoneId.trim() !== "" &&
    namedInput.hostname.trim() !== "";

  const canStartCloudflared =
    status.running &&
    status.port !== null &&
    cloudflaredStatus.installed &&
    !cloudflaredBusy &&
    (tunnelMode === "quick" || namedReady);

  const cloudflaredInput: StartCloudflaredTunnelInput | null =
    status.port === null
      ? null
      : {
          apiProxyPort: status.port,
          useHttp2,
          mode: tunnelMode,
          named:
            tunnelMode === "named"
              ? {
                  apiToken: namedInput.apiToken.trim(),
                  accountId: namedInput.accountId.trim(),
                  zoneId: namedInput.zoneId.trim(),
                  hostname: namedInput.hostname.trim(),
                }
              : null,
        };

  return (
    <section className="proxyPage">
      <div className="proxyHero">
        <div>
          <p className="proxyKicker">{proxyCopy.kicker}</p>
          <h2>{proxyCopy.title}</h2>
          <div className="proxyHeroBody proxyHeroStats">
            <span className="proxyHeroStat">
              <span className={`proxyStatusDot${status.running ? " isRunning" : ""}`} aria-hidden="true" />
              {proxyCopy.statusLabel}
              {labelSeparator}
              <strong>{status.running ? proxyCopy.statusRunning : proxyCopy.statusStopped}</strong>
            </span>
            <span className="proxyHeroStat">
              {proxyCopy.portLabel}
              {labelSeparator}
              <strong>{status.port ?? "--"}</strong>
            </span>
            <span className="proxyHeroStat">
              {proxyCopy.accountCountLabel}
              {labelSeparator}
              <strong>{accountCount}</strong>
            </span>
          </div>
        </div>
        <div className="proxyHeroControlGroup">
          <div className="proxyHeroActions">
            <label className="proxyPortField">
              <input
                className="proxyPortInput"
                inputMode="numeric"
                aria-label={proxyCopy.portInputAriaLabel}
                placeholder={DEFAULT_PROXY_PORT}
                value={portInput}
                onChange={(event) => setPortInput(event.target.value)}
                disabled={busy || status.running}
              />
            </label>
            <button className="ghost" onClick={onRefresh} disabled={busy}>
              {proxyCopy.refreshStatus}
            </button>
            {status.running ? (
              <button className="danger" onClick={onStop} disabled={busy}>
                {stopping ? proxyCopy.stopping : proxyCopy.stop}
              </button>
            ) : (
              <button
                className="primary"
                onClick={() => onStart(effectivePort)}
                disabled={busy || accountCount === 0 || effectivePort === null}
              >
                {starting ? proxyCopy.starting : proxyCopy.start}
              </button>
            )}
          </div>
          <div className="proxyAutoStartRow">
            <span className="proxyAutoStartLabel">{proxyCopy.defaultStartLabel}</span>
            <label className="themeSwitch" aria-label={proxyCopy.defaultStartLabel}>
              <input
                type="checkbox"
                checked={autoStartEnabled}
                disabled={savingSettings}
                onChange={(event) => onToggleAutoStart(event.target.checked)}
              />
              <span className="themeSwitchTrack" aria-hidden="true">
                <span className="themeSwitchThumb" />
              </span>
              <span className="themeSwitchText">
                {autoStartEnabled
                  ? proxyCopy.defaultStartEnabled
                  : proxyCopy.defaultStartDisabled}
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="proxyDetailGrid">
        <article className="proxyDetailCard">
          <div className="proxyDetailHeader">
            <span className="proxyLabel">{proxyCopy.baseUrlLabel}</span>
            <button className="ghost proxyCopyButton" onClick={() => copyText(status.baseUrl)} disabled={!status.baseUrl}>
              {proxyCopy.copy}
            </button>
          </div>
          <code>{status.baseUrl ?? proxyCopy.baseUrlPlaceholder}</code>
        </article>

        <article className="proxyDetailCard">
          <div className="proxyDetailHeader">
            <span className="proxyLabel">{proxyCopy.apiKeyLabel}</span>
            <div className="proxyDetailActions">
              <button
                className="ghost proxyCopyButton"
                onClick={onRefreshApiKey}
                disabled={refreshingApiKey}
              >
                {refreshingApiKey ? proxyCopy.refreshingKey : proxyCopy.refreshKey}
              </button>
              <button className="ghost proxyCopyButton" onClick={() => copyText(status.apiKey)} disabled={!status.apiKey}>
                {proxyCopy.copy}
              </button>
            </div>
          </div>
          <code>{status.apiKey ?? proxyCopy.apiKeyPlaceholder}</code>
        </article>

        <article className="proxyDetailCard">
          <span className="proxyLabel">{proxyCopy.activeAccountLabel}</span>
          <strong>{status.activeAccountLabel ?? proxyCopy.activeAccountEmptyTitle}</strong>
          <p>{status.activeAccountId ?? proxyCopy.activeAccountEmptyDescription}</p>
        </article>

        <article className="proxyDetailCard">
          <span className="proxyLabel">{proxyCopy.lastErrorLabel}</span>
          <p className="proxyErrorText">{status.lastError ?? proxyCopy.none}</p>
        </article>
      </div>

      <section className="cloudflaredSection">
        <div className="cloudflaredHeader">
          <div>
            <p className="proxyKicker">{proxyCopy.cloudflaredKicker}</p>
            <h3>{proxyCopy.cloudflaredTitle}</h3>
            <p className="cloudflaredBody">{proxyCopy.cloudflaredDescription}</p>
          </div>
          <label className="cloudflaredToggle">
            <input
              type="checkbox"
              checked={publicAccessEnabled}
              onChange={(event) => setPublicAccessEnabled(event.target.checked)}
            />
            <span>{proxyCopy.cloudflaredToggle}</span>
          </label>
        </div>

        {cloudflaredEnabled ? (
          <div className="cloudflaredContent">
            {!status.running ? (
              <article className="cloudflaredCallout">
                <strong>{proxyCopy.startLocalProxyFirstTitle}</strong>
                <p>{proxyCopy.startLocalProxyFirstDescription}</p>
              </article>
            ) : null}

            {!cloudflaredStatus.installed ? (
              <article className="cloudflaredInstallCard">
                <div>
                  <span className="proxyLabel">{proxyCopy.notInstalledLabel}</span>
                  <strong>{proxyCopy.installTitle}</strong>
                  <p>{proxyCopy.installDescription}</p>
                </div>
                <button className="primary" onClick={onInstallCloudflared} disabled={installingCloudflared}>
                  {installingCloudflared ? proxyCopy.installing : proxyCopy.installButton}
                </button>
              </article>
            ) : (
              <>
                <div className="cloudflaredModeGrid">
                  <button
                    className={`cloudflaredModeCard${tunnelMode === "quick" ? " isActive" : ""}`}
                    onClick={() => setTunnelMode("quick")}
                    disabled={cloudflaredBusy || cloudflaredStatus.running}
                  >
                    <span className="proxyLabel">{proxyCopy.quickModeLabel}</span>
                    <strong>{proxyCopy.quickModeTitle}</strong>
                    <p>{proxyCopy.quickModeDescription}</p>
                  </button>
                  <button
                    className={`cloudflaredModeCard${tunnelMode === "named" ? " isActive" : ""}`}
                    onClick={() => setTunnelMode("named")}
                    disabled={cloudflaredBusy || cloudflaredStatus.running}
                  >
                    <span className="proxyLabel">{proxyCopy.namedModeLabel}</span>
                    <strong>{proxyCopy.namedModeTitle}</strong>
                    <p>{proxyCopy.namedModeDescription}</p>
                  </button>
                </div>

                {tunnelMode === "quick" ? (
                  <article className="cloudflaredCallout">
                    <strong>{proxyCopy.quickNoteTitle}</strong>
                    <p>{proxyCopy.quickNoteBody}</p>
                  </article>
                ) : null}

                {tunnelMode === "named" ? (
                  <div className="cloudflaredFormGrid">
                    <label className="cloudflaredInputField">
                      <span>{proxyCopy.apiTokenLabel}</span>
                      <input
                        type="password"
                        value={namedInput.apiToken}
                        onChange={(event) =>
                          setNamedInput((current) => ({ ...current, apiToken: event.target.value }))
                        }
                        placeholder={proxyCopy.apiTokenPlaceholder}
                        disabled={cloudflaredBusy || cloudflaredStatus.running}
                      />
                    </label>
                    <label className="cloudflaredInputField">
                      <span>{proxyCopy.accountIdLabel}</span>
                      <input
                        value={namedInput.accountId}
                        onChange={(event) =>
                          setNamedInput((current) => ({ ...current, accountId: event.target.value }))
                        }
                        placeholder={proxyCopy.accountIdPlaceholder}
                        disabled={cloudflaredBusy || cloudflaredStatus.running}
                      />
                    </label>
                    <label className="cloudflaredInputField">
                      <span>{proxyCopy.zoneIdLabel}</span>
                      <input
                        value={namedInput.zoneId}
                        onChange={(event) =>
                          setNamedInput((current) => ({ ...current, zoneId: event.target.value }))
                        }
                        placeholder={proxyCopy.zoneIdPlaceholder}
                        disabled={cloudflaredBusy || cloudflaredStatus.running}
                      />
                    </label>
                    <label className="cloudflaredInputField">
                      <span>{proxyCopy.hostnameLabel}</span>
                      <input
                        value={namedInput.hostname}
                        onChange={(event) =>
                          setNamedInput((current) => ({ ...current, hostname: event.target.value }))
                        }
                        placeholder={proxyCopy.hostnamePlaceholder}
                        disabled={cloudflaredBusy || cloudflaredStatus.running}
                      />
                    </label>
                  </div>
                ) : null}

                <div className="cloudflaredToolbar">
                  <label className="cloudflaredCheckbox">
                    <input
                      type="checkbox"
                      checked={useHttp2}
                      onChange={(event) => setUseHttp2(event.target.checked)}
                      disabled={cloudflaredBusy || cloudflaredStatus.running}
                    />
                    <span>{proxyCopy.useHttp2}</span>
                  </label>
                  <div className="cloudflaredToolbarActions">
                    <button className="ghost" onClick={onRefreshCloudflared} disabled={cloudflaredBusy}>
                      {proxyCopy.refreshPublicStatus}
                    </button>
                    {cloudflaredStatus.running ? (
                      <button className="danger" onClick={onStopCloudflared} disabled={cloudflaredBusy}>
                        {stoppingCloudflared ? proxyCopy.stoppingPublic : proxyCopy.stopPublic}
                      </button>
                    ) : (
                      <button
                        className="primary"
                        onClick={() => {
                          if (cloudflaredInput) {
                            onStartCloudflared(cloudflaredInput);
                          }
                        }}
                        disabled={!canStartCloudflared || cloudflaredInput === null}
                      >
                        {startingCloudflared ? proxyCopy.startingPublic : proxyCopy.startPublic}
                      </button>
                    )}
                  </div>
                </div>

                <div className="proxyDetailGrid">
                  <article className="proxyDetailCard">
                    <span className="proxyLabel">{proxyCopy.publicStatusLabel}</span>
                    <strong className={`proxyStatus${cloudflaredStatus.running ? " isRunning" : ""}`}>
                      {cloudflaredStatus.running ? proxyCopy.publicStatusRunning : proxyCopy.publicStatusStopped}
                    </strong>
                    <p>
                      {cloudflaredStatus.running
                        ? proxyCopy.publicStatusRunningDescription
                        : proxyCopy.publicStatusStoppedDescription}
                    </p>
                  </article>

                  <article className="proxyDetailCard">
                    <div className="proxyDetailHeader">
                      <span className="proxyLabel">{proxyCopy.publicUrlLabel}</span>
                      <button
                        className="ghost proxyCopyButton"
                        onClick={() => copyText(cloudflaredStatus.publicUrl)}
                        disabled={!cloudflaredStatus.publicUrl}
                      >
                        {proxyCopy.copy}
                      </button>
                    </div>
                    <code>{cloudflaredStatus.publicUrl ?? proxyCopy.baseUrlPlaceholder}</code>
                  </article>

                  <article className="proxyDetailCard">
                    <span className="proxyLabel">{proxyCopy.installPathLabel}</span>
                    <code>{cloudflaredStatus.binaryPath ?? proxyCopy.notDetected}</code>
                  </article>

                  <article className="proxyDetailCard">
                    <span className="proxyLabel">{proxyCopy.lastErrorLabel}</span>
                    <p className="proxyErrorText">{cloudflaredStatus.lastError ?? proxyCopy.none}</p>
                  </article>
                </div>
              </>
            )}
          </div>
        ) : null}
      </section>
    </section>
  );
}
