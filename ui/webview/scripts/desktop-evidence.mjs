import { pathToFileURL } from 'node:url';

const revisionPattern = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u;
const componentSource = 'apps/desktop/src/routes/+page.svelte';
const noSideEffects = Object.freeze({
	bridge: 'none',
	filesystem: 'none',
	network: 'none',
	window: 'none'
});
export const desktopComponentContracts = [
	{
		id: 'box',
		name: 'ZBox',
		marker: 'ZBox-status',
		native: { tag: 'DIV', ariaLive: 'polite' }
	},
	{ id: 'stack', name: 'ZStack', marker: 'ZStack', native: { tag: 'DIV' } },
	{
		id: 'text',
		name: 'ZText',
		marker: 'ZText',
		native: { tag: 'STRONG', text: 'Windows WebView2 capability lab' }
	},
	{
		id: 'button',
		name: 'ZButton',
		marker: 'ZButton-component-action',
		native: { tag: 'BUTTON', type: 'button', disabled: false, text: 'Verify component' },
		interaction: {
			id: 'activate-once',
			action: 'click',
			target: 'root',
			observations: [
				{
					id: 'runs-delta',
					kind: 'state',
					target: 'data-desktop-evidence-runs',
					expected: 1,
					read: (raw) => raw.page.componentActionDelta
				}
			]
		}
	},
	{
		id: 'form',
		name: 'ZForm',
		marker: 'ZForm-contract',
		native: { tag: 'FORM', noValidate: true },
		interaction: {
			id: 'submit-valid-form',
			action: 'submit',
			target: 'root',
			observations: [
				{
					id: 'submitted',
					kind: 'state',
					target: 'data-submitted',
					expected: true,
					read: (raw) => raw.formInteraction.formSubmitted
				},
				{
					id: 'submit-count',
					kind: 'count',
					target: 'onValidSubmit',
					expected: 1,
					read: (raw) => raw.formInteraction.submitCount
				},
				{
					id: 'form-data-email',
					kind: 'form-data',
					target: 'email',
					expected: 'desktop-value',
					read: (raw) => raw.formInteraction.formDataEmail
				},
				{
					id: 'form-data-enabled',
					kind: 'form-data',
					target: 'enabled',
					expected: 'enabled',
					read: (raw) => raw.formInteraction.formDataEnabled
				}
			]
		}
	},
	{
		id: 'form-field',
		name: 'ZFormField',
		marker: 'ZFormField-email',
		native: { tag: 'DIV' },
		interaction: {
			id: 'observe-input-state',
			action: 'fill-and-blur',
			target: 'descendant:ZInput',
			observations: [
				{
					id: 'dirty',
					kind: 'state',
					target: 'data-dirty',
					expected: true,
					read: (raw) => raw.formInteraction.fieldDirty
				},
				{
					id: 'touched',
					kind: 'state',
					target: 'data-touched',
					expected: true,
					read: (raw) => raw.formInteraction.fieldTouched
				}
			]
		}
	},
	{
		id: 'input',
		name: 'ZInput',
		marker: 'ZInput-email',
		native: {
			tag: 'INPUT',
			type: 'text',
			disabled: false,
			name: 'email',
			value: '',
			required: true,
			readOnly: false
		},
		interaction: {
			id: 'fill-email',
			action: 'fill',
			target: 'root',
			observations: [
				{
					id: 'value',
					kind: 'state',
					target: 'value',
					expected: 'desktop-value',
					read: (raw) => raw.formInteraction.inputValue
				},
				{
					id: 'label-relation',
					kind: 'relationship',
					target: 'labels',
					expected: true,
					read: (raw) => raw.formInteraction.inputLabelled
				},
				{
					id: 'description-relation',
					kind: 'relationship',
					target: 'aria-describedby',
					expected: true,
					read: (raw) => raw.formInteraction.inputDescriptionResolved
				}
			]
		}
	},
	{
		id: 'checkbox',
		name: 'ZCheckbox',
		marker: 'ZCheckbox-enabled',
		native: {
			tag: 'INPUT',
			type: 'checkbox',
			disabled: false,
			name: 'enabled',
			value: 'enabled',
			checked: false,
			dataState: 'unchecked'
		},
		interaction: {
			id: 'check-enabled',
			action: 'click',
			target: 'root',
			observations: [
				{
					id: 'checked',
					kind: 'state',
					target: 'checked',
					expected: true,
					read: (raw) => raw.formInteraction.checkboxChecked
				},
				{
					id: 'data-state',
					kind: 'state',
					target: 'data-state',
					expected: 'checked',
					read: (raw) => raw.formInteraction.checkboxState
				},
				{
					id: 'label-relation',
					kind: 'relationship',
					target: 'labels',
					expected: true,
					read: (raw) => raw.formInteraction.checkboxLabelled
				}
			]
		}
	},
	{
		id: 'switch',
		name: 'ZSwitch',
		marker: 'ZSwitch-enabled',
		native: {
			tag: 'INPUT',
			type: 'checkbox',
			role: 'switch',
			disabled: false,
			name: 'switchEnabled',
			value: 'enabled',
			checked: false,
			ariaChecked: 'false',
			dataState: 'unchecked'
		},
		interaction: {
			id: 'toggle-switch',
			action: 'click',
			target: 'root',
			observations: [
				{
					id: 'checked',
					kind: 'state',
					target: 'checked',
					expected: true,
					read: (raw) => raw.choiceInteraction.switchChecked
				},
				{
					id: 'data-state',
					kind: 'state',
					target: 'data-state',
					expected: 'checked',
					read: (raw) => raw.choiceInteraction.switchState
				},
				{
					id: 'aria-checked',
					kind: 'aria',
					target: 'aria-checked',
					expected: 'true',
					read: (raw) => raw.choiceInteraction.switchAriaChecked
				},
				{
					id: 'label-relation',
					kind: 'relationship',
					target: 'labels',
					expected: true,
					read: (raw) => raw.choiceInteraction.switchLabelled
				},
				{
					id: 'form-data',
					kind: 'form-data',
					target: 'switchEnabled',
					expected: 'enabled',
					read: (raw) => raw.choiceInteraction.switchFormData
				}
			]
		}
	},
	{
		id: 'radio-group',
		name: 'ZRadioGroup',
		marker: 'ZRadioGroup-mode',
		native: { tag: 'DIV', role: 'radiogroup', ariaOrientation: 'vertical' },
		interaction: {
			id: 'arrow-select',
			action: 'key:ArrowDown',
			target: 'descendant:value=standard',
			observations: [
				{
					id: 'selected-value',
					kind: 'form-data',
					target: 'mode',
					expected: 'advanced',
					read: (raw) => raw.choiceInteraction.radioValue
				},
				{
					id: 'disabled-skipped',
					kind: 'state',
					target: 'disabled-option',
					expected: true,
					read: (raw) => raw.choiceInteraction.disabledSkipped
				},
				{
					id: 'focus-moved',
					kind: 'relationship',
					target: 'activeElement',
					expected: true,
					read: (raw) => raw.choiceInteraction.advancedFocused
				}
			]
		}
	},
	{
		id: 'radio-group-item',
		name: 'ZRadioGroupItem',
		marker: 'ZRadioGroupItem-advanced',
		native: {
			tag: 'INPUT',
			type: 'radio',
			disabled: false,
			name: 'mode',
			value: 'advanced',
			checked: false,
			ariaChecked: 'false',
			tabIndex: -1,
			dataState: 'unchecked'
		},
		interaction: {
			id: 'receive-group-selection',
			action: 'keyboard-selection',
			target: 'root',
			observations: [
				{
					id: 'checked',
					kind: 'state',
					target: 'checked',
					expected: true,
					read: (raw) => raw.choiceInteraction.advancedChecked
				},
				{
					id: 'data-state',
					kind: 'state',
					target: 'data-state',
					expected: 'checked',
					read: (raw) => raw.choiceInteraction.advancedState
				},
				{
					id: 'aria-checked',
					kind: 'aria',
					target: 'aria-checked',
					expected: 'true',
					read: (raw) => raw.choiceInteraction.advancedAriaChecked
				},
				{
					id: 'focused',
					kind: 'relationship',
					target: 'activeElement',
					expected: true,
					read: (raw) => raw.choiceInteraction.advancedFocused
				}
			]
		}
	},
	{
		id: 'select-trigger',
		name: 'ZSelectTrigger',
		marker: 'ZSelectTrigger-country',
		native: {
			tag: 'BUTTON',
			type: 'button',
			disabled: false,
			text: 'Choose country',
			ariaExpanded: 'false',
			ariaControlsPresent: true,
			ariaHasPopup: 'listbox',
			dataState: 'closed'
		},
		interaction: {
			id: 'open-select-and-restore-focus',
			action: 'click+Enter+Escape',
			target: 'root',
			observations: [
				{
					id: 'expanded-before',
					kind: 'aria',
					target: 'aria-expanded',
					expected: false,
					read: (raw) => raw.selectInteraction.expandedBefore
				},
				{
					id: 'expanded-after-open',
					kind: 'aria',
					target: 'aria-expanded',
					expected: true,
					read: (raw) => raw.selectInteraction.expandedAfterOpen
				},
				{
					id: 'controls-resolved',
					kind: 'relationship',
					target: 'aria-controls',
					expected: true,
					read: (raw) => raw.selectInteraction.controlsResolved
				},
				{
					id: 'closed-after-selection',
					kind: 'aria',
					target: 'aria-expanded',
					expected: false,
					read: (raw) => raw.selectInteraction.expandedAfterSelection
				},
				{
					id: 'focus-after-selection',
					kind: 'relationship',
					target: 'activeElement',
					expected: true,
					read: (raw) => raw.selectInteraction.focusAfterSelection
				},
				{
					id: 'closed-after-escape',
					kind: 'aria',
					target: 'aria-expanded',
					expected: false,
					read: (raw) => raw.selectInteraction.expandedAfterEscape
				},
				{
					id: 'focus-after-escape',
					kind: 'relationship',
					target: 'activeElement',
					expected: true,
					read: (raw) => raw.selectInteraction.focusAfterEscape
				}
			]
		}
	},
	{
		id: 'select-content',
		name: 'ZSelectContent',
		marker: 'ZSelectContent-country',
		native: {
			tag: 'DIV',
			role: 'listbox',
			ariaActiveDescendantPresent: true,
			tabIndex: -1,
			dataState: 'open'
		},
		interaction: {
			id: 'own-active-descendant',
			action: 'focus+Enter+Escape',
			target: 'root',
			observations: [
				{
					id: 'popup-role',
					kind: 'native',
					target: 'role',
					expected: 'listbox',
					read: (raw) => raw.selectInteraction.popupRole
				},
				{
					id: 'active-descendant-resolved',
					kind: 'relationship',
					target: 'aria-activedescendant',
					expected: true,
					read: (raw) => raw.selectInteraction.activeDescendantResolved
				},
				{
					id: 'disabled-skipped',
					kind: 'state',
					target: 'disabled-option',
					expected: true,
					read: (raw) => raw.selectInteraction.disabledSkipped
				},
				{
					id: 'popup-focused',
					kind: 'relationship',
					target: 'activeElement',
					expected: true,
					read: (raw) => raw.selectInteraction.popupFocused
				}
			]
		}
	},
	{
		id: 'select-item',
		name: 'ZSelectItem',
		marker: 'ZSelectItem-country-cn',
		native: {
			tag: 'DIV',
			role: 'option',
			ariaSelected: 'false',
			tabIndex: -1,
			dataState: 'unselected',
			dataHighlighted: 'true'
		},
		interaction: {
			id: 'select-active-item',
			action: 'Enter',
			target: 'active-descendant',
			observations: [
				{
					id: 'selected-value',
					kind: 'state',
					target: 'value',
					expected: 'cn',
					read: (raw) => raw.selectInteraction.selectedValue
				},
				{
					id: 'form-data',
					kind: 'form-data',
					target: 'country',
					expected: 'cn',
					read: (raw) => raw.selectInteraction.formDataValue
				}
			]
		}
	},
	{
		id: 'dialog-trigger',
		name: 'ZDialogTrigger',
		marker: 'ZDialogTrigger-settings',
		native: {
			tag: 'BUTTON',
			type: 'button',
			ariaExpanded: 'false',
			ariaControlsPresent: true,
			ariaHasPopup: 'dialog',
			dataState: 'closed'
		},
		interaction: {
			id: 'open-dismiss-and-restore-focus',
			action: 'click+Escape+click-close',
			target: 'root',
			observations: [
				{
					id: 'expanded-before',
					kind: 'aria',
					target: 'aria-expanded',
					expected: false,
					read: (raw) => raw.dialogInteraction.expandedBefore
				},
				{
					id: 'expanded-after-open',
					kind: 'aria',
					target: 'aria-expanded',
					expected: true,
					read: (raw) => raw.dialogInteraction.expandedAfterOpen
				},
				{
					id: 'closed-after-escape',
					kind: 'aria',
					target: 'aria-expanded',
					expected: false,
					read: (raw) => raw.dialogInteraction.expandedAfterEscape
				},
				{
					id: 'focus-after-escape',
					kind: 'relationship',
					target: 'activeElement',
					expected: true,
					read: (raw) => raw.dialogInteraction.focusAfterEscape
				},
				{
					id: 'closed-after-close-button',
					kind: 'aria',
					target: 'aria-expanded',
					expected: false,
					read: (raw) => raw.dialogInteraction.expandedAfterClose
				},
				{
					id: 'focus-after-close-button',
					kind: 'relationship',
					target: 'activeElement',
					expected: true,
					read: (raw) => raw.dialogInteraction.focusAfterClose
				}
			]
		}
	},
	{
		id: 'dialog-overlay',
		name: 'ZDialogOverlay',
		marker: 'ZDialogOverlay-settings',
		native: {
			tag: 'DIV',
			ariaHidden: 'true',
			dataPresence: 'entered',
			dataReducedMotion: 'true',
			dataState: 'open'
		},
		interaction: {
			id: 'reduced-motion-presence-cleanup',
			action: 'Escape+click-close',
			target: 'root',
			observations: [
				{
					id: 'presence-entered-observed',
					kind: 'state',
					target: 'data-presence',
					expected: true,
					read: (raw) => raw.dialogInteraction.presenceEnteredObserved
				},
				{
					id: 'reduced-motion-observed',
					kind: 'state',
					target: 'data-reduced-motion',
					expected: true,
					read: (raw) => raw.dialogInteraction.reducedMotionObserved
				},
				{
					id: 'removed-after-escape',
					kind: 'cleanup',
					target: 'presence',
					expected: true,
					read: (raw) => raw.dialogInteraction.presenceCleanedAfterEscape
				},
				{
					id: 'removed-after-close-button',
					kind: 'cleanup',
					target: 'presence',
					expected: true,
					read: (raw) => raw.dialogInteraction.presenceCleanedAfterClose
				}
			]
		}
	},
	{
		id: 'dialog-content',
		name: 'ZDialogContent',
		marker: 'ZDialogContent-settings',
		native: {
			tag: 'DIV',
			role: 'dialog',
			tabIndex: -1,
			ariaModal: 'true',
			ariaLabelledByPresent: true,
			ariaDescribedByPresent: true,
			dataPresence: 'entered',
			dataReducedMotion: 'true',
			dataState: 'open'
		},
		interaction: {
			id: 'modal-relationships-focus-and-cleanup',
			action: 'click+Tab+ShiftTab+Escape+click-close',
			target: 'aria-controls',
			observations: [
				{
					id: 'controls-resolved',
					kind: 'relationship',
					target: 'aria-controls',
					expected: true,
					read: (raw) => raw.dialogInteraction.controlsResolved
				},
				{
					id: 'content-role',
					kind: 'native',
					target: 'role',
					expected: 'dialog',
					read: (raw) => raw.dialogInteraction.contentRole
				},
				{
					id: 'modal',
					kind: 'aria',
					target: 'aria-modal',
					expected: true,
					read: (raw) => raw.dialogInteraction.modal
				},
				{
					id: 'labelledby-resolved',
					kind: 'relationship',
					target: 'aria-labelledby',
					expected: true,
					read: (raw) => raw.dialogInteraction.labelledByResolved
				},
				{
					id: 'describedby-resolved',
					kind: 'relationship',
					target: 'aria-describedby',
					expected: true,
					read: (raw) => raw.dialogInteraction.describedByResolved
				},
				{
					id: 'initial-focus-contained',
					kind: 'focus',
					target: 'dialog-content',
					expected: true,
					read: (raw) => raw.dialogInteraction.contentFocusedAfterOpen
				},
				{
					id: 'focus-trap-held',
					kind: 'focus',
					target: 'dialog-content',
					expected: true,
					read: (raw) => raw.dialogInteraction.focusTrapHeld
				},
				{
					id: 'background-inert-applied',
					kind: 'state',
					target: 'background-owner',
					expected: true,
					read: (raw) => raw.dialogInteraction.inertApplied
				},
				{
					id: 'background-inert-released-after-escape',
					kind: 'cleanup',
					target: 'background-owner',
					expected: true,
					read: (raw) => raw.dialogInteraction.inertReleasedAfterEscape
				},
				{
					id: 'background-inert-released-after-close',
					kind: 'cleanup',
					target: 'background-owner',
					expected: true,
					read: (raw) => raw.dialogInteraction.inertReleasedAfterClose
				},
				{
					id: 'scroll-lock-applied',
					kind: 'state',
					target: 'document-body',
					expected: true,
					read: (raw) => raw.dialogInteraction.scrollLockApplied
				},
				{
					id: 'scroll-lock-released-after-escape',
					kind: 'cleanup',
					target: 'document-body',
					expected: true,
					read: (raw) => raw.dialogInteraction.scrollLockReleasedAfterEscape
				},
				{
					id: 'scroll-lock-released-after-close',
					kind: 'cleanup',
					target: 'document-body',
					expected: true,
					read: (raw) => raw.dialogInteraction.scrollLockReleasedAfterClose
				}
			]
		}
	},
	{
		id: 'dialog-title',
		name: 'ZDialogTitle',
		marker: 'ZDialogTitle-settings',
		native: { tag: 'H2', idPresent: true },
		interaction: {
			id: 'label-dialog-content',
			action: 'register',
			target: 'aria-labelledby',
			observations: [
				{
					id: 'labelledby-resolved',
					kind: 'relationship',
					target: 'aria-labelledby',
					expected: true,
					read: (raw) => raw.dialogInteraction.labelledByResolved
				}
			]
		}
	},
	{
		id: 'dialog-description',
		name: 'ZDialogDescription',
		marker: 'ZDialogDescription-settings',
		native: { tag: 'P', idPresent: true },
		interaction: {
			id: 'describe-dialog-content',
			action: 'register',
			target: 'aria-describedby',
			observations: [
				{
					id: 'describedby-resolved',
					kind: 'relationship',
					target: 'aria-describedby',
					expected: true,
					read: (raw) => raw.dialogInteraction.describedByResolved
				}
			]
		}
	},
	{
		id: 'dialog-close',
		name: 'ZDialogClose',
		marker: 'ZDialogClose-settings',
		native: { tag: 'BUTTON', type: 'button' },
		interaction: {
			id: 'close-and-restore-focus',
			action: 'click',
			target: 'root',
			observations: [
				{
					id: 'closed',
					kind: 'state',
					target: 'dialog',
					expected: true,
					read: (raw) => raw.dialogInteraction.closeButtonClosed
				},
				{
					id: 'focus-restored',
					kind: 'focus',
					target: 'trigger',
					expected: true,
					read: (raw) => raw.dialogInteraction.focusAfterClose
				}
			]
		}
	}
];
desktopComponentContracts.push(
	{
		id: 'tabs',
		name: 'ZTabs',
		marker: 'ZTabs-settings',
		native: { tag: 'DIV', dataOrientation: 'horizontal', dataPanelMount: 'keep-mounted' },
		interaction: {
			id: 'tabs-keyboard-selection',
			action: 'ArrowRight+Home',
			target: 'root',
			observations: [
				{
					id: 'initial-selected',
					kind: 'state',
					target: 'selected',
					expected: true,
					read: (raw) => raw.tabsInteraction.initialSelected
				},
				{
					id: 'initial-controls',
					kind: 'relationship',
					target: 'aria-controls',
					expected: true,
					read: (raw) => raw.tabsInteraction.initialControlsResolved
				},
				{
					id: 'initial-labelledby',
					kind: 'relationship',
					target: 'aria-labelledby',
					expected: true,
					read: (raw) => raw.tabsInteraction.initialLabelledByResolved
				},
				{
					id: 'disabled-skipped',
					kind: 'state',
					target: 'disabled-option',
					expected: true,
					read: (raw) => raw.tabsInteraction.disabledSkipped
				},
				{
					id: 'arrow-handled',
					kind: 'keyboard',
					target: 'ArrowRight',
					expected: true,
					read: (raw) => raw.tabsInteraction.arrowHandled
				},
				{
					id: 'advanced-focused',
					kind: 'focus',
					target: 'advanced',
					expected: true,
					read: (raw) => raw.tabsInteraction.advancedFocused
				},
				{
					id: 'advanced-selected',
					kind: 'state',
					target: 'advanced',
					expected: true,
					read: (raw) => raw.tabsInteraction.advancedSelected
				},
				{
					id: 'advanced-panel-active',
					kind: 'state',
					target: 'advanced-panel',
					expected: true,
					read: (raw) => raw.tabsInteraction.advancedPanelActive
				},
				{
					id: 'general-hidden',
					kind: 'state',
					target: 'general-panel',
					expected: true,
					read: (raw) => raw.tabsInteraction.generalPanelHidden
				},
				{
					id: 'home-handled',
					kind: 'keyboard',
					target: 'Home',
					expected: true,
					read: (raw) => raw.tabsInteraction.homeHandled
				},
				{
					id: 'general-focused-after-home',
					kind: 'focus',
					target: 'general',
					expected: true,
					read: (raw) => raw.tabsInteraction.generalFocusedAfterHome
				},
				{
					id: 'general-selected-after-home',
					kind: 'state',
					target: 'general',
					expected: true,
					read: (raw) => raw.tabsInteraction.generalSelectedAfterHome
				},
				{
					id: 'general-panel-active-after-home',
					kind: 'state',
					target: 'general-panel',
					expected: true,
					read: (raw) => raw.tabsInteraction.generalPanelActiveAfterHome
				}
			]
		}
	},
	{
		id: 'tabs-list',
		name: 'ZTabsList',
		marker: 'ZTabsList-settings',
		native: { tag: 'DIV', role: 'tablist', ariaOrientation: 'horizontal' },
		interaction: {
			id: 'navigate-enabled-tabs',
			action: 'ArrowRight+Home',
			target: 'tablist',
			observations: [
				{
					id: 'arrow-handled',
					kind: 'keyboard',
					target: 'ArrowRight',
					expected: true,
					read: (raw) => raw.tabsInteraction.arrowHandled
				},
				{
					id: 'disabled-skipped',
					kind: 'state',
					target: 'disabled-option',
					expected: true,
					read: (raw) => raw.tabsInteraction.disabledSkipped
				},
				{
					id: 'home-handled',
					kind: 'keyboard',
					target: 'Home',
					expected: true,
					read: (raw) => raw.tabsInteraction.homeHandled
				}
			]
		}
	},
	{
		id: 'tabs-trigger',
		name: 'ZTabsTrigger',
		marker: 'ZTabsTrigger-general',
		native: {
			tag: 'BUTTON',
			type: 'button',
			role: 'tab',
			ariaSelected: 'true',
			ariaControlsPresent: true,
			tabIndex: 0,
			dataState: 'active'
		},
		interaction: {
			id: 'synchronize-roving-selection',
			action: 'ArrowRight+Home',
			target: 'root',
			observations: [
				{
					id: 'advanced-selected',
					kind: 'state',
					target: 'advanced-tab',
					expected: true,
					read: (raw) => raw.tabsInteraction.advancedSelected
				},
				{
					id: 'general-focused-after-home',
					kind: 'focus',
					target: 'general-tab',
					expected: true,
					read: (raw) => raw.tabsInteraction.generalFocusedAfterHome
				},
				{
					id: 'general-selected-after-home',
					kind: 'state',
					target: 'general-tab',
					expected: true,
					read: (raw) => raw.tabsInteraction.generalSelectedAfterHome
				}
			]
		}
	},
	{
		id: 'tabs-panel',
		name: 'ZTabsPanel',
		marker: 'ZTabsPanel-general',
		native: {
			tag: 'DIV',
			role: 'tabpanel',
			ariaLabelledByPresent: true,
			hidden: false,
			tabIndex: 0,
			dataState: 'active'
		},
		interaction: {
			id: 'synchronize-mounted-panels',
			action: 'selection-change',
			target: 'root',
			observations: [
				{
					id: 'general-hidden',
					kind: 'state',
					target: 'hidden',
					expected: true,
					read: (raw) => raw.tabsInteraction.generalPanelHidden
				},
				{
					id: 'general-active-after-home',
					kind: 'state',
					target: 'data-state',
					expected: true,
					read: (raw) => raw.tabsInteraction.generalPanelActiveAfterHome
				}
			]
		}
	},
	{
		id: 'accordion',
		name: 'ZAccordion',
		marker: 'ZAccordion-settings',
		native: { tag: 'DIV', dataReducedMotion: 'true' },
		interaction: {
			id: 'accordion-keyboard-selection',
			action: 'click+ArrowDown',
			target: 'root',
			observations: [
				{
					id: 'initial-expanded',
					kind: 'state',
					target: 'expanded',
					expected: true,
					read: (raw) => raw.accordionInteraction.initialExpanded
				},
				{
					id: 'initial-controls',
					kind: 'relationship',
					target: 'aria-controls',
					expected: true,
					read: (raw) => raw.accordionInteraction.initialControlsResolved
				},
				{
					id: 'initial-labelledby',
					kind: 'relationship',
					target: 'aria-labelledby',
					expected: true,
					read: (raw) => raw.accordionInteraction.initialLabelledByResolved
				},
				{
					id: 'reduced-motion',
					kind: 'state',
					target: 'motion',
					expected: true,
					read: (raw) => raw.accordionInteraction.reducedMotionObserved
				},
				{
					id: 'collapse-focused',
					kind: 'focus',
					target: 'general',
					expected: true,
					read: (raw) => raw.accordionInteraction.collapseFocused
				},
				{
					id: 'collapsed',
					kind: 'state',
					target: 'general',
					expected: true,
					read: (raw) => raw.accordionInteraction.collapsed
				},
				{
					id: 'content-cleaned',
					kind: 'cleanup',
					target: 'general-content',
					expected: true,
					read: (raw) => raw.accordionInteraction.generalContentCleaned
				},
				{
					id: 'reopened',
					kind: 'state',
					target: 'general',
					expected: true,
					read: (raw) => raw.accordionInteraction.reopened
				},
				{
					id: 'arrow-handled',
					kind: 'keyboard',
					target: 'ArrowDown',
					expected: true,
					read: (raw) => raw.accordionInteraction.arrowHandled
				},
				{
					id: 'disabled-skipped',
					kind: 'state',
					target: 'disabled-option',
					expected: true,
					read: (raw) => raw.accordionInteraction.disabledSkipped
				},
				{
					id: 'advanced-focused',
					kind: 'focus',
					target: 'advanced',
					expected: true,
					read: (raw) => raw.accordionInteraction.advancedFocused
				},
				{
					id: 'advanced-expanded',
					kind: 'state',
					target: 'advanced',
					expected: true,
					read: (raw) => raw.accordionInteraction.advancedExpanded
				},
				{
					id: 'general-collapsed',
					kind: 'state',
					target: 'general',
					expected: true,
					read: (raw) => raw.accordionInteraction.generalCollapsed
				},
				{
					id: 'advanced-controls',
					kind: 'relationship',
					target: 'aria-controls',
					expected: true,
					read: (raw) => raw.accordionInteraction.advancedControlsResolved
				},
				{
					id: 'advanced-labelledby',
					kind: 'relationship',
					target: 'aria-labelledby',
					expected: true,
					read: (raw) => raw.accordionInteraction.advancedLabelledByResolved
				},
				{
					id: 'content-cleaned-after-advanced',
					kind: 'cleanup',
					target: 'general-content',
					expected: true,
					read: (raw) => raw.accordionInteraction.generalContentCleanedAfterAdvanced
				}
			]
		}
	},
	{
		id: 'accordion-item',
		name: 'ZAccordionItem',
		marker: 'ZAccordionItem-general',
		native: { tag: 'DIV', dataState: 'open' },
		interaction: {
			id: 'synchronize-single-item-state',
			action: 'collapse+reopen+select-advanced',
			target: 'root',
			observations: [
				{
					id: 'collapsed',
					kind: 'state',
					target: 'data-state',
					expected: true,
					read: (raw) => raw.accordionInteraction.collapsed
				},
				{
					id: 'reopened',
					kind: 'state',
					target: 'data-state',
					expected: true,
					read: (raw) => raw.accordionInteraction.reopened
				},
				{
					id: 'general-collapsed-after-advanced',
					kind: 'state',
					target: 'data-state',
					expected: true,
					read: (raw) => raw.accordionInteraction.generalCollapsed
				}
			]
		}
	},
	{
		id: 'accordion-trigger',
		name: 'ZAccordionTrigger',
		marker: 'ZAccordionTrigger-general',
		native: {
			tag: 'BUTTON',
			type: 'button',
			ariaExpanded: 'true',
			ariaControlsPresent: true,
			tabIndex: 0,
			dataState: 'open',
			dataReducedMotion: 'true'
		},
		interaction: {
			id: 'activate-and-navigate-triggers',
			action: 'click+ArrowDown',
			target: 'root',
			observations: [
				{
					id: 'collapse-focused',
					kind: 'focus',
					target: 'root',
					expected: true,
					read: (raw) => raw.accordionInteraction.collapseFocused
				},
				{
					id: 'arrow-handled',
					kind: 'keyboard',
					target: 'ArrowDown',
					expected: true,
					read: (raw) => raw.accordionInteraction.arrowHandled
				},
				{
					id: 'disabled-skipped',
					kind: 'state',
					target: 'disabled-trigger',
					expected: true,
					read: (raw) => raw.accordionInteraction.disabledSkipped
				},
				{
					id: 'advanced-focused',
					kind: 'focus',
					target: 'advanced-trigger',
					expected: true,
					read: (raw) => raw.accordionInteraction.advancedFocused
				}
			]
		}
	},
	{
		id: 'accordion-content',
		name: 'ZAccordionContent',
		marker: 'ZAccordionContent-general',
		native: {
			tag: 'DIV',
			role: 'region',
			ariaLabelledByPresent: true,
			dataPresence: 'entered',
			dataState: 'open',
			dataReducedMotion: 'true'
		},
		interaction: {
			id: 'clean-up-collapsed-content',
			action: 'collapse+reopen+select-advanced',
			target: 'root',
			observations: [
				{
					id: 'initial-controls',
					kind: 'relationship',
					target: 'aria-controls',
					expected: true,
					read: (raw) => raw.accordionInteraction.initialControlsResolved
				},
				{
					id: 'content-cleaned',
					kind: 'cleanup',
					target: 'presence',
					expected: true,
					read: (raw) => raw.accordionInteraction.generalContentCleaned
				},
				{
					id: 'content-cleaned-after-advanced',
					kind: 'cleanup',
					target: 'presence',
					expected: true,
					read: (raw) => raw.accordionInteraction.generalContentCleanedAfterAdvanced
				}
			]
		}
	},
	{
		id: 'popover-trigger',
		name: 'ZPopoverTrigger',
		marker: 'ZPopoverTrigger-settings',
		native: {
			tag: 'BUTTON',
			type: 'button',
			ariaExpanded: 'false',
			ariaControlsPresent: true,
			ariaHasPopup: 'dialog',
			dataState: 'closed'
		},
		interaction: {
			id: 'open-dismiss-and-restore-focus',
			action: 'click+Escape+pointerdown-outside',
			target: 'root',
			observations: [
				{
					id: 'expanded-after-open',
					kind: 'aria',
					target: 'aria-expanded',
					expected: true,
					read: (raw) => raw.popoverInteraction.expandedAfterOpen
				},
				{
					id: 'closed-after-escape',
					kind: 'aria',
					target: 'aria-expanded',
					expected: false,
					read: (raw) => raw.popoverInteraction.expandedAfterEscape
				},
				{
					id: 'focus-after-escape',
					kind: 'focus',
					target: 'trigger',
					expected: true,
					read: (raw) => raw.popoverInteraction.focusAfterEscape
				},
				{
					id: 'expanded-after-pointer-outside',
					kind: 'aria',
					target: 'aria-expanded',
					expected: false,
					read: (raw) => raw.popoverInteraction.expandedAfterPointerOutside
				},
				{
					id: 'focus-after-pointer-outside',
					kind: 'focus',
					target: 'trigger',
					expected: true,
					read: (raw) => raw.popoverInteraction.focusAfterPointerOutside
				}
			]
		}
	},
	{
		id: 'popover-content',
		name: 'ZPopoverContent',
		marker: 'ZPopoverContent-settings',
		native: {
			tag: 'DIV',
			role: 'dialog',
			tabIndex: -1,
			ariaModal: null,
			ariaLabelledByPresent: true,
			dataPresence: 'entered',
			dataReducedMotion: 'true',
			dataState: 'open'
		},
		interaction: {
			id: 'non-modal-relationships-and-cleanup',
			action: 'click+Escape+reopen+pointerdown-outside',
			target: 'aria-controls',
			observations: [
				{
					id: 'controls-resolved',
					kind: 'relationship',
					target: 'aria-controls',
					expected: true,
					read: (raw) => raw.popoverInteraction.controlsResolved
				},
				{
					id: 'content-role',
					kind: 'native',
					target: 'role',
					expected: 'dialog',
					read: (raw) => raw.popoverInteraction.contentRole
				},
				{
					id: 'labelledby-resolved',
					kind: 'relationship',
					target: 'aria-labelledby',
					expected: true,
					read: (raw) => raw.popoverInteraction.labelledByResolved
				},
				{
					id: 'content-focused-after-open',
					kind: 'focus',
					target: 'popover-content',
					expected: true,
					read: (raw) => raw.popoverInteraction.contentFocusedAfterOpen
				},
				{
					id: 'presence-entered-observed',
					kind: 'state',
					target: 'data-presence',
					expected: true,
					read: (raw) => raw.popoverInteraction.presenceEnteredObserved
				},
				{
					id: 'reduced-motion-observed',
					kind: 'state',
					target: 'data-reduced-motion',
					expected: true,
					read: (raw) => raw.popoverInteraction.reducedMotionObserved
				},
				{
					id: 'background-unchanged',
					kind: 'state',
					target: 'document-owner-effects',
					expected: true,
					read: (raw) => raw.popoverInteraction.backgroundUnchanged
				},
				{
					id: 'presence-cleaned-after-escape',
					kind: 'cleanup',
					target: 'presence',
					expected: true,
					read: (raw) => raw.popoverInteraction.presenceCleanedAfterEscape
				},
				{
					id: 'presence-cleaned-after-pointer-outside',
					kind: 'cleanup',
					target: 'presence',
					expected: true,
					read: (raw) => raw.popoverInteraction.presenceCleanedAfterPointerOutside
				}
			]
		}
	}
);
Object.freeze(desktopComponentContracts);

