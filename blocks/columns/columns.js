export default function decorate(block) {
  const rows = [...block.children];
  const colCount = rows[0]?.children.length || 0;
  block.classList.add(`columns-${colCount}-cols`);

  rows.forEach((row) => {
    row.classList.add('columns-row');
    const columns = [...row.children];
    const hasImageInRow = row.querySelector('picture');
    if (!hasImageInRow) {
      row.classList.add('col-align-top');
    }

    columns.forEach((column, index) => {
      const isPicture = !!column.querySelector('picture');
      const isText = !!column.querySelector('p');
      const cell = index + 1;

      if (colCount === 3) {
        column.classList.add('col-33');

        if (cell === 3 && isPicture) {
          row.classList.add('last-col-img');
        }
      } else {
        const isCol3366 = block.classList.contains('col-33-66');
        const isCol6633 = block.classList.contains('col-66-33');

        if (isCol3366) {
          if (cell === 1) {
            column.setAttribute('class', 'col-33');
          } else {
            column.classList.add('col-66');

            if (isText) {
              column.classList.add('col-txt-spacing');
            }
          }
        } else if (isCol6633) {
          if (cell === 1) {
            column.classList.add('col-66');

            if (isText) {
              column.classList.add('col-txt-spacing');
            }
          } else {
            column.classList.add('col-33');
          }
        } else {
          column.classList.add('col-50');

          if (isText) {
            column.classList.add('col-txt-spacing');
          }
        }
      }
    });
  });
}
