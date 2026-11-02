function createMarkUp(block) {
  const rows = [...block.children];

  const [mediaRow, headerRow, textRow, linkTextRow, linkUrlRow, buttonTitleRow] = rows;

  const getContent = (row) => row?.lastElementChild;

  const linkText = getContent(linkTextRow)?.textContent?.trim() || '';
  const buttonTitle = getContent(buttonTitleRow)?.textContent?.trim() || '';
  const linkUrlCell = getContent(linkUrlRow);
  let linkUrl = '';

  if (linkUrlCell) {
    const anchor = linkUrlCell.querySelector('a');
    if (anchor) {
      linkUrl = anchor.getAttribute('href');
    } else {
      const paragraph = linkUrlCell.querySelector('p');
      linkUrl = (paragraph ? paragraph.textContent : linkUrlCell.textContent).trim();
    }
  }

  const mediaDiv = document.createElement('div');
  const contentDiv = document.createElement('div');
  const headerElement = document.createElement('h2');

  const media = getContent(mediaRow)?.querySelector('picture') || getContent(mediaRow)?.querySelector('video');
  if (media) {
    const mediaWrapper = document.createElement('div');
    mediaWrapper.append(media);
    mediaDiv.append(mediaWrapper);
  }

  const headlineContent = getContent(headerRow)?.textContent?.trim() || '';
  if (headlineContent) {
    headerElement.append(headlineContent);
    contentDiv.append(headerElement);
  }

  const textContainer = getContent(textRow);
  if (textContainer) {
    const richTextWrapper = document.createElement('div');
    richTextWrapper.innerHTML = textContainer.innerHTML;
    contentDiv.append(richTextWrapper);
  }

  if (linkUrl && linkText) {
    let finalHref = linkUrl.trim();

    if (finalHref.startsWith('www.')) {
      finalHref = `https://${finalHref}`;
    }
    const buttonElement = document.createElement('a');
    buttonElement.href = linkUrl;
    buttonElement.textContent = linkText;
    buttonElement.className = 'button';

    const isExternal = finalHref.startsWith('http') && !finalHref.includes(window.location.hostname);

    if (isExternal) {
      buttonElement.setAttribute('target', '_blank');
      buttonElement.setAttribute('rel', 'noopener noreferrer');
    }
    if (buttonTitle) {
      buttonElement.title = buttonTitle;
    }
    contentDiv.append(buttonElement);
  }

  mediaDiv.append(contentDiv);
  block.replaceChildren(mediaDiv);
}

export default function decorate(block) {
  createMarkUp(block);
  const rows = [...block.children];

  rows.forEach((row) => {
    row.classList.add('quick-content-row');
    const columns = [...row.children];

    columns.forEach((column) => {
      const isText = !!column.querySelector('p');

      column.classList.add('col-50');
      if (isText) {
        column.classList.add('col-txt-spacing');
      }
    });
  });
}