const contractsByName = new Map(
	desktopComponentContracts.map((contract) => [contract.name, contract])
);

export const desktopCompositionContracts = Object.freeze([
	{
		id: 'select',
		name: 'ZSelect',
		children: [
			{
				id: 'select-trigger',
				name: 'ZSelectTrigger',
				evidenceId: 'ZSelectTrigger-country',
				role: 'trigger'
			},
			{
				id: 'select-content',
				name: 'ZSelectContent',
				evidenceId: 'ZSelectContent-country',
				role: 'content'
			},
			{ id: 'select-item', name: 'ZSelectItem', evidenceId: 'ZSelectItem-country-cn', role: 'item' }
		],
		ownerProbe: {
			id: 'select-runtime-owner',
			action: 'click+Enter+Escape',
			observations: [
				{
					id: 'expanded-after-open',
					kind: 'aria',
					target: 'trigger[aria-expanded]',
					expected: true,
					read: (raw) => raw.selectInteraction.expandedAfterOpen
				},
				{
					id: 'controls-resolved',
					kind: 'relationship',
					target: 'trigger[aria-controls] -> content[id]',
					expected: true,
					read: (raw) => raw.selectInteraction.controlsResolved
				},
				{
					id: 'active-descendant-resolved',
					kind: 'relationship',
					target: 'content[aria-activedescendant] -> item[id]',
					expected: true,
					read: (raw) => raw.selectInteraction.activeDescendantResolved
				},
				{
					id: 'disabled-skipped',
					kind: 'state',
					target: 'disabled-option',
					expected: true,
					read: (raw) => raw.selectInteraction.disabledSkipped
				},
				{
					id: 'selected-value',
					kind: 'state',
					target: 'value',
					expected: 'cn',
					read: (raw) => raw.selectInteraction.selectedValue
				},
				{
					id: 'form-data',
					kind: 'form-data',
					target: 'country',
					expected: 'cn',
					read: (raw) => raw.selectInteraction.formDataValue
				},
				{
					id: 'focus-restored',
					kind: 'focus',
					target: 'trigger',
					expected: true,
					read: (raw) => raw.selectInteraction.focusAfterEscape
				},
				{
					id: 'closed-after-selection',
					kind: 'aria',
					target: 'trigger[aria-expanded]',
					expected: false,
					read: (raw) => raw.selectInteraction.expandedAfterSelection
				},
				{
					id: 'focus-after-selection',
					kind: 'focus',
					target: 'trigger',
					expected: true,
					read: (raw) => raw.selectInteraction.focusAfterSelection
				},
				{
					id: 'closed-after-escape',
					kind: 'aria',
					target: 'trigger[aria-expanded]',
					expected: false,
					read: (raw) => raw.selectInteraction.expandedAfterEscape
				}
			]
		}
	},
	{
		id: 'dialog',
		name: 'ZDialog',
		children: [
			{
				id: 'dialog-trigger',
				name: 'ZDialogTrigger',
				evidenceId: 'ZDialogTrigger-settings',
				role: 'trigger'
			},
			{
				id: 'dialog-overlay',
				name: 'ZDialogOverlay',
				evidenceId: 'ZDialogOverlay-settings',
				role: 'overlay'
			},
			{
				id: 'dialog-content',
				name: 'ZDialogContent',
				evidenceId: 'ZDialogContent-settings',
				role: 'content'
			},
			{
				id: 'dialog-title',
				name: 'ZDialogTitle',
				evidenceId: 'ZDialogTitle-settings',
				role: 'title'
			},
			{
				id: 'dialog-description',
				name: 'ZDialogDescription',
				evidenceId: 'ZDialogDescription-settings',
				role: 'description'
			},
			{
				id: 'dialog-close',
				name: 'ZDialogClose',
				evidenceId: 'ZDialogClose-settings',
				role: 'close'
			}
		],
		ownerProbe: {
			id: 'dialog-runtime-owner',
			action: 'click+Tab+ShiftTab+Escape+click-close',
			observations: [
				{
					id: 'controls-resolved',
					kind: 'relationship',
					target: 'trigger[aria-controls] -> content[id]',
					expected: true,
					read: (raw) => raw.dialogInteraction.controlsResolved
				},
				{
					id: 'open-state-observed',
					kind: 'state',
					target: 'dialog open state',
					expected: true,
					read: (raw) => raw.dialogInteraction.openStateObserved
				},
				{
					id: 'labelledby-resolved',
					kind: 'relationship',
					target: 'content[aria-labelledby] -> title[id]',
					expected: true,
					read: (raw) => raw.dialogInteraction.labelledByResolved
				},
				{
					id: 'closed-after-escape',
					kind: 'aria',
					target: 'trigger[aria-expanded]',
					expected: false,
					read: (raw) => raw.dialogInteraction.expandedAfterEscape
				},
				{
					id: 'closed-after-close',
					kind: 'aria',
					target: 'trigger[aria-expanded]',
					expected: false,
					read: (raw) => raw.dialogInteraction.expandedAfterClose
				},
				{
					id: 'describedby-resolved',
					kind: 'relationship',
					target: 'content[aria-describedby] -> description[id]',
					expected: true,
					read: (raw) => raw.dialogInteraction.describedByResolved
				},
				{
					id: 'content-focused-after-open',
					kind: 'focus',
					target: 'dialog-content',
					expected: true,
					read: (raw) => raw.dialogInteraction.contentFocusedAfterOpen
				},
				{
					id: 'focus-trap-held',
					kind: 'focus',
					target: 'dialog-content',
					expected: true,
					read: (raw) => raw.dialogInteraction.focusTrapHeld
				},
				{
					id: 'background-inert-applied',
					kind: 'state',
					target: 'background-owner',
					expected: true,
					read: (raw) => raw.dialogInteraction.inertApplied
				},
				{
					id: 'background-inert-released',
					kind: 'cleanup',
					target: 'background-owner',
					expected: true,
					read: (raw) =>
						raw.dialogInteraction.inertReleasedAfterEscape &&
						raw.dialogInteraction.inertReleasedAfterClose
				},
				{
					id: 'scroll-lock-applied',
					kind: 'state',
					target: 'document-body',
					expected: true,
					read: (raw) => raw.dialogInteraction.scrollLockApplied
				},
				{
					id: 'presence-cleaned',
					kind: 'cleanup',
					target: 'presence',
					expected: true,
					read: (raw) =>
						raw.dialogInteraction.presenceCleanedAfterEscape &&
						raw.dialogInteraction.presenceCleanedAfterClose
				},
				{
					id: 'scroll-lock-released',
					kind: 'cleanup',
					target: 'document-body',
					expected: true,
					read: (raw) =>
						raw.dialogInteraction.scrollLockReleasedAfterEscape &&
						raw.dialogInteraction.scrollLockReleasedAfterClose
				},
				{
					id: 'reduced-motion-observed',
					kind: 'state',
					target: 'dialog[data-reduced-motion]',
					expected: true,
					read: (raw) => raw.dialogInteraction.reducedMotionObserved
				},
				{
					id: 'focus-restored',
					kind: 'focus',
					target: 'trigger',
					expected: true,
					read: (raw) =>
						raw.dialogInteraction.focusAfterEscape && raw.dialogInteraction.focusAfterClose
				}
			]
		}
	},
	{
		id: 'popover',
		name: 'ZPopover',
		children: [
			{
				id: 'popover-trigger',
				name: 'ZPopoverTrigger',
				evidenceId: 'ZPopoverTrigger-settings',
				role: 'trigger'
			},
			{
				id: 'popover-content',
				name: 'ZPopoverContent',
				evidenceId: 'ZPopoverContent-settings',
				role: 'content'
			}
		],
		ownerProbe: {
			id: 'popover-runtime-owner',
			action: 'click+Escape+reopen+pointerdown-outside',
			observations: [
				{
					id: 'controls-resolved',
					kind: 'relationship',
					target: 'trigger[aria-controls] -> content[id]',
					expected: true,
					read: (raw) => raw.popoverInteraction.controlsResolved
				},
				{
					id: 'open-state-observed',
					kind: 'state',
					target: 'popover open state',
					expected: true,
					read: (raw) => raw.popoverInteraction.openStateObserved
				},
				{
					id: 'content-focused-after-open',
					kind: 'focus',
					target: 'popover-content',
					expected: true,
					read: (raw) => raw.popoverInteraction.contentFocusedAfterOpen
				},
				{
					id: 'closed-after-escape',
					kind: 'aria',
					target: 'trigger[aria-expanded]',
					expected: false,
					read: (raw) => raw.popoverInteraction.expandedAfterEscape
				},
				{
					id: 'focus-restored-after-escape',
					kind: 'focus',
					target: 'trigger',
					expected: true,
					read: (raw) => raw.popoverInteraction.focusAfterEscape
				},
				{
					id: 'reopened',
					kind: 'state',
					target: 'popover open state',
					expected: true,
					read: (raw) => raw.popoverInteraction.reopened
				},
				{
					id: 'expanded-after-pointer-outside',
					kind: 'aria',
					target: 'trigger[aria-expanded]',
					expected: false,
					read: (raw) => raw.popoverInteraction.expandedAfterPointerOutside
				},
				{
					id: 'focus-restored-after-pointer-outside',
					kind: 'focus',
					target: 'trigger',
					expected: true,
					read: (raw) => raw.popoverInteraction.focusAfterPointerOutside
				},
				{
					id: 'presence-cleaned',
					kind: 'cleanup',
					target: 'presence',
					expected: true,
					read: (raw) =>
						raw.popoverInteraction.presenceCleanedAfterEscape &&
						raw.popoverInteraction.presenceCleanedAfterPointerOutside
				},
				{
					id: 'reduced-motion-observed',
					kind: 'state',
					target: 'popover[data-reduced-motion]',
					expected: true,
					read: (raw) => raw.popoverInteraction.reducedMotionObserved
				},
				{
					id: 'background-unchanged',
					kind: 'state',
					target: 'document-owner-effects',
					expected: true,
					read: (raw) => raw.popoverInteraction.backgroundUnchanged
				}
			]
		}
	}
]);
const compositionContractsById = new Map(
	desktopCompositionContracts.map((contract) => [contract.id, contract])
);

