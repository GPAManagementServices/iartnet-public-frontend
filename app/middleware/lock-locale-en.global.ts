/**
 * Forza URL in inglese: niente `useI18n` / `useSwitchLocalePath` qui (vietati fuori da `setup`).
 * Con strategy predefinita `prefix_except_default`, il locale `it` è sotto il prefisso `/it`.
 */
function italianPrefixedPathToEnglishPath(path: string): string | null {
  if (path === '/it' || path === '/it/')
    return '/'
  if (path.startsWith('/it/'))
    return path.slice(3) || '/'
  return null
}

export default defineNuxtRouteMiddleware((to) => {
  const path = italianPrefixedPathToEnglishPath(to.path)
  if (path === null)
    return

  return navigateTo(
    { path, query: to.query, hash: to.hash },
    { replace: true },
  )
})
