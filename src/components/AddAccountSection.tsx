import { useI18n } from '../i18n/I18nProvider';

type AddAccountSectionProps = {
	startingAdd: boolean;
	addFlowActive: boolean;
	onOpenAddDialog: () => void;
	onSmartSwitch: () => void;
	smartSwitching: boolean;
	onExportAccounts: () => void;
	onImportAccounts: () => void;
	importing: boolean;
};

export function AddAccountSection({
	startingAdd,
	addFlowActive,
	onOpenAddDialog,
	onSmartSwitch,
	smartSwitching,
	onExportAccounts,
	onImportAccounts,
	importing,
}: AddAccountSectionProps) {
	const { copy } = useI18n();

	return (
		<section className="importBar">
			<div className="importInfo">
				<button
					className="smartSwitchButton importSmartSwitch"
					onClick={onSmartSwitch}
					disabled={smartSwitching}
					title={copy.addAccount.smartSwitch}
					aria-label={copy.addAccount.smartSwitch}
				>
					{copy.addAccount.smartSwitch}
				</button>
			</div>
			<div className="importRow">
				<button className="primary" onClick={onOpenAddDialog}>
					{startingAdd
						? copy.addAccount.startingButton
						: addFlowActive
							? copy.addAccount.waitingButton
							: copy.addAccount.startButton}
				</button>
			</div>
			<div className="importRow">
				<button className="ghost" onClick={onExportAccounts} title={copy.addAccount.exportAccounts}>
					{copy.addAccount.exportAccounts}
				</button>
				<button className="ghost" onClick={onImportAccounts} disabled={importing} title={copy.addAccount.importAccounts}>
					{copy.addAccount.importAccounts}
				</button>
			</div>
		</section>
	);
}