export function mergeDesktopEvidence(initial, current, max = 256) {
	if (!Array.isArray(initial) || !Array.isArray(current))
		throw new TypeError('Desktop evidence collection must be arrays.');
	const merged = [];
	const names = new Map();
	const markers = new Set();
	for (const item of [...initial, ...current]) {
		if (
			!item ||
			typeof item.name !== 'string' ||
			item.name.trim() === '' ||
			typeof item.marker !== 'string' ||
			item.marker.trim() === ''
		)
			throw new TypeError('Desktop evidence component name/marker must not be empty.');
		if (names.has(item.name)) {
			if (names.get(item.name) !== item.marker)
				throw new TypeError(`Desktop evidence name has conflicting markers: ${item.name}.`);
			continue;
		}
		if (markers.has(item.marker))
			throw new TypeError(`Desktop evidence marker is duplicated: ${item.marker}.`);
		if (item.present === false)
			throw new TypeError(`Desktop evidence component is not present: ${item.name}.`);
		names.set(item.name, item.marker);
		markers.add(item.marker);
		merged.push(item);
		if (merged.length > max)
			throw new RangeError('Desktop evidence component count exceeds the maximum.');
	}
	return merged;
}
const isMain = process.argv[1] ? pathToFileURL(process.argv[1]).href === import.meta.url : false;

