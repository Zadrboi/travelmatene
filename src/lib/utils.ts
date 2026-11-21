import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** easeInOutCubic — used for hero wipe rAF */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Format ₹ with Indian numbering */
export function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

/** Permit badge label */
export function permitLabel(type: string, cost?: number): string {
  if (type === "open") return cost ? `Eco-Cess: ${formatINR(cost)}` : "Permit-Free";
  if (type === "ilp")  return cost ? `ILP Mandatory (${formatINR(cost)})` : "ILP Required";
  if (type === "pap")  return cost ? `PAP (${formatINR(cost)})` : "PAP Required";
  if (type === "rap")  return "RAP — Foreign Nationals";
  return "Open";
}
