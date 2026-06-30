/**
 * Torna alla pagina precedente nello history (es. risultati ricerca con query/pagina)
 * oppure, se non c’è history utile, alla route search “vuota”.
 */
export function useBackToSearch() {
  const router = useRouter()
  const localePath = useLocalePath()

  function goBackToSearchResults(): void {
    if (import.meta.client && typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    void router.push(localePath('search'))
  }

  return { goBackToSearchResults }
}