function fail(message) {
	throw new Error(`Desktop evidence validation failed: ${message}`);
}

function productionSource(value) {
	try {
		return new URL(value).origin === 'https://app.zadmin.local';
	} catch {
		return false;
	}
}

function nativeKind(property) {
	return property.startsWith('aria') ? 'aria' : 'native';
}

function normalizeComponent(contract, item, raw) {
	const native = Object.fromEntries(
		Object.keys(contract.native).map((property) => [property, item.native[property]])
	);
	const assertions = [
		{
			id: 'rendered',
			kind: 'state',
			target: 'root',
			expected: true,
			actual: item.present,
			passed: true
		},
		...Object.entries(contract.native).map(([property, expected]) => ({
			id: `native.${property}`,
			kind: nativeKind(property),
			target: property,
			expected,
			actual: item.native[property],
			passed: true
		}))
	];
	const interactions = contract.interaction
		? [
				{
					id: contract.interaction.id,
					action: contract.interaction.action,
					target: contract.interaction.target,
					observations: contract.interaction.observations.map((observation) => ({
						id: observation.id,
						kind: observation.kind,
						target: observation.target,
						expected: observation.expected,
						actual: observation.read(raw),
						passed: true
					})),
					passed: true
				}
			]
		: [];
	return {
		id: contract.id,
		name: contract.name,
		source: componentSource,
		evidenceId: contract.marker,
		locator: {
			kind: 'data-attribute',
			attribute: 'data-desktop-evidence',
			value: contract.marker
		},
		sideEffects: { ...noSideEffects },
		rendered: item.present,
		native,
		assertions,
		interactions,
		passed: true
	};
}

