using System.Text.Json;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.Web.WebView2.Core;
using ZAdmin.WebView.Core;
using ZAdmin.WebView.Core.Generated;

namespace ZAdmin.WebView.Windows;

public sealed class WebViewHost : IAsyncDisposable
{
    private const int MaxDesktopEvidenceItems = 256;

    private static DesktopEvidenceItem[] MergeDesktopEvidence(
        DesktopEvidenceItem[] initial,
        DesktopEvidenceItem[] current)
    {
        if (initial is null || current is null) throw new InvalidOperationException("Desktop evidence collection is null.");
        var merged = new List<DesktopEvidenceItem>(initial.Length + current.Length);
        var names = new Dictionary<string, string>(StringComparer.Ordinal);
        var markers = new HashSet<string>(StringComparer.Ordinal);
        foreach (var item in initial.Concat(current))
        {
            if (item is null || string.IsNullOrWhiteSpace(item.Name) || string.IsNullOrWhiteSpace(item.Marker))
                throw new InvalidOperationException("Desktop evidence component name/marker is empty.");
            if (names.TryGetValue(item.Name, out var existingMarker))
            {
                if (!StringComparer.Ordinal.Equals(existingMarker, item.Marker))
                    throw new InvalidOperationException($"Desktop evidence name has conflicting markers: {item.Name}.");
                continue; // initial persistent snapshot owns a component name
            }
            if (!item.Present) throw new InvalidOperationException($"Desktop evidence component is not present: {item.Name}.");
            if (!markers.Add(item.Marker)) throw new InvalidOperationException($"Desktop evidence marker is duplicated: {item.Marker}.");
            names.Add(item.Name, item.Marker);
            merged.Add(item);
            if (merged.Count > MaxDesktopEvidenceItems) throw new InvalidOperationException($"Desktop evidence component count exceeds {MaxDesktopEvidenceItems}.");
        }
        return merged.ToArray();
    }

    private sealed class DesktopEvidencePage
    {
        public string? Origin { get; set; }
        public string? Title { get; set; }
        public string? BodyText { get; set; }
        public bool HasBridge { get; set; }
        public bool ViteClient { get; set; }
        public string[] Errors { get; set; } = [];
        public DesktopEvidenceItem[]? DesktopEvidence { get; set; }
        public string? StatusBefore { get; set; }
        public int ComponentActionRunsBefore { get; set; }
    }

    private sealed class DesktopEvidenceItem
    {
        public string? Name { get; set; }
        public string? Marker { get; set; }
        public bool Present { get; set; }
        public JsonElement Native { get; set; }
    }

    private sealed class DesktopFormInteractionEvidence
    {
        public bool Ready { get; set; }
        public string? InputValue { get; set; }
        public bool InputLabelled { get; set; }
        public bool InputDescriptionResolved { get; set; }
        public bool CheckboxChecked { get; set; }
        public string? CheckboxState { get; set; }
        public bool CheckboxLabelled { get; set; }
        public bool FieldDirty { get; set; }
        public bool FieldTouched { get; set; }
        public bool FormSubmitted { get; set; }
        public int SubmitCount { get; set; }
        public string? FormDataEmail { get; set; }
        public string? FormDataEnabled { get; set; }
    }

    private sealed class DesktopChoiceInteractionEvidence
    {
        public bool Ready { get; set; }
        public bool SwitchChecked { get; set; }
        public string? SwitchState { get; set; }
        public string? SwitchAriaChecked { get; set; }
        public bool SwitchLabelled { get; set; }
        public string? SwitchFormData { get; set; }
        public string? RadioValue { get; set; }
        public bool AdvancedChecked { get; set; }
        public string? AdvancedState { get; set; }
        public string? AdvancedAriaChecked { get; set; }
        public bool AdvancedFocused { get; set; }
        public bool DisabledSkipped { get; set; }
    }

    private sealed class DesktopSelectOpenEvidence
    {
        public bool Ready { get; set; }
        public bool Expanded { get; set; }
        public bool ControlsResolved { get; set; }
        public string? PopupRole { get; set; }
        public bool ActiveDescendantResolved { get; set; }
        public bool DisabledSkipped { get; set; }
        public bool PopupFocused { get; set; }
    }

    private sealed class DesktopSelectClosedEvidence
    {
        public bool Ready { get; set; }
        public bool Expanded { get; set; }
        public bool FocusRestored { get; set; }
        public string? FormDataValue { get; set; }
    }

    private sealed class DesktopDialogOpenEvidence
    {
        public bool Ready { get; set; }
        public bool Expanded { get; set; }
        public bool ControlsResolved { get; set; }
        public string? ContentRole { get; set; }
        public bool Modal { get; set; }
        public bool LabelledByResolved { get; set; }
        public bool DescribedByResolved { get; set; }
        public bool ContentFocused { get; set; }
        public bool InertApplied { get; set; }
        public bool ScrollLockApplied { get; set; }
        public bool ReducedMotionObserved { get; set; }
    }

