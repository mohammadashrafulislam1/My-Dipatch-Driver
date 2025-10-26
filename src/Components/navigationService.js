let _navigate = null;

export function setNavigate(navigateFn) {
  _navigate = navigateFn;
}

export function navigate(to, options) {
  if (_navigate) {
    _navigate(to, options);
  } else {
    // fallback to full page navigation
    if (typeof to === 'string') window.location.href = to;
  }
}