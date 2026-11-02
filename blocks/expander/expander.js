export default function decorate(block) {
  const pictureElementDiv = block.querySelector('picture');
  if (pictureElementDiv) {
    pictureElementDiv.parentNode.classList.add('expander-image');
  }

  const iconElement = block.querySelectorAll('.icon');
  if (iconElement) {
    iconElement.forEach((element) => element.parentNode.classList.add('icon-wrapper'));
  }

  const buttonContainer = block.querySelector('.button-container a');
  if (buttonContainer) {
    buttonContainer.classList.add('no-background', 'capitalize');
  }

  const contentDivElements = block.querySelectorAll('div');
  const headerElement = block.querySelector('h2, h3');
  // Since the headings move to the new header wrepper, the previous div container is deleted
  const oldHeaderDiv = headerElement.parentNode.parentNode;
  oldHeaderDiv.remove();

  // Header
  const headerWrapper = document.createElement('div');
  headerWrapper.classList.add('expander-header');
  // Expander button
  const expanderButton = document.createElement('span');
  expanderButton.classList.add('expander-button');
  // Content
  const contentWrapper = document.createElement('div');
  contentWrapper.classList.add('expander-content');

  // Check if the content is inside divs or pasted directly below the heading
  const tableContent = contentDivElements[2];
  let els = null;
  if (tableContent) {
    els = [...block.children];
  } else {
    els = [...headerElement.parentNode.children];
  }

  function wrapContent(elements) {
    elements.forEach((element) => {
      if (element.tagName !== 'H3') {
        element.remove();
        contentWrapper.append(element);
      }
    });
  }

  // Wrap content and add it to the expander-content container
  wrapContent(els);
  block.append(contentWrapper);

  // Take the heading, add the expander button and add them to the expander header
  block.prepend(headerWrapper);
  headerWrapper.append(headerElement);
  headerWrapper.append(expanderButton);

  const expanders = document.querySelectorAll('.expander-wrapper');

  function headerNumbers() {
    expanders.forEach((el, index) => {
      const header = el.querySelector('h2, h3');
      header.setAttribute('data-block-number', index + 1);
    });
  }
  headerNumbers();

  // Look for the first Expander and add the appropriate classess
  const isFirstExpander = block.parentElement.previousSibling.classList?.contains('expander-wrapper');
  if (isFirstExpander) {
    block.parentElement.classList.add('collapsed');
  } else {
    block.parentElement.classList.add('expanded');
  }

  // Also check if the author decides to expand the content by adding content-expanded
  if (block.classList.contains('content-expanded')) {
    block.parentElement.classList.add('expanded');
  }

  function resetExpanders() {
    expanders.forEach((el) => {
      const content = el.querySelector('.expander-content');
      el.classList.remove('expanded');
      el.classList.add('collapsed');
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      }
    });
  }

  function toggleState() {
    if (block.parentNode.className.includes('expanded')) {
      contentWrapper.style.maxHeight = null;

      block.parentNode.classList.remove('expanded');
      block.parentNode.classList.add('collapsed');
    } else {
      resetExpanders();
      contentWrapper.style.maxHeight = `${contentWrapper.scrollHeight}px`;

      block.parentNode.classList.add('expanded');
      block.parentNode.classList.remove('collapsed');
      block.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  headerWrapper.addEventListener('click', toggleState);
}
