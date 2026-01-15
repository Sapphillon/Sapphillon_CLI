/**
 * String analysis utilities using lodash
 */

import _ from "npm:lodash@4.17.21";

/**
 * テキスト内の単語数をカウントします。
 * @param {string} text - 分析する文字列
 * @returns {number} 単語数
 */
export function countWords(text) {
    return _.words(text).length;
}

/**
 * テキスト内の各単語の出現回数を集計します。
 * @param {string} text - 分析する文字列
 * @returns {Object} 単語と出現回数のオブジェクト
 */
export function getWordFrequency(text) {
    const words = _.words(text.toLowerCase());
    return _.countBy(words);
}
