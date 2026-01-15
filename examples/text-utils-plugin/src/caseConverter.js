/**
 * String case conversion utilities using lodash
 */

import _ from "npm:lodash@4.17.21";

/**
 * テキストをキャメルケースに変換します。
 * @param {string} text - 変換する文字列
 * @returns {string} キャメルケースに変換された文字列
 */
export function toCamelCase(text) {
    return _.camelCase(text);
}

/**
 * テキストをスネークケースに変換します。
 * @param {string} text - 変換する文字列
 * @returns {string} スネークケースに変換された文字列
 */
export function toSnakeCase(text) {
    return _.snakeCase(text);
}

/**
 * テキストをケバブケースに変換します。
 * @param {string} text - 変換する文字列
 * @returns {string} ケバブケースに変換された文字列
 */
export function toKebabCase(text) {
    return _.kebabCase(text);
}