function normalizeComposition(contract, raw) {
	return {
		id: contract.id,
		name: contract.name,
		source: componentSource,
		evidenceMode: 'logical-composition',
		children: contract.children.map(({ id, name, evidenceId, role }) => ({
			id,
			name,
			evidenceId,
			role
		})),
		ownerProbe: {
			id: contract.ownerProbe.id,
			action: contract.ownerProbe.action,
			observations: contract.ownerProbe.observations.map(
				({ id, kind, target, expected, read }) => ({
					id,
					kind,
					target,
					expected,
					actual: read(raw),
					passed: true
				})
			)
		},
		sideEffects: { ...noSideEffects },
		runtimeObserved: true,
		passed: true
	};
}

function assertionMatches(assertion, { id, kind, target, expected, actual }) {
	return (
		assertion?.id === id &&
		assertion.kind === kind &&
		assertion.target === target &&
		assertion.expected === expected &&
		assertion.actual === actual &&
		assertion.passed === true
	);
}

function validateNormalizedComponent(component, contract) {
	if (
		component?.id !== contract.id ||
		component.name !== contract.name ||
		component.source !== componentSource ||
		component.evidenceId !== contract.marker ||
		component.rendered !== true ||
		component.passed !== true ||
		component.locator?.kind !== 'data-attribute' ||
		component.locator.attribute !== 'data-desktop-evidence' ||
		component.locator.value !== contract.marker
	)
		fail(`normalized component ${contract.name} identity is invalid.`);
	if (
		!component.sideEffects ||
		Object.keys(component.sideEffects).length !== Object.keys(noSideEffects).length ||
		Object.entries(noSideEffects).some(([key, value]) => component.sideEffects[key] !== value)
	)
		fail(`normalized component ${contract.name} side-effect policy is invalid.`);
	if (
		!component.native ||
		Object.keys(component.native).length !== Object.keys(contract.native).length ||
		Object.entries(contract.native).some(([key, value]) => component.native[key] !== value)
	)
		fail(`normalized component ${contract.name} native snapshot is invalid.`);
	if (!Array.isArray(component.assertions))
		fail(`normalized component ${contract.name} assertions are invalid.`);
	const assertionsById = new Map(
		component.assertions.map((assertion) => [assertion?.id, assertion])
	);
	if (
		assertionsById.size !== component.assertions.length ||
		component.assertions.length !== Object.keys(contract.native).length + 1 ||
		!assertionMatches(assertionsById.get('rendered'), {
			id: 'rendered',
			kind: 'state',
			target: 'root',
			expected: true,
			actual: true
		})
	)
		fail(`normalized component ${contract.name} rendered assertion is invalid.`);
	for (const [property, expected] of Object.entries(contract.native))
		if (
			!assertionMatches(assertionsById.get(`native.${property}`), {
				id: `native.${property}`,
				kind: nativeKind(property),
				target: property,
				expected,
				actual: expected
			})
		)
			fail(`normalized component ${contract.name} ${property} assertion is invalid.`);
	if (!Array.isArray(component.interactions))
		fail(`normalized component ${contract.name} interactions are invalid.`);
	if (!contract.interaction) {
		if (component.interactions.length !== 0)
			fail(`normalized component ${contract.name} has undeclared interactions.`);
		return;
	}
	const interaction = component.interactions[0];
	if (
		component.interactions.length !== 1 ||
		interaction?.id !== contract.interaction.id ||
		interaction.action !== contract.interaction.action ||
		interaction.target !== contract.interaction.target ||
		interaction.passed !== true ||
		!Array.isArray(interaction.observations) ||
		interaction.observations.length !== contract.interaction.observations.length
	)
		fail(`normalized component ${contract.name} interaction is invalid.`);
	const observationsById = new Map(
		interaction.observations.map((observation) => [observation?.id, observation])
	);
	if (observationsById.size !== interaction.observations.length)
		fail(`normalized component ${contract.name} interaction observations are duplicated.`);
	for (const observation of contract.interaction.observations)
		if (
			!assertionMatches(observationsById.get(observation.id), {
				id: observation.id,
				kind: observation.kind,
				target: observation.target,
				expected: observation.expected,
				actual: observation.expected
			})
		)
			fail(`normalized component ${contract.name} ${observation.id} observation is invalid.`);
}

