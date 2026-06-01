import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, startOfDay, endOfDay } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function dayStart(date: Date = new Date()): Date {
  return startOfDay(date);
}

export function dayEnd(date: Date = new Date()): Date {
  return endOfDay(date);
}

export function macroColor(status: "UNDER" | "ON_TRACK" | "OVER"): string {
  return status === "ON_TRACK" ? "text-green-400" : status === "OVER" ? "text-red-400" : "text-yellow-400";
}

export function macroBg(status: "UNDER" | "ON_TRACK" | "OVER"): string {
  return status === "ON_TRACK" ? "bg-green-400" : status === "OVER" ? "bg-red-400" : "bg-yellow-400";
}
