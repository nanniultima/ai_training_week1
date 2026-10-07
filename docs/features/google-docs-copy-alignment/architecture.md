# Architecture: google-docs-copy-alignment

Kopiointi kloonaa turvallisen `presentation.html`-merkkijonon DOM-templateen,
käy vain tekstisolmut läpi ja vakauttaa kohdistusvälit NBSP-merkeillä.
Elementtejä tai attribuutteja ei lisätä. Muunnos koskee vain `text/html`-Blobia;
ruudulla näkyvä HTML ja `text/plain` säilyvät ennallaan.
