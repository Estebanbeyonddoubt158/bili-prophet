/**
 * subtitle-compress.js
 * 智能字幕压缩 — 均匀分段采样 + 去重 + 时间戳骨架
 *
 * 用法：
 *   const text = compressSubtitle(subtitleBody);
 *   // 替换原来的 BiliAPI.subtitleToText(subtitleBody)
 *
 * subtitleBody 格式：[{ from: number, to: number, content: string }, ...]
 */

/**
 * 秒数转 mm:ss / hh:mm:ss 标签
 */
function toTimeLabel(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * 对相邻重复句去重
 * B站字幕刷新机制会产生大量连续重复条目（同一句话出现 3-5 次）
 */
function dedupAdjacent(items) {
  const result = [];
  let lastContent = '';
  for (const item of items) {
    const content = (item.content || '').trim();
    if (!content) continue;
    // 完全相同 或 包含关系（前一句是后一句的前缀，滚动字幕）则跳过
    if (content === lastContent) continue;
    if (lastContent && (content.startsWith(lastContent) || lastContent.startsWith(content))) {
      // 保留更长的那一条
      if (content.length > lastContent.length) {
        result[result.length - 1] = item;
        lastContent = content;
      }
      continue;
    }
    result.push(item);
    lastContent = content;
  }
  return result;
}

/**
 * 核心压缩函数
 *
 * @param {Array<{from: number, to: number, content: string}>} subtitleBody
 * @param {object} options
 * @param {number} options.targetChars   目标字符数上限，默认 18000
 * @param {number} options.segments      均匀分段数，默认 12
 * @param {boolean} options.withTimestamp 每段开头是否插入时间标签，默认 true
 * @returns {string}
 */
function compressSubtitle(subtitleBody, options = {}) {
  const {
    targetChars = 18000,
    segments = 12,
    withTimestamp = true,
  } = options;

  if (!Array.isArray(subtitleBody) || subtitleBody.length === 0) return '';

  // 1. 去重相邻重复
  const deduped = dedupAdjacent(subtitleBody);

  // 2. 全量拼接看是否超限
  const fullText = deduped.map(i => i.content).join(' ');
  if (fullText.length <= targetChars) {
    // 不超限：直接返回，但仍插入时间戳骨架方便模型定位 chapters
    if (!withTimestamp) return fullText;
    return buildWithTimestamps(deduped, segments);
  }

  // 3. 超限：均匀分段采样
  // 按视频时间而非条目数均匀切分，保证覆盖全程
  const totalDuration = (deduped[deduped.length - 1].from || 0);
  const segDuration = totalDuration > 0
    ? totalDuration / segments
    : deduped.length / segments; // fallback: 按条目数

  // 每段允许的字符配额
  const charsPerSegment = Math.floor(targetChars / segments);

  const parts = [];
  for (let seg = 0; seg < segments; seg++) {
    const tStart = seg * segDuration;
    const tEnd = (seg + 1) * segDuration;

    // 取该时间段内的条目
    const segItems = totalDuration > 0
      ? deduped.filter(i => i.from >= tStart && i.from < tEnd)
      : deduped.slice(
          Math.floor(seg * deduped.length / segments),
          Math.floor((seg + 1) * deduped.length / segments)
        );

    if (segItems.length === 0) continue;

    // 该段文本，超出配额则截断
    let segText = segItems.map(i => i.content).join(' ');
    if (segText.length > charsPerSegment) {
      segText = segText.slice(0, charsPerSegment) + '…';
    }

    if (withTimestamp) {
      const label = toTimeLabel(segItems[0].from);
      parts.push(`[${label}] ${segText}`);
    } else {
      parts.push(segText);
    }
  }

  return parts.join('\n');
}

/**
 * 不超限时也插入时间戳骨架（每 N 条插一次）
 */
function buildWithTimestamps(items, segments) {
  const step = Math.max(1, Math.floor(items.length / segments));
  const parts = [];
  for (let i = 0; i < items.length; i++) {
    if (i % step === 0) {
      const label = toTimeLabel(items[i].from);
      parts.push(`\n[${label}]`);
    }
    parts.push(items[i].content);
  }
  return parts.join(' ').trim();
}

// ─── 测试 / 演示 ────────────────────────────────────────────────
// 在浏览器控制台或 Node.js 中运行以下代码验证效果：
//
// const mockSubtitle = Array.from({ length: 500 }, (_, i) => ({
//   from: i * 3,
//   to: i * 3 + 2.5,
//   content: i % 5 === 0 ? `重要观点${i}` : `普通字幕内容第${i}句话，描述视频某个片段`
// }));
// console.log('原始字符数:', mockSubtitle.map(i=>i.content).join(' ').length);
// const compressed = compressSubtitle(mockSubtitle);
// console.log('压缩后字符数:', compressed.length);
// console.log('压缩预览:\n', compressed.slice(0, 500));

// ─── 导出（如需 Node.js / ESM 使用）────────────────────────────
if (typeof module !== 'undefined') {
  module.exports = { compressSubtitle, dedupAdjacent, toTimeLabel };
}
