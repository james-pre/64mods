export interface ModSetting<T> {
	id: string;
	default: T;
	label?: string;
	description?: string;
}

export type SettingsFor<M extends Mod> = {
	[K in M['settings'][number]['id']]: Extract<M['settings'][number], { id: K }>['default'];
};

export type ThisFor<T, M extends keyof T = keyof T> = T & { __initial: T[M] };

export interface MethodReplacement<T, M extends keyof T | '__default__' = '__default__'> {
	class: new (...args: any) => T;
	method: M;
	enableIf?: boolean;
	replacement: M extends keyof T
		? T[M] extends (...args: any) => any
			? (this: ThisFor<T, M>, ...args: Parameters<T[M]>) => ReturnType<T[M]>
			: never
		: (this: T & { __initial: unknown }, ...args: any) => any;
}

export interface Mod {
	id: string;
	version: string;
	label?: string;
	description: string;

	/**
	 * If this mod had a dependency on another mod and version:
	 */
	dependencies?: Record<string, string>;
	/**
	 * If it has conflicts with other mods ("*" for any version, or put a specific version):
	 */
	conflicts?: object;

	/**
	 * Mods which need to replace methods on various game objects will need to implement this method.
	 * Will only be called if the mod is enabled.
	 */
	methodReplacements: MethodReplacement<any, any>[];

	settings: ModSetting<unknown>[];

	/**
	 * CSS to be added to the page
	 */
	styles?: string;
	init?(): void;
	preinit?(): void;
}

export function resolveLabel(mod: Mod): void {
	mod.label ||= mod.id;
}

export function initializeOptions(mod: Mod) {
	for (const settingName in mod.settings) {
		mod.configuredOptions[settingName] = mod.configuredOptions[settingName] ?? mod.settings[settingName]?.default ?? null;
	}
}

export function setOriginalMethod(mod: Mod, prototypeName, methodName, method) {
	mod.originalMethods[prototypeName] = mod.originalMethods[prototypeName] ?? {};
	mod.originalMethods[prototypeName][methodName] = method;
}