function validateNormalizedComposition(composition, contract, leafById) {
	if (
		composition?.id !== contract.id ||
		composition.name !== contract.name ||
		composition.source !== componentSource ||
		composition.evidenceMode !== 'logical-composition' ||
		composition.runtimeObserved !== true ||
		composition.passed !== true ||
		Object.hasOwn(composition, 'marker') ||
		Object.hasOwn(composition, 'locator') ||
		Object.hasOwn(composition, 'rendered') ||
		Object.hasOwn(composition, 'native')
	)
		fail(`normalized composition ${contract.name} identity is invalid.`);
	if (
		!composition.sideEffects ||
		Object.keys(composition.sideEffects).length !== Object.keys(noSideEffects).length ||
		Object.entries(noSideEffects).some(([key, value]) => composition.sideEffects[key] !== value)
	)
		fail(`normalized composition ${contract.name} side-effect policy is invalid.`);
	if (
		!Array.isArray(composition.children) ||
		composition.children.length !== contract.children.length
	)
		fail(`normalized composition ${contract.name} children are invalid.`);
	const childIds = new Set();
	const childEvidenceIds = new Set();
	for (const [index, expected] of contract.children.entries()) {
		const child = composition.children[index];
		if (
			!child ||
			child.id !== expected.id ||
			child.name !== expected.name ||
			child.evidenceId !== expected.evidenceId ||
			child.role !== expected.role ||
			childIds.has(child.id) ||
			childEvidenceIds.has(child.evidenceId) ||
			!leafById.has(child.id) ||
			leafById.get(child.id)?.name !== expected.name ||
			leafById.get(child.id)?.evidenceId !== expected.evidenceId
		)
			fail(`normalized composition ${contract.name} child reference is invalid.`);
		childIds.add(child.id);
		childEvidenceIds.add(child.evidenceId);
	}
	const probe = composition.ownerProbe;
	if (
		!probe ||
		probe.id !== contract.ownerProbe.id ||
		probe.action !== contract.ownerProbe.action ||
		!Array.isArray(probe.observations) ||
		probe.observations.length !== contract.ownerProbe.observations.length
	)
		fail(`normalized composition ${contract.name} owner probe is invalid.`);
	const observations = new Map(
		probe.observations.map((observation) => [observation?.id, observation])
	);
	if (observations.size !== probe.observations.length)
		fail(`normalized composition ${contract.name} observations are duplicated.`);
	for (const expected of contract.ownerProbe.observations) {
		const observation = observations.get(expected.id);
		if (
			!observation ||
			observation.kind !== expected.kind ||
			observation.target !== expected.target ||
			observation.expected !== expected.expected ||
			observation.actual !== expected.expected ||
			observation.passed !== true
		)
			fail(`normalized composition ${contract.name} ${expected.id} observation is invalid.`);
	}
}

