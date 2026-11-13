export const isEditableElement = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;
};

export const shouldIgnoreDrillKey = (event: KeyboardEvent) =>
  event.defaultPrevented || event.repeat || event.isComposing || event.keyCode === 229 ||
  event.altKey || event.ctrlKey || event.metaKey || isEditableElement(event.target) ||
  (event.target instanceof Element && event.target !== document.body && !event.target.closest('.trainer-panel'));