    private sealed class DesktopDialogClosedEvidence
    {
        public bool Ready { get; set; }
        public bool Expanded { get; set; }
        public string? TriggerState { get; set; }
        public bool FocusRestored { get; set; }
        public bool InertReleased { get; set; }
        public bool ScrollLockReleased { get; set; }
        public bool PresenceCleaned { get; set; }
    }

    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);
    private const string CaptureDesktopEvidenceScript = """
        (() => {
          const collect = (node) => {
            const name = node.getAttribute('data-desktop-component');
            const marker = node.getAttribute('data-desktop-evidence');
            return {
              name,
              marker,
              present: node !== null,
              native: {
                tag: node?.tagName ?? null,
                type: node?.getAttribute('type') ?? null,
                disabled: node?.hasAttribute('disabled') ?? false,
                text: node?.textContent?.trim() ?? '',
                ariaLive: node?.getAttribute('aria-live') ?? null,
                role: node?.getAttribute('role') ?? null,
                name: node?.getAttribute('name') ?? null,
                value: node?.value ?? null,
                checked: node?.checked ?? false,
                required: node?.required ?? false,
                readOnly: node?.readOnly ?? false,
                noValidate: node?.noValidate ?? false,
                ariaInvalid: node?.getAttribute('aria-invalid') ?? null,
                ariaDescribedBy: node?.getAttribute('aria-describedby') ?? null,
                ariaChecked: node?.getAttribute('aria-checked') ?? null,
                ariaOrientation: node?.getAttribute('aria-orientation') ?? null,
                ariaExpanded: node?.getAttribute('aria-expanded') ?? null,
                ariaControls: node?.getAttribute('aria-controls') ?? null,
                ariaControlsPresent: Boolean(node?.getAttribute('aria-controls')),
                ariaHasPopup: node?.getAttribute('aria-haspopup') ?? null,
                ariaHidden: node?.getAttribute('aria-hidden') ?? null,
                ariaModal: node?.getAttribute('aria-modal') ?? null,
                ariaLabelledByPresent: Boolean(node?.getAttribute('aria-labelledby')),
                ariaDescribedByPresent: Boolean(node?.getAttribute('aria-describedby')),
                ariaActiveDescendant: node?.getAttribute('aria-activedescendant') ?? null,
                ariaActiveDescendantPresent: Boolean(node?.getAttribute('aria-activedescendant')),
                ariaSelected: node?.getAttribute('aria-selected') ?? null,
                idPresent: Boolean(node?.id),
                tabIndex: node?.tabIndex ?? null,
                dataState: node?.getAttribute('data-state') ?? null,
                dataPresence: node?.getAttribute('data-presence') ?? null,
                dataReducedMotion: node?.getAttribute('data-reduced-motion') ?? null,
                dataHighlighted: node?.getAttribute('data-highlighted') ?? null,
                dataDisabled: node?.getAttribute('data-disabled') ?? null
              }
            };
          };
          const collector = () => [...document.querySelectorAll(
                '[data-desktop-component][data-desktop-evidence]'
              )].map(collect);
          globalThis.__ZADMIN_DESKTOP_COMPONENT_COLLECTOR__ = collector;
          const componentAction = document.querySelector(
            '[data-desktop-evidence="ZButton-component-action"]'
          );
          return JSON.stringify({
            origin: location.origin,
            title: document.title,
            bodyText: document.body?.innerText?.slice(0, 1000) ?? '',
            hasBridge: Boolean(globalThis.chrome?.webview),
            viteClient:
              [...document.scripts].some((script) => script.src.includes('/@vite/client')) ||
              performance
                .getEntriesByType('resource')
                .some((entry) => entry.name.includes('/@vite/client')),
            errors: globalThis.__ZADMIN_WEBVIEW_ERRORS__ ?? [],
            desktopEvidence: collector(),
            statusBefore:
              document.querySelector('[data-desktop-evidence="ZBox-status"]')?.innerText ?? '',
            componentActionRunsBefore: Number(
              componentAction?.getAttribute('data-desktop-evidence-runs') ?? '0'
            )
          });
        })()
        """;
    private const string CaptureCurrentDesktopEvidenceScript =
        "JSON.stringify(globalThis.__ZADMIN_DESKTOP_COMPONENT_COLLECTOR__?.() ?? [])";
    private const string ClickComponentEvidenceScript =
        "document.querySelector('[data-desktop-evidence=\"ZButton-component-action\"]')?.click()";
    private const string ReadComponentEvidenceRunsScript =
        "Number(document.querySelector('[data-desktop-evidence=\"ZButton-component-action\"]')?.getAttribute('data-desktop-evidence-runs')??'0')";
    private const string ReadStatusScript =
        "JSON.stringify(document.querySelector('[data-desktop-evidence=\"ZBox-status\"]')?.innerText??'')";
    private const string RunFormEvidenceScript = """
        (() => {
          const form = document.querySelector('[data-desktop-evidence="ZForm-contract"]');
          const input = document.querySelector('[data-desktop-evidence="ZInput-email"]');
          const checkbox = document.querySelector('[data-desktop-evidence="ZCheckbox-enabled"]');
          if (!(form instanceof HTMLFormElement) || !(input instanceof HTMLInputElement) ||
              !(checkbox instanceof HTMLInputElement)) return false;
          input.focus();
          input.value = 'desktop-value';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.blur();
          checkbox.click();
          form.requestSubmit();
          return true;
        })()
        """;
    private const string ReadFormEvidenceScript = """
        (() => {
          const form = document.querySelector('[data-desktop-evidence="ZForm-contract"]');
          const field = document.querySelector('[data-desktop-evidence="ZFormField-email"]');
          const input = document.querySelector('[data-desktop-evidence="ZInput-email"]');
          const checkbox = document.querySelector('[data-desktop-evidence="ZCheckbox-enabled"]');
          const data = form instanceof HTMLFormElement ? new FormData(form) : null;
          const describedBy = input?.getAttribute('aria-describedby')?.split(/\s+/u).filter(Boolean) ?? [];
          const result = {
            inputValue: input instanceof HTMLInputElement ? input.value : null,
            inputLabelled:
              input instanceof HTMLInputElement &&
              input.id.length > 0 &&
              [...(input.labels ?? [])].some((label) => label.htmlFor === input.id),
            inputDescriptionResolved:
              describedBy.length > 0 && describedBy.every((id) => document.getElementById(id) !== null),
            checkboxChecked: checkbox instanceof HTMLInputElement && checkbox.checked,
            checkboxState: checkbox?.getAttribute('data-state') ?? null,
            checkboxLabelled:
              checkbox instanceof HTMLInputElement && (checkbox.labels?.length ?? 0) > 0,
            fieldDirty: field?.getAttribute('data-dirty') === 'true',
            fieldTouched: field?.getAttribute('data-touched') === 'true',
            formSubmitted: form?.getAttribute('data-submitted') === 'true',
            submitCount: Number(form?.getAttribute('data-desktop-submit-count') ?? '0'),
            formDataEmail: data?.get('email') ?? null,
            formDataEnabled: data?.get('enabled') ?? null
          };
          return JSON.stringify({
            ...result,
            ready:
              result.inputValue === 'desktop-value' &&
              result.inputLabelled &&
              result.inputDescriptionResolved &&
              result.checkboxChecked &&
              result.checkboxState === 'checked' &&
              result.checkboxLabelled &&
              result.fieldDirty &&
              result.fieldTouched &&
              result.formSubmitted &&
              result.submitCount === 1 &&
              result.formDataEmail === 'desktop-value' &&
              result.formDataEnabled === 'enabled'
          });
        })()
        """;
    private const string RunChoiceEvidenceScript = """
        (() => {
          const switchControl = document.querySelector('[data-desktop-evidence="ZSwitch-enabled"]');
          const group = document.querySelector('[data-desktop-evidence="ZRadioGroup-mode"]');
          const standard = group?.querySelector('input[type="radio"][value="standard"]');
          if (!(switchControl instanceof HTMLInputElement) ||
              !(group instanceof HTMLElement) ||
              !(standard instanceof HTMLInputElement)) return false;
          switchControl.click();
          standard.focus();
          standard.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
          return true;
        })()
        """;
    private const string ReadChoiceEvidenceScript = """
        (() => {
          const form = document.querySelector('[data-desktop-evidence="ZForm-contract"]');
          const switchControl = document.querySelector('[data-desktop-evidence="ZSwitch-enabled"]');
          const group = document.querySelector('[data-desktop-evidence="ZRadioGroup-mode"]');
          const disabled = group?.querySelector('input[type="radio"][value="disabled"]');
          const advanced = document.querySelector(
            '[data-desktop-evidence="ZRadioGroupItem-advanced"]'
          );
          const data = form instanceof HTMLFormElement ? new FormData(form) : null;
          const result = {
            switchChecked: switchControl instanceof HTMLInputElement && switchControl.checked,
            switchState: switchControl?.getAttribute('data-state') ?? null,
            switchAriaChecked: switchControl?.getAttribute('aria-checked') ?? null,
            switchLabelled:
              switchControl instanceof HTMLInputElement && (switchControl.labels?.length ?? 0) > 0,
            switchFormData: data?.get('switchEnabled') ?? null,
            radioValue: data?.get('mode') ?? null,
            advancedChecked: advanced instanceof HTMLInputElement && advanced.checked,
            advancedState: advanced?.getAttribute('data-state') ?? null,
            advancedAriaChecked: advanced?.getAttribute('aria-checked') ?? null,
            advancedFocused: document.activeElement === advanced,
            disabledSkipped: disabled instanceof HTMLInputElement && !disabled.checked
          };
          return JSON.stringify({
            ...result,
            ready:
              result.switchChecked &&
              result.switchState === 'checked' &&
              result.switchAriaChecked === 'true' &&
              result.switchLabelled &&
              result.switchFormData === 'enabled' &&
              result.radioValue === 'advanced' &&
              result.advancedChecked &&
              result.advancedState === 'checked' &&
              result.advancedAriaChecked === 'true' &&
              result.advancedFocused &&
              result.disabledSkipped
          });
        })()
        """;
    private const string OpenSelectEvidenceScript = """
        (() => {
          const trigger = document.querySelector(
            '[data-desktop-evidence="ZSelectTrigger-country"]'
          );
          if (!(trigger instanceof HTMLButtonElement) ||
              trigger.getAttribute('aria-expanded') !== 'false') return false;
          trigger.click();
          return true;
        })()
        """;
    private const string ReadSelectOpenEvidenceScript = """
        (() => {
          const trigger = document.querySelector(
            '[data-desktop-evidence="ZSelectTrigger-country"]'
          );
          const controls = trigger?.getAttribute('aria-controls');
          const popup = controls ? document.getElementById(controls) : null;
          const activeId = popup?.getAttribute('aria-activedescendant');
          const active = activeId ? document.getElementById(activeId) : null;
          const disabled = popup?.querySelector('[data-desktop-option="disabled"]');
          const country = popup?.querySelector('[data-desktop-option="cn"]');
          const result = {
            expanded: trigger?.getAttribute('aria-expanded') === 'true',
            controlsResolved: Boolean(controls && popup && popup.id === controls),
            popupRole: popup?.getAttribute('role') ?? null,
            activeDescendantResolved: Boolean(activeId && active === country),
            disabledSkipped:
              disabled?.getAttribute('data-highlighted') !== 'true' &&
              country?.getAttribute('data-highlighted') === 'true',
            popupFocused: document.activeElement === popup
          };
          return JSON.stringify({
            ...result,
            ready:
              result.expanded &&
              result.controlsResolved &&
              result.popupRole === 'listbox' &&
              result.activeDescendantResolved &&
              result.disabledSkipped &&
              result.popupFocused
          });
        })()
        """;
    private const string ChooseSelectEvidenceScript = """
        (() => {
          const trigger = document.querySelector(
            '[data-desktop-evidence="ZSelectTrigger-country"]'
          );
          const controls = trigger?.getAttribute('aria-controls');
          const popup = controls ? document.getElementById(controls) : null;
          if (!(popup instanceof HTMLElement)) return false;
          popup.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
          return true;
        })()
        """;
    private const string DismissSelectEvidenceScript = """
        (() => {
          const trigger = document.querySelector(
            '[data-desktop-evidence="ZSelectTrigger-country"]'
          );
          const controls = trigger?.getAttribute('aria-controls');
          const popup = controls ? document.getElementById(controls) : null;
          if (!(popup instanceof HTMLElement)) return false;
          popup.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
          return true;
        })()
        """;
    private const string ReadSelectClosedEvidenceScript = """
        (() => {
          const form = document.querySelector('[data-desktop-evidence="ZForm-contract"]');
          const trigger = document.querySelector(
            '[data-desktop-evidence="ZSelectTrigger-country"]'
          );
          const data = form instanceof HTMLFormElement ? new FormData(form) : null;
          const result = {
            expanded: trigger?.getAttribute('aria-expanded') === 'true',
            focusRestored: document.activeElement === trigger,
            formDataValue: data?.get('country') ?? null
          };
          return JSON.stringify({
            ...result,
            ready:
              !result.expanded &&
              result.focusRestored &&
              result.formDataValue === 'cn'
          });
        })()
        """;
    private const string OpenDialogEvidenceScript = """
        (() => {
          const trigger = document.querySelector(
            '[data-desktop-evidence="ZDialogTrigger-settings"]'
          );
          const background = document.querySelector(
            '[data-desktop-evidence="ZDialog-background-sibling"]'
          );
          const backgroundOwner = background
            ? [...document.body.children].find(
                (element) => element instanceof HTMLElement && element.contains(background)
              )
            : null;
          if (!(trigger instanceof HTMLButtonElement) ||
              !(backgroundOwner instanceof HTMLElement) ||
              trigger.getAttribute('aria-expanded') !== 'false') return false;
          globalThis.__ZADMIN_DIALOG_EVIDENCE__ = {
            backgroundOwner,
            backgroundInert: backgroundOwner.inert,
            backgroundAriaHidden: backgroundOwner.getAttribute('aria-hidden'),
            bodyOverflow: document.body.style.overflow,
            bodyPaddingInlineEnd: document.body.style.paddingInlineEnd
          };
          trigger.focus();
          trigger.click();
          return true;
        })()
        """;
    private const string ReadDialogOpenEvidenceScript = """
        (() => {
          const state = globalThis.__ZADMIN_DIALOG_EVIDENCE__;
          const trigger = document.querySelector(
            '[data-desktop-evidence="ZDialogTrigger-settings"]'
          );
          const controls = trigger?.getAttribute('aria-controls');
          const content = controls ? document.getElementById(controls) : null;
          const overlay = document.querySelector(
            '[data-desktop-evidence="ZDialogOverlay-settings"]'
          );
          const title = document.querySelector(
            '[data-desktop-evidence="ZDialogTitle-settings"]'
          );
          const description = document.querySelector(
            '[data-desktop-evidence="ZDialogDescription-settings"]'
          );
          const labelledBy = content?.getAttribute('aria-labelledby');
          const describedBy = content?.getAttribute('aria-describedby');
          const result = {
            expanded: trigger?.getAttribute('aria-expanded') === 'true',
            controlsResolved: Boolean(controls && content && content.id === controls),
            contentRole: content?.getAttribute('role') ?? null,
            modal: content?.getAttribute('aria-modal') === 'true',
            labelledByResolved: Boolean(
              labelledBy && title?.id === labelledBy && document.getElementById(labelledBy) === title
            ),
            describedByResolved: Boolean(
              describedBy && description?.id === describedBy &&
              document.getElementById(describedBy) === description
            ),
            contentFocused:
              content instanceof HTMLElement && content.contains(document.activeElement),
            inertApplied:
              state?.backgroundOwner instanceof HTMLElement &&
              state.backgroundOwner.inert &&
              state.backgroundOwner.getAttribute('aria-hidden') === 'true',
            scrollLockApplied: document.body.style.overflow === 'hidden',
            reducedMotionObserved:
              content?.getAttribute('data-reduced-motion') === 'true' &&
              overlay?.getAttribute('data-reduced-motion') === 'true'
          };
          return JSON.stringify({
            ...result,
            ready:
              result.expanded &&
              result.controlsResolved &&
              result.contentRole === 'dialog' &&
              result.modal &&
              result.labelledByResolved &&
              result.describedByResolved &&
              result.contentFocused &&
              result.inertApplied &&
              result.scrollLockApplied &&
              result.reducedMotionObserved
          });
        })()
        """;
    private const string RunDialogFocusEvidenceScript = """
        (() => {
          const trigger = document.querySelector(
            '[data-desktop-evidence="ZDialogTrigger-settings"]'
          );
          const controls = trigger?.getAttribute('aria-controls');
          const content = controls ? document.getElementById(controls) : null;
          const close = content?.querySelector(
            '[data-desktop-evidence="ZDialogClose-settings"]'
          );
          const sentinel = document.querySelector(
            '[data-desktop-evidence="ZDialog-focus-sentinel"]'
          );
          const state = globalThis.__ZADMIN_DIALOG_EVIDENCE__;
          if (!(content instanceof HTMLElement) ||
              !(close instanceof HTMLButtonElement) ||
              !(sentinel instanceof HTMLButtonElement) ||
              !(state?.backgroundOwner instanceof HTMLElement)) return false;
          close.focus();
          const initiallyContained = content.contains(document.activeElement);
          const forward = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Tab'
          });
          close.dispatchEvent(forward);
          const forwardTrapped = forward.defaultPrevented && content.contains(document.activeElement);
          const backward = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Tab',
            shiftKey: true
          });
          document.activeElement?.dispatchEvent(backward);
          const backwardTrapped = backward.defaultPrevented && content.contains(document.activeElement);
          state.backgroundOwner.inert = false;
          sentinel.focus();
          const outsideRedirected = content.contains(document.activeElement);
          state.backgroundOwner.inert = true;
          return initiallyContained && forwardTrapped && backwardTrapped && outsideRedirected;
        })()
        """;
    private const string DismissDialogEvidenceScript = """
        (() => {
          const trigger = document.querySelector(
            '[data-desktop-evidence="ZDialogTrigger-settings"]'
          );
          const controls = trigger?.getAttribute('aria-controls');
          const content = controls ? document.getElementById(controls) : null;
          if (!(content instanceof HTMLElement)) return false;
          content.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
          return true;
        })()
        """;
    private const string CloseDialogEvidenceScript = """
        (() => {
          const trigger = document.querySelector(
            '[data-desktop-evidence="ZDialogTrigger-settings"]'
          );
          const controls = trigger?.getAttribute('aria-controls');
          const content = controls ? document.getElementById(controls) : null;
          const close = content?.querySelector(
            '[data-desktop-evidence="ZDialogClose-settings"]'
          );
          if (!(close instanceof HTMLButtonElement)) return false;
          close.click();
          return true;
        })()
        """;
    private const string ReadDialogClosedEvidenceScript = """
        (() => {
          const state = globalThis.__ZADMIN_DIALOG_EVIDENCE__;
          const trigger = document.querySelector(
            '[data-desktop-evidence="ZDialogTrigger-settings"]'
          );
          const result = {
            expanded: trigger?.getAttribute('aria-expanded') === 'true',
            triggerState: trigger?.getAttribute('data-state') ?? null,
            focusRestored: document.activeElement === trigger,
            inertReleased:
              state?.backgroundOwner instanceof HTMLElement &&
              state.backgroundOwner.inert === state.backgroundInert &&
              state.backgroundOwner.getAttribute('aria-hidden') === state.backgroundAriaHidden,
            scrollLockReleased:
              document.body.style.overflow === state?.bodyOverflow &&
              document.body.style.paddingInlineEnd === state?.bodyPaddingInlineEnd,
            presenceCleaned:
              document.querySelector('[data-desktop-evidence="ZDialogContent-settings"]') === null &&
              document.querySelector('[data-desktop-evidence="ZDialogOverlay-settings"]') === null
          };
          return JSON.stringify({
            ...result,
            ready:
              !result.expanded &&
              result.triggerState === 'closed' &&
              result.focusRestored &&
              result.inertReleased &&
              result.scrollLockReleased &&
              result.presenceCleaned
          });
        })()
        """;
    private readonly HostOptions _options;
    private readonly WebView2 _webview;
    private readonly Microsoft.UI.Xaml.Window _window;
    private CoreWebView2Environment? _environment;
    private string? _webViewVersion;
    private StaticAssetServer? _assets;
    private WebViewDispatcher? _dispatcher;
    private WindowsCommandModule? _commands;
    private int _recoveryAttempts;
    private int _smokeNavigationGeneration;
    private TaskCompletionSource<bool>? _smokeResponse;

    public WebViewHost(Microsoft.UI.Xaml.Window window, WebView2 webview, HostOptions options)
    {
        _window = window;
        _webview = webview;
        _options = options;
        var appData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "ZAdmin");
        Window = new WindowService(window, Path.Combine(appData, "window-state.json"));
        Window.Changed += OnWindowChanged;
    }

    public WindowService Window { get; }

    public async Task InitializeAsync()
    {
        if (_options.SmokeReportPath is { } smokeReport)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(smokeReport)!);
            await WriteSmokeReportAsync(smokeReport, JsonSerializer.Serialize(new { phase = "initializing" }));
        }
        var version = CoreWebView2Environment.GetAvailableBrowserVersionString();
        _webViewVersion = version;
        await WriteSmokePhaseAsync("runtime-detected");
        var userData = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "ZAdmin",
            "WebView2");
        Directory.CreateDirectory(userData);
        _environment = await CoreWebView2Environment.CreateWithOptionsAsync(
            null,
            userData,
            new CoreWebView2EnvironmentOptions());
        await WriteSmokePhaseAsync("environment-created");
        await _webview.EnsureCoreWebView2Async(_environment);
        await WriteSmokePhaseAsync("webview-ready");
        var core = _webview.CoreWebView2;
        core.Settings.AreDefaultContextMenusEnabled = _options.Development;
        core.Settings.AreDevToolsEnabled = _options.Development;
        core.Settings.AreBrowserAcceleratorKeysEnabled = _options.Development;
        core.Settings.AreHostObjectsAllowed = false;
        core.Settings.IsStatusBarEnabled = false;
        core.Settings.IsWebMessageEnabled = true;
        await core.AddScriptToExecuteOnDocumentCreatedAsync(
            "Object.defineProperty(globalThis,'__ZADMIN_WEBVIEW_ERRORS__',{value:[],writable:false,configurable:false});" +
            "addEventListener('error',event=>__ZADMIN_WEBVIEW_ERRORS__.push(String(event.error?.message??event.message)));" +
            "addEventListener('unhandledrejection',event=>__ZADMIN_WEBVIEW_ERRORS__.push(String(event.reason?.message??event.reason)));" +
            "addEventListener('securitypolicyviolation',event=>__ZADMIN_WEBVIEW_ERRORS__.push(`CSP ${event.violatedDirective} ${event.blockedURI}`));"
        );
        await WriteSmokePhaseAsync("diagnostics-injected");

        if (_options.Development)
        {
            var origin = JsonSerializer.Serialize(_options.TrustedOrigin);
            await core.AddScriptToExecuteOnDocumentCreatedAsync(
                $"Object.defineProperty(globalThis,'__ZADMIN_WEBVIEW_TRUSTED_ORIGIN__',{{value:{origin},writable:false,configurable:false}});");
            await WriteSmokePhaseAsync("development-origin-injected");
        }
        else
        {
            if (!Directory.Exists(_options.AssetsRoot))
            {
                throw new DirectoryNotFoundException($"Web assets are missing: {_options.AssetsRoot}");
            }
            _assets = new StaticAssetServer(_options.AssetsRoot, _environment);
            core.AddWebResourceRequestedFilter(
                $"{WebViewSecurityPolicy.DefaultAppOrigin}/*",
                CoreWebView2WebResourceContext.All);
            core.WebResourceRequested += OnWebResourceRequested;
        }

        _dispatcher = new WebViewDispatcher(
            new WebViewSecurityPolicy(_options.TrustedOrigin, allowLoopbackHttp: _options.Development));
        _commands = new WindowsCommandModule(_window, Window, _options, version);
        _commands.Register(_dispatcher);
        await WriteSmokePhaseAsync("commands-registered");
        core.WebMessageReceived += OnWebMessageReceived;
        core.NavigationStarting += OnNavigationStarting;
        core.NewWindowRequested += OnNewWindowRequested;
        core.PermissionRequested += OnPermissionRequested;
        core.DownloadStarting += OnDownloadStarting;
        core.ProcessFailed += OnProcessFailed;
        core.DOMContentLoaded += OnDomContentLoaded;
        _webview.Source = _options.InitialUri;
        await WriteSmokePhaseAsync("navigation-started");
    }

    private async void OnWebMessageReceived(CoreWebView2 sender, CoreWebView2WebMessageReceivedEventArgs args)
    {
        if (_dispatcher is null) return;
        string message;
        try
        {
            message = args.TryGetWebMessageAsString();
        }
        catch (ArgumentException)
        {
            return;
        }

        var isSmokeRequest = IsSmokeRequest(message);
        var response = await _dispatcher.DispatchAsync(message, Origin(args.Source));
        if (response is not null) sender.PostWebMessageAsJson(response);
        if (isSmokeRequest) _smokeResponse?.TrySetResult(IsSuccessfulSmokeResponse(response));
    }

    private static bool IsSmokeRequest(string message)
    {
        try
        {
            using var document = JsonDocument.Parse(message);
            var root = document.RootElement;
            return root.TryGetProperty("v", out var version) && version.GetInt32() == WebViewProtocol.Version &&
                root.TryGetProperty("kind", out var kind) && kind.GetString() == "request" &&
                root.TryGetProperty("id", out var id) && id.GetString() == "smoke" &&
                root.TryGetProperty("method", out var method) && method.GetString() == WebViewProtocol.AppSnapshot;
        }
        catch (JsonException)
        {
            return false;
        }
    }

    private static bool IsSuccessfulSmokeResponse(string? response)
    {
        if (response is null) return false;
        try
        {
            var message = JsonSerializer.Deserialize<ProtocolResponse>(response, SerializerOptions);
            return message is not null &&
                message.Version == WebViewProtocol.Version &&
                message.Kind == "response" &&
                message.Id == "smoke" &&
                message.Ok;
        }
        catch (JsonException)
        {
            return false;
        }
    }

    private static async Task<T?> ExecuteJsonScriptAsync<T>(CoreWebView2 sender, string script)
        where T : class
    {
        var value = await sender.ExecuteScriptAsync(script);
        var json = JsonSerializer.Deserialize<string>(value) ?? "{}";
        return JsonSerializer.Deserialize<T>(json, SerializerOptions);
    }

    private static async Task<T> WaitForEvidenceAsync<T>(
        CoreWebView2 sender,
        string script,
        Func<T, bool> completed,
        string timeoutMessage)
        where T : class
    {
        for (var attempt = 0; attempt < 100; attempt++)
        {
            var evidence = await ExecuteJsonScriptAsync<T>(sender, script);
            if (evidence is not null && completed(evidence)) return evidence;
            await Task.Delay(100);
        }
        throw new TimeoutException(timeoutMessage);
    }

    private static async Task<DesktopEvidenceItem[]> CaptureCurrentDesktopEvidenceAsync(CoreWebView2 sender) =>
        await ExecuteJsonScriptAsync<DesktopEvidenceItem[]>(sender, CaptureCurrentDesktopEvidenceScript) ?? [];

    private void OnWebResourceRequested(CoreWebView2 sender, CoreWebView2WebResourceRequestedEventArgs args) =>
        _assets?.Handle(args);

    private void OnNavigationStarting(CoreWebView2 sender, CoreWebView2NavigationStartingEventArgs args)
    {
        if (!Uri.TryCreate(args.Uri, UriKind.Absolute, out var uri) ||
            !StringComparer.Ordinal.Equals(uri.GetLeftPart(UriPartial.Authority), _options.TrustedOrigin))
        {
            args.Cancel = true;
            return;
        }

        // Vite can replace the first document after dependency optimization. Mark the old smoke
        // handler stale as soon as navigation starts instead of waiting for the replacement DOM.
        if (_options.SmokeReportPath is not null)
            Interlocked.Increment(ref _smokeNavigationGeneration);
    }

    private static void OnNewWindowRequested(CoreWebView2 sender, CoreWebView2NewWindowRequestedEventArgs args) =>
        args.Handled = true;

    private static void OnPermissionRequested(CoreWebView2 sender, CoreWebView2PermissionRequestedEventArgs args) =>
        args.State = CoreWebView2PermissionState.Deny;

    private static void OnDownloadStarting(CoreWebView2 sender, CoreWebView2DownloadStartingEventArgs args) =>
        args.Cancel = true;

    private void OnProcessFailed(CoreWebView2 sender, CoreWebView2ProcessFailedEventArgs args)
    {
        if (_recoveryAttempts++ < 3) _webview.Reload();
    }

    private async void OnDomContentLoaded(CoreWebView2 sender, CoreWebView2DOMContentLoadedEventArgs args)
    {
        if (_options.SmokeReportPath is null) return;
        var generation = Volatile.Read(ref _smokeNavigationGeneration);
        // Vite may reload once after its first dependency optimization. Only the last quiet navigation
        // owns the smoke report so overlapping DOMContentLoaded handlers never race on the same file.
        await Task.Delay(750);
        if (generation != Volatile.Read(ref _smokeNavigationGeneration)) return;
        var closeWindow = true;
        var smokePhase = "waiting-for-hydration";
        DesktopEvidencePage? evidenceBefore = null;
        try
        {
            _smokeResponse = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
            // A non-empty body can still be Vite's transient pre-optimization document. Wait for
            // an explicit marker set from Svelte onMount, and let a replacement navigation own the report.
            var hydrated = false;
            for (var attempt = 0; attempt < 300; attempt++)
            {
                if (generation != Volatile.Read(ref _smokeNavigationGeneration))
                {
                    closeWindow = false;
                    return;
                }
                if (await sender.ExecuteScriptAsync(
                        "document.querySelector('[data-zadmin-webview-ready=\"true\"]')!==null") == "true")
                {
                    hydrated = true;
                    break;
                }
                await Task.Delay(100);
            }
            if (!hydrated) throw new TimeoutException("Development page did not reach its hydrated marker.");
            if (generation != Volatile.Read(ref _smokeNavigationGeneration))
            {
                closeWindow = false;
                return;
            }
            smokePhase = "capturing-components";
            var pageValue = await sender.ExecuteScriptAsync(
                CaptureDesktopEvidenceScript);
            var pageJson = JsonSerializer.Deserialize<string>(pageValue) ?? "{}";
            evidenceBefore = JsonSerializer.Deserialize<DesktopEvidencePage>(pageJson, SerializerOptions) ?? throw new InvalidOperationException("Desktop evidence page state is unreadable.");
            if (evidenceBefore.DesktopEvidence is null ||
                evidenceBefore.DesktopEvidence.Length == 0 ||
                evidenceBefore.DesktopEvidence.Length > MaxDesktopEvidenceItems ||
                evidenceBefore.DesktopEvidence.Any(item => !item.Present ||
                    string.IsNullOrWhiteSpace(item.Name) || string.IsNullOrWhiteSpace(item.Marker)) ||
                evidenceBefore.DesktopEvidence.Select(item => item.Name).Distinct(StringComparer.Ordinal).Count() != evidenceBefore.DesktopEvidence.Length ||
                evidenceBefore.DesktopEvidence.Select(item => item.Marker).Distinct(StringComparer.Ordinal).Count() != evidenceBefore.DesktopEvidence.Length)
                throw new InvalidOperationException("Desktop evidence markers are incomplete or not hydrated.");
            smokePhase = "validating-bridge-round-trip";
            var bridgeRequest = JsonSerializer.Serialize(
                new { v = WebViewProtocol.Version, kind = "request", id = "smoke", method = WebViewProtocol.AppSnapshot, @params = new { } },
                SerializerOptions);
            await sender.ExecuteScriptAsync(
                $"chrome.webview.postMessage({JsonSerializer.Serialize(bridgeRequest)})");
            var bridgeResponseValidated = await _smokeResponse.Task.WaitAsync(TimeSpan.FromSeconds(10));
            if (!bridgeResponseValidated)
                throw new InvalidOperationException("WebView bridge app.snapshot response was not successful.");
            smokePhase = "validating-component-interaction";
            await sender.ExecuteScriptAsync(ClickComponentEvidenceScript);
            var componentActionRunsAfter = evidenceBefore.ComponentActionRunsBefore;
            var expectedComponentActionRuns = evidenceBefore.ComponentActionRunsBefore + 1;
            for (var attempt = 0; attempt < 100; attempt++)
            {
                var actionValue = await sender.ExecuteScriptAsync(ReadComponentEvidenceRunsScript);
                if (int.TryParse(actionValue, out componentActionRunsAfter) && componentActionRunsAfter == expectedComponentActionRuns)
                {
                    break;
                }
                await Task.Delay(100);
            }
            if (componentActionRunsAfter != expectedComponentActionRuns)
                throw new TimeoutException("ZButton component evidence action did not update its observable state.");
            smokePhase = "validating-form-interaction";
            if (await sender.ExecuteScriptAsync(RunFormEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop form evidence controls are unavailable.");
            var formInteraction = await WaitForEvidenceAsync<DesktopFormInteractionEvidence>(
                sender,
                ReadFormEvidenceScript,
                evidence => evidence.Ready,
                "Desktop form components did not complete their observable interactions.");
            smokePhase = "validating-choice-interaction";
            if (await sender.ExecuteScriptAsync(RunChoiceEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop choice evidence controls are unavailable.");
            var choiceInteraction = await WaitForEvidenceAsync<DesktopChoiceInteractionEvidence>(
                sender,
                ReadChoiceEvidenceScript,
                evidence => evidence.Ready,
                "Desktop choice components did not complete their observable interactions.");
            smokePhase = "validating-select-open";
            if (await sender.ExecuteScriptAsync(OpenSelectEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Select trigger is unavailable or not closed.");
            var selectOpen = await WaitForEvidenceAsync<DesktopSelectOpenEvidence>(
                sender,
                ReadSelectOpenEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Select did not establish its listbox and active descendant.");
            evidenceBefore.DesktopEvidence = MergeDesktopEvidence(
                evidenceBefore.DesktopEvidence,
                await CaptureCurrentDesktopEvidenceAsync(sender));
            smokePhase = "validating-select-selection";
            if (await sender.ExecuteScriptAsync(ChooseSelectEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Select listbox is unavailable for selection.");
            var selectAfterSelection = await WaitForEvidenceAsync<DesktopSelectClosedEvidence>(
                sender,
                ReadSelectClosedEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Select did not commit FormData and restore trigger focus.");
            smokePhase = "validating-select-dismiss";
            if (await sender.ExecuteScriptAsync(OpenSelectEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Select trigger could not reopen.");
            _ = await WaitForEvidenceAsync<DesktopSelectOpenEvidence>(
                sender,
                ReadSelectOpenEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Select did not reopen its listbox.");
            if (await sender.ExecuteScriptAsync(DismissSelectEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Select listbox is unavailable for dismissal.");
            var selectAfterDismiss = await WaitForEvidenceAsync<DesktopSelectClosedEvidence>(
                sender,
                ReadSelectClosedEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Select Escape dismissal did not restore trigger focus.");
            var selectInteraction = new
            {
                ready = true,
                expandedBefore = false,
                expandedAfterOpen = selectOpen.Expanded,
                selectOpen.ControlsResolved,
                selectOpen.PopupRole,
                selectOpen.ActiveDescendantResolved,
                selectOpen.DisabledSkipped,
                selectOpen.PopupFocused,
                selectedValue = selectAfterSelection.FormDataValue,
                formDataValue = selectAfterSelection.FormDataValue,
                expandedAfterSelection = selectAfterSelection.Expanded,
                focusAfterSelection = selectAfterSelection.FocusRestored,
                expandedAfterEscape = selectAfterDismiss.Expanded,
                focusAfterEscape = selectAfterDismiss.FocusRestored
            };
            evidenceBefore.DesktopEvidence = MergeDesktopEvidence(
                evidenceBefore.DesktopEvidence,
                await CaptureCurrentDesktopEvidenceAsync(sender));
            smokePhase = "validating-dialog-open";
            if (await sender.ExecuteScriptAsync(OpenDialogEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Dialog trigger or background owner is unavailable.");
            var dialogOpen = await WaitForEvidenceAsync<DesktopDialogOpenEvidence>(
                sender,
                ReadDialogOpenEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Dialog did not establish its modal relationships and owner effects.");
            evidenceBefore.DesktopEvidence = MergeDesktopEvidence(
                evidenceBefore.DesktopEvidence,
                await CaptureCurrentDesktopEvidenceAsync(sender));
            smokePhase = "validating-dialog-focus";
            if (await sender.ExecuteScriptAsync(RunDialogFocusEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Dialog did not retain focus for Tab and Shift+Tab.");
            smokePhase = "validating-dialog-escape";
            if (await sender.ExecuteScriptAsync(DismissDialogEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Dialog content is unavailable for Escape dismissal.");
            var dialogAfterEscape = await WaitForEvidenceAsync<DesktopDialogClosedEvidence>(
                sender,
                ReadDialogClosedEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Dialog Escape did not restore focus and release modal owner effects.");
            smokePhase = "validating-dialog-reopen";
            if (await sender.ExecuteScriptAsync(OpenDialogEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Dialog trigger could not reopen.");
            _ = await WaitForEvidenceAsync<DesktopDialogOpenEvidence>(
                sender,
                ReadDialogOpenEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Dialog did not restore its modal state after reopening.");
            smokePhase = "validating-dialog-close";
            if (await sender.ExecuteScriptAsync(CloseDialogEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Dialog close control is unavailable.");
            var dialogAfterClose = await WaitForEvidenceAsync<DesktopDialogClosedEvidence>(
                sender,
                ReadDialogClosedEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Dialog close control did not restore focus and release modal owner effects.");
            var dialogInteraction = new
            {
                ready = true,
                expandedBefore = false,
                expandedAfterOpen = dialogOpen.Expanded,
                dialogOpen.ControlsResolved,
                dialogOpen.ContentRole,
                dialogOpen.Modal,
                dialogOpen.LabelledByResolved,
                dialogOpen.DescribedByResolved,
                contentFocusedAfterOpen = dialogOpen.ContentFocused,
                focusTrapHeld = true,
                dialogOpen.InertApplied,
                dialogOpen.ScrollLockApplied,
                dialogOpen.ReducedMotionObserved,
                expandedAfterEscape = dialogAfterEscape.Expanded,
                focusAfterEscape = dialogAfterEscape.FocusRestored,
                inertReleasedAfterEscape = dialogAfterEscape.InertReleased,
                scrollLockReleasedAfterEscape = dialogAfterEscape.ScrollLockReleased,
                presenceCleanedAfterEscape = dialogAfterEscape.PresenceCleaned,
                expandedAfterClose = dialogAfterClose.Expanded,
                closeButtonClosed = !dialogAfterClose.Expanded && dialogAfterClose.TriggerState == "closed",
                focusAfterClose = dialogAfterClose.FocusRestored,
                inertReleasedAfterClose = dialogAfterClose.InertReleased,
                scrollLockReleasedAfterClose = dialogAfterClose.ScrollLockReleased,
                presenceCleanedAfterClose = dialogAfterClose.PresenceCleaned
            };
            var pageAfterValue = await sender.ExecuteScriptAsync(ReadStatusScript);
            smokePhase = "writing-report";
            var report = new
            {
                bridgeRoundTrip = new { method = WebViewProtocol.AppSnapshot, requestReceived = true, responseValidated = bridgeResponseValidated },
                navigation = true,
                page = new { evidenceBefore.Origin, evidenceBefore.Title, evidenceBefore.BodyText, evidenceBefore.HasBridge, evidenceBefore.ViteClient, hydrated = true, webViewVersion = _webViewVersion, evidenceBefore.Errors, statusBefore = evidenceBefore.StatusBefore, statusAfter = JsonSerializer.Deserialize<string>(pageAfterValue), componentActionRunsBefore = evidenceBefore.ComponentActionRunsBefore, componentActionRunsAfter, componentActionDelta = componentActionRunsAfter - evidenceBefore.ComponentActionRunsBefore },
                protocol = WebViewProtocol.Version,
                source = _webview.Source?.ToString(),
                revision = Environment.GetEnvironmentVariable("GITHUB_SHA") ?? "local",
                target = "windows-x64",
                host = new { runtime = "WebView2", implementation = "WebViewHost", origin = evidenceBefore.Origin, webViewVersion = _webViewVersion, protocolVersion = WebViewProtocol.Version, navigation = true, hydrated = true, bridge = evidenceBefore.HasBridge, bridgeResponseValidated, pageErrors = evidenceBefore.Errors, source = _webview.Source?.ToString() },
                components = evidenceBefore.DesktopEvidence,
                formInteraction,
                choiceInteraction,
                selectInteraction,
                dialogInteraction
            };
            Directory.CreateDirectory(Path.GetDirectoryName(_options.SmokeReportPath)!);
            await WriteSmokeReportAsync(
                _options.SmokeReportPath,
                JsonSerializer.Serialize(report, new JsonSerializerOptions(SerializerOptions) { WriteIndented = true }));
        }
        catch (Exception error) when (_options.Development && error.HResult == unchecked((int)0x8007139F))
        {
            // Vite's first dependency optimization can replace the current document while the old
            // DOMContentLoaded handler is reading it. The replacement navigation owns the report.
            closeWindow = false;
        }
        catch (Exception error)
        {
            await WriteSmokeReportAsync(
                _options.SmokeReportPath,
                JsonSerializer.Serialize(new { error = error.Message, phase = smokePhase, components = evidenceBefore?.DesktopEvidence }));
        }
        finally
        {
            if (closeWindow) _window.DispatcherQueue.TryEnqueue(_window.Close);
        }
    }

    private void OnWindowChanged(object? sender, System.Text.Json.Nodes.JsonObject snapshot) =>
        SendEvent("window.changed", snapshot);

    private void SendEvent(string topic, System.Text.Json.Nodes.JsonNode? payload)
    {
        if (_webview.CoreWebView2 is null) return;
        var message = new ProtocolEvent(WebViewProtocol.Version, "event", topic, payload);
        _webview.CoreWebView2.PostWebMessageAsJson(JsonSerializer.Serialize(message, SerializerOptions));
    }

    private static string Origin(string source) =>
        Uri.TryCreate(source, UriKind.Absolute, out var uri)
            ? uri.GetLeftPart(UriPartial.Authority)
            : string.Empty;

    internal static async Task WriteSmokeReportAsync(string path, string contents)
    {
        for (var attempt = 0; ; attempt++)
        {
            try
            {
                await File.WriteAllTextAsync(path, contents);
                return;
            }
            catch (IOException) when (attempt < 49)
            {
                await Task.Delay(100);
            }
            catch (UnauthorizedAccessException) when (attempt < 49)
            {
                await Task.Delay(100);
            }
        }
    }

    private Task WriteSmokePhaseAsync(string phase) =>
        _options.SmokeReportPath is { } path
            ? WriteSmokeReportAsync(path, JsonSerializer.Serialize(new { phase }))
            : Task.CompletedTask;

    public async ValueTask DisposeAsync()
    {
        Window.Changed -= OnWindowChanged;
        if (_webview.CoreWebView2 is { } core)
        {
            core.WebResourceRequested -= OnWebResourceRequested;
            core.WebMessageReceived -= OnWebMessageReceived;
            core.NavigationStarting -= OnNavigationStarting;
            core.NewWindowRequested -= OnNewWindowRequested;
            core.PermissionRequested -= OnPermissionRequested;
            core.DownloadStarting -= OnDownloadStarting;
            core.ProcessFailed -= OnProcessFailed;
            core.DOMContentLoaded -= OnDomContentLoaded;
        }
        _commands?.Dispose();
        if (_dispatcher is not null) await _dispatcher.DisposeAsync();
        _webview.Close();
    }
}