export function validateDesktopEvidence(raw, { expectedRevision } = {}) {
	if (!raw || raw.navigation !== true) fail('host navigation is incomplete.');
	if (
		raw.bridgeRoundTrip?.method !== 'app.snapshot' ||
		raw.bridgeRoundTrip?.requestReceived !== true ||
		raw.bridgeRoundTrip?.responseValidated !== true
	)
		fail('bridge round trip is incomplete.');
	if (
		raw.protocol !== 1 ||
		raw.target !== 'windows-x64' ||
		raw.host?.implementation !== 'WebViewHost'
	)
		fail('target or host is invalid.');
	if (
		!revisionPattern.test(raw.revision ?? '') &&
		!(expectedRevision === undefined && raw.revision === 'local')
	)
		fail('revision is invalid.');
	if (
		expectedRevision !== undefined &&
		(!revisionPattern.test(expectedRevision) || raw.revision !== expectedRevision)
	)
		fail(`revision does not match expected ${expectedRevision}.`);
	if (
		raw.page?.origin !== 'https://app.zadmin.local' ||
		raw.page?.hasBridge !== true ||
		raw.page?.hydrated !== true ||
		!Array.isArray(raw.page?.errors) ||
		raw.page.errors.length !== 0
	)
		fail('page hydration, origin, bridge or errors are invalid.');
	if (
		raw.host.runtime !== 'WebView2' ||
		typeof raw.host.webViewVersion !== 'string' ||
		raw.host.webViewVersion.length === 0 ||
		raw.host.origin !== raw.page.origin ||
		raw.host.protocolVersion !== 1 ||
		raw.host.navigation !== true ||
		raw.host.hydrated !== true ||
		raw.host.bridge !== true ||
		raw.host.bridgeResponseValidated !== true ||
		!Array.isArray(raw.host.pageErrors) ||
		raw.host.pageErrors.length !== 0 ||
		raw.host.source !== raw.source ||
		raw.host.webViewVersion !== raw.page.webViewVersion
	)
		fail('host evidence is incomplete.');
	if (typeof raw.source !== 'string' || !productionSource(raw.source))
		fail('production source is invalid.');
	if (typeof raw.page.webViewVersion !== 'string' || raw.page.webViewVersion.length === 0)
		fail('WebView2 version is missing.');
	if (
		!Number.isInteger(raw.page.componentActionRunsBefore) ||
		!Number.isInteger(raw.page.componentActionRunsAfter) ||
		raw.page.componentActionRunsAfter !== raw.page.componentActionRunsBefore + 1 ||
		raw.page.componentActionDelta !== 1
	)
		fail('component interaction did not produce exactly one observable state transition.');
	if (raw.formInteraction?.ready !== true) fail('form interaction evidence is incomplete.');
	if (raw.choiceInteraction?.ready !== true) fail('choice interaction evidence is incomplete.');
	if (raw.selectInteraction?.ready !== true) fail('Select interaction evidence is incomplete.');
	if (raw.dialogInteraction?.ready !== true) fail('Dialog interaction evidence is incomplete.');
	if (raw.popoverInteraction?.ready !== true) fail('Popover interaction evidence is incomplete.');
	for (const contract of desktopComponentContracts)
		for (const observation of contract.interaction?.observations ?? [])
			if (observation.read(raw) !== observation.expected)
				fail(`component ${contract.name} ${observation.id} interaction is invalid.`);
	if (!Array.isArray(raw.components) || raw.components.length !== desktopComponentContracts.length)
		fail(`component set must contain exactly ${desktopComponentContracts.length} records.`);
	let components;
	try {
		components = mergeDesktopEvidence([], raw.components);
	} catch (error) {
		fail(error instanceof Error ? error.message : String(error));
	}
	if (components.length !== raw.components.length)
		fail('component names are not exact and unique.');
	const byName = new Map();
	for (const item of components) {
		const contract = contractsByName.get(item?.name);
		if (!contract || byName.has(item.name)) fail('component names are not exact and unique.');
		if (item.present !== true || typeof item.marker !== 'string' || item.marker.length === 0)
			fail(`component ${item?.name ?? '<unknown>'} is not rendered with a marker.`);
		if (item.marker !== contract.marker) fail(`component ${item.name} marker is invalid.`);
		if (!item.native || typeof item.native !== 'object')
			fail(`component ${item.name} has no native evidence.`);
		for (const [property, expected] of Object.entries(contract.native))
			if (item.native[property] !== expected)
				fail(`native ${item.name} ${property} semantics are invalid.`);
		byName.set(item.name, item);
	}
	if (desktopComponentContracts.some(({ name }) => !byName.has(name)))
		fail('component set is incomplete.');
	const compositions = desktopCompositionContracts.map((contract) =>
		normalizeComposition(contract, raw)
	);
	return validateDesktopEvidenceArtifact(
		{
			schemaVersion: 4,
			evidenceFormat: 'structured',
			status: 'passed',
			revision: raw.revision,
			target: raw.target,
			host: raw.host,
			bridgeRoundTrip: raw.bridgeRoundTrip,
			components: desktopComponentContracts.map((contract) =>
				normalizeComponent(contract, byName.get(contract.name), raw)
			),
			compositions
		},
		{ expectedRevision }
	);
}

export function validateDesktopEvidenceArtifact(evidence, { expectedRevision } = {}) {
	if (
		!(evidence?.schemaVersion === 3 || evidence?.schemaVersion === 4) ||
		evidence.evidenceFormat !== 'structured' ||
		evidence.status !== 'passed' ||
		evidence.target !== 'windows-x64' ||
		(!revisionPattern.test(evidence.revision ?? '') &&
			!(expectedRevision === undefined && evidence.revision === 'local')) ||
		(expectedRevision !== undefined && evidence.revision !== expectedRevision)
	)
		fail('normalized identity is invalid.');
	if (
		evidence.bridgeRoundTrip?.method !== 'app.snapshot' ||
		evidence.bridgeRoundTrip?.requestReceived !== true ||
		evidence.bridgeRoundTrip?.responseValidated !== true
	)
		fail('normalized bridge round trip is invalid.');
	if (
		evidence.host?.runtime !== 'WebView2' ||
		evidence.host?.implementation !== 'WebViewHost' ||
		evidence.host?.origin !== 'https://app.zadmin.local' ||
		evidence.host?.protocolVersion !== 1 ||
		evidence.host?.navigation !== true ||
		evidence.host?.hydrated !== true ||
		evidence.host?.bridge !== true ||
		evidence.host?.bridgeResponseValidated !== true ||
		!Array.isArray(evidence.host?.pageErrors) ||
		evidence.host.pageErrors.length !== 0 ||
		typeof evidence.host.webViewVersion !== 'string' ||
		evidence.host.webViewVersion.length === 0 ||
		!productionSource(evidence.host.source)
	)
		fail('normalized host is invalid.');
	if (
		!Array.isArray(evidence.components) ||
		evidence.components.length !== desktopComponentContracts.length
	)
		fail('normalized component set is invalid.');
	const expectedByName = new Map(
		desktopComponentContracts.map((contract) => [contract.name, contract])
	);
	for (const component of evidence.components) {
		const contract = expectedByName.get(component?.name);
		if (!contract) fail(`normalized component ${component?.name ?? '<unknown>'} is invalid.`);
		validateNormalizedComponent(component, contract);
		expectedByName.delete(component.name);
	}
	if (expectedByName.size !== 0) fail('normalized component identities are not exact and unique.');
	if (evidence.schemaVersion === 3) {
		if (Object.hasOwn(evidence, 'compositions'))
			fail('schema v3 evidence must not contain logical compositions.');
		return evidence;
	}
	if (
		!Array.isArray(evidence.compositions) ||
		evidence.compositions.length !== desktopCompositionContracts.length
	)
		fail('normalized composition set is invalid.');
	const leafById = new Map(evidence.components.map((component) => [component.id, component]));
	const compositionIds = new Set();
	for (const composition of evidence.compositions) {
		const contract = compositionContractsById.get(composition?.id);
		if (!contract || compositionIds.has(composition.id) || leafById.has(composition.id))
			fail(`normalized composition ${composition?.id ?? '<unknown>'} identity is invalid.`);
		validateNormalizedComposition(composition, contract, leafById);
		compositionIds.add(composition.id);
	}
	if (compositionIds.size !== desktopCompositionContracts.length)
		fail('normalized composition identities are not exact and unique.');
	return evidence;
}

