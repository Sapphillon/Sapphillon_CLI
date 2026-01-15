/**
 * String formatting utilities using lodash
 */

import _ from "npm:lodash@4.17.21";

/**
 * テキストを指定した長さに切り詰めます。
 * @param {string} text - 切り詰める文字列
 * @param {number} length - 最大文字数
 * @returns {string} 切り詰められた文字列
 */
export function truncateText(text, length) {
    return _.truncate(text, { length: length, omission: "..." });
}

/**
 * テキストの各単語の先頭を大文字にします。
 * @param {string} text - 変換する文字列
 * @returns {string} タイトルケースに変換された文字列
 */
export function toTitleCase(text) {
    return _.startCase(text);
}

/**
 * テキストから余分な空白を除去します。
 * @param {string} text - 処理する文字列
 * @returns {string} 空白が正規化された文字列
 */
export function normalizeWhitespace(text) {
    return _.words(text).join(" ");
}
