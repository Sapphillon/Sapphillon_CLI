/**
 * Text Utils Plugin
 * Combines multiple text utilities using lodash
 */

// Import from local modules
import {
    toCamelCase as _toCamelCase,
    toSnakeCase as _toSnakeCase,
    toKebabCase as _toKebabCase,
} from "./caseConverter.js";
import {
    truncateText as _truncateText,
    toTitleCase as _toTitleCase,
    normalizeWhitespace as _normalizeWhitespace,
} from "./formatter.js";
import {
    countWords as _countWords,
    getWordFrequency as _getWordFrequency,
} from "./analyzer.js";

/**
 * テキストをキャメルケースに変換します。
 * @param {string} text - 変換する文字列
 * @returns {string} キャメルケースに変換された文字列
 */
export function toCamelCase(text) {
    return _toCamelCase(text);
}

/**
 * テキストをスネークケースに変換します。
 * @param {string} text - 変換する文字列
 * @returns {string} スネークケースに変換された文字列
 */
export function toSnakeCase(text) {
    return _toSnakeCase(text);
}

/**
 * テキストをケバブケースに変換します。
 * @param {string} text - 変換する文字列
 * @returns {string} ケバブケースに変換された文字列
 */
export function toKebabCase(text) {
    return _toKebabCase(text);
}

/**
 * テキストを指定した長さに切り詰めます。
 * @param {string} text - 切り詰める文字列
 * @param {number} length - 最大文字数
 * @returns {string} 切り詰められた文字列
 */
export function truncateText(text, length) {
    return _truncateText(text, length);
}

/**
 * テキストの各単語の先頭を大文字にします。
 * @param {string} text - 変換する文字列
 * @returns {string} タイトルケースに変換された文字列
 */
export function toTitleCase(text) {
    return _toTitleCase(text);
}

/**
 * テキストから余分な空白を除去します。
 * @param {string} text - 処理する文字列
 * @returns {string} 空白が正規化された文字列
 */
export function normalizeWhitespace(text) {
    return _normalizeWhitespace(text);
}

/**
 * テキスト内の単語数をカウントします。
 * @param {string} text - 分析する文字列
 * @returns {number} 単語数
 */
export function countWords(text) {
    return _countWords(text);
}

/**
 * テキスト内の各単語の出現回数を集計します。
 * @param {string} text - 分析する文字列
 * @returns {Object} 単語と出現回数のオブジェクト
 */
export function getWordFrequency(text) {
    return _getWordFrequency(text);
}
