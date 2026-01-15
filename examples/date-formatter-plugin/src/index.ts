/**
 * Date Formatter Plugin
 * Uses date-fns library to format dates
 */

import { format, formatDistance, parseISO } from "npm:date-fns@4.1.0";
import { ja } from "npm:date-fns@4.1.0/locale";

/**
 * 日付を指定されたフォーマットで整形します。
 * @param {string} dateString - ISO 8601形式の日付文字列
 * @param {string} formatPattern - フォーマットパターン (例: "yyyy年MM月dd日")
 * @returns {string} 整形された日付文字列
 */
export function formatDate(dateString: string, formatPattern: string): string {
    const date = parseISO(dateString);
    return format(date, formatPattern, { locale: ja });
}

/**
 * 指定された日付から現在までの相対的な時間を返します。
 * @param {string} dateString - ISO 8601形式の日付文字列
 * @returns {string} 相対的な時間 (例: "3日前")
 */
export function getRelativeTime(dateString: string): string {
    const date = parseISO(dateString);
    return formatDistance(date, new Date(), { addSuffix: true, locale: ja });
}

/**
 * 現在の日時を日本語形式で返します。
 * @returns {string} 現在の日時 (例: "2024年1月15日 19時30分")
 */
export function getCurrentDateTime(): string {
    return format(new Date(), "yyyy年MM月dd日 HH時mm分", { locale: ja });
}
