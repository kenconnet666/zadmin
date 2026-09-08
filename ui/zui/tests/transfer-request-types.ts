import type {
	TransferItem,
	TransferMoveEnd,
	TransferMoveRequest,
	TransferMoveResult,
	TransferMoveSource,
	ZTransferProps
} from '../src/components/input/ZTransfer.svelte';

const items = [
	{ key: 0, label: 'Numeric zero' },
	{ key: '0', label: 'String zero' },
	{ key: 'tail', label: 'Tail' }
] as const satisfies readonly TransferItem[];

const immediate = {
	items,
	onMoveEnd: (detail: TransferMoveEnd) => detail.result,
	onValueChange: (value: readonly (number | string)[]) => value.length,
	value: [0]
} satisfies ZTransferProps;

const requested = {
	items,
	moveMode: 'request',
	onMoveEnd: (detail: TransferMoveEnd) => detail.request.nextValue,
	onMoveRequest: async (request: TransferMoveRequest) => request.destination === 'target',
	value: [0]
} satisfies ZTransferProps;

const request: TransferMoveRequest = {
	destination: 'target',
	movingKeys: ['0'],
	nextValue: [0, '0'],
	signal: new AbortController().signal,
	source: 'keyboard',
	value: [0]
};
const source: TransferMoveSource = request.source;
const result: TransferMoveResult = 'stale';

const missingRequestHandler = {
	items,
	moveMode: 'request',
	value: [0]
};
// @ts-expect-error Request mode requires onMoveRequest.
const invalidMissingRequestHandler: ZTransferProps = missingRequestHandler;
const requestWithValueCallback = {
	items,
	moveMode: 'request',
	onMoveRequest: () => true,
	onValueChange: () => undefined,
	value: [0]
} as const;
// @ts-expect-error Request mode cannot compete with onValueChange.
const invalidRequestWithValueCallback: ZTransferProps = requestWithValueCallback;
const immediateWithRequestHandler = {
	items,
	onMoveRequest: () => true,
	value: [0]
} as const;
// @ts-expect-error Immediate mode cannot declare onMoveRequest.
const invalidImmediateWithRequestHandler: ZTransferProps = immediateWithRequestHandler;
const invalidRequestResult = {
	items,
	moveMode: 'request',
	// @ts-expect-error Request handlers resolve only boolean acceptance decisions.
	onMoveRequest: () => 'accepted',
	value: [0]
} satisfies ZTransferProps;

void [
	immediate,
	requested,
	request,
	source,
	result,
	invalidMissingRequestHandler,
	invalidRequestWithValueCallback,
	invalidImmediateWithRequestHandler,
	invalidRequestResult
];
