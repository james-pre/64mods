export interface EntityCodexEntry {
	canPurchase: boolean;
	isUpgradeTo: string;
	onlyone: boolean;
}

export type Cell = [number, number];

export interface Price {}

declare global {
	class Item {
		name: string;
		eraser: boolean;
	}

	class Game {
		h: number;
		w: number;
		ctx: CanvasRenderingContext2D & { strokeWidth?: number };
		init(): void;
		processMousedown(e: Event): void;
		processMouseup(e: Event): void;
		processMousemove(e?: Event, dxy?: number): void;
		processClick(e: Event): void;
		renderEntities(dt: number): void;
		renderloop(dt: number): void;
		uvToXY(uv: Cell): Cell;
		pixelRatio: number;
		startSound(id: string, panning: number, loudness: number): void;
		playSound(id: string, panning: number, loudness: number, dark: boolean, forced: boolean): void;
		updateLoop(): void;
		createResourceTransfer(r: unknown, p: unknown, d: unknown, f: (...args: any) => any, v: unknown): void;
		itemInHand?: Item;
		canAfford(itemName: string): boolean;
		hoveredCell: Cell;
		hoveredEntity?: Entity;
		canPlace: boolean;
		clearCell(cell: Cell): void;
		codex: {
			entities: Record<string, EntityCodexEntry>;
		};
		transportedEntity?: Entity;
		mouse: {
			positionChanged: boolean;
		};
		entitiesInGame: Record<string, number>;
		stuff: Entity[];
		zoom: number;
		isVisible(entity: Entity): boolean;
		plane?: Entity;
		clock: Worker;
		time: { lt: number };
		addEntity(entityName: string, position: Cell): void;
		resources: number[];
		quantities: number[];
		pickupItem(name: string): void;
		stats: {
			machinesBuild: number;
		};
		requestResources(price: Price, cell: Cell, _u_a: boolean, _u_b: boolean): void;
		getRealPrice(itemName: string): Price;
		translation: Cell;
		exportSave(): void;
		loadSaveFromClipboard(): Promise<void>;
		onlyones: Record<string, boolean>;
		setListeners(): void;
	}

	class Entity {
		init(): void;
		name: string;
		position: Cell;
		depth?: number;
	}

	class Splash {
		init(): void;
		show(): void;
		close(): void;
		element: Element;
	}

	class Pump extends Entity {}

	class Gradient extends Entity {}

	class Silo extends Entity {
		tap(): void;
		fuel: number[];
		fill: number;
		initHint(): void;
	}

	class Silo2 extends Silo {}

	class Entropic extends Entity {
		power: number;
		interval: number;
	}

	class Entropic2 extends Entropic {}

	class Entropic2a extends Entropic {}

	class Entropic3 extends Entropic {}

	class Strange1 extends Entity {
		maxSpawnedHollows: number;
		spawnTimerBase: number;
	}

	class Strange2 extends Strange1 {}

	class Strange3 extends Strange1 {}

	const game: Game;
}

export {};