if (isMain && process.argv.includes('--self-test')) {
	const sample = {
		navigation: true,
		bridgeRoundTrip: {
			method: 'app.snapshot',
			requestReceived: true,
			responseValidated: true
		},
		protocol: 1,
		source: 'https://app.zadmin.local/',
		revision: 'a'.repeat(40),
		target: 'windows-x64',
		host: {
			runtime: 'WebView2',
			implementation: 'WebViewHost',
			origin: 'https://app.zadmin.local',
			webViewVersion: '130.0.1',
			protocolVersion: 1,
			navigation: true,
			hydrated: true,
			bridge: true,
			bridgeResponseValidated: true,
			pageErrors: [],
			source: 'https://app.zadmin.local/'
		},
		page: {
			origin: 'https://app.zadmin.local',
			hasBridge: true,
			hydrated: true,
			viteClient: false,
			webViewVersion: '130.0.1',
			errors: [],
			statusAfter: 'Desktop component evidence 1: ZButton click handled.',
			componentActionRunsBefore: 0,
			componentActionRunsAfter: 1,
			componentActionDelta: 1
		},
		formInteraction: {
			ready: true,
			inputValue: 'desktop-value',
			inputLabelled: true,
			inputDescriptionResolved: true,
			checkboxChecked: true,
			checkboxState: 'checked',
			checkboxLabelled: true,
			fieldDirty: true,
			fieldTouched: true,
			formSubmitted: true,
			submitCount: 1,
			formDataEmail: 'desktop-value',
			formDataEnabled: 'enabled'
		},
		choiceInteraction: {
			ready: true,
			switchChecked: true,
			switchState: 'checked',
			switchAriaChecked: 'true',
			switchLabelled: true,
			switchFormData: 'enabled',
			radioValue: 'advanced',
			advancedChecked: true,
			advancedState: 'checked',
			advancedAriaChecked: 'true',
			advancedFocused: true,
			disabledSkipped: true
		},
		selectInteraction: {
			ready: true,
			expandedBefore: false,
			expandedAfterOpen: true,
			controlsResolved: true,
			popupRole: 'listbox',
			activeDescendantResolved: true,
			disabledSkipped: true,
			popupFocused: true,
			selectedValue: 'cn',
			formDataValue: 'cn',
			expandedAfterSelection: false,
			focusAfterSelection: true,
			expandedAfterEscape: false,
			focusAfterEscape: true
		},
		dialogInteraction: {
			ready: true,
			expandedBefore: false,
			expandedAfterOpen: true,
			controlsResolved: true,
			contentRole: 'dialog',
			modal: true,
			labelledByResolved: true,
			describedByResolved: true,
			contentFocusedAfterOpen: true,
			focusTrapHeld: true,
			inertApplied: true,
			scrollLockApplied: true,
			reducedMotionObserved: true,
			openStateObserved: true,
			presenceEnteredObserved: true,
			expandedAfterEscape: false,
			focusAfterEscape: true,
			inertReleasedAfterEscape: true,
			scrollLockReleasedAfterEscape: true,
			presenceCleanedAfterEscape: true,
			expandedAfterClose: false,
			closeButtonClosed: true,
			focusAfterClose: true,
			inertReleasedAfterClose: true,
			scrollLockReleasedAfterClose: true,
			presenceCleanedAfterClose: true
		},
		popoverInteraction: {
			ready: true,
			expandedAfterOpen: true,
			controlsResolved: true,
			contentRole: 'dialog',
			labelledByResolved: true,
			contentFocusedAfterOpen: true,
			presenceEnteredObserved: true,
			reducedMotionObserved: true,
			openStateObserved: true,
			backgroundUnchanged: true,
			expandedAfterEscape: false,
			focusAfterEscape: true,
			presenceCleanedAfterEscape: true,
			reopened: true,
			expandedAfterPointerOutside: false,
			focusAfterPointerOutside: true,
			presenceCleanedAfterPointerOutside: true
		},
		tabsInteraction: {
			ready: true,
			initialSelected: true,
			initialControlsResolved: true,
			initialLabelledByResolved: true,
			disabledSkipped: true,
			arrowHandled: true,
			advancedFocused: true,
			advancedSelected: true,
			advancedPanelActive: true,
			generalPanelHidden: true,
			homeHandled: true,
			generalFocusedAfterHome: true,
			generalSelectedAfterHome: true,
			generalPanelActiveAfterHome: true
		},
		accordionInteraction: {
			ready: true,
			initialExpanded: true,
			initialControlsResolved: true,
			initialLabelledByResolved: true,
			reducedMotionObserved: true,
			collapseFocused: true,
			collapsed: true,
			generalContentCleaned: true,
			reopened: true,
			arrowHandled: true,
			disabledSkipped: true,
			advancedFocused: true,
			advancedExpanded: true,
			generalCollapsed: true,
			advancedControlsResolved: true,
			advancedLabelledByResolved: true,
			generalContentCleanedAfterAdvanced: true
		},
		components: desktopComponentContracts.map((contract) => ({
			name: contract.name,
			marker: contract.marker,
			present: true,
			native: contract.native
		}))
	};
	const normalized = validateDesktopEvidence(sample, { expectedRevision: sample.revision });
	if (
		normalized.components.length !== desktopComponentContracts.length ||
		normalized.status !== 'passed'
	)
		fail('self-test normalization failed.');
	if (validateDesktopEvidence({ ...sample, revision: 'local' }).revision !== 'local')
		fail('self-test local normalization failed.');
	const { compositions: _v4Compositions, ...v3Artifact } = normalized;
	void _v4Compositions;
	validateDesktopEvidenceArtifact({ ...v3Artifact, schemaVersion: 3 });
	try {
		validateDesktopEvidenceArtifact({ ...v3Artifact, schemaVersion: 3, compositions: [] });
		fail('self-test accepted v3 evidence with compositions.');
	} catch (error) {
		if (!String(error).includes('schema v3')) throw error;
	}
	const expectFailure = (label, value, pattern, options) => {
		try {
			validateDesktopEvidence(value, options);
			fail(`self-test accepted ${label}.`);
		} catch (error) {
			if (!String(error).includes(pattern)) throw error;
		}
	};
	expectFailure(
		'bridge response failure',
		{
			...sample,
			bridgeRoundTrip: { ...sample.bridgeRoundTrip, responseValidated: false }
		},
		'bridge round trip'
	);
	expectFailure(
		'component interaction failure',
		{ ...sample, page: { ...sample.page, componentActionRunsAfter: 0, componentActionDelta: 0 } },
		'component interaction'
	);
	expectFailure(
		'choice interaction failure',
		{ ...sample, choiceInteraction: { ...sample.choiceInteraction, ready: false } },
		'choice interaction'
	);
	expectFailure(
		'dialog interaction failure',
		{ ...sample, dialogInteraction: { ...sample.dialogInteraction, ready: false } },
		'Dialog interaction'
	);
	expectFailure(
		'dialog focus false positive',
		{ ...sample, dialogInteraction: { ...sample.dialogInteraction, focusTrapHeld: false } },
		'component ZDialogContent focus-trap-held'
	);
	expectFailure(
		'incomplete component set',
		{ ...sample, components: sample.components.slice(0, 3) },
		`exactly ${desktopComponentContracts.length}`
	);
	expectFailure('revision mismatch', sample, 'revision does not match expected', {
		expectedRevision: 'b'.repeat(40)
	});
	expectFailure(
		'page error',
		{ ...sample, page: { ...sample.page, errors: ['boom'] } },
		'page hydration'
	);
	expectFailure(
		'duplicate component',
		{ ...sample, components: [...sample.components.slice(0, -1), sample.components[0]] },
		'exact and unique'
	);
	expectFailure(
		'bad marker',
		{
			...sample,
			components: sample.components.map((item) =>
				item.name === 'ZBox' ? { ...item, marker: 'wrong' } : item
			)
		},
		'marker is invalid'
	);
	expectFailure(
		'bad native',
		{
			...sample,
			components: sample.components.map((item) =>
				item.name === 'ZText' ? { ...item, native: { tag: 'P', text: 'wrong' } } : item
			)
		},
		'native ZText'
	);
	for (const [label, key] of [
		['popover closed-state', 'expandedAfterEscape'],
		['popover reopened-state', 'reopened'],
		['popover baseline', 'backgroundUnchanged']
	]) {
		const changed = structuredClone(sample);
		changed.popoverInteraction[key] = !changed.popoverInteraction[key];
		try {
			validateDesktopEvidence(changed, { expectedRevision: sample.revision });
			fail(`self-test accepted ${label}.`);
		} catch (error) {
			if (!String(error).includes('Popover') && !String(error).includes('component')) throw error;
		}
	}
	try {
		validateDesktopEvidenceArtifact({
			...normalized,
			components: normalized.components.map((component) =>
				component.name === 'ZButton' ? { ...component, interactions: [] } : component
			)
		});
		fail('self-test accepted normalized evidence without its interaction.');
	} catch (error) {
		if (!String(error).includes('normalized component ZButton interaction')) throw error;
	}
	try {
		validateDesktopEvidenceArtifact({
			...normalized,
			components: normalized.components.map((component) =>
				component.name === 'ZButton'
					? { ...component, sideEffects: { ...component.sideEffects, bridge: 'read' } }
					: component
			)
		});
		fail('self-test accepted normalized evidence with an undeclared side effect.');
	} catch (error) {
		if (!String(error).includes('side-effect policy')) throw error;
	}
	for (const [label, mutate, pattern] of [
		['composition marker', (value) => (value.compositions[0].marker = 'wrong'), /identity/u],
		['composition locator', (value) => (value.compositions[0].locator = {}), /identity/u],
		[
			'composition child',
			(value) => (value.compositions[0].children[0].evidenceId = 'wrong'),
			/child reference/u
		],
		[
			'composition cross-reference drift',
			(value) =>
				(value.components.find((component) => component.id === 'select-trigger').evidenceId =
					'wrong'),
			/identity/u
		],
		[
			'composition observation',
			(value) => (value.compositions[0].ownerProbe.observations[0].actual = false),
			/observation/u
		],
		[
			'composition runtime flag',
			(value) => (value.compositions[0].runtimeObserved = false),
			/identity/u
		],
		[
			'composition duplicate id',
			(value) => (value.compositions[1].id = value.compositions[0].id),
			/identity/u
		]
	]) {
		const changed = structuredClone(normalized);
		mutate(changed);
		try {
			validateDesktopEvidenceArtifact(changed);
			fail(`self-test accepted ${label}.`);
		} catch (error) {
			if (!pattern.test(String(error))) throw error;
		}
	}
	const initial = [{ name: 'ZDialog', marker: 'dialog-root' }];
	const merged = mergeDesktopEvidence(initial, [
		initial[0],
		{ name: 'ZPopover', marker: 'popover-root' }
	]);
	if (merged.length !== 2 || merged[0] !== initial[0])
		fail('self-test merge did not retain the initial snapshot.');
	for (const [initialItems, currentItems, message, max] of [
		[[{ name: 'ZDialog', marker: 'dialog-root' }], [{ name: '', marker: 'empty' }], 'empty'],
		[
			[{ name: 'ZDialog', marker: 'dialog-root' }],
			[{ name: 'ZDialog', marker: 'dialog-other' }],
			'conflicting'
		],
		[
			[{ name: 'ZDialog', marker: 'dialog-root' }],
			[{ name: 'ZOther', marker: 'dialog-root' }],
			'duplicated'
		],
		[[], [{ name: 'ZDialog', marker: 'dialog-root', present: false }], 'not present'],
		[
			[{ name: 'ZDialog', marker: 'dialog-root' }],
			[{ name: 'ZPopover', marker: 'popover-root' }],
			'maximum',
			1
		]
	]) {
		try {
			mergeDesktopEvidence(initialItems, currentItems, max);
			fail(`self-test accepted ${message} merge.`);
		} catch (error) {
			if (!String(error).includes(message)) throw error;
		}
	}
	console.log(JSON.stringify({ status: 'passed', components: normalized.components.length }));
}
