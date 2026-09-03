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
        public bool OpenStateObserved { get; set; }
        public bool PresenceEnteredObserved { get; set; }
    }

    private sealed class DesktopDialogFocusEvidence
    {
        public bool Ready { get; set; }
        public bool FocusTrapHeld { get; set; }
        public bool InitiallyContained { get; set; }
        public bool ForwardPrevented { get; set; }
        public bool ForwardContained { get; set; }
        public bool BackwardPrevented { get; set; }
        public bool BackwardContained { get; set; }
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

    private sealed class DesktopKeyboardEvidence
    {
        public bool Ready { get; set; }
        public bool DefaultPrevented { get; set; }
    }

    private sealed class DesktopTabsInitialEvidence
    {
        public bool Ready { get; set; }
        public bool InitialSelected { get; set; }
        public bool InitialControlsResolved { get; set; }
        public bool InitialLabelledByResolved { get; set; }
    }

    private sealed class DesktopTabsAdvancedEvidence
    {
        public bool Ready { get; set; }
        public bool DisabledSkipped { get; set; }
        public bool AdvancedFocused { get; set; }
        public bool AdvancedSelected { get; set; }
        public bool AdvancedPanelActive { get; set; }
        public bool GeneralPanelHidden { get; set; }
    }

    private sealed class DesktopTabsHomeEvidence
    {
        public bool Ready { get; set; }
        public bool GeneralFocused { get; set; }
        public bool GeneralSelected { get; set; }
        public bool GeneralPanelActive { get; set; }
    }

    private sealed class DesktopAccordionInitialEvidence
    {
        public bool Ready { get; set; }
        public bool InitialExpanded { get; set; }
        public bool InitialControlsResolved { get; set; }
        public bool InitialLabelledByResolved { get; set; }
        public bool ReducedMotionObserved { get; set; }
    }

    private sealed class DesktopAccordionCollapsedEvidence
    {
        public bool Ready { get; set; }
        public bool CollapseFocused { get; set; }
        public bool Collapsed { get; set; }
        public bool GeneralContentCleaned { get; set; }
    }

    private sealed class DesktopAccordionNavigationEvidence
    {
        public bool Ready { get; set; }
        public bool DisabledSkipped { get; set; }
        public bool AdvancedFocused { get; set; }
    }

    private sealed class DesktopAccordionAdvancedEvidence
    {
        public bool Ready { get; set; }
        public bool AdvancedExpanded { get; set; }
        public bool GeneralCollapsed { get; set; }
        public bool AdvancedControlsResolved { get; set; }
        public bool AdvancedLabelledByResolved { get; set; }
        public bool GeneralContentCleaned { get; set; }
    }

    private sealed class DesktopPopoverEvidence
    {
        public bool Ready { get; set; }
        public bool Expanded { get; set; }
        public bool ControlsResolved { get; set; }
        public string? ContentRole { get; set; }
        public bool LabelledByResolved { get; set; }
        public bool ContentFocused { get; set; }
        public bool PresenceEntered { get; set; }
        public bool ReducedMotionObserved { get; set; }
        public bool OpenStateObserved { get; set; }
        public bool BackgroundUnchanged { get; set; }
        public bool FocusRestored { get; set; }
        public bool PresenceCleaned { get; set; }
    }

    private sealed class DesktopTooltipEvidence
    {
        public bool Ready { get; set; }
        public bool DescribedByResolved { get; set; }
        public string? ContentRole { get; set; }
        public bool PresenceEntered { get; set; }
        public bool ReducedMotionObserved { get; set; }
        public bool OpenStateObserved { get; set; }
        public bool FocusOpenObserved { get; set; }
        public string? TriggerState { get; set; }
        public bool PresenceCleaned { get; set; }
        public bool BackgroundUnchanged { get; set; }
    }

    private sealed class DesktopPrimitiveInteractionEvidence
    {
        public string? HeadingLevel { get; set; }
        public string? HeadingText { get; set; }
        public string? CodeTag { get; set; }
        public bool CodeDescendant { get; set; }
        public bool CodeText { get; set; }
        public string? IconRole { get; set; }
        public string? IconLabel { get; set; }
        public bool DecorativeIconHidden { get; set; }
        public string? KbdText { get; set; }
        public bool LinkTargetResolved { get; set; }
        public bool LinkPrevented { get; set; }
        public int LinkActivations { get; set; }
        public bool LinkHashUnchanged { get; set; }
        public string? SeparatorOrientation { get; set; }
        public bool SeparatorRole { get; set; }
        public bool VisuallyHiddenAccessible { get; set; }
        public bool VisuallyHiddenClipped { get; set; }
        public bool VisuallyHiddenSized { get; set; }
        public bool AspectRatioMeasured { get; set; }
        public bool ContainerMaxWidth { get; set; }
        public bool ContainerPadding { get; set; }
        public bool ContainerBounds { get; set; }
        public string? AlertRole { get; set; }
        public string? AlertLive { get; set; }
        public bool AlertText { get; set; }
        public string? SpinnerRole { get; set; }
        public string? SpinnerLabel { get; set; }
        public bool SpinnerMotionObserved { get; set; }
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
                href: node?.getAttribute('href') ?? null,
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
                ariaLabelledBy: node?.getAttribute('aria-labelledby') ?? null,
                ariaLabelledByPresent: Boolean(node?.getAttribute('aria-labelledby')),
                ariaDescribedByPresent: Boolean(node?.getAttribute('aria-describedby')),
                ariaActiveDescendant: node?.getAttribute('aria-activedescendant') ?? null,
                ariaActiveDescendantPresent: Boolean(node?.getAttribute('aria-activedescendant')),
                ariaSelected: node?.getAttribute('aria-selected') ?? null,
                idPresent: Boolean(node?.id),
                hidden: node?.hidden ?? false,
                tabIndex: node?.tabIndex ?? null,
                dataState: node?.getAttribute('data-state') ?? null,
                dataPresence: node?.getAttribute('data-presence') ?? null,
                dataReducedMotion: node?.getAttribute('data-reduced-motion') ?? null,
                dataOrientation: node?.getAttribute('data-orientation') ?? null,
                dataPanelMount: node?.getAttribute('data-panel-mount') ?? null,
                dataActive: node?.getAttribute('data-active') ?? null,
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
    private const string RunPrimitiveEvidenceScript = """
        (async () => {
          const q = (marker) => document.querySelector(`[data-desktop-evidence="${marker}"]`);
          const style = (node) => node ? getComputedStyle(node) : null;
          const heading = q('ZHeading-primitives'), code = q('ZCode-primitives');
          const labelled = q('ZIcon-labelled'), decorative = q('ZIcon-decorative');
          const kbd = q('ZKbd-primitives'), link = q('ZLink-primitives'), target = document.getElementById('desktop-primitives');
          const separator = q('ZSeparator-primitives'), hidden = q('ZVisuallyHidden-primitives');
          const aspect = q('ZAspectRatio-primitives'), container = q('ZContainer-primitives');
          const alert = q('ZAlert-primitives'), spinner = q('ZSpinner-primitives');
          const hash = location.hash;
          const linkActivationsBefore = Number(document.querySelector('[data-desktop-primitive-link-activations]')?.getAttribute('data-desktop-primitive-link-activations') ?? '0');
          const linkEvent = link ? new MouseEvent('click', { bubbles: true, cancelable: true, view: window }) : null;
          const linkDispatchResult = link && linkEvent ? link.dispatchEvent(linkEvent) : false;
          await new Promise((resolve) => requestAnimationFrame(() => resolve()));
          const hs = style(hidden), as = style(aspect), cs = style(container), ss = style(spinner);
          const ar = aspect?.getBoundingClientRect();
          const cr = container?.getBoundingClientRect();
          return JSON.stringify({
            headingLevel: heading?.tagName ?? null,
            headingText: heading?.textContent?.trim() ?? '',
            codeTag: code?.tagName ?? null,
            codeDescendant: Boolean(code?.querySelector('code')),
            codeText: Boolean(code?.textContent?.includes('const ready = true;')),
            iconRole: labelled?.getAttribute('role') ?? null,
            iconLabel: labelled?.getAttribute('aria-label') ?? null,
            decorativeIconHidden: decorative?.getAttribute('aria-hidden') === 'true',
            kbdText: kbd?.textContent?.trim() ?? '',
            linkTargetResolved: Boolean(link?.getAttribute('href') === '#desktop-primitives' && target),
            linkPrevented: linkDispatchResult === false && linkEvent?.defaultPrevented === true,
            linkActivations: Number(document.querySelector('[data-desktop-primitive-link-activations]')?.getAttribute('data-desktop-primitive-link-activations') ?? '0') - linkActivationsBefore,
            linkHashUnchanged: location.hash === hash,
            separatorOrientation: separator?.getAttribute('data-orientation') ?? null,
            separatorRole: separator?.tagName === 'HR' && separator?.getAttribute('role') === null,
            visuallyHiddenAccessible: Boolean(hidden && !hidden.hidden && hidden.getAttribute('aria-hidden') !== 'true'),
            visuallyHiddenClipped: Boolean(hs && hs.position === 'absolute' && (hs.clipPath.includes('inset') || hs.clip.includes('rect'))),
            visuallyHiddenSized: Boolean(hs && parseFloat(hs.width) <= 1 && parseFloat(hs.height) <= 1),
            aspectRatioMeasured: Boolean(ar && ar.width > 0 && ar.height > 0 && Math.abs(ar.width / ar.height - 16 / 9) < 0.04),
            containerMaxWidth: Boolean(cs && cs.maxWidth !== 'none' && cs.maxWidth !== ''),
            containerPadding: Boolean(cs && parseFloat(cs.paddingLeft) > 0 && parseFloat(cs.paddingRight) > 0),
            containerBounds: Boolean(cr && cr.width > 0 && cr.height > 0),
            alertRole: alert?.getAttribute('role') ?? null,
            alertLive: alert?.getAttribute('aria-live') ?? null,
            alertText: Boolean(alert?.textContent?.includes('Desktop alert') && alert?.textContent?.includes('A measured alert.')),
            spinnerRole: spinner?.getAttribute('role') ?? null,
            spinnerLabel: spinner?.getAttribute('aria-label') ?? null,
            spinnerMotionObserved: Boolean(ss && spinner?.getAttribute('data-reduced-motion') === 'true' && spinner?.querySelector('[data-slot="indicator"]')?.getAnimations().length === 0 && (ss.animationName === 'none' || ss.animationDuration === '0s' || ss.animationPlayState === 'paused'))
          });
        })()
        """;
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
          const existing = globalThis.__ZADMIN_DIALOG_EVIDENCE__;
          if (existing) {
            if (existing.backgroundOwner !== backgroundOwner ||
                backgroundOwner.inert !== existing.backgroundInert ||
                backgroundOwner.getAttribute('aria-hidden') !== existing.backgroundAriaHidden ||
                document.body.style.overflow !== existing.bodyOverflow ||
                document.body.style.paddingInlineEnd !== existing.bodyPaddingInlineEnd) return false;
          } else {
            globalThis.__ZADMIN_DIALOG_EVIDENCE__ = {
              backgroundOwner,
              backgroundInert: backgroundOwner.inert,
              backgroundAriaHidden: backgroundOwner.getAttribute('aria-hidden'),
              bodyOverflow: document.body.style.overflow,
              bodyPaddingInlineEnd: document.body.style.paddingInlineEnd
            };
          }
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
              overlay?.getAttribute('data-reduced-motion') === 'true',
            openStateObserved:
              content?.getAttribute('data-state') === 'open' &&
              overlay?.getAttribute('data-state') === 'open',
            presenceEnteredObserved:
              content?.getAttribute('data-presence') === 'entered' &&
              overlay?.getAttribute('data-presence') === 'entered'
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
              result.reducedMotionObserved &&
              result.openStateObserved &&
              result.presenceEnteredObserved
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
          if (!(content instanceof HTMLElement) ||
              !(close instanceof HTMLButtonElement)) return JSON.stringify({
                ready: false,
                focusTrapHeld: false,
                initiallyContained: false,
                forwardPrevented: false,
                forwardContained: false,
                backwardPrevented: false,
                backwardContained: false
              });
          close.focus();
          const initiallyContained = content.contains(document.activeElement);
          const forward = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Tab'
          });
          close.dispatchEvent(forward);
          const forwardContained = content.contains(document.activeElement);
          const backward = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Tab',
            shiftKey: true
          });
          document.activeElement?.dispatchEvent(backward);
          const backwardContained = content.contains(document.activeElement);
          const focusTrapHeld =
            initiallyContained && forward.defaultPrevented && forwardContained &&
            backward.defaultPrevented && backwardContained;
          return JSON.stringify({
            ready: focusTrapHeld,
            focusTrapHeld,
            initiallyContained,
            forwardPrevented: forward.defaultPrevented,
            forwardContained,
            backwardPrevented: backward.defaultPrevented,
            backwardContained
          });
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
          content.dispatchEvent(
            new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape' })
          );
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
    private const string ReadTabsInitialEvidenceScript = """
        (() => {
          const root = document.querySelector('[data-desktop-evidence="ZTabs-settings"]');
          const list = document.querySelector('[data-desktop-evidence="ZTabsList-settings"]');
          const trigger = document.querySelector('[data-desktop-evidence="ZTabsTrigger-general"]');
          const controls = trigger?.getAttribute('aria-controls');
          const panel = controls ? document.getElementById(controls) : null;
          const result = {
            initialSelected:
              trigger?.getAttribute('aria-selected') === 'true' &&
              trigger?.getAttribute('data-state') === 'active',
            initialControlsResolved: Boolean(
              controls && panel?.id === controls && panel?.getAttribute('role') === 'tabpanel'
            ),
            initialLabelledByResolved: Boolean(
              trigger?.id && panel?.getAttribute('aria-labelledby') === trigger.id
            )
          };
          return JSON.stringify({
            ...result,
            ready:
              root?.getAttribute('data-orientation') === 'horizontal' &&
              root?.getAttribute('data-panel-mount') === 'keep-mounted' &&
              list?.getAttribute('role') === 'tablist' &&
              list?.getAttribute('aria-orientation') === 'horizontal' &&
              result.initialSelected &&
              result.initialControlsResolved &&
              result.initialLabelledByResolved
          });
        })()
        """;
    private const string AdvanceTabsEvidenceScript = """
        (() => {
          const trigger = document.querySelector('[data-desktop-evidence="ZTabsTrigger-general"]');
          if (!(trigger instanceof HTMLButtonElement)) return JSON.stringify({
            ready: false,
            defaultPrevented: false
          });
          trigger.focus();
          const event = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'ArrowRight'
          });
          trigger.dispatchEvent(event);
          return JSON.stringify({ ready: event.defaultPrevented, defaultPrevented: event.defaultPrevented });
        })()
        """;
    private const string ReadTabsAdvancedEvidenceScript = """
        (() => {
          const list = document.querySelector('[data-desktop-evidence="ZTabsList-settings"]');
          const general = document.querySelector('[data-desktop-evidence="ZTabsTrigger-general"]');
          const disabled = list?.querySelector('[data-desktop-option="disabled"]');
          const advanced = list?.querySelector('[data-desktop-option="advanced"]');
          const generalControls = general?.getAttribute('aria-controls');
          const generalPanel = generalControls ? document.getElementById(generalControls) : null;
          const advancedControls = advanced?.getAttribute('aria-controls');
          const advancedPanel = advancedControls ? document.getElementById(advancedControls) : null;
          const result = {
            disabledSkipped:
              disabled instanceof HTMLButtonElement &&
              disabled.disabled &&
              disabled.getAttribute('aria-selected') === 'false' &&
              document.activeElement !== disabled,
            advancedFocused: document.activeElement === advanced,
            advancedSelected:
              advanced?.getAttribute('aria-selected') === 'true' &&
              advanced?.getAttribute('data-state') === 'active' &&
              general?.getAttribute('aria-selected') === 'false',
            advancedPanelActive:
              Boolean(advancedControls && advancedPanel?.id === advancedControls) &&
              advancedPanel?.getAttribute('data-state') === 'active' &&
              advancedPanel?.hidden === false &&
              advancedPanel?.getAttribute('aria-labelledby') === advanced?.id,
            generalPanelHidden:
              generalPanel instanceof HTMLElement &&
              generalPanel.hidden &&
              generalPanel.getAttribute('data-state') === 'inactive'
          };
          return JSON.stringify({
            ...result,
            ready: Object.values(result).every(Boolean)
          });
        })()
        """;
    private const string ReturnTabsHomeEvidenceScript = """
        (() => {
          const list = document.querySelector('[data-desktop-evidence="ZTabsList-settings"]');
          const advanced = list?.querySelector('[data-desktop-option="advanced"]');
          if (!(advanced instanceof HTMLButtonElement)) return JSON.stringify({
            ready: false,
            defaultPrevented: false
          });
          const event = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Home'
          });
          advanced.dispatchEvent(event);
          return JSON.stringify({ ready: event.defaultPrevented, defaultPrevented: event.defaultPrevented });
        })()
        """;
    private const string ReadTabsHomeEvidenceScript = """
        (() => {
          const list = document.querySelector('[data-desktop-evidence="ZTabsList-settings"]');
          const general = document.querySelector('[data-desktop-evidence="ZTabsTrigger-general"]');
          const advanced = list?.querySelector('[data-desktop-option="advanced"]');
          const controls = general?.getAttribute('aria-controls');
          const panel = controls ? document.getElementById(controls) : null;
          const result = {
            generalFocused: document.activeElement === general,
            generalSelected:
              general?.getAttribute('aria-selected') === 'true' &&
              advanced?.getAttribute('aria-selected') === 'false',
            generalPanelActive:
              panel?.getAttribute('data-state') === 'active' && panel?.hidden === false
          };
          return JSON.stringify({ ...result, ready: Object.values(result).every(Boolean) });
        })()
        """;
    private const string ReadAccordionInitialEvidenceScript = """
        (() => {
          const root = document.querySelector('[data-desktop-evidence="ZAccordion-settings"]');
          const trigger = document.querySelector(
            '[data-desktop-evidence="ZAccordionTrigger-general"]'
          );
          const controls = trigger?.getAttribute('aria-controls');
          const content = controls ? document.getElementById(controls) : null;
          const result = {
            initialExpanded:
              trigger?.getAttribute('aria-expanded') === 'true' &&
              trigger?.getAttribute('data-state') === 'open',
            initialControlsResolved: Boolean(
              controls && content?.id === controls && content?.getAttribute('role') === 'region'
            ),
            initialLabelledByResolved: Boolean(
              trigger?.id && content?.getAttribute('aria-labelledby') === trigger.id
            ),
            reducedMotionObserved:
              root?.getAttribute('data-reduced-motion') === 'true' &&
              trigger?.getAttribute('data-reduced-motion') === 'true' &&
              content?.getAttribute('data-reduced-motion') === 'true'
          };
          return JSON.stringify({ ...result, ready: Object.values(result).every(Boolean) });
        })()
        """;
    private const string CollapseAccordionEvidenceScript = """
        (() => {
          const trigger = document.querySelector(
            '[data-desktop-evidence="ZAccordionTrigger-general"]'
          );
          if (!(trigger instanceof HTMLButtonElement) ||
              trigger.getAttribute('aria-expanded') !== 'true') return false;
          trigger.focus();
          trigger.click();
          return true;
        })()
        """;
    private const string ReadAccordionCollapsedEvidenceScript = """
        (() => {
          const item = document.querySelector('[data-desktop-evidence="ZAccordionItem-general"]');
          const trigger = document.querySelector(
            '[data-desktop-evidence="ZAccordionTrigger-general"]'
          );
          const result = {
            collapseFocused: document.activeElement === trigger,
            collapsed:
              trigger?.getAttribute('aria-expanded') === 'false' &&
              trigger?.getAttribute('data-state') === 'closed' &&
              item?.getAttribute('data-state') === 'closed',
            generalContentCleaned:
              document.querySelector('[data-desktop-evidence="ZAccordionContent-general"]') === null
          };
          return JSON.stringify({ ...result, ready: Object.values(result).every(Boolean) });
        })()
        """;
    private const string ReopenAccordionEvidenceScript = """
        (() => {
          const trigger = document.querySelector(
            '[data-desktop-evidence="ZAccordionTrigger-general"]'
          );
          if (!(trigger instanceof HTMLButtonElement) ||
              trigger.getAttribute('aria-expanded') !== 'false') return false;
          trigger.click();
          return true;
        })()
        """;
    private const string NavigateAccordionEvidenceScript = """
        (() => {
          const trigger = document.querySelector(
            '[data-desktop-evidence="ZAccordionTrigger-general"]'
          );
          if (!(trigger instanceof HTMLButtonElement)) return JSON.stringify({
            ready: false,
            defaultPrevented: false
          });
          trigger.focus();
          const event = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'ArrowDown'
          });
          trigger.dispatchEvent(event);
          return JSON.stringify({ ready: event.defaultPrevented, defaultPrevented: event.defaultPrevented });
        })()
        """;
    private const string ReadAccordionNavigationEvidenceScript = """
        (() => {
          const root = document.querySelector('[data-desktop-evidence="ZAccordion-settings"]');
          const disabledItem = root?.querySelector('[data-desktop-option="disabled"]');
          const advancedItem = root?.querySelector('[data-desktop-option="advanced"]');
          const disabled = disabledItem?.querySelector('button');
          const advanced = advancedItem?.querySelector('button');
          const result = {
            disabledSkipped:
              disabled instanceof HTMLButtonElement &&
              disabled.disabled &&
              document.activeElement !== disabled,
            advancedFocused: advanced instanceof HTMLButtonElement && document.activeElement === advanced
          };
          return JSON.stringify({ ...result, ready: Object.values(result).every(Boolean) });
        })()
        """;
    private const string ActivateAdvancedAccordionEvidenceScript = """
        (() => {
          const root = document.querySelector('[data-desktop-evidence="ZAccordion-settings"]');
          const advanced = root
            ?.querySelector('[data-desktop-option="advanced"]')
            ?.querySelector('button');
          if (!(advanced instanceof HTMLButtonElement)) return false;
          advanced.click();
          return true;
        })()
        """;
    private const string ReadAccordionAdvancedEvidenceScript = """
        (() => {
          const root = document.querySelector('[data-desktop-evidence="ZAccordion-settings"]');
          const generalItem = document.querySelector('[data-desktop-evidence="ZAccordionItem-general"]');
          const general = document.querySelector(
            '[data-desktop-evidence="ZAccordionTrigger-general"]'
          );
          const advancedItem = root?.querySelector('[data-desktop-option="advanced"]');
          const advanced = advancedItem?.querySelector('button');
          const controls = advanced?.getAttribute('aria-controls');
          const content = controls ? document.getElementById(controls) : null;
          const result = {
            advancedExpanded:
              advanced?.getAttribute('aria-expanded') === 'true' &&
              advanced?.getAttribute('data-state') === 'open' &&
              advancedItem?.getAttribute('data-state') === 'open',
            generalCollapsed:
              general?.getAttribute('aria-expanded') === 'false' &&
              general?.getAttribute('data-state') === 'closed' &&
              generalItem?.getAttribute('data-state') === 'closed',
            advancedControlsResolved: Boolean(
              controls && content?.id === controls && content?.getAttribute('role') === 'region'
            ),
            advancedLabelledByResolved: Boolean(
              advanced?.id && content?.getAttribute('aria-labelledby') === advanced.id
            ),
            generalContentCleaned:
              document.querySelector('[data-desktop-evidence="ZAccordionContent-general"]') === null
          };
          return JSON.stringify({ ...result, ready: Object.values(result).every(Boolean) });
        })()
        """;
    private const string OpenPopoverEvidenceScript = """
        (() => {
          const trigger = document.querySelector('[data-desktop-evidence="ZPopoverTrigger-settings"]');
          if (!(trigger instanceof HTMLButtonElement)) return false;
          const background = document.querySelector('[data-desktop-evidence="ZPopover-background-sibling"]');
          if (!globalThis.__ZADMIN_POPOVER_BASELINE__)
            globalThis.__ZADMIN_POPOVER_BASELINE__ = {
              inert: background?.inert ?? false,
              inertAttr: background?.getAttribute('inert'),
              ariaHidden: background?.getAttribute('aria-hidden'),
              overflow: document.body?.style.overflow ?? '',
              paddingInlineEnd: document.body?.style.paddingInlineEnd ?? '',
              paddingRight: document.body?.style.paddingRight ?? ''
            };
          trigger.click();
          return true;
        })()
        """;
    private const string ReadPopoverEvidenceScript = """
        (() => {
          const trigger = document.querySelector('[data-desktop-evidence="ZPopoverTrigger-settings"]');
          const controls = trigger?.getAttribute('aria-controls');
          const content = controls ? document.getElementById(controls) : null;
          const background = document.querySelector('[data-desktop-evidence="ZPopover-background-sibling"]');
          const baseline = globalThis.__ZADMIN_POPOVER_BASELINE__;
          const backgroundUnchanged = Boolean(baseline && background &&
            background.inert === baseline.inert &&
            background.getAttribute('inert') === baseline.inertAttr &&
            background.getAttribute('aria-hidden') === baseline.ariaHidden &&
            document.body?.style.overflow === baseline.overflow &&
            document.body?.style.paddingInlineEnd === baseline.paddingInlineEnd &&
            document.body?.style.paddingRight === baseline.paddingRight);
          const result = {
            expanded: trigger?.getAttribute('aria-expanded') === 'true' && trigger?.getAttribute('data-state') === 'open',
            controlsResolved: Boolean(controls && content?.id === controls && content?.getAttribute('role') === 'dialog'),
            contentRole: content?.getAttribute('role'),
            labelledByResolved: Boolean(trigger?.id && content?.getAttribute('aria-labelledby')?.split(/\\s+/u).includes(trigger.id)),
            contentFocused: document.activeElement === content,
            presenceEntered: content?.getAttribute('data-presence') === 'entered',
            reducedMotionObserved: content?.getAttribute('data-reduced-motion') === 'true',
            openStateObserved: content?.getAttribute('data-state') === 'open',
            backgroundUnchanged
          };
          return JSON.stringify({
            ...result,
            ready:
              result.expanded &&
              result.controlsResolved &&
              result.contentRole === 'dialog' &&
              result.labelledByResolved &&
              result.contentFocused &&
              result.presenceEntered &&
              result.reducedMotionObserved &&
              result.openStateObserved &&
              result.backgroundUnchanged
          });
        })()
        """;
    private const string DismissPopoverEscapeEvidenceScript = """
        (() => {
          const content = document.querySelector('[data-desktop-evidence="ZPopoverContent-settings"]');
          if (!(content instanceof HTMLElement)) return false;
          const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape' });
          content.dispatchEvent(event);
          return true;
        })()
        """;
    private const string ReadPopoverClosedEvidenceScript = """
        (() => {
          const trigger = document.querySelector('[data-desktop-evidence="ZPopoverTrigger-settings"]');
          const content = document.querySelector('[data-desktop-evidence="ZPopoverContent-settings"]');
          const result = {
            expanded: trigger?.getAttribute('aria-expanded') === 'true',
            focusRestored: document.activeElement === trigger,
            presenceCleaned: (() => {
              const controls = trigger?.getAttribute('aria-controls');
              const controlledContent = controls ? document.getElementById(controls) : null;
              return controlledContent === null && content === null;
            })(),
            backgroundUnchanged: (() => {
              const background = document.querySelector('[data-desktop-evidence="ZPopover-background-sibling"]');
              const baseline = globalThis.__ZADMIN_POPOVER_BASELINE__;
              return Boolean(baseline && background && background.inert === baseline.inert && background.getAttribute('inert') === baseline.inertAttr && background.getAttribute('aria-hidden') === baseline.ariaHidden && document.body?.style.overflow === baseline.overflow && document.body?.style.paddingInlineEnd === baseline.paddingInlineEnd && document.body?.style.paddingRight === baseline.paddingRight);
            })()
          };
          return JSON.stringify({ ...result, ready: result.expanded === false && result.focusRestored && result.presenceCleaned && result.backgroundUnchanged });
        })()
        """;
    private const string PointerOutsidePopoverEvidenceScript = """
        (() => {
          const background = document.querySelector('[data-desktop-evidence="ZPopover-background-sibling"]');
          if (!(background instanceof HTMLElement)) return false;
          background.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, composed: true, pointerType: 'mouse' }));
          return true;
        })()
        """;
    private const string FocusTooltipEvidenceScript = """
        (() => {
          const trigger = document.querySelector('[data-desktop-evidence="ZTooltipTrigger-settings"]');
          if (!(trigger instanceof HTMLElement)) return false;
          const sibling = document.querySelector('[data-desktop-evidence="ZTooltip-background-sibling"]');
          if (!globalThis.__ZADMIN_TOOLTIP_BASELINE__) globalThis.__ZADMIN_TOOLTIP_BASELINE__ = {
            inert: sibling?.inert ?? false, inertAttr: sibling?.getAttribute('inert'), ariaHidden: sibling?.getAttribute('aria-hidden'),
            overflow: document.body?.style.overflow ?? '', paddingInlineEnd: document.body?.style.paddingInlineEnd ?? '', paddingRight: document.body?.style.paddingRight ?? ''
          };
          trigger.focus();
          return true;
        })()
        """;
    private const string MoveTooltipFocusOutsideScript = """
        (() => {
          const outside = document.querySelector('[data-desktop-evidence="ZTooltip-outside-focus"]');
          if (!(outside instanceof HTMLElement)) return false;
          outside.focus();
          return document.activeElement === outside;
        })()
        """;
    private const string ReadTooltipOpenEvidenceScript = """
        (() => {
          const trigger = document.querySelector('[data-desktop-evidence="ZTooltipTrigger-settings"]');
          const id = trigger?.getAttribute('aria-describedby');
          const content = id ? document.getElementById(id) : null;
          const sibling = document.querySelector('[data-desktop-evidence="ZTooltip-background-sibling"]');
          const b = globalThis.__ZADMIN_TOOLTIP_BASELINE__;
          const backgroundUnchanged = Boolean(b && sibling && sibling.inert === b.inert && sibling.getAttribute('inert') === b.inertAttr && sibling.getAttribute('aria-hidden') === b.ariaHidden && document.body?.style.overflow === b.overflow && document.body?.style.paddingInlineEnd === b.paddingInlineEnd && document.body?.style.paddingRight === b.paddingRight);
          const result = { describedByResolved: Boolean(id && content?.id === id), contentRole: content?.getAttribute('role'), presenceEntered: content?.getAttribute('data-presence') === 'entered', reducedMotionObserved: content?.getAttribute('data-reduced-motion') === 'true', openStateObserved: content?.getAttribute('data-state') === 'open', focusOpenObserved: document.activeElement === trigger, backgroundUnchanged };
          return JSON.stringify({ ...result, ready: result.describedByResolved && result.contentRole === 'tooltip' && result.presenceEntered && result.reducedMotionObserved && result.openStateObserved && result.backgroundUnchanged });
        })()
        """;
    private const string DismissTooltipEscapeEvidenceScript = """
        (() => {
          const trigger = document.querySelector('[data-desktop-evidence="ZTooltipTrigger-settings"]');
          if (!(trigger instanceof HTMLElement)) return false;
          trigger.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape' }));
          return true;
        })()
        """;
    private const string ReadTooltipClosedEvidenceScript = """
        (() => {
          const trigger = document.querySelector('[data-desktop-evidence="ZTooltipTrigger-settings"]');
          const content = document.querySelector('[data-desktop-evidence="ZTooltipContent-settings"]');
          const b = globalThis.__ZADMIN_TOOLTIP_BASELINE__;
          const sibling = document.querySelector('[data-desktop-evidence="ZTooltip-background-sibling"]');
          const backgroundUnchanged = Boolean(b && sibling && sibling.inert === b.inert && sibling.getAttribute('inert') === b.inertAttr && sibling.getAttribute('aria-hidden') === b.ariaHidden && document.body?.style.overflow === b.overflow && document.body?.style.paddingInlineEnd === b.paddingInlineEnd && document.body?.style.paddingRight === b.paddingRight);
          const result = { triggerState: trigger?.getAttribute('data-state') ?? 'missing', presenceCleaned: content === null, backgroundUnchanged };
          return JSON.stringify({ ...result, ready: result.triggerState === 'closed' && result.presenceCleaned && result.backgroundUnchanged });
        })()
        """;
    private const string PointerEnterTooltipEvidenceScript = """
        (() => {
          const trigger = document.querySelector('[data-desktop-evidence="ZTooltipTrigger-settings"]');
          if (!(trigger instanceof HTMLElement)) return false;
          trigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false, cancelable: true, pointerType: 'mouse' }));
          return true;
        })()
        """;
    private const string PointerLeaveTooltipEvidenceScript = """
        (() => {
          const trigger = document.querySelector('[data-desktop-evidence="ZTooltipTrigger-settings"]');
          if (!(trigger instanceof HTMLElement)) return false;
          trigger.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false, cancelable: true, pointerType: 'mouse' }));
          return true;
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
            var dialogFocus = await ExecuteJsonScriptAsync<DesktopDialogFocusEvidence>(
                sender,
                RunDialogFocusEvidenceScript);
            if (dialogFocus is null || !dialogFocus.Ready)
                throw new InvalidOperationException(
                    $"Desktop Dialog did not retain focus for Tab and Shift+Tab: {JsonSerializer.Serialize(dialogFocus, SerializerOptions)}");
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
                dialogFocus.FocusTrapHeld,
                dialogOpen.InertApplied,
                dialogOpen.ScrollLockApplied,
                dialogOpen.ReducedMotionObserved,
                dialogOpen.OpenStateObserved,
                dialogOpen.PresenceEnteredObserved,
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
            smokePhase = "validating-tabs-initial";
            var tabsInitial = await WaitForEvidenceAsync<DesktopTabsInitialEvidence>(
                sender,
                ReadTabsInitialEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Tabs did not establish its initial selected panel relationships.");
            smokePhase = "validating-tabs-arrow";
            var tabsArrow = await ExecuteJsonScriptAsync<DesktopKeyboardEvidence>(
                sender,
                AdvanceTabsEvidenceScript);
            if (tabsArrow is null || !tabsArrow.Ready)
                throw new InvalidOperationException(
                    $"Desktop Tabs did not handle ArrowRight: {JsonSerializer.Serialize(tabsArrow, SerializerOptions)}");
            var tabsAdvanced = await WaitForEvidenceAsync<DesktopTabsAdvancedEvidence>(
                sender,
                ReadTabsAdvancedEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Tabs did not skip its disabled tab and synchronize the advanced panel.");
            smokePhase = "validating-tabs-home";
            var tabsHomeKey = await ExecuteJsonScriptAsync<DesktopKeyboardEvidence>(
                sender,
                ReturnTabsHomeEvidenceScript);
            if (tabsHomeKey is null || !tabsHomeKey.Ready)
                throw new InvalidOperationException(
                    $"Desktop Tabs did not handle Home: {JsonSerializer.Serialize(tabsHomeKey, SerializerOptions)}");
            var tabsHome = await WaitForEvidenceAsync<DesktopTabsHomeEvidence>(
                sender,
                ReadTabsHomeEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Tabs did not restore its first tab and panel with Home.");
            var tabsInteraction = new
            {
                ready = true,
                tabsInitial.InitialSelected,
                tabsInitial.InitialControlsResolved,
                tabsInitial.InitialLabelledByResolved,
                tabsAdvanced.DisabledSkipped,
                arrowHandled = tabsArrow.DefaultPrevented,
                tabsAdvanced.AdvancedFocused,
                tabsAdvanced.AdvancedSelected,
                tabsAdvanced.AdvancedPanelActive,
                tabsAdvanced.GeneralPanelHidden,
                homeHandled = tabsHomeKey.DefaultPrevented,
                generalFocusedAfterHome = tabsHome.GeneralFocused,
                generalSelectedAfterHome = tabsHome.GeneralSelected,
                generalPanelActiveAfterHome = tabsHome.GeneralPanelActive
            };
            smokePhase = "validating-accordion-initial";
            var accordionInitial = await WaitForEvidenceAsync<DesktopAccordionInitialEvidence>(
                sender,
                ReadAccordionInitialEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Accordion did not establish its initial expanded content relationships.");
            smokePhase = "validating-accordion-collapse";
            if (await sender.ExecuteScriptAsync(CollapseAccordionEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Accordion general trigger could not collapse.");
            var accordionCollapsed = await WaitForEvidenceAsync<DesktopAccordionCollapsedEvidence>(
                sender,
                ReadAccordionCollapsedEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Accordion did not clean up its collapsed reduced-motion content.");
            smokePhase = "validating-accordion-reopen";
            if (await sender.ExecuteScriptAsync(ReopenAccordionEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Accordion general trigger could not reopen.");
            var accordionReopened = await WaitForEvidenceAsync<DesktopAccordionInitialEvidence>(
                sender,
                ReadAccordionInitialEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Accordion did not restore its general content after reopening.");
            smokePhase = "validating-accordion-navigation";
            var accordionArrow = await ExecuteJsonScriptAsync<DesktopKeyboardEvidence>(
                sender,
                NavigateAccordionEvidenceScript);
            if (accordionArrow is null || !accordionArrow.Ready)
                throw new InvalidOperationException(
                    $"Desktop Accordion did not handle ArrowDown: {JsonSerializer.Serialize(accordionArrow, SerializerOptions)}");
            var accordionNavigation = await WaitForEvidenceAsync<DesktopAccordionNavigationEvidence>(
                sender,
                ReadAccordionNavigationEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Accordion did not skip its disabled trigger during navigation.");
            smokePhase = "validating-accordion-single-selection";
            if (await sender.ExecuteScriptAsync(ActivateAdvancedAccordionEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Accordion advanced trigger is unavailable.");
            var accordionAdvanced = await WaitForEvidenceAsync<DesktopAccordionAdvancedEvidence>(
                sender,
                ReadAccordionAdvancedEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Accordion did not enforce its single-selection content lifecycle.");
            var accordionInteraction = new
            {
                ready = true,
                accordionInitial.InitialExpanded,
                accordionInitial.InitialControlsResolved,
                accordionInitial.InitialLabelledByResolved,
                accordionInitial.ReducedMotionObserved,
                accordionCollapsed.CollapseFocused,
                accordionCollapsed.Collapsed,
                accordionCollapsed.GeneralContentCleaned,
                reopened = accordionReopened.InitialExpanded,
                arrowHandled = accordionArrow.DefaultPrevented,
                accordionNavigation.DisabledSkipped,
                accordionNavigation.AdvancedFocused,
                accordionAdvanced.AdvancedExpanded,
                accordionAdvanced.GeneralCollapsed,
                accordionAdvanced.AdvancedControlsResolved,
                accordionAdvanced.AdvancedLabelledByResolved,
                generalContentCleanedAfterAdvanced = accordionAdvanced.GeneralContentCleaned
            };
            smokePhase = "validating-popover-open";
            if (await sender.ExecuteScriptAsync(OpenPopoverEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Popover trigger is unavailable.");
            var popoverOpen = await WaitForEvidenceAsync<DesktopPopoverEvidence>(
                sender,
                ReadPopoverEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Popover did not establish its non-modal relationships and focus.");
            evidenceBefore.DesktopEvidence = MergeDesktopEvidence(
                evidenceBefore.DesktopEvidence,
                await CaptureCurrentDesktopEvidenceAsync(sender));
            smokePhase = "validating-popover-escape";
            if (await sender.ExecuteScriptAsync(DismissPopoverEscapeEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Popover content is unavailable for Escape dismissal.");
            var popoverAfterEscape = await WaitForEvidenceAsync<DesktopPopoverEvidence>(
                sender,
                ReadPopoverClosedEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Popover Escape did not restore focus and clean up presence.");
            smokePhase = "validating-popover-pointer-outside";
            if (await sender.ExecuteScriptAsync(OpenPopoverEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Popover trigger could not reopen.");
            var popoverReopen = await WaitForEvidenceAsync<DesktopPopoverEvidence>(
                sender,
                ReadPopoverEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Popover did not reopen.");
            if (await sender.ExecuteScriptAsync(PointerOutsidePopoverEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Popover outside target is unavailable.");
            var popoverAfterPointer = await WaitForEvidenceAsync<DesktopPopoverEvidence>(
                sender,
                ReadPopoverClosedEvidenceScript,
                evidence => evidence.Ready,
                "Desktop Popover pointer-outside dismissal did not restore focus and clean up presence.");
            var popoverInteraction = new
            {
                ready = true,
                expandedAfterOpen = popoverOpen.Expanded,
                popoverOpen.ControlsResolved,
                popoverOpen.ContentRole,
                popoverOpen.LabelledByResolved,
                contentFocusedAfterOpen = popoverOpen.ContentFocused,
                presenceEnteredObserved = popoverOpen.PresenceEntered,
                reducedMotionObserved = popoverOpen.ReducedMotionObserved,
                openStateObserved = popoverOpen.OpenStateObserved,
                expandedAfterEscape = popoverAfterEscape.Expanded,
                focusAfterEscape = popoverAfterEscape.FocusRestored,
                presenceCleanedAfterEscape = popoverAfterEscape.PresenceCleaned,
                reopened = popoverReopen.Expanded,
                expandedAfterPointerOutside = popoverAfterPointer.Expanded,
                focusAfterPointerOutside = popoverAfterPointer.FocusRestored,
                presenceCleanedAfterPointerOutside = popoverAfterPointer.PresenceCleaned,
                backgroundUnchanged = popoverOpen.BackgroundUnchanged &&
                    popoverAfterEscape.BackgroundUnchanged &&
                    popoverReopen.BackgroundUnchanged &&
                    popoverAfterPointer.BackgroundUnchanged
            };
            smokePhase = "validating-tooltip-focus";
            if (await sender.ExecuteScriptAsync(FocusTooltipEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Tooltip trigger is unavailable.");
            var tooltipOpen = await WaitForEvidenceAsync<DesktopTooltipEvidence>(
                sender,
                ReadTooltipOpenEvidenceScript,
                evidence => evidence.Ready && evidence.FocusOpenObserved,
                "Desktop Tooltip did not establish focus, aria-describedby and non-modal effects.");
            evidenceBefore.DesktopEvidence = MergeDesktopEvidence(evidenceBefore.DesktopEvidence, await CaptureCurrentDesktopEvidenceAsync(sender));
            smokePhase = "validating-tooltip-escape";
            if (await sender.ExecuteScriptAsync(DismissTooltipEscapeEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Tooltip trigger is unavailable for Escape dismissal.");
            var tooltipAfterEscape = await WaitForEvidenceAsync<DesktopTooltipEvidence>(sender, ReadTooltipClosedEvidenceScript, evidence => evidence.Ready, "Desktop Tooltip Escape did not clean up presence.");
            smokePhase = "validating-tooltip-blur";
            if (await sender.ExecuteScriptAsync(MoveTooltipFocusOutsideScript) != "true" ||
                await sender.ExecuteScriptAsync(FocusTooltipEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Tooltip focus/blur sequence is unavailable.");
            var tooltipReopened = await WaitForEvidenceAsync<DesktopTooltipEvidence>(
                sender,
                ReadTooltipOpenEvidenceScript,
                evidence => evidence.Ready && evidence.FocusOpenObserved,
                "Desktop Tooltip did not reopen after focus moved away and returned.");
            if (await sender.ExecuteScriptAsync(MoveTooltipFocusOutsideScript) != "true")
                throw new InvalidOperationException("Desktop Tooltip outside focus target is unavailable.");
            var tooltipAfterBlur = await WaitForEvidenceAsync<DesktopTooltipEvidence>(sender, ReadTooltipClosedEvidenceScript, evidence => evidence.Ready, "Desktop Tooltip blur did not clean up presence.");
            smokePhase = "validating-tooltip-hover";
            if (await sender.ExecuteScriptAsync(PointerEnterTooltipEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Tooltip trigger is unavailable for pointerenter.");
            var tooltipHoverOpen = await WaitForEvidenceAsync<DesktopTooltipEvidence>(sender, ReadTooltipOpenEvidenceScript, evidence => evidence.Ready, "Desktop Tooltip hover did not open.");
            if (await sender.ExecuteScriptAsync(PointerLeaveTooltipEvidenceScript) != "true")
                throw new InvalidOperationException("Desktop Tooltip trigger is unavailable for pointerleave.");
            var tooltipAfterPointerLeave = await WaitForEvidenceAsync<DesktopTooltipEvidence>(sender, ReadTooltipClosedEvidenceScript, evidence => evidence.Ready, "Desktop Tooltip pointerleave did not clean up presence.");
            var tooltipInteraction = new
            {
                ready = true,
                describedByResolved = tooltipOpen.DescribedByResolved,
                contentRole = tooltipOpen.ContentRole,
                presenceEntered = tooltipOpen.PresenceEntered,
                reducedMotionObserved = tooltipOpen.ReducedMotionObserved,
                openStateObserved = tooltipOpen.OpenStateObserved,
                focusOpenObserved = tooltipOpen.FocusOpenObserved,
                stateAfterEscape = tooltipAfterEscape.TriggerState,
                escapeCleaned = tooltipAfterEscape.PresenceCleaned,
                reopened = tooltipReopened.OpenStateObserved && tooltipReopened.FocusOpenObserved,
                hoverOpened = tooltipHoverOpen.OpenStateObserved,
                blurCleaned = tooltipAfterBlur.PresenceCleaned,
                pointerLeaveCleaned = tooltipAfterPointerLeave.PresenceCleaned,
                backgroundUnchanged = tooltipOpen.BackgroundUnchanged && tooltipAfterEscape.BackgroundUnchanged && tooltipReopened.BackgroundUnchanged && tooltipAfterBlur.BackgroundUnchanged && tooltipHoverOpen.BackgroundUnchanged && tooltipAfterPointerLeave.BackgroundUnchanged
            };
            smokePhase = "validating-primitives";
            var primitiveInteraction = await ExecuteJsonScriptAsync<DesktopPrimitiveInteractionEvidence>(sender, RunPrimitiveEvidenceScript)
                ?? throw new InvalidOperationException("Desktop primitive evidence did not return an object.");
            if (!StringComparer.Ordinal.Equals(primitiveInteraction.HeadingLevel, "H2") ||
                !StringComparer.Ordinal.Equals(primitiveInteraction.HeadingText, "Desktop primitives") ||
                !StringComparer.Ordinal.Equals(primitiveInteraction.CodeTag, "PRE") ||
                !primitiveInteraction.CodeDescendant || !primitiveInteraction.CodeText ||
                !StringComparer.Ordinal.Equals(primitiveInteraction.IconRole, "img") ||
                !StringComparer.Ordinal.Equals(primitiveInteraction.IconLabel, "Warning") ||
                !primitiveInteraction.DecorativeIconHidden ||
                !StringComparer.Ordinal.Equals(primitiveInteraction.KbdText, "Ctrl") ||
                !primitiveInteraction.LinkTargetResolved || !primitiveInteraction.LinkPrevented ||
                primitiveInteraction.LinkActivations != 1 || !primitiveInteraction.LinkHashUnchanged ||
                !StringComparer.Ordinal.Equals(primitiveInteraction.SeparatorOrientation, "horizontal") ||
                !primitiveInteraction.SeparatorRole || !primitiveInteraction.VisuallyHiddenAccessible ||
                !primitiveInteraction.VisuallyHiddenClipped || !primitiveInteraction.VisuallyHiddenSized ||
                !primitiveInteraction.AspectRatioMeasured || !primitiveInteraction.ContainerMaxWidth ||
                !primitiveInteraction.ContainerPadding || !primitiveInteraction.ContainerBounds ||
                !StringComparer.Ordinal.Equals(primitiveInteraction.AlertRole, "status") ||
                !StringComparer.Ordinal.Equals(primitiveInteraction.AlertLive, "polite") ||
                !primitiveInteraction.AlertText ||
                !StringComparer.Ordinal.Equals(primitiveInteraction.SpinnerRole, "status") ||
                !StringComparer.Ordinal.Equals(primitiveInteraction.SpinnerLabel, "Loading desktop primitives") ||
                !primitiveInteraction.SpinnerMotionObserved)
                throw new InvalidOperationException("Desktop primitive interaction evidence failed its typed contract.");
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
                dialogInteraction,
                tabsInteraction,
                accordionInteraction,
                popoverInteraction,
                tooltipInteraction,
                primitiveInteraction
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
