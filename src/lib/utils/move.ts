import type { ActionReturn } from 'svelte/action';

type MoveOptions = {
	initialPosition?: {
		left: number;
		top: number;
	};
};

type MoveAtributes = {
	'on:movestart': MoveEventHandler;
	'on:moving': MoveEventHandler;
	'on:moveend': MoveEventHandler;
};

type MoveEventHandler = (e: CustomEvent<MoveEvent>) => void;

export type MoveEvent = {
	left: number;
	top: number;
};

export default function move(
	node: HTMLElement,
	options?: MoveOptions
): ActionReturn<MoveOptions, MoveAtributes> {
	let left = options?.initialPosition?.left ?? 0;
	let top = options?.initialPosition?.top ?? 0;

	node.style.position = 'absolute';
	node.style.top = `${top}px`;
	node.style.left = `${left}px`;
	node.style.cursor = 'move';
	node.style.userSelect = 'none';

	let initialPosition = { x: 0, y: 0 };

	function onMouseDown(event: MouseEvent) {
		node.classList.add('selected');

		initialPosition = {
			x: node.offsetLeft - event.clientX,
			y: node.offsetTop - event.clientY
		};

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onMouseUp);

		node.dispatchEvent(
			new CustomEvent('movestart', {
				detail: { left, top }
			})
		);
	}

	function onMouseUp() {
		node.classList.remove('selected');
		window.removeEventListener('mousemove', onMove);
		window.removeEventListener('mouseup', onMouseUp);

		node.dispatchEvent(
			new CustomEvent('moveend', {
				detail: { left, top }
			})
		);
	}

	function onMove(event: MouseEvent) {
		left = event.clientX + initialPosition.x;
		top = event.clientY + initialPosition.y;
		node.style.top = `${top}px`;
		node.style.left = `${left}px`;

		node.dispatchEvent(
			new CustomEvent('moving', {
				detail: { left, top }
			})
		);
	}

	node.addEventListener('mousedown', onMouseDown);

	return {
		destroy() {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onMouseUp);
		}
	};
}
