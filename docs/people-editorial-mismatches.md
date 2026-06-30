# People — anagrafiche: divergenze documento / CMS

Documento per redazione: confronto tra elenchi ufficiali (mail) e anagrafica in CMS. Aggiornare l’anagrafica o correggere i testi in base alla decisione editoriale.

| Nome in documento | In CMS (esempio) | Nota |
|-------------------|------------------|------|
| Gabriella Grizzuti | Gabriela Grizzuti | Ortografia nome |
| Maurizio Noris **Chiorda** | Maurizio Noris **Chioda** | Cognome / refuso documento? |
| Francesco **Fruzza Meozzi** | Francesco R. **Fruzza** (nome) + **Meozzi** (cognome) | Campi nome/cognome |
| D’Ambrosio Maria Vittoria | Maria Vittoria D’**Ambrosio** | Ordine; apostrofo Unicode in CMS |
| **Cotroneo Massimo** (Brescia) | **Cotrone** (nome) **Cotroneo** (cognome) o viceversa; non corrisponde a “Massimo” | Dati inseriti in anagrafica da verificare |
| Annamaria Ducci (comitato) / Anna Maria Ducci (Carrara) | Stesso id se unica persona | Unificare etichetta in documento se coincidono |

**Comitati scientifici (8 nomi)**: a oggi non risultano schede Person in CMS per: Gerardo De Simone, Giovanni Iovane, Johann Haarberg, Emanuele Quinz, Samuel Bianchini, Elena Cologni, Linda Messas, Federica Martini. Fino a creazione in backend, in pagina compaiono come **testo semplice** (senza badge/bio). Dopo l’inserimento, con bio breve, si abilitano link e immagine.

**Rigenerare il confronto automatico** (opzionale): `npx tsx scripts/compare-people-camilla.mts` (con cache o fetch da API).
