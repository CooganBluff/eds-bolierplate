function buildCell(isHeader, isVertical = false) {
  const cell = isHeader ? document.createElement('th') : document.createElement('td');

  if (isHeader) {
    cell.setAttribute('scope', isVertical ? 'row' : 'col');
  }
  return cell;
}

export default async function decorate(block) {
  const isVertical = block.classList.contains('vertical');
  const hasHeader = !block.classList.contains('no-header');

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  if (hasHeader && !isVertical) table.append(thead);
  table.append(tbody);

  const colAlignments = [];
  const headers = [];

  [...block.children].forEach((rowWrapper, rowIndex) => {
    const tr = document.createElement('tr');

    if (hasHeader && !isVertical && rowIndex === 0) {
      thead.append(tr);
    } else {
      tbody.append(tr);
    }

    [...rowWrapper.children].forEach((colWrapper, colIndex) => {
      const text = colWrapper.textContent.trim();

      if (rowIndex === 0 || (isVertical && colIndex === 0)) {
        if (text.startsWith('_') && text.endsWith('_')) {
          colAlignments[colIndex] = 'txt-center';
        } else if (text.startsWith('_')) {
          colAlignments[colIndex] = 'txt-left';
        } else if (text.endsWith('_')) {
          colAlignments[colIndex] = 'txt-right';
        }
      }

      const isFirstRow = rowIndex === 0;
      const isFirstColumn = colIndex === 0;
      const isHeaderCell = hasHeader && ((!isVertical && isFirstRow) || (isVertical && isFirstColumn));

      const cell = buildCell(isHeaderCell, isVertical);
      if (colAlignments[colIndex]) cell.className = colAlignments[colIndex];

      cell.innerHTML = colWrapper.innerHTML
        .replace(/(<[a-z1-6]+[^>]*>)\s*_/gi, '$1')
        .replace(/_\s*(<\/[a-z1-6]+>)/gi, '$1')
        .replace(/^(_)|(_)$/g, '');

      if (!isVertical) {
        if (rowIndex === 0) {
          headers[colIndex] = cell.textContent.trim();
        } else if (headers[colIndex]) {
          if (hasHeader && headers[colIndex] && headers.length > 2) {
            cell.setAttribute('data-label', headers[colIndex]);
            block.classList.add('responsive-table');
          }
        }
      }

      tr.append(cell);
    });
  });

  block.innerHTML = '';
  block.append(table);
}
