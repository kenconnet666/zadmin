export class CancelableEvent {
	#defaultPrevented = false;

	get defaultPrevented(): boolean {
		return this.#defaultPrevented;
	}

	preventDefault(): void {
		this.#defaultPrevented = true;
	}
}
