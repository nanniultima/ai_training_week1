# Architecture: pasted-rich-text-formatting

`parseRichText` muuntaa liitetyn DOM-puun turvallisiksi segmenteiksi. Elementin
`font-weight` ja `font-style` luetaan `CSSStyleDeclaration`-rajapinnasta ja
yhdistetään nykyiseen tagi- ja perintölogiikkaan. Muu putki käyttää samoja
`FormattedTextSegment`-tyyppejä kuin ennen. `formatMusicResult` tuottaa
muotoilusta `strong`/`em`-tagit eikä kopioi syötteen attribuutteja.

Rollback on parserin kahden CSS-tulkintasäännön ja niitä vastaavien testien
poistaminen.
