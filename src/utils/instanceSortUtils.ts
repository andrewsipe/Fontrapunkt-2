/**
 * Instance sorting utilities
 * Provides flexible sorting functions for variable font instances
 */

import type { NamedVariation, VariableAxis } from "../types/font.types";

/**
 * Sort instances by weight (wght) axis value
 * Light (100) -> Regular (400) -> Bold (700) -> Black (900)
 */
export function sortByWeight(instances: NamedVariation[]): NamedVariation[] {
  return [...instances].sort((a, b) => {
    const weightA = a.coordinates.wght;
    const weightB = b.coordinates.wght;

    // Instances with weight come before instances without
    if (weightA !== undefined && weightB === undefined) return -1;
    if (weightA === undefined && weightB !== undefined) return 1;
    if (weightA === undefined && weightB === undefined) return 0;

    return (weightA ?? 0) - (weightB ?? 0);
  });
}

/**
 * Sort instances by width (wdth) axis value
 * Condensed (50) -> Normal (100) -> Extended (150)
 */
export function sortByWidth(instances: NamedVariation[]): NamedVariation[] {
  return [...instances].sort((a, b) => {
    const widthA = a.coordinates.wdth;
    const widthB = b.coordinates.wdth;

    // Instances with width come before instances without
    if (widthA !== undefined && widthB === undefined) return -1;
    if (widthA === undefined && widthB !== undefined) return 1;
    if (widthA === undefined && widthB === undefined) return 0;

    return (widthA ?? 0) - (widthB ?? 0);
  });
}

/**
 * Sort instances alphabetically by name
 */
export function sortAlphabetically(instances: NamedVariation[]): NamedVariation[] {
  return [...instances].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

/**
 * Sort instances with default instance first (matches all axis defaults)
 * Then applies secondary sort function
 */
export function sortWithDefaultFirst(
  instances: NamedVariation[],
  axes: VariableAxis[],
  secondarySort?: (instances: NamedVariation[]) => NamedVariation[]
): NamedVariation[] {
  const withDefault = instances.map((inst) => ({
    instance: inst,
    isDefault: axes.every((axis) => inst.coordinates[axis.tag] === axis.default),
  }));

  const defaultInstances = withDefault
    .filter((item) => item.isDefault)
    .map((item) => item.instance);

  const nonDefaultInstances = withDefault
    .filter((item) => !item.isDefault)
    .map((item) => item.instance);

  const sortedNonDefault = secondarySort ? secondarySort(nonDefaultInstances) : nonDefaultInstances;

  return [...defaultInstances, ...sortedNonDefault];
}

/**
 * Multi-level sort: width -> weight -> other axes -> alphabetical
 * This is the comprehensive sorting approach from before
 */
export function sortMultiLevel(
  instances: NamedVariation[],
  axes?: VariableAxis[]
): NamedVariation[] {
  return [...instances].sort((a, b) => {
    // 1. Default instance first (if axes provided)
    if (axes) {
      const aIsDefault = axes.every((axis) => a.coordinates[axis.tag] === axis.default);
      const bIsDefault = axes.every((axis) => b.coordinates[axis.tag] === axis.default);

      if (aIsDefault && !bIsDefault) return -1;
      if (!aIsDefault && bIsDefault) return 1;
    }

    // 2. Sort by Width (wdth)
    const widthA = a.coordinates.wdth;
    const widthB = b.coordinates.wdth;

    if (widthA !== undefined && widthB !== undefined) {
      if (widthA !== widthB) return widthA - widthB;
    } else if (widthA !== undefined && widthB === undefined) return -1;
    else if (widthA === undefined && widthB !== undefined) return 1;

    // 3. Sort by Weight (wght)
    const weightA = a.coordinates.wght;
    const weightB = b.coordinates.wght;

    if (weightA !== undefined && weightB !== undefined) {
      if (weightA !== weightB) return weightA - weightB;
    } else if (weightA !== undefined && weightB === undefined) return -1;
    else if (weightA === undefined && weightB !== undefined) return 1;

    // 4. Sort by other common axes
    const axisOrder = ["slnt", "ital", "opsz", "GRAD", "CASL", "MONO"];
    for (const axisTag of axisOrder) {
      const valueA = a.coordinates[axisTag];
      const valueB = b.coordinates[axisTag];

      if (valueA !== undefined && valueB !== undefined) {
        if (valueA !== valueB) return valueA - valueB;
      } else if (valueA !== undefined && valueB === undefined) return -1;
      else if (valueA === undefined && valueB !== undefined) return 1;
    }

    // 5. Alphabetical fallback
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });
}

/**
 * Custom sort function type
 */
export type InstanceSortFunction = (instances: NamedVariation[]) => NamedVariation[];

/**
 * Apply a custom sort function to instances
 * Useful for creating your own sorting logic
 */
export function applyCustomSort(
  instances: NamedVariation[],
  sortFn: InstanceSortFunction
): NamedVariation[] {
  return sortFn([...instances]);
}
